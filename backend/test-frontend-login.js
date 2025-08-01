const axios = require('axios');

async function testFrontendLogin() {
  try {
    console.log('🧪 Testing Frontend Login Simulation...\n');

    // Simulate exactly what the frontend sends
    const frontendData = {
      username: 'johndoe',
      password: 'JohnDoe8047',
      role: 'student'
    };

    console.log('📤 Frontend sends this data:');
    console.log(JSON.stringify(frontendData, null, 2));

    try {
      const response = await axios.post('http://localhost:5000/login', frontendData);
      
      console.log('\n✅ Backend responds successfully:');
      console.log(`   User: ${response.data.user.name}`);
      console.log(`   Role: ${response.data.user.role}`);
      console.log(`   Token: ${response.data.token.substring(0, 20)}...`);
      
    } catch (error) {
      console.error('\n❌ Backend responds with error:');
      console.error(`   Status: ${error.response?.status}`);
      console.error(`   Message: ${error.response?.data?.error}`);
    }

    // Test with email instead
    console.log('\n📤 Frontend sends email data:');
    const emailData = {
      username: 'john.doe@fgschool.com',
      password: 'JohnDoe8047',
      role: 'student'
    };
    console.log(JSON.stringify(emailData, null, 2));

    try {
      const emailResponse = await axios.post('http://localhost:5000/login', emailData);
      
      console.log('\n✅ Email login successful:');
      console.log(`   User: ${emailResponse.data.user.name}`);
      console.log(`   Role: ${emailResponse.data.user.role}`);
      
    } catch (error) {
      console.error('\n❌ Email login failed:');
      console.error(`   Status: ${error.response?.status}`);
      console.error(`   Message: ${error.response?.data?.error}`);
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testFrontendLogin(); 