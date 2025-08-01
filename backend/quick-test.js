const axios = require('axios');

async function quickTest() {
  try {
    console.log('🧪 Quick Backend Test...\n');

    // Test 1: Health check
    console.log('🌐 Testing health endpoint...');
    const healthResponse = await axios.get('http://localhost:5000/health');
    console.log('✅ Backend is running:', healthResponse.data);

    // Test 2: PC Login
    console.log('\n🔐 Testing PC login...');
    const loginResponse = await axios.post('http://localhost:5000/login', {
      username: 'admin',
      password: 'admin123',
      role: 'primary'
    });
    
    console.log('✅ PC login successful!');
    console.log('   User:', loginResponse.data.user.name);
    console.log('   Token:', loginResponse.data.token.substring(0, 20) + '...');

    console.log('\n🎉 All tests passed!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

quickTest(); 