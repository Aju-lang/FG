const axios = require('axios');

async function debugPCLogin() {
  try {
    console.log('🔍 Debugging PC Login...\n');

    // Test 1: Check if backend is running
    console.log('🌐 Test 1: Checking if backend is running...');
    try {
      const healthResponse = await axios.get('http://localhost:5000/health');
      console.log('✅ Backend is running:', healthResponse.data);
    } catch (error) {
      console.error('❌ Backend not accessible:', error.message);
      return;
    }

    // Test 2: Try PC login with detailed error
    console.log('\n🔐 Test 2: Trying PC login...');
    try {
      const response = await axios.post('http://localhost:5000/login', {
        username: 'admin',
        password: 'admin123',
        role: 'primary'
      });
      
      console.log('✅ Login successful!');
      console.log('Response:', response.data);
      
    } catch (error) {
      console.error('❌ Login failed:');
      console.error('   Status:', error.response?.status);
      console.error('   Status Text:', error.response?.statusText);
      console.error('   Data:', error.response?.data);
      console.error('   Message:', error.message);
      
      if (error.response?.status === 401) {
        console.log('\n💡 This suggests the credentials are incorrect');
      }
    }

    // Test 3: Try with different password
    console.log('\n🔐 Test 3: Trying with different password...');
    try {
      const response = await axios.post('http://localhost:5000/login', {
        username: 'admin',
        password: 'Admin123',
        role: 'primary'
      });
      
      console.log('✅ Login successful with Admin123!');
      console.log('Response:', response.data);
      
    } catch (error) {
      console.error('❌ Login failed with Admin123:', error.response?.data || error.message);
    }

    // Test 4: Try without role
    console.log('\n🔐 Test 4: Trying without role...');
    try {
      const response = await axios.post('http://localhost:5000/login', {
        username: 'admin',
        password: 'admin123'
      });
      
      console.log('✅ Login successful without role!');
      console.log('Response:', response.data);
      
    } catch (error) {
      console.error('❌ Login failed without role:', error.response?.data || error.message);
    }

  } catch (error) {
    console.error('❌ Debug failed:', error);
  }
}

debugPCLogin(); 