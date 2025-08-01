const axios = require('axios');

async function testStudentRegistration() {
  try {
    console.log('🧪 Testing Student Registration and Login...\n');

    // Step 1: Login as Primary Controller to get token
    console.log('1️⃣ Logging in as Primary Controller...');
    const pcLoginResponse = await axios.post('http://localhost:5000/login', {
      username: 'admin',
      password: 'admin123',
      role: 'primary'
    });

    const pcToken = pcLoginResponse.data.token;
    console.log('✅ PC Login successful\n');

    // Step 2: Register a new student
    console.log('2️⃣ Registering a new student...');
    const studentData = {
      name: 'Test Student',
      email: 'teststudent@fgschool.com',
      class: '10',
      division: 'A',
      parentName: 'Test Parent',
      place: 'Test City',
      rollNumber: '101',
      phone: '1234567890'
    };

    const registerResponse = await axios.post('http://localhost:5000/register', studentData, {
      headers: {
        'Authorization': `Bearer ${pcToken}`
      }
    });

    console.log('✅ Student registration successful!');
    console.log('📋 Student Details:');
    console.log(`   Username: ${registerResponse.data.student.username}`);
    console.log(`   Password: ${registerResponse.data.student.password}`);
    console.log(`   Email: ${registerResponse.data.student.email}`);
    console.log(`   QR Token: ${registerResponse.data.student.qrToken}\n`);

    // Step 3: Test student login with username
    console.log('3️⃣ Testing student login with username...');
    const studentLoginResponse = await axios.post('http://localhost:5000/login', {
      username: registerResponse.data.student.username,
      password: registerResponse.data.student.password,
      role: 'student'
    });

    console.log('✅ Student login successful!');
    console.log(`   User: ${studentLoginResponse.data.user.name}`);
    console.log(`   Role: ${studentLoginResponse.data.user.role}`);
    console.log(`   Token: ${studentLoginResponse.data.token.substring(0, 20)}...\n`);

    // Step 4: Test student login with email
    console.log('4️⃣ Testing student login with email...');
    const emailLoginResponse = await axios.post('http://localhost:5000/login', {
      username: registerResponse.data.student.email,
      password: registerResponse.data.student.password,
      role: 'student'
    });

    console.log('✅ Email login successful!\n');

    // Step 5: Test QR code login
    console.log('5️⃣ Testing QR code login...');
    const qrLoginResponse = await axios.post('http://localhost:5000/login-qr', {
      qrToken: registerResponse.data.student.qrToken,
      role: 'student'
    });

    console.log('✅ QR code login successful!\n');

    // Step 6: Test protected endpoint
    console.log('6️⃣ Testing protected endpoint access...');
    const profileResponse = await axios.get('http://localhost:5000/me', {
      headers: {
        'Authorization': `Bearer ${studentLoginResponse.data.token}`
      }
    });

    console.log('✅ Protected endpoint access successful!');
    console.log(`   User ID: ${profileResponse.data.user.id}`);
    console.log(`   Username: ${profileResponse.data.user.username}\n`);

    console.log('🎉 All tests passed! Student registration and login is working perfectly!');
    console.log('\n📋 Test Credentials:');
    console.log(`   Username: ${registerResponse.data.student.username}`);
    console.log(`   Password: ${registerResponse.data.student.password}`);
    console.log(`   Email: ${registerResponse.data.student.email}`);
    console.log(`   QR Token: ${registerResponse.data.student.qrToken}`);
    console.log('\n🔗 Test at: http://localhost:3000/login');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testStudentRegistration(); 