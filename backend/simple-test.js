const axios = require('axios');

async function simpleTest() {
  try {
    console.log('🧪 Simple test...\n');

    // Test 1: Login as PC
    console.log('1️⃣ Testing PC login...');
    const pcLoginResponse = await axios.post('http://localhost:5000/login', {
      username: 'admin',
      password: 'admin123',
      role: 'primary'
    });

    console.log('✅ PC Login successful');
    console.log(`Token: ${pcLoginResponse.data.token.substring(0, 20)}...\n`);

    // Test 2: Try to register a student
    console.log('2️⃣ Testing student registration...');
    const studentData = {
      name: 'Simple Test',
      email: 'simpletest@fgschool.com',
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

    } catch (registerError) {
      console.error('❌ Registration failed:', registerError.response?.data || registerError.message);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

simpleTest(); 