const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
const QRCode = require('qrcode');
require('dotenv').config({ path: './config.env' });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fixPrimaryController() {
  try {
    console.log('🔧 Fixing Primary Controller password and QR token...\n');

    // Generate correct password hash
    const password = 'admin123';
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Generate QR token and QR code
    const qrToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const qrData = JSON.stringify({
      type: 'login',
      username: 'admin',
      password: password,
      role: 'primary'
    });
    
    const qrCodeImage = await QRCode.toDataURL(qrData);

    // Update the existing controller
    const { data, error } = await supabase
      .from('primary_controllers')
      .update({
        password: hashedPassword
      })
      .eq('username', 'admin')
      .select();

    if (error) {
      console.error('❌ Error updating controller:', error);
      return;
    }

    console.log('✅ Primary Controller updated successfully!');
    console.log('📋 Updated Details:');
    console.log(`   Username: ${data[0].username}`);
    console.log(`   Password: ${password} (plain text for testing)`);
    console.log(`   Password Hash: ${data[0].password}`);
    console.log(`   QR Token: ${data[0].qrToken}`);

    // Test the password
    const isValid = await bcrypt.compare(password, data[0].password);
    console.log(`   Password Verification: ${isValid ? '✅ Valid' : '❌ Invalid'}`);

    console.log('\n🔗 You can now login with:');
    console.log('   Username: admin');
    console.log('   Password: admin123');
    console.log(`   QR Token: ${data[0].qrToken}`);

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

fixPrimaryController(); 