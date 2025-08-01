// Update test student with isActive field
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './config.env' });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function updateTestStudent() {
  try {
    console.log('🔍 Updating test student...');
    
    // Update the test student to set isActive = true
    const { data, error } = await supabase
      .from('students')
      .update({ isActive: true })
      .eq('username', 'teststudent101')
      .select('id, name, email, username, isActive');
    
    if (error) {
      console.error('❌ Failed to update test student:', error);
      return;
    }
    
    if (data && data.length > 0) {
      console.log('✅ Test student updated successfully!');
      console.log('👤 Student:', data[0].name);
      console.log('✅ isActive:', data[0].isActive);
    } else {
      console.log('⚠️ No test student found to update');
    }
    
    console.log('\n🎉 Test student is now ready for login!');
    console.log('📋 Test Credentials:');
    console.log('👤 Username: teststudent101');
    console.log('🔑 Password: testpassword');
    
  } catch (error) {
    console.error('❌ Update failed:', error);
  }
}

// Run the update
updateTestStudent(); 