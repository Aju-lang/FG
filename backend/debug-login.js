const axios = require('axios');

async function debugLogin() {
  try {
    console.log('🔍 Debugging Login Process...\n');

    // Test with the known working credentials
    const testCredentials = [
      {
        username: 'johndoe',
        password: 'JohnDoe8047',
        role: 'student',
        description: 'John Doe (from test)'
      },
      {
        username: 'uniqueteststudent',
        password: 'UniqueTestStudent5685',
        role: 'student',
        description: 'Unique Test Student (from test)'
      },
      {
        username: 'john.doe@fgschool.com',
        password: 'JohnDoe8047',
        role: 'student',
        description: 'John Doe email login'
      }
    ];

    for (const cred of testCredentials) {
      console.log(`\n🧪 Testing: ${cred.description}`);
      console.log(`   Username: ${cred.username}`);
      console.log(`   Password: ${cred.password}`);
      console.log(`   Role: ${cred.role}`);

      try {
        const response = await axios.post('http://localhost:5000/login', {
          username: cred.username,
          password: cred.password,
          role: cred.role
        });
        
        console.log('✅ Login successful!');
        console.log(`   User: ${response.data.user.name}`);
        console.log(`   Role: ${response.data.user.role}`);
        console.log(`   Token: ${response.data.token.substring(0, 20)}...`);
        
      } catch (error) {
        console.error('❌ Login failed:', error.response?.data || error.message);
        
        // If it's a 401, let's check what the actual error is
        if (error.response?.status === 401) {
          console.log('   🔍 This suggests the credentials are incorrect or user not found');
        }
      }
    }

    // Also test the API endpoint directly
    console.log('\n🌐 Testing API endpoint directly...');
    try {
      const healthResponse = await axios.get('http://localhost:5000/health');
      console.log('✅ Backend is running:', healthResponse.data);
    } catch (error) {
      console.error('❌ Backend not accessible:', error.message);
    }

  } catch (error) {
    console.error('❌ Debug failed:', error);
  }
}

debugLogin(); 