import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import { readFile } from 'node:fs/promises'
import path from 'node:path'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const blobToken = process.env.BLOB_READ_WRITE_TOKEN!

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
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
  const page = pdfDoc.addPage([595.28, 841.89]) // A4
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
    // Ignore logo errors and continue without it
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

  const pdfBytes = await pdfDoc.save()
  return pdfBytes
}

async function resolveStudentRow(submission: {
  student_id: string | null
  batch_id: string | null
}) {
  const rawStudentId = submission.student_id

  if (rawStudentId) {
    const { data: byId } = await supabaseAdmin
      .from('students')
      .select('id')
      .eq('id', rawStudentId)
      .maybeSingle()
    if (byId?.id) return byId

    const { data: byUserId } = await supabaseAdmin
      .from('students')
      .select('id')
      .eq('user_id', rawStudentId)
      .maybeSingle()
    if (byUserId?.id) return byUserId
  }

  if (rawStudentId) {
    const { data: profile } = await supabaseAdmin
      .from('student_profiles')
      .select('id, student_id, full_name, batch_id')
      .eq('id', rawStudentId)
      .maybeSingle()

    if (profile?.id) {
      const studentIdValue = String(profile.student_id)
      const studentName = String(profile.full_name || 'Student')
      const batchId = profile.batch_id || submission.batch_id || null

      const { data: upserted, error: upsertError } = await supabaseAdmin
        .from('students')
        .upsert(
          {
            id: profile.id,
            user_id: profile.id,
            registration_number: studentIdValue,
            name: studentName,
            batch_id: batchId,
            status: 'Active',
          },
          { onConflict: 'id' },
        )
        .select('id')
        .maybeSingle()

      if (!upsertError && upserted?.id) {
        return upserted
      }
    }
  }

  return null
}

export async function POST(req: NextRequest) {
  try {
    const { submissionId, actorId } = await req.json()

    if (!submissionId || !actorId) {
      return NextResponse.json(
        { error: 'submissionId and actorId are required' },
        { status: 400 },
      )
    }

    if (!blobToken) {
      return NextResponse.json(
        { error: 'BLOB_READ_WRITE_TOKEN is not configured' },
        { status: 500 },
      )
    }

    const { data: submission, error: submissionError } = await supabaseAdmin
      .from('fee_submissions')
      .select('id, student_id, batch_id, status')
      .eq('id', submissionId)
      .maybeSingle()

    if (submissionError || !submission) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 })
    }

    if (submission.status === 'Approved') {
      return NextResponse.json({ ok: true })
    }

    const studentRow = await resolveStudentRow(submission)
    if (!studentRow?.id) {
      return NextResponse.json(
        { error: 'Student record not found. Please sync student data before approving.' },
        { status: 400 },
      )
    }

    const { error: updateError } = await supabaseAdmin
      .from('fee_submissions')
      .update({
        status: 'Approved',
        reviewed_at: new Date().toISOString(),
        reviewed_by: actorId,
      })
      .eq('id', submissionId)

    if (updateError) {
      return NextResponse.json({ error: 'Failed to update submission' }, { status: 500 })
    }

    const { data: existingSlip } = await supabaseAdmin
      .from('permission_slips')
      .select('id')
      .eq('submission_id', submissionId)
      .maybeSingle()

    if (!existingSlip) {
      const { data: batchRow } = submission.batch_id
        ? await supabaseAdmin
            .from('batches')
            .select('batch_name, academic_year, semester')
            .eq('id', submission.batch_id)
            .maybeSingle()
        : { data: null }

      const { data: studentInfo } = await supabaseAdmin
        .from('students')
        .select('registration_number, name, current_semester')
        .eq('id', studentRow.id)
        .maybeSingle()

      const verificationCode = `SLIP-${Date.now()}`
      const issuedAt = new Date().toISOString()

      const pdfBytes = await generatePermissionSlipPdfBytes({
        studentName: studentInfo?.name || 'Student',
        registrationNumber: studentInfo?.registration_number || 'N/A',
        batchName: batchRow?.batch_name || 'N/A',
        semester: String(batchRow?.semester || studentInfo?.current_semester || 'N/A'),
        examSession: batchRow?.academic_year || 'N/A',
        submissionId,
        verificationCode,
        issuedAt,
      })

      const blobPath = `permission-slips/${studentRow.id}/${submissionId}.pdf`
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
        return NextResponse.json(
          { error: 'Failed to upload permission slip', details: text },
          { status: 500 },
        )
      }

      const blobJson = (await blobResponse.json()) as { url: string }
      const fileUrl = blobJson.url

      const { error: slipError } = await supabaseAdmin
        .from('permission_slips')
        .insert({
          student_id: studentRow.id,
          submission_id: submissionId,
          batch_id: submission.batch_id,
          verification_code: verificationCode,
          file_url: fileUrl,
          issued_at: issuedAt,
          issued_by: actorId,
        })

      if (slipError) {
        return NextResponse.json({ error: 'Failed to generate permission slip' }, { status: 500 })
      }
    }

    let studentEmail: string | null = null
    if (studentRow?.id) {
      const { data: userData } = await supabaseAdmin.auth.admin.getUserById(studentRow.id)
      studentEmail = userData?.user?.email || null
    }

    await supabaseAdmin.from('audit_logs').insert({
      actor_id: actorId,
      action_type: 'approve',
      target_table: 'fee_submissions',
      target_id: submissionId,
      batch_id: submission.batch_id,
      new_value: {
        status: 'Approved',
        submission_id: submissionId,
        student_id: studentRow?.id || submission.student_id,
        student_email: studentEmail,
      },
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('approve fee submission API error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
