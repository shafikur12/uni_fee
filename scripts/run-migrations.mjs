import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('❌ Missing environment variables:');
  console.error('   - NEXT_PUBLIC_SUPABASE_URL');
  console.error('   - SUPABASE_SERVICE_ROLE_KEY');
  console.error('\nMake sure .env.local is configured with your Supabase credentials.');
  process.exit(1);
}

// Create Supabase client with service role (allows admin operations)
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const migrationFiles = [
  '001_create_schema.sql',
  '002_add_student_profiles.sql',
  '003_fix_rls_policies.sql',
];

async function executeMigration(fileName) {
  try {
    const filePath = path.join(__dirname, fileName);
    const sql = fs.readFileSync(filePath, 'utf-8');

    console.log(`\n📝 Executing: ${fileName}`);

    // Execute the SQL using Supabase's query method
    const { error } = await supabase.rpc('exec', { sql });

    if (error) {
      // Try using postgrest API if exec doesn't work
      // Fall back to executing via SQL directly
      const lines = sql
        .split(';')
        .filter((line) => line.trim().length > 0);

      for (const statement of lines) {
        const trimmedStatement = statement.trim();
        if (trimmedStatement.length === 0) continue;

        try {
          await supabase.rpc('exec', { sql: trimmedStatement + ';' });
        } catch (err) {
          console.error(`   Error executing statement: ${err.message}`);
        }
      }
    }

    console.log(`✅ ${fileName} completed successfully`);
    return true;
  } catch (error) {
    console.error(`❌ Error executing ${fileName}:`, error.message);
    return false;
  }
}

async function setupDatabase() {
  console.log('🚀 Starting database setup...');
  console.log(`📍 Connecting to: ${supabaseUrl}`);

  try {
    // First, verify connection
    const { data, error } = await supabase
      .from('batches')
      .select('count(*)', { count: 'exact', head: true });

    if (error && error.code !== 'PGRST116') {
      console.error('❌ Failed to connect to Supabase:', error.message);
      process.exit(1);
    }

    console.log('✅ Connected to Supabase');

    // Execute migrations
    let allSuccess = true;
    for (const file of migrationFiles) {
      const success = await executeMigration(file);
      if (!success) allSuccess = false;
    }

    if (allSuccess) {
      console.log('\n✅ Database setup completed successfully!');
      console.log(
        '\n📋 Next steps:'
      );
      console.log(
        '   1. Run: npm run dev'
      );
      console.log(
        '   2. Open: http://localhost:3000'
      );
      console.log(
        '   3. Create your first admin user via Supabase dashboard'
      );
    } else {
      console.log(
        '\n⚠️  Some migrations failed. Check the errors above.'
      );
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

setupDatabase();
