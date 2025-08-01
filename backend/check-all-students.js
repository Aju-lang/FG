const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './config.env' });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkAllStudents() {
  try {
    console.log('🔍 Checking all students in database...\n');

    // Get all students
    const { data: students, error } = await supabase
      .from('students')
      .select('*')
      .order('createdat', { ascending: false });

    if (error) {
      console.error('❌ Error accessing students table:', error);
      return;
    }

    if (!students || students.length === 0) {
      console.log('❌ No students found in database');
      return;
    }

    console.log(`✅ Found ${students.length} student(s):\n`);

    students.forEach((student, index) => {
      console.log(`📋 Student ${index + 1}:`);
      console.log(`   ID: ${student.id}`);
      console.log(`   Name: ${student.name}`);
      console.log(`   Username: ${student.username}`);
      console.log(`   Email: ${student.email}`);
      console.log(`   Password Hash: ${student.password.substring(0, 20)}...`);
      console.log(`   Class: ${student.class}-${student.division}`);
      console.log(`   Parent: ${student.parentname}`);
      console.log(`   Place: ${student.place}`);
      console.log(`   QR Token: ${student.qrtoken || 'Not set'}`);
      console.log(`   Role: ${student.role}`);
      console.log(`   Created: ${student.createdat}`);
      console.log(`   Last Login: ${student.lastlogin || 'Never'}`);
      console.log('');
    });

    console.log('🔑 Available Login Credentials:');
    students.forEach((student, index) => {
      console.log(`\n${index + 1}. ${student.name}:`);
      console.log(`   Username: ${student.username}`);
      console.log(`   Email: ${student.email}`);
      console.log(`   Password: (check email or use test password)`);
      console.log(`   Role: Student`);
    });

    console.log('\n🌐 Frontend Login Instructions:');
    console.log(`   1. Go to: http://localhost:3000/login`);
    console.log(`   2. Use any of the usernames above`);
    console.log(`   3. Password: (check the email that was sent)`);
    console.log(`   4. Role: Student`);
    console.log(`   5. Or try email instead of username`);

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkAllStudents(); 