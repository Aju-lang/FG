const bcrypt = require('bcryptjs');

async function generatePasswordHash() {
  try {
    const password = 'admin123';
    const hashedPassword = await bcrypt.hash(password, 12);
    
    console.log('🔐 Password Hash Generated:');
    console.log(`   Original Password: ${password}`);
    console.log(`   Hashed Password: ${hashedPassword}`);
    
    // Test the hash
    const isValid = await bcrypt.compare(password, hashedPassword);
    console.log(`   Hash Verification: ${isValid ? '✅ Valid' : '❌ Invalid'}`);
    
    console.log('\n📋 Use this hash in your SQL script:');
    console.log(`   '${hashedPassword}'`);
    
  } catch (error) {
    console.error('❌ Error generating password hash:', error);
  }
}

generatePasswordHash(); 