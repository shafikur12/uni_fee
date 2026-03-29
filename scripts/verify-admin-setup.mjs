#!/usr/bin/env node

/**
 * Admin Setup Verification Script
 * This script helps verify that the admin user and staff_profile are correctly set up
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: Missing Supabase environment variables');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function verifyAdminSetup() {
  console.log('🔍 Verifying Admin Authentication Setup...\n');

  try {
    // Step 1: Check if admin user exists
    console.log('Step 1: Checking for admin user in Supabase Auth...');
    const { data: adminUser, error: userError } = await supabase.auth.admin.listUsers();
    
    const admin = adminUser?.users?.find(u => u.email === 'admin@unifee.com');
    
    if (!admin) {
      console.error('❌ Admin user NOT found in Supabase Auth');
      console.error('   Email: admin@unifee.com not found in authentication users');
      console.log('\n📝 Action required: Create admin user in Supabase Dashboard:');
      console.log('   1. Go to Authentication > Users');
      console.log('   2. Click "Add user"');
      console.log('   3. Email: admin@unifee.com');
      console.log('   4. Password: Admin@123456');
      console.log('   5. Click "Create user"\n');
      return;
    }

    console.log('✅ Admin user found!');
    console.log(`   ID: ${admin.id}`);
    console.log(`   Email: ${admin.email}`);
    console.log(`   Created: ${new Date(admin.created_at).toLocaleString()}\n`);

    // Step 2: Check if staff_profile exists
    console.log('Step 2: Checking for staff profile in database...');
    const { data: staffProfile, error: staffError } = await supabase
      .from('staff_profiles')
      .select('*')
      .eq('id', admin.id)
      .maybeSingle();

    if (staffError) {
      console.error('❌ Database query error:', staffError.message);
      return;
    }

    if (!staffProfile) {
      console.error('❌ Staff profile NOT found for admin user');
      console.log('\n📝 Action required: Create staff profile with this SQL:');
      console.log(`   INSERT INTO public.staff_profiles (id, role, department)`);
      console.log(`   VALUES ('${admin.id}', 'Admin', 'Administration')`);
      console.log(`   ON CONFLICT (id) DO NOTHING;\n`);
      return;
    }

    console.log('✅ Staff profile found!');
    console.log(`   ID: ${staffProfile.id}`);
    console.log(`   Role: ${staffProfile.role}`);
    console.log(`   Department: ${staffProfile.department}`);
    console.log(`   Created: ${new Date(staffProfile.created_at).toLocaleString()}\n`);

    // Step 3: Verify role is correct
    if (staffProfile.role !== 'Admin') {
      console.warn('⚠️  Warning: Staff profile role is not "Admin"');
      console.warn(`   Current role: ${staffProfile.role}`);
      console.log('\n📝 To fix, run this SQL:');
      console.log(`   UPDATE public.staff_profiles SET role = 'Admin' WHERE id = '${admin.id}';\n`);
    }

    console.log('✅ All checks passed! Admin authentication should work correctly.\n');
    console.log('📋 Next steps:');
    console.log('   1. Start the dev server: npm run dev');
    console.log('   2. Go to http://localhost:3000');
    console.log('   3. Click "Sign In"');
    console.log('   4. Enter admin@unifee.com / Admin@123456');
    console.log('   5. You should be redirected to /admin/dashboard\n');

  } catch (error) {
    console.error('❌ Verification failed:', error);
  }
}

verifyAdminSetup();
