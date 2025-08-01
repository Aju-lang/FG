const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './config.env' });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkDatabaseStructure() {
  try {
    console.log('🔍 Checking database structure...\n');

    // Check if students table exists and get its structure
    const { data: students, error } = await supabase
      .from('students')
      .select('*')
      .limit(1);

    if (error) {
      console.error('❌ Error accessing students table:', error);
      return;
    }

    console.log('✅ Students table exists');

    // Check if primary_controllers table exists
    const { data: controllers, error: pcError } = await supabase
      .from('primary_controllers')
      .select('*')
      .limit(1);

    if (pcError) {
      console.error('❌ Error accessing primary_controllers table:', pcError);
    } else {
      console.log('✅ Primary controllers table exists');
    }

    // Try to get column information
    console.log('\n📋 Checking for required columns...');
    
    // Test if qrToken column exists
    try {
      const { data: qrTest, error: qrError } = await supabase
        .from('students')
        .select('qrToken')
        .limit(1);
      
      if (qrError && qrError.message.includes('column "qrToken" does not exist')) {
        console.log('❌ qrToken column is missing');
      } else {
        console.log('✅ qrToken column exists');
      }
    } catch (e) {
      console.log('❌ qrToken column is missing');
    }

    // Test if qrCodeImage column exists
    try {
      const { data: qrImgTest, error: qrImgError } = await supabase
        .from('students')
        .select('qrCodeImage')
        .limit(1);
      
      if (qrImgError && qrImgError.message.includes('column "qrCodeImage" does not exist')) {
        console.log('❌ qrCodeImage column is missing');
      } else {
        console.log('✅ qrCodeImage column exists');
      }
    } catch (e) {
      console.log('❌ qrCodeImage column is missing');
    }

    console.log('\n📝 You need to run the SQL script in Supabase SQL Editor:');
    console.log('1. Go to your Supabase Dashboard');
    console.log('2. Navigate to SQL Editor');
    console.log('3. Copy and paste the contents of add-qr-token-column.sql');
    console.log('4. Run the script');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkDatabaseStructure(); 