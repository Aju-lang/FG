const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './config.env' });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkPrimaryControllers() {
  try {
    console.log('🔍 Checking Primary Controllers table...\n');

    // Check if table exists and get all records
    const { data: controllers, error } = await supabase
      .from('primary_controllers')
      .select('*');

    if (error) {
      console.error('❌ Error accessing primary_controllers table:', error);
      return;
    }

    console.log(`📊 Found ${controllers.length} primary controller(s):`);
    
    controllers.forEach((controller, index) => {
      console.log(`\n${index + 1}. Controller Details:`);
      console.log(`   ID: ${controller.id}`);
      console.log(`   Username: ${controller.username}`);
      console.log(`   Email: ${controller.email}`);
      console.log(`   Name: ${controller.name}`);
      console.log(`   Password Hash: ${controller.password}`);
      console.log(`   QR Token: ${controller.qrToken}`);
      console.log(`   Role: ${controller.role}`);
      console.log(`   Is Active: ${controller.isActive}`);
    });

    // Test password verification
    const bcrypt = require('bcryptjs');
    const testPassword = 'admin123';
    
    console.log('\n🔐 Testing password verification...');
    for (const controller of controllers) {
      const isValid = await bcrypt.compare(testPassword, controller.password);
      console.log(`   Controller ${controller.username}: ${isValid ? '✅ Valid' : '❌ Invalid'} password`);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkPrimaryControllers(); 