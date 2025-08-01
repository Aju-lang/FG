const axios = require('axios');

async function testStudentLogin() {
  try {
    console.log('🧪 Testing Student Login...\n');

    // Test with the student that was just created
    const studentData = {
      username: 'uniqueteststudent', // This was from the test
      password: 'UniqueTestStudent5685', // This was from the test
      role: 'student'
    };

    console.log('1️⃣ Testing student login with username...');
    console.log(`   Username: ${studentData.username}`);
    console.log(`   Password: ${studentData.password}`);
    console.log(`   Role: ${studentData.role}`);

    try {
      const loginResponse = await axios.post('http://localhost:5000/login', studentData);
      
      console.log('✅ Student login successful!');
      console.log(`   User: ${loginResponse.data.user.name}`);
      console.log(`   Role: ${loginResponse.data.user.role}`);
      console.log(`   Token: ${loginResponse.data.token.substring(0, 20)}...`);
      
    } catch (loginError) {
      console.error('❌ Student login failed:', loginError.response?.data || loginError.message);
    }

    // Test with email instead of username
    console.log('\n2️⃣ Testing student login with email...');
    const emailData = {
      username: 'student-1753954420592@fgschool.com', // Email from test
      password: 'UniqueTestStudent5685',
      role: 'student'
    };

    try {
      const emailLoginResponse = await axios.post('http://localhost:5000/login', emailData);
      
      console.log('✅ Email login successful!');
      console.log(`   User: ${emailLoginResponse.data.user.name}`);
      console.log(`   Role: ${emailLoginResponse.data.user.role}`);
      
    } catch (emailLoginError) {
      console.error('❌ Email login failed:', emailLoginError.response?.data || emailLoginError.message);
    }

    // Test QR code login
    console.log('\n3️⃣ Testing QR code login...');
    const qrData = {
      qrToken: 'admin_qr_token_123', // This is the PC token, but let's test the format
      role: 'student'
    };

    try {
      const qrLoginResponse = await axios.post('http://localhost:5000/login-qr', qrData);
      
      console.log('✅ QR login successful!');
      console.log(`   User: ${qrLoginResponse.data.user.name}`);
      console.log(`   Role: ${qrLoginResponse.data.user.role}`);
      
    } catch (qrLoginError) {
      console.error('❌ QR login failed:', qrLoginError.response?.data || qrLoginError.message);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testStudentLogin(); 