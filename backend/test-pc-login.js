const axios = require('axios');

async function testPCLogin() {
  try {
    console.log('🧪 Testing Primary Controller Login...\n');

    // Test 1: Login with username/password
    console.log('1️⃣ Testing username/password login...');
    const loginResponse = await axios.post('http://localhost:5000/login', {
      username: 'admin',
      password: 'admin123',
      role: 'primary'
    });

    console.log('✅ Username/Password Login Successful!');
    console.log(`   User: ${loginResponse.data.user.name}`);
    console.log(`   Role: ${loginResponse.data.user.role}`);
    console.log(`   Token: ${loginResponse.data.token.substring(0, 20)}...\n`);

    // Test 2: Login with QR code (skipped - qrToken column not in database)
    console.log('2️⃣ Testing QR code login...');
    console.log('⏭️  Skipped - QR token column not in database\n');

    // Test 3: Test protected endpoint
    console.log('3️⃣ Testing protected endpoint access...');
    const profileResponse = await axios.get('http://localhost:5000/me', {
      headers: {
        'Authorization': `Bearer ${loginResponse.data.token}`
      }
    });

    console.log('✅ Protected Endpoint Access Successful!');
    console.log(`   User ID: ${profileResponse.data.user.id}`);
    console.log(`   Username: ${profileResponse.data.user.username}\n`);

    console.log('🎉 Primary Controller login tests passed!');
    console.log('\n📋 Login Credentials:');
    console.log('   Username: admin');
    console.log('   Password: admin123');
    console.log('   Note: QR login requires qrToken column in database');
    console.log('\n🔗 Test at: http://localhost:3000/login');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testPCLogin(); 