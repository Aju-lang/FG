// Test script to verify Supabase setup
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './config.env' });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testSupabaseConnection() {
  try {
    console.log('🔍 Testing Supabase connection...');
    
    // Test 1: Check if we can connect and see existing data
    const { data, error } = await supabase
      .from('students')
      .select('id, name, email, username')
      .limit(5);
    
    if (error) {
      console.error('❌ Connection failed:', error);
      return;
    }
    
    console.log('✅ Supabase connection successful!');
    console.log('📊 Found students:', data?.length || 0);
    
    if (data && data.length > 0) {
      console.log('👥 Existing students:');
      data.forEach(student => {
        console.log(`  - ${student.name} (${student.username})`);
      });
    }
    
    // Test 2: Try to find the test student
    console.log('\n🔍 Looking for test student...');
    
    const { data: testStudent, error: findError } = await supabase
      .from('students')
      .select('id, name, email, username')
      .eq('username', 'teststudent101')
      .single();
    
    if (findError) {
      console.log('❌ Test student not found, creating one...');
      
      // Create a minimal test student
      const newStudent = {
        username: 'teststudent101',
        password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/5J5K5K5', // hashed 'testpassword'
        email: 'test@fg-school.com',
        name: 'Test Student',
        class: '10th',
        division: 'A',
        parentName: 'Test Parent',
        place: 'Test City',
        qrToken: 'test_qr_token_123',
        qrCodeImage: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
        role: 'student',
        bio: 'Hi! I\'m Test Student, a 10th student at FG School.',
        mission: 'To excel in my studies and contribute positively to my school.',
        skills: ['Learning', 'Curious', 'Team Player'],
        interests: ['Reading', 'Sports', 'Technology'],
        totalPoints: 0,
        certificates: 0,
        rewardPoints: 0
      };
      
      const { data: insertData, error: insertError } = await supabase
        .from('students')
        .insert([newStudent])
        .select('id, name, email, username');
      
      if (insertError) {
        console.error('❌ Failed to create test student:', insertError);
        return;
      }
      
      console.log('✅ Test student created successfully!');
    } else {
      console.log('✅ Test student found:', testStudent.name);
    }
    
    console.log('\n🎉 Database setup is working!');
    console.log('\n📋 Test Credentials:');
    console.log('📧 Email: test@fg-school.com');
    console.log('👤 Username: teststudent101');
    console.log('🔑 Password: testpassword');
    console.log('🔗 QR Token: test_qr_token_123');
    
    console.log('\n📋 Next steps:');
    console.log('1. Start the backend server: npm run dev');
    console.log('2. Start the frontend: cd .. && npm run dev');
    console.log('3. Test login with the credentials above');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testSupabaseConnection(); 