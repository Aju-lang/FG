const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './config.env' });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkPCCredentials() {
  try {
    console.log('🔍 Checking Primary Controller Credentials...\n');

    // Check if primary_controllers table exists and has data
    const { data: controllers, error } = await supabase
      .from('primary_controllers')
      .select('*');

    if (error) {
      console.error('❌ Error accessing primary_controllers table:', error);
      return;
    }

    if (!controllers || controllers.length === 0) {
      console.log('❌ No primary controllers found in database');
      console.log('💡 You need to run the SQL script to create the primary_controllers table');
      return;
    }

    console.log(`✅ Found ${controllers.length} primary controller(s):\n`);

    controllers.forEach((controller, index) => {
      console.log(`📋 Controller ${index + 1}:`);
      console.log(`   ID: ${controller.id}`);
      console.log(`   Username: ${controller.username}`);
      console.log(`   Name: ${controller.name}`);
      console.log(`   Email: ${controller.email}`);
      console.log(`   Password Hash: ${controller.password.substring(0, 20)}...`);
      console.log(`   Role: ${controller.role}`);
      console.log(`   Is Active: ${controller.isactive}`);
      console.log(`   Created: ${controller.createdat}`);
      console.log(`   Last Login: ${controller.lastlogin || 'Never'}`);
      console.log('');
    });

    // Test login with each controller
    console.log('🧪 Testing login with each controller...\n');
    
    for (const controller of controllers) {
      console.log(`🔐 Testing login for: ${controller.username}`);
      
      try {
        const axios = require('axios');
        const response = await axios.post('http://localhost:5000/login', {
          username: controller.username,
          password: 'admin123', // Try the default password
          role: 'primary'
        });
        
        if (response.data.success) {
          console.log('✅ Login successful!');
          console.log(`   User: ${response.data.user.name}`);
          console.log(`   Token: ${response.data.token.substring(0, 20)}...`);
        } else {
          console.log('❌ Login failed:', response.data.error);
        }
        
      } catch (error) {
        console.error('❌ Login error:', error.response?.data || error.message);
      }
      
      console.log('');
    }

    console.log('🔑 Available PC Login Credentials:');
    controllers.forEach((controller, index) => {
      console.log(`\n${index + 1}. ${controller.name}:`);
      console.log(`   Username: ${controller.username}`);
      console.log(`   Email: ${controller.email}`);
      console.log(`   Password: admin123 (default)`);
      console.log(`   Role: Primary Controller`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkPCCredentials(); 