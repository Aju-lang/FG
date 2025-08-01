const axios = require('axios');

async function testCompleteFlow() {
  try {
    console.log('🧪 Testing Complete Student Flow...\n');

    // Step 1: Login as Primary Controller
    console.log('1️⃣ Logging in as Primary Controller...');
    const pcLoginData = {
      username: 'admin',
      password: 'admin123',
      role: 'primary'
    };

    let pcToken;
    try {
      const pcLoginResponse = await axios.post('http://localhost:5000/login', pcLoginData);
      console.log('✅ Primary Controller login successful!');
      pcToken = pcLoginResponse.data.token;
    } catch (error) {
      console.error('❌ Primary Controller login failed:', error.response?.data || error.message);
      return;
    }

    // Step 2: Register a new student using PC token
    console.log('\n2️⃣ Registering a new student...');
    const studentData = {
      name: 'John Doe',
      email: 'john.doe@fgschool.com',
      class: '10',
      division: 'A',
      parentName: 'Jane Doe',
      place: 'New York',
      rollNumber: '101',
      phone: '1234567890'
    };

    try {
      const registerResponse = await axios.post('http://localhost:5000/register', studentData, {
        headers: { Authorization: `Bearer ${pcToken}` }
      });
      console.log('✅ Student registered successfully!');
      console.log(`   Username: ${registerResponse.data.student.username}`);
      console.log(`   Password: ${registerResponse.data.student.password}`);
      console.log(`   Email: ${registerResponse.data.student.email}`);
      console.log(`   QR Token: ${registerResponse.data.student.qrToken}`);
      
      const { username, password, email, qrToken } = registerResponse.data.student;

      // Step 3: Test student login with username
      console.log('\n3️⃣ Testing student login with username...');
      const loginData = {
        username: username,
        password: password,
        role: 'student'
      };

      const loginResponse = await axios.post('http://localhost:5000/login', loginData);
      console.log('✅ Student login successful!');
      console.log(`   User: ${loginResponse.data.user.name}`);
      console.log(`   Role: ${loginResponse.data.user.role}`);
      console.log(`   Token: ${loginResponse.data.token.substring(0, 20)}...`);

      // Step 4: Test student login with email
      console.log('\n4️⃣ Testing student login with email...');
      const emailLoginData = {
        username: email,
        password: password,
        role: 'student'
      };

      const emailLoginResponse = await axios.post('http://localhost:5000/login', emailLoginData);
      console.log('✅ Email login successful!');
      console.log(`   User: ${emailLoginResponse.data.user.name}`);

      // Step 5: Test QR login
      console.log('\n5️⃣ Testing QR login...');
      const qrLoginData = {
        qrToken: qrToken,
        role: 'student'
      };

      const qrLoginResponse = await axios.post('http://localhost:5000/login-qr', qrLoginData);
      console.log('✅ QR login successful!');
      console.log(`   User: ${qrLoginResponse.data.user.name}`);

      // Step 6: Test protected endpoint
      console.log('\n6️⃣ Testing protected endpoint...');
      const studentToken = loginResponse.data.token;
      const profileResponse = await axios.get('http://localhost:5000/me', {
        headers: { Authorization: `Bearer ${studentToken}` }
      });
      console.log('✅ Protected endpoint accessible!');
      console.log(`   User: ${profileResponse.data.user.name}`);

      console.log('\n🎉 All tests passed! The complete flow is working.');
      console.log('\n📋 Summary of working credentials:');
      console.log(`   Username: ${username}`);
      console.log(`   Password: ${password}`);
      console.log(`   Email: ${email}`);
      console.log(`   QR Token: ${qrToken}`);
      console.log(`   Role: Student`);

      console.log('\n🌐 Frontend Login Instructions:');
      console.log(`   1. Go to: http://localhost:3000/login`);
      console.log(`   2. Username: ${username}`);
      console.log(`   3. Password: ${password}`);
      console.log(`   4. Role: Student`);
      console.log(`   5. Click Login`);
      console.log(`   6. After login, click the About Me icon in navbar`);

    } catch (error) {
      console.error('❌ Test failed:', error.response?.data || error.message);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testCompleteFlow(); 