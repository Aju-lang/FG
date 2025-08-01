const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcrypt');
require('dotenv').config({ path: './config.env' });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fixPCPassword() {
  try {
    console.log('🔧 Fixing Primary Controller Password...\n');

    // Generate correct password hash for 'admin123'
    const password = 'admin123';
    const hashedPassword = await bcrypt.hash(password, 12);
    
    console.log('🔐 Generated password hash for "admin123":');
    console.log(`   Hash: ${hashedPassword}`);

    // Update the primary controller password
    console.log('\n🔄 Updating primary controller password...');
    const { data, error } = await supabase
      .from('primary_controllers')
      .update({ 
        password: hashedPassword,
        updatedat: new Date().toISOString()
      })
      .eq('username', 'admin')
      .select();

    if (error) {
      console.error('❌ Error updating password:', error);
      return;
    }

    console.log('✅ Password updated successfully!');
    console.log(`   Updated controller: ${data[0].username}`);

    // Test the login
    console.log('\n🧪 Testing login with new password...');
    const axios = require('axios');
    
    try {
      const response = await axios.post('http://localhost:5000/login', {
        username: 'admin',
        password: 'admin123',
        role: 'primary'
      });
      
      if (response.data.success) {
        console.log('✅ Login successful!');
        console.log(`   User: ${response.data.user.name}`);
        console.log(`   Role: ${response.data.user.role}`);
        console.log(`   Token: ${response.data.token.substring(0, 20)}...`);
      } else {
        console.log('❌ Login failed:', response.data.error);
      }
      
    } catch (error) {
      console.error('❌ Login test failed:', error.response?.data || error.message);
    }

    console.log('\n🎉 Password fix completed!');
    console.log('📝 Primary Controller Credentials:');
    console.log(`   Username: admin`);
    console.log(`   Password: admin123`);
    console.log(`   Role: Primary Controller`);

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

fixPCPassword(); 