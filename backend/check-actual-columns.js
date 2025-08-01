const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './config.env' });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkActualColumns() {
  try {
    console.log('🔍 Checking actual columns in students table...\n');

    // Get all data from students table to see what columns exist
    const { data: students, error } = await supabase
      .from('students')
      .select('*')
      .limit(1);

    if (error) {
      console.error('❌ Error accessing students table:', error);
      return;
    }

    if (students && students.length > 0) {
      console.log('✅ Students table exists');
      console.log('📋 Actual columns in students table:');
      const firstStudent = students[0];
      Object.keys(firstStudent).forEach(key => {
        console.log(`   - ${key}: ${typeof firstStudent[key]}`);
      });
    } else {
      console.log('📋 Students table exists but is empty');
    }

    // Try to get column information from information_schema
    console.log('\n🔍 Checking column information...');
    const { data: columns, error: columnError } = await supabase
      .rpc('get_table_columns', { table_name: 'students' })
      .catch(() => {
        console.log('❌ Could not get column info via RPC');
        return { data: null, error: 'RPC not available' };
      });

    if (columnError) {
      console.log('❌ Could not get column info:', columnError);
    } else if (columns) {
      console.log('📋 Columns from information_schema:');
      columns.forEach(col => {
        console.log(`   - ${col.column_name}: ${col.data_type}`);
      });
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkActualColumns(); 