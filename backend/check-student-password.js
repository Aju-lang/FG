const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: './config.env' });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkStudentPassword() {
  try {
    console.log('🔍 Checking student password...\n');

    // Get the latest student
    const { data: students, error } = await supabase
      .from('students')
      .select('*')
      .order('createdat', { ascending: false })
      .limit(1);

    if (error || !students || students.length === 0) {
      console.error('❌ Error getting student:', error);
      return;
    }

    const student = students[0];
    console.log(`📋 Student: ${student.name}`);
    console.log(`   Username: ${student.username}`);
    console.log(`   Email: ${student.email}`);
    console.log(`   Password Hash: ${student.password}`);

    // Test common passwords that might have been generated
    const possiblePasswords = [
      `${student.name.replace(/\s+/g, '')}${Math.floor(Math.random() * 9901) + 100}`,
      `${student.name.replace(/\s+/g, '')}101`,
      `${student.name.replace(/\s+/g, '')}123`,
      `${student.name.replace(/\s+/g, '')}2024`,
      `${student.name.replace(/\s+/g, '')}2025`,
      'UniqueTestStudent5685', // From our test
      'teststudent101123',
      'teststudent101456',
      'teststudent101789'
    ];

    console.log('\n🔐 Testing possible passwords...');
    let foundPassword = null;

    for (const password of possiblePasswords) {
      const isValid = await bcrypt.compare(password, student.password);
      if (isValid) {
        foundPassword = password;
        console.log(`✅ Found correct password: ${password}`);
        break;
      }
    }

    if (!foundPassword) {
      console.log('❌ Could not find the correct password');
      console.log('📧 Check the email that was sent for the actual password');
    }

    console.log('\n🔑 Login Instructions:');
    console.log(`   1. Go to: http://localhost:3000/login`);
    console.log(`   2. Username: ${student.username}`);
    console.log(`   3. Password: ${foundPassword || '(check email)'}`);
    console.log(`   4. Role: Student`);
    console.log(`   5. Or try email: ${student.email}`);

    // Also test with the known working password
    console.log('\n🧪 Testing with known working password...');
    const testData = {
      username: student.username,
      password: 'UniqueTestStudent5685', // This worked in our test
      role: 'student'
    };

    const axios = require('axios');
    try {
      const response = await axios.post('http://localhost:5000/login', testData);
      console.log('✅ Login test successful!');
      console.log(`   User: ${response.data.user.name}`);
      console.log(`   Role: ${response.data.user.role}`);
    } catch (error) {
      console.error('❌ Login test failed:', error.response?.data || error.message);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkStudentPassword(); 