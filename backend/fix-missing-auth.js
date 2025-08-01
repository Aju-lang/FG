const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './config.env' });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fixMissingAuth() {
  try {
    console.log('🔧 Fixing Missing Auth Account...\n');

    // Get the test student from database
    const { data: dbStudent, error: dbError } = await supabase
      .from('students')
      .select('*')
      .eq('username', 'teststudent101')
      .single();

    if (dbError || !dbStudent) {
      console.error('❌ Test student not found in database');
      return;
    }

    console.log('📋 Found test student in database:');
    console.log(`   Name: ${dbStudent.name}`);
    console.log(`   Email: ${dbStudent.email}`);
    console.log(`   Username: ${dbStudent.username}`);
    console.log(`   ID: ${dbStudent.id}`);

    // Create auth account for this student
    console.log('\n🔐 Creating Supabase auth account...');
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: dbStudent.email,
      password: 'TestStudent123!', // Set a default password
      email_confirm: true,
      user_metadata: {
        username: dbStudent.username,
        name: dbStudent.name,
        role: 'student',
        class: dbStudent.class,
        division: dbStudent.division
      }
    });

    if (authError) {
      console.error('❌ Failed to create auth account:', authError);
      return;
    }

    console.log('✅ Auth account created successfully:');
    console.log(`   Auth ID: ${authData.user.id}`);
    console.log(`   Email: ${authData.user.email}`);

    // Update the database record to use the new auth ID
    console.log('\n🔄 Updating database record...');
    const { error: updateError } = await supabase
      .from('students')
      .update({ id: authData.user.id })
      .eq('username', 'teststudent101');

    if (updateError) {
      console.error('❌ Failed to update database record:', updateError);
      return;
    }

    console.log('✅ Database record updated successfully');

    // Test the login
    console.log('\n🧪 Testing login with new credentials...');
    const axios = require('axios');
    
    try {
      const response = await axios.post('http://localhost:5000/login', {
        username: 'teststudent101',
        password: 'TestStudent123!',
        role: 'student'
      });
      
      console.log('✅ Login successful!');
      console.log(`   User: ${response.data.user.name}`);
      console.log(`   Role: ${response.data.user.role}`);
      
    } catch (error) {
      console.error('❌ Login failed:', error.response?.data || error.message);
    }

    console.log('\n🎉 Fix completed!');
    console.log('📝 New credentials for Test Student:');
    console.log(`   Username: teststudent101`);
    console.log(`   Password: TestStudent123!`);
    console.log(`   Email: test@fg-school.com`);

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

fixMissingAuth(); 