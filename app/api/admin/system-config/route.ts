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
            {
               error: 'Forbidden - only Admin users can update system configuration',
            },
            { status: 403 },
         );
      }

      const {
         university_name,
         system_email,
         late_fee_percentage,
         session_timeout,
      } = await req.json();

      if (!university_name || !system_email) {
         return NextResponse.json(
            { error: 'University name and system email are required' },
            { status: 400 },
         );
      }

      // Update system configuration
      const { data, error } = await supabaseAdmin
         .from('system_configuration')
         .update({
            university_name,
            system_email,
            late_fee_percentage: parseFloat(late_fee_percentage),
            session_timeout: parseInt(session_timeout),
            updated_at: new Date().toISOString(),
         })
         .eq('id', '00000000-0000-0000-0000-000000000000')
         .select();

      if (error) {
         return NextResponse.json(
            { error: 'Failed to update system configuration' },
            { status: 400 },
         );
      }

      return NextResponse.json(
         {
            message: 'System configuration updated successfully',
            data: data?.[0],
         },
         { status: 200 },
      );
   } catch (err: any) {
      console.error('System configuration update error:', err);
      return NextResponse.json(
         { error: err.message || 'Failed to update system configuration' },
         { status: 500 },
      );
   }
}
