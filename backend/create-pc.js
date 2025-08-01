const axios = require('axios');

async function createPrimaryController() {
  try {
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
    
  } catch (error) {
    console.error('❌ Error creating primary controller:', error.response?.data || error.message);
  }
}

createPrimaryController(); 