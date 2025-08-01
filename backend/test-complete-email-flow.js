const axios = require('axios');

async function testCompleteEmailFlow() {
  try {
    console.log('🧪 Testing Complete Email Flow...\n');

    // Step 1: Login as Primary Controller
    console.log('🔐 Step 1: Logging in as Primary Controller...');
    const loginResponse = await axios.post('http://localhost:5000/login', {
      username: 'admin',
      password: 'admin123',
      role: 'primary'
    });

    if (!loginResponse.data.success) {
      console.error('❌ PC login failed:', loginResponse.data);
      return;
    }

    const token = loginResponse.data.token;
    console.log('✅ PC login successful!');

    // Step 2: Register a test student
    console.log('\n📤 Step 2: Registering test student...');
    const studentData = {
      name: 'Email Test Student',
      email: 'emailtest@fgschool.com',
      class: '10',
      division: 'A',
      parentName: 'Test Parent',
      place: 'Test City',
      rollNumber: '12345',
      phone: '1234567890'
    };

    const registerResponse = await axios.post('http://localhost:5000/register', studentData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (registerResponse.data.success) {
      console.log('✅ Student registration successful!');
      console.log(`   Student: ${registerResponse.data.student.name}`);
      console.log(`   Username: ${registerResponse.data.student.username}`);
      console.log(`   Password: ${registerResponse.data.student.password}`);
      console.log(`   Email: ${registerResponse.data.student.email}`);
      console.log('📧 Email data was logged - check backend console for email details');
    } else {
      console.error('❌ Student registration failed:', registerResponse.data);
    }

    // Step 3: Test student login
    console.log('\n🔐 Step 3: Testing student login...');
    const studentLoginResponse = await axios.post('http://localhost:5000/login', {
      username: registerResponse.data.student.username,
      password: registerResponse.data.student.password,
      role: 'student'
    });

    if (studentLoginResponse.data.success) {
      console.log('✅ Student login successful!');
      console.log(`   User: ${studentLoginResponse.data.user.name}`);
      console.log(`   Role: ${studentLoginResponse.data.user.role}`);
    } else {
      console.error('❌ Student login failed:', studentLoginResponse.data);
    }

    console.log('\n🎉 Test completed!');
    console.log('📝 Next steps:');
    console.log('1. Check the backend console for email data logs');
    console.log('2. Try registering a student via the frontend');
    console.log('3. The frontend will handle actual email sending');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testCompleteEmailFlow(); 