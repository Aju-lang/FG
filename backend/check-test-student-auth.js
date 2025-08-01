const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './config.env' });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkTestStudentAuth() {
  try {
    console.log('🔍 Checking Test Student Authentication Status...\n');

    // Check database for test student
    const { data: dbStudent, error: dbError } = await supabase
      .from('students')
      .select('*')
      .eq('username', 'teststudent101')
      .single();

    if (dbError) {
      console.error('❌ Database error:', dbError);
      return;
    }

    if (!dbStudent) {
      console.log('❌ Test student not found in database');
      return;
    }

    console.log('✅ Test student found in database:');
    console.log(`   ID: ${dbStudent.id}`);
    console.log(`   Name: ${dbStudent.name}`);
    console.log(`   Username: ${dbStudent.username}`);
    console.log(`   Email: ${dbStudent.email}`);
    console.log(`   Role: ${dbStudent.role}`);

    // Check if this ID exists in Supabase auth
    const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(dbStudent.id);

    if (authError) {
      console.error('❌ Auth error:', authError);
      console.log('🔍 This means the student exists in database but NOT in Supabase auth');
      console.log('💡 This is why login fails - the auth account is missing');
    } else {
      console.log('✅ Test student found in Supabase auth:');
      console.log(`   Auth ID: ${authUser.user.id}`);
      console.log(`   Email: ${authUser.user.email}`);
      console.log(`   Email Confirmed: ${authUser.user.email_confirmed_at ? 'Yes' : 'No'}`);
      console.log(`   Created: ${authUser.user.created_at}`);
    }

    // Check all students in auth
    console.log('\n🔍 Checking all users in Supabase auth...');
    const { data: allAuthUsers, error: listError } = await supabase.auth.admin.listUsers();

    if (listError) {
      console.error('❌ Error listing auth users:', listError);
    } else {
      console.log(`✅ Found ${allAuthUsers.users.length} users in Supabase auth:`);
      allAuthUsers.users.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.email} (${user.id}) - Confirmed: ${user.email_confirmed_at ? 'Yes' : 'No'}`);
      });
    }

    // Check all students in database
    console.log('\n🔍 Checking all students in database...');
    const { data: allDbStudents, error: listDbError } = await supabase
      .from('students')
      .select('id, name, email, username');

    if (listDbError) {
      console.error('❌ Error listing database students:', listDbError);
    } else {
      console.log(`✅ Found ${allDbStudents.length} students in database:`);
      allDbStudents.forEach((student, index) => {
        console.log(`   ${index + 1}. ${student.name} (${student.email}) - ID: ${student.id}`);
      });
    }

    // Find mismatches
    console.log('\n🔍 Finding mismatches...');
    const dbIds = allDbStudents.map(s => s.id);
    const authIds = allAuthUsers.users.map(u => u.id);
    
    const missingInAuth = dbIds.filter(id => !authIds.includes(id));
    const missingInDb = authIds.filter(id => !dbIds.includes(id));

    if (missingInAuth.length > 0) {
      console.log('❌ Students in database but NOT in auth:');
      missingInAuth.forEach(id => {
        const student = allDbStudents.find(s => s.id === id);
        console.log(`   - ${student?.name || 'Unknown'} (${id})`);
      });
    }

    if (missingInDb.length > 0) {
      console.log('❌ Users in auth but NOT in database:');
      missingInDb.forEach(id => {
        const user = allAuthUsers.users.find(u => u.id === id);
        console.log(`   - ${user?.email || 'Unknown'} (${id})`);
      });
    }

    if (missingInAuth.length === 0 && missingInDb.length === 0) {
      console.log('✅ All students are properly synchronized between database and auth');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkTestStudentAuth(); 