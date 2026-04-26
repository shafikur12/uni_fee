import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
   auth: {
      autoRefreshToken: false,
      persistSession: false,
   },
});

export async function POST(req: NextRequest) {
   try {
      // Get and verify the authorization token
      const authHeader = req.headers.get('Authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
         return NextResponse.json(
            { error: 'Unauthorized - missing authentication token' },
            { status: 401 },
         );
      }

      const token = authHeader.substring(7);

      // Verify the token and get the user
      const { data: userData, error: userError } =
         await supabaseAdmin.auth.getUser(token);
      if (userError || !userData.user) {
         return NextResponse.json(
            { error: 'Unauthorized - invalid token' },
            { status: 401 },
         );
      }

      // Check if user is Admin
      const { data: profile, error: profileError } = await supabaseAdmin
         .from('staff_profiles')
         .select('role')
         .eq('id', userData.user.id)
         .maybeSingle();

      if (profileError || !profile || profile.role !== 'Admin') {
         return NextResponse.json(
            { error: 'Forbidden - only Admin users can create staff accounts' },
            { status: 403 },
         );
      }

      const { email, password, fullName, role } = await req.json();

      if (!email || !password || !fullName || !role) {
         return NextResponse.json(
            { error: 'All fields are required' },
            { status: 400 },
         );
      }

      if (String(password).length < 8) {
         return NextResponse.json(
            { error: 'Password must be at least 8 characters' },
            { status: 400 },
         );
      }

      if (!['Admin', 'Accountant', 'Registrar'].includes(role)) {
         return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
      }

      // Create auth user with email confirmation bypassed to avoid rate limits
      const { data: createAuthData, error: createAuthError } =
         await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: {
               full_name: fullName,
               role: role,
            },
         });

      if (createAuthError || !createAuthData.user) {
         return NextResponse.json(
            { error: createAuthError?.message || 'Failed to create account' },
            { status: 400 },
         );
      }

      // Create staff profile
      const { error: staffError } = await supabaseAdmin
         .from('staff_profiles')
         .insert({
            id: createAuthData.user.id,
            role: role,
            department: '',
         });

      if (staffError) {
         // Rollback: delete the auth user if profile creation fails
         await supabaseAdmin.auth.admin.deleteUser(createAuthData.user.id);
         return NextResponse.json(
            {
               error: 'Account created but profile setup failed. Please contact support.',
            },
            { status: 400 },
         );
      }

      return NextResponse.json(
         {
            message: `${role} account created successfully`,
            email: email,
            role: role,
         },
         { status: 201 },
      );
   } catch (err: any) {
      console.error('Staff account creation error:', err);
      return NextResponse.json(
         { error: err.message || 'Failed to create staff account' },
         { status: 500 },
      );
   }
}
