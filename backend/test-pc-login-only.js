const axios = require('axios');

async function testPCLoginOnly() {
  try {
    console.log('🧪 Testing PC login only...\n');

    // Test PC login
    console.log('1️⃣ Testing PC login...');
    const pcLoginResponse = await axios.post('http://localhost:5000/login', {
      username: 'admin',
      password: 'admin123',
      role: 'primary'
    });

    console.log('✅ PC Login successful!');
    console.log(`Token: ${pcLoginResponse.data.token.substring(0, 20)}...`);
    console.log(`User: ${pcLoginResponse.data.user.name}`);
    console.log(`Role: ${pcLoginResponse.data.user.role}`);

  } catch (error) {
    console.error('❌ PC Login failed:', error.response?.data || error.message);
  }
}

testPCLoginOnly(); 