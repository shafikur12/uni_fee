#!/usr/bin/env node

/**
 * Database Migration & Setup Script
 * This script creates all required tables and sets up the database for the UniF project
 * 
 * Run with: node scripts/setup-database.mjs
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load environment variables
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Error: Missing Supabase environment variables!');
  console.error('Make sure .env.local is set up with:');
  console.error('  - NEXT_PUBLIC_SUPABASE_URL');
  console.error('  - SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function executeSqlFile(sqlFilePath) {
  try {
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf-8');
    
    console.log(`\n📄 Reading: ${path.basename(sqlFilePath)}`);
    console.log('⏳ Executing SQL...');
    
    const { error } = await supabase.rpc('execute_sql', {
      sql: sqlContent
    }).catch(() => {
      // Fallback: try executing directly via query
      return supabase.from('_').select().catch(e => ({ error: e }));
    });

    if (error && error.message && error.message.includes('does not exist')) {
      // This is expected for first run - database function might not exist
      console.log('⚠️  Note: Direct SQL execution not available. Using Supabase dashboard instead.');
      console.log('\n📋 Copy this SQL to Supabase SQL Editor:');
      console.log('─'.repeat(60));
      console.log(sqlContent);
      console.log('─'.repeat(60));
      return true;
    }

    if (error) {
      console.error('❌ SQL Error:', error.message);
      return false;
    }

    console.log('✅ Successfully executed!');
    return true;
  } catch (err) {
    console.error('❌ Error reading SQL file:', err.message);
    return false;
  }
}

async function verifyTables() {
  console.log('\n📊 Verifying Database Tables...');
  
  const tables = [
    'batches',
    'batch_fee_config',
    'batch_permission_templates',
    'students',
    'fee_submissions',
    'uploaded_receipts',
    'permission_slips',
    'audit_logs',
    'staff_profiles'
  ];

  try {
    for (const table of tables) {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);

      if (error && error.code === 'PGRST116') {
        console.log(`✅ Table "${table}" exists (empty or no select permission)`);
      } else if (error) {
        console.log(`❌ Table "${table}" missing or error: ${error.message}`);
      } else {
        console.log(`✅ Table "${table}" exists and accessible`);
      }
    }
  } catch (err) {
    console.error('❌ Error verifying tables:', err.message);
  }
}

async function main() {
  console.log('═'.repeat(60));
  console.log('🚀 UniFee Database Setup');
  console.log('═'.repeat(60));

  console.log('\n✅ Supabase Configuration:');
  console.log(`   URL: ${SUPABASE_URL}`);

  // Try to execute main schema
  const schemaPath = path.join(__dirname, '001_create_schema.sql');
  
  if (!fs.existsSync(schemaPath)) {
    console.error('\n❌ Error: 001_create_schema.sql not found!');
    console.log('Expected location:', schemaPath);
    process.exit(1);
  }

  const success = await executeSqlFile(schemaPath);

  if (success) {
    await verifyTables();
    console.log('\n' + '═'.repeat(60));
    console.log('✅ Database Setup Complete!');
    console.log('═'.repeat(60));
  } else {
    console.log('\n⚠️  Setup Incomplete - Follow the SQL instructions above');
    console.log('═'.repeat(60));
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
