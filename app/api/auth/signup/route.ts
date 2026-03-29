import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const { email, password, fullName, studentId, batchId } = await request.json()

  if (!email || !password) {
    return NextResponse.json(
      { error: 'Email and password are required' },
      { status: 400 }
    )
  }

  const supabase = await createClient()

  try {
    // Sign up user with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`,
        data: {
          full_name: fullName || email.split('@')[0],
          role: 'Student',
        },
      },
    })

    if (authError) {
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      )
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 500 }
      )
    }

    // Create student profile
    if (studentId && batchId) {
      const { error: profileError } = await supabase
        .from('student_profiles')
        .insert({
          user_id: authData.user.id,
          full_name: fullName || email.split('@')[0],
          student_id: studentId,
          batch_id: batchId,
        })

      if (profileError) {
        console.error('Student profile creation error:', profileError)
        return NextResponse.json(
          { error: 'Failed to create student profile' },
          { status: 500 }
        )
      }
    }

    return NextResponse.json(
      {
        message: 'Account created successfully',
        user: authData.user,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { error: 'An error occurred during signup' },
      { status: 500 }
    )
  }
}
