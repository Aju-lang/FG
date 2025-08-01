const axios = require('axios');
require('dotenv').config({ path: './config.env' });

async function testEmailSetup() {
  try {
    console.log('🧪 Testing EmailJS Setup...\n');

    // Check environment variables
    const serviceId = process.env.EMAILJS_SERVICE_ID;
    const templateId = process.env.EMAILJS_TEMPLATE_ID;
    const publicKey = process.env.EMAILJS_PUBLIC_KEY;

    console.log('📧 EmailJS Configuration:');
    console.log(`   Service ID: ${serviceId || '❌ Missing'}`);
    console.log(`   Template ID: ${templateId || '❌ Missing'}`);
    console.log(`   Public Key: ${publicKey || '❌ Missing'}`);

    if (!serviceId || !templateId || !publicKey || publicKey === 'your-emailjs-public-key') {
      console.log('\n❌ EmailJS not properly configured!');
      console.log('\n📝 To fix this:');
      console.log('1. Go to https://www.emailjs.com/');
      console.log('2. Create an account and get your Public Key');
      console.log('3. Update backend/config.env with your real EmailJS_PUBLIC_KEY');
      console.log('4. Restart the backend server');
      return;
    }

    // Test email sending
    console.log('\n📤 Testing email sending...');
    const emailData = {
      service_id: serviceId,
      template_id: templateId,
      user_id: publicKey,
      template_params: {
        to_email: 'test@example.com',
        to_name: 'Test Student',
        username: 'teststudent',
        password: 'TestPassword123',
        qr_code_image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
        class: '10',
        division: 'A'
      }
    };

    try {
      const response = await axios.post('https://api.emailjs.com/api/v1.0/email/send', emailData);
      
      if (response.status === 200) {
        console.log('✅ EmailJS is working correctly!');
        console.log('   Response:', response.data);
      } else {
        console.log('❌ EmailJS test failed:', response.data);
      }
    } catch (error) {
      console.log('❌ EmailJS test failed:', error.response?.data || error.message);
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testEmailSetup(); 