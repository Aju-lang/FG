const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './config.env' });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function getPCCredentials() {
  try {
    console.log('🔍 Retrieving Primary Controller credentials from Supabase...\n');

    // Get all primary controllers
    const { data: controllers, error } = await supabase
      .from('primary_controllers')
      .select('*');

    if (error) {
      console.error('❌ Error accessing primary_controllers table:', error);
      return;
    }

    if (!controllers || controllers.length === 0) {
      console.log('❌ No primary controllers found in database');
      return;
    }

    console.log(`✅ Found ${controllers.length} primary controller(s):\n`);

    controllers.forEach((controller, index) => {
      console.log(`📋 Primary Controller ${index + 1}:`);
      console.log(`   ID: ${controller.id}`);
      console.log(`   Name: ${controller.name}`);
      console.log(`   Username: ${controller.username}`);
      console.log(`   Email: ${controller.email}`);
      console.log(`   Password Hash: ${controller.password}`);
      console.log(`   QR Token: ${controller.qrtoken || 'Not set'}`);
      console.log(`   Role: ${controller.role}`);
      console.log(`   Is Active: ${controller.isactive}`);
      console.log(`   Created: ${controller.createdat}`);
      console.log(`   Last Login: ${controller.lastlogin || 'Never'}`);
      console.log('');
    });

    // Test the login with the first controller
    console.log('🧪 Testing login with first controller...');
    const testController = controllers[0];
    
    console.log(`\n📋 Login Credentials for Testing:`);
    console.log(`   Username: ${testController.username}`);
    console.log(`   Password: admin123 (plain text)`);
    console.log(`   Email: ${testController.email}`);
    console.log(`   QR Token: ${testController.qrtoken || 'Not available'}`);
    
    console.log(`\n🔗 Test URLs:`);
    console.log(`   Frontend Login: http://localhost:3000/login`);
    console.log(`   Backend Health: http://localhost:5000/health`);

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

getPCCredentials(); 