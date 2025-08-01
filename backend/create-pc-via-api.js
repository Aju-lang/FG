const axios = require('axios');

async function createPrimaryControllerViaAPI() {
  try {
    console.log('🔧 Creating Primary Controller via API...\n');

    const controllerData = {
      name: 'Admin Controller',
      email: 'admin@fgschool.com',
      username: 'admin',
      password: 'admin123'
    };

    const response = await axios.post('http://localhost:5000/create-primary-controller', controllerData);
    
    console.log('✅ Primary Controller created successfully!');
    console.log('📋 Controller Details:');
    console.log(`   Username: ${response.data.controller.username}`);
    console.log(`   Password: ${response.data.controller.password}`);
    console.log(`   Email: ${response.data.controller.email}`);
    console.log(`   QR Token: ${response.data.controller.qrToken}`);
    console.log('\n🔗 You can now login with these credentials at http://localhost:3000/login');
    
    // Test the login immediately
    console.log('\n🧪 Testing login...');
    const loginResponse = await axios.post('http://localhost:5000/login', {
      username: 'admin',
      password: 'admin123',
      role: 'primary'
    });

    console.log('✅ Login test successful!');
    console.log(`   User: ${loginResponse.data.user.name}`);
    console.log(`   Role: ${loginResponse.data.user.role}`);
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

createPrimaryControllerViaAPI(); 