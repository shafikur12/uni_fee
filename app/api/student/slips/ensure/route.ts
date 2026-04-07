import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import { readFile } from 'node:fs/promises'
import path from 'node:path'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const blobToken = process.env.BLOB_READ_WRITE_TOKEN!

const supabaseAdmin = createAdminClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

async function generatePermissionSlipPdfBytes(input: {
  studentName: string
  registrationNumber: string
  batchName: string
  semester: string
  examSession: string
  submissionId: string
  verificationCode: string
  issuedAt: string
}) {
  const pdfDoc = await PDFDocument.create()
  const page = pdfDoc.addPage([595.28, 841.89])
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

  const { width, height } = page.getSize()

  try {
    const logoPath = path.join(process.cwd(), 'public', 'placeholder-logo.png')
    const logoBytes = await readFile(logoPath)
    const logoImage = await pdfDoc.embedPng(logoBytes)
    const logoDims = logoImage.scale(0.25)
    page.drawImage(logoImage, {
      x: 60,
      y: height - 90,
      width: logoDims.width,
      height: logoDims.height,
    })
  } catch {
    // ignore logo errors
  }

  const drawLabel = (label: string, value: string, y: number) => {
    page.drawText(label, { x: 60, y, size: 12, font, color: rgb(0.35, 0.35, 0.35) })
    page.drawText(value, { x: 220, y, size: 12, font: boldFont, color: rgb(0.1, 0.1, 0.1) })
  }

  page.drawText('Exam Permission Slip', {
    x: 60,
    y: height - 80,
    size: 22,
    font: boldFont,
    color: rgb(0.1, 0.1, 0.1),
  })

  page.drawText('University Fee System', {
    x: 60,
    y: height - 110,
    size: 12,
    font,
    color: rgb(0.4, 0.4, 0.4),
  })

  page.drawLine({
    start: { x: 60, y: height - 140 },
    end: { x: width - 60, y: height - 140 },
    thickness: 1,
    color: rgb(0.9, 0.9, 0.9),
  })

  const startY = height - 190
  drawLabel('Student Name:', input.studentName, startY)
  drawLabel('Registration No:', input.registrationNumber, startY - 26)
  drawLabel('Batch:', input.batchName, startY - 52)
  drawLabel('Semester:', input.semester, startY - 78)
  drawLabel('Exam Session:', input.examSession, startY - 104)
  drawLabel('Submission ID:', input.submissionId, startY - 130)
  drawLabel('Verification Code:', input.verificationCode, startY - 156)
  drawLabel('Issued At:', new Date(input.issuedAt).toLocaleString(), startY - 182)

  page.drawText(
    'This slip confirms that the student has cleared the required fee payments and is permitted to sit for examinations.',
    {
      x: 60,
      y: startY - 245,
      size: 11,
      font,
      color: rgb(0.3, 0.3, 0.3),
      maxWidth: width - 120,
      lineHeight: 16,
    },
  )

  page.drawText('Please present this slip along with your student ID card at the exam hall.', {
    x: 60,
    y: startY - 285,
    size: 11,
    font,
    color: rgb(0.3, 0.3, 0.3),
  })

  page.drawLine({
    start: { x: 60, y: 120 },
    end: { x: width - 60, y: 120 },
    thickness: 1,
    color: rgb(0.85, 0.85, 0.85),
  })

  page.drawText('Authorized Signature', {
    x: 60,
    y: 90,
    size: 10,
    font,
    color: rgb(0.4, 0.4, 0.4),
  })

  page.drawLine({
    start: { x: 60, y: 110 },
    end: { x: 220, y: 110 },
    thickness: 1,
    color: rgb(0.3, 0.3, 0.3),
  })

  page.drawLine({
    start: { x: 70, y: 112 },
    end: { x: 110, y: 125 },
    thickness: 1,
    color: rgb(0.15, 0.15, 0.15),
  })
  page.drawLine({
    start: { x: 110, y: 125 },
    end: { x: 160, y: 105 },
    thickness: 1,
    color: rgb(0.15, 0.15, 0.15),
  })
  page.drawLine({
    start: { x: 160, y: 105 },
    end: { x: 210, y: 120 },
    thickness: 1,
    color: rgb(0.15, 0.15, 0.15),
  })

  return pdfDoc.save()
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!blobToken) {
    return NextResponse.json({ error: 'BLOB_READ_WRITE_TOKEN is not configured' }, { status: 500 })
  }

  const { data: directSlip } = await supabaseAdmin
    .from('permission_slips')
    .select('*')
    .eq('student_id', user.id)
    .order('generated_at', { ascending: false })
    .maybeSingle()

  if (directSlip) {
    return NextResponse.json({ slips: [directSlip] })
  }

  const { data: studentRow } = await supabaseAdmin
    .from('students')
    .select('id, registration_number, name, user_id, batch_id, current_semester')
    .eq('user_id', user.id)
    .maybeSingle()

  const possibleStudentIds = Array.from(
    new Set([user.id, studentRow?.id].filter(Boolean) as string[]),
  )

  const { data: existingSlip } = await supabaseAdmin
    .from('permission_slips')
    .select('*')
    .in('student_id', possibleStudentIds)
    .order('generated_at', { ascending: false })
    .maybeSingle()

  if (existingSlip) {
    return NextResponse.json({ slips: [existingSlip] })
  }

  const { data: submissions } = await supabaseAdmin
    .from('fee_submissions')
    .select('id, student_id, batch_id, status')
    .in('student_id', possibleStudentIds)
    .ilike('status', 'approved')
    .order('created_at', { ascending: false })
 
  if (!submissions || submissions.length === 0) {
    const { count: approvedCount } = await supabaseAdmin
      .from('fee_submissions')
      .select('*', { count: 'exact', head: true })
      .in('student_id', possibleStudentIds)
      .ilike('status', 'approved')

    return NextResponse.json({
      slips: [],
      debug: {
        userId: user.id,
        possibleStudentIds,
        approvedCount: approvedCount || 0,
      },
    })
  }

  const submissionIds = submissions.map((s) => s.id)
  const { data: existingSlips } = await supabaseAdmin
    .from('permission_slips')
    .select('*')
    .in('submission_id', submissionIds)
    .order('issued_at', { ascending: false })

  const existingBySubmission = new Set((existingSlips || []).map((s: any) => s.submission_id))
  const missing = submissions.filter((s) => !existingBySubmission.has(s.id))

  const { data: profileRow } = await supabaseAdmin
    .from('student_profiles')
    .select('full_name')
    .eq('id', user.id)
    .maybeSingle()

  const slipsCreated: any[] = []

  for (const submission of missing) {
    const { data: batchRow } = submission.batch_id
      ? await supabaseAdmin
          .from('batches')
          .select('batch_name, academic_year, semester')
          .eq('id', submission.batch_id)
          .maybeSingle()
      : { data: null }

    const verificationCode = `SLIP-${Date.now()}-${submission.id.slice(0, 6)}`
    const issuedAt = new Date().toISOString()

    const pdfBytes = await generatePermissionSlipPdfBytes({
      studentName: studentRow?.name || profileRow?.full_name || 'Student',
      registrationNumber: studentRow?.registration_number || 'N/A',
      batchName: batchRow?.batch_name || 'N/A',
      semester: String(batchRow?.semester || studentRow?.current_semester || 'N/A'),
      examSession: batchRow?.academic_year || 'N/A',
      submissionId: submission.id,
      verificationCode,
      issuedAt,
    })

    const blobPath = `permission-slips/${submission.student_id}/${submission.id}.pdf`
    const blobResponse = await fetch('https://blob.vercel-storage.com/' + blobPath, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${blobToken}`,
        'Content-Type': 'application/pdf',
      },
      body: Buffer.from(pdfBytes),
    })

    if (!blobResponse.ok) {
      const text = await blobResponse.text()
      return NextResponse.json({ error: 'Failed to upload permission slip', details: text }, { status: 500 })
    }

    const blobJson = (await blobResponse.json()) as { url: string }

    const { data: insertedSlip, error: slipError } = await supabaseAdmin
      .from('permission_slips')
      .insert({
        student_id: submission.student_id,
        submission_id: submission.id,
        batch_id: submission.batch_id,
        verification_code: verificationCode,
        file_url: blobJson.url,
        issued_at: issuedAt,
        issued_by: user.id,
      })
      .select('*')
      .maybeSingle()

    if (slipError || !insertedSlip) {
      return NextResponse.json({ error: 'Failed to create permission slip' }, { status: 500 })
    }

    slipsCreated.push(insertedSlip)
  }

  const allSlips = [...(existingSlips || []), ...slipsCreated].sort((a: any, b: any) => {
    const aTime = new Date(a.issued_at || a.generated_at || 0).getTime()
    const bTime = new Date(b.issued_at || b.generated_at || 0).getTime()
    return bTime - aTime
  })

  return NextResponse.json({ slips: allSlips })
}
