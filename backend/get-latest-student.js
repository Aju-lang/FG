const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './config.env' });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function getLatestStudent() {
  try {
    console.log('🔍 Getting latest student credentials...\n');

    // Get the most recent student
    const { data: students, error } = await supabase
      .from('students')
      .select('*')
      .order('createdat', { ascending: false })
      .limit(5);

    if (error) {
      console.error('❌ Error accessing students table:', error);
      return;
    }

    if (!students || students.length === 0) {
      console.log('❌ No students found in database');
      return;
    }

    console.log(`✅ Found ${students.length} recent student(s):\n`);

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
      console.log('');
    });

    // Show login instructions
    const latestStudent = students[0];
    console.log('🔑 Login Instructions:');
    console.log(`   1. Go to: http://localhost:3000/login`);
    console.log(`   2. Username: ${latestStudent.username}`);
    console.log(`   3. Password: (check the email that was sent)`);
    console.log(`   4. Role: Student`);
    console.log(`   5. Or try email: ${latestStudent.email}`);
    console.log('');
    console.log('📧 Email should contain:');
    console.log(`   - Username: ${latestStudent.username}`);
    console.log(`   - Password: (generated password)`);
    console.log(`   - QR Code for quick login`);

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

getLatestStudent(); 