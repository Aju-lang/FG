const axios = require('axios');

async function testUniqueRegistration() {
  try {
    console.log('🧪 Testing unique student registration...\n');

    // Test 1: Login as PC
    console.log('1️⃣ Logging in as Primary Controller...');
    const pcLoginResponse = await axios.post('http://localhost:5000/login', {
      username: 'admin',
      password: 'admin123',
      role: 'primary'
    });

    console.log('✅ PC Login successful\n');

    // Test 2: Register a student with unique email
    console.log('2️⃣ Registering a student with unique email...');
    const uniqueEmail = `student-${Date.now()}@fgschool.com`;
    const studentData = {
      name: 'Unique Test Student',
      email: uniqueEmail,
      class: '10',
      division: 'A',
      parentName: 'Test Parent',
      place: 'Test City'
    };

    try {
      const registerResponse = await axios.post('http://localhost:5000/register', studentData, {
        headers: {
          'Authorization': `Bearer ${pcLoginResponse.data.token}`
        }
      });

      console.log('✅ Registration successful!');
      console.log(`Student: ${registerResponse.data.student.name}`);
      console.log(`Username: ${registerResponse.data.student.username}`);
      console.log(`Password: ${registerResponse.data.student.password}`);
      console.log(`Email: ${registerResponse.data.student.email}`);

      // Test 3: Try to login with the new student
      console.log('\n3️⃣ Testing student login...');
      const studentLoginResponse = await axios.post('http://localhost:5000/login', {
        username: registerResponse.data.student.username,
        password: registerResponse.data.student.password,
        role: 'student'
      });

      console.log('✅ Student login successful!');
      console.log(`User: ${studentLoginResponse.data.user.name}`);
      console.log(`Role: ${studentLoginResponse.data.user.role}`);

    } catch (registerError) {
      console.error('❌ Registration failed:', registerError.response?.data || registerError.message);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testUniqueRegistration(); 