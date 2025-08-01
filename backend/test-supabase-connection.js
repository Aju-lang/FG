const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './config.env' });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testSupabaseConnection() {
  try {
    console.log('🔍 Testing Supabase connection...\n');

    console.log('Environment variables:');
    console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? '✅ Set' : '❌ Missing');
    console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Set' : '❌ Missing');
    console.log('JWT_SECRET:', process.env.JWT_SECRET ? '✅ Set' : '❌ Missing');
    console.log('');

    // Test 1: Check if we can read from students table
    console.log('1️⃣ Testing read access to students table...');
    const { data: students, error: readError } = await supabase
      .from('students')
      .select('id, name, email')
      .limit(1);

    if (readError) {
      console.error('❌ Read error:', readError);
    } else {
      console.log('✅ Read access successful');
      console.log('Sample data:', students);
    }

    // Test 2: Check if we can read from primary_controllers table
    console.log('\n2️⃣ Testing read access to primary_controllers table...');
    const { data: controllers, error: pcReadError } = await supabase
      .from('primary_controllers')
      .select('id, name, email')
      .limit(1);

    if (pcReadError) {
      console.error('❌ PC read error:', pcReadError);
    } else {
      console.log('✅ PC read access successful');
      console.log('Sample data:', controllers);
    }

    // Test 3: Test auth admin functions
    console.log('\n3️⃣ Testing auth admin functions...');
    try {
      const { data: authTest, error: authError } = await supabase.auth.admin.listUsers();
      if (authError) {
        console.error('❌ Auth admin error:', authError);
      } else {
        console.log('✅ Auth admin access successful');
        console.log('User count:', authTest.users.length);
      }
    } catch (authException) {
      console.error('❌ Auth admin exception:', authException.message);
    }

    // Test 4: Try to create a test auth user
    console.log('\n4️⃣ Testing auth user creation...');
    const testEmail = `test-${Date.now()}@example.com`;
    const testPassword = 'testpass123';
    
    try {
      const { data: createUserData, error: createUserError } = await supabase.auth.admin.createUser({
        email: testEmail,
        password: testPassword,
        email_confirm: true
      });

      if (createUserError) {
        console.error('❌ Create user error:', createUserError);
      } else {
        console.log('✅ Create user successful');
        console.log('User ID:', createUserData.user.id);
        
        // Clean up - delete the test user
        const { error: deleteError } = await supabase.auth.admin.deleteUser(createUserData.user.id);
        if (deleteError) {
          console.error('❌ Delete user error:', deleteError);
        } else {
          console.log('✅ Test user cleaned up');
        }
      }
    } catch (createException) {
      console.error('❌ Create user exception:', createException.message);
    }

  } catch (error) {
    console.error('❌ General error:', error);
  }
}

testSupabaseConnection(); 