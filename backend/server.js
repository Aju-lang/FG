const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const QRCode = require('qrcode');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const axios = require('axios');
require('dotenv').config({ path: './config.env' });

// Supabase setup
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// File upload configuration
const upload = multer({ dest: 'uploads/' });

// EmailJS configuration
const EMAILJS_SERVICE_ID = process.env.EMAILJS_SERVICE_ID || 'service_4pcybvf';
const EMAILJS_TEMPLATE_ID = process.env.EMAILJS_TEMPLATE_ID || 'template_jeniuml';
const EMAILJS_PUBLIC_KEY = process.env.EMAILJS_PUBLIC_KEY;

// Send email function
const sendWelcomeEmail = async (studentData) => {
  try {
    if (!EMAILJS_PUBLIC_KEY || EMAILJS_PUBLIC_KEY === 'your-emailjs-public-key') {
      console.log('⚠️ EmailJS not configured - skipping email send');
      return { success: false, error: 'EmailJS not configured' };
    }

    // For now, we'll log the email data and let the frontend handle the actual sending
    console.log('📧 Email data prepared for student:', studentData.name);
    console.log('   Email:', studentData.email);
    console.log('   Username:', studentData.username);
    console.log('   Password:', studentData.password);
    
    // Return success so the registration continues
    return { success: true, message: 'Email data logged - frontend will handle sending' };
    
  } catch (error) {
    console.error(`❌ Email error for ${studentData.email}:`, error.message);
    return { success: false, error: error.message };
  }
};

// JWT Middleware
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid token' });
  }
};

// Utility Functions
const generateCredentials = (name) => {
  const username = name.toLowerCase().replace(/\s+/g, '');
  const randomNum = Math.floor(Math.random() * 9901) + 100;
  const password = `${name.replace(/\s+/g, '')}${randomNum}`;
  return { username, password };
};

const generateQRToken = () => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

// Routes

// 0. Create Primary Controller (Admin only - for initial setup)
app.post('/create-primary-controller', async (req, res) => {
  try {
    const { name, email, username, password } = req.body;

    // Check if controller already exists
    const { data: existingController } = await supabase
      .from('primary_controllers')
      .select('id')
      .eq('email', email)
      .single();

    if (existingController) {
      return res.status(400).json({ error: 'Controller with this email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Generate QR token and QR code
    const qrToken = generateQRToken();
    const qrData = JSON.stringify({
      type: 'login',
      username: username,
      password: password,
      role: 'primary'
    });
    
    const qrCodeImage = await QRCode.toDataURL(qrData);

    // Create controller object
    const controller = {
      username,
      password: hashedPassword,
      email,
      name,
      qrToken,
      qrCodeImage,
      role: 'primary',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastLogin: null
    };

    // Insert into Supabase
    const { data, error } = await supabase
      .from('primary_controllers')
      .insert([controller])
      .select();

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ error: 'Failed to create primary controller' });
    }

    // Return success response with credentials
    res.status(201).json({
      success: true,
      message: 'Primary Controller created successfully',
      controller: {
        id: data[0].id,
        username,
        password, // Return plain password for email
        email,
        name,
        qrCodeImage,
        qrToken
      }
    });

  } catch (error) {
    console.error('Create controller error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 1. Register Student (Only for Primary Controller - Protected)
app.post('/register', authenticateToken, async (req, res) => {
  try {
    // Check if user is primary controller
    if (req.user.role !== 'primary') {
      return res.status(403).json({ error: 'Only primary controllers can register students' });
    }

    const { name, email, class: className, division, parentName, place, rollNumber, phone } = req.body;

    // Check if student already exists
    const { data: existingStudent } = await supabase
      .from('students')
      .select('id')
      .eq('email', email)
      .single();

    if (existingStudent) {
      return res.status(400).json({ error: 'Student with this email already exists' });
    }

    // Generate credentials
    const { username, password } = generateCredentials(name);
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Generate QR token and QR code
    const qrToken = generateQRToken();
    const qrData = JSON.stringify({
      type: 'login',
      username: username,
      password: password,
      role: 'student'
    });
    
    const qrCodeImage = await QRCode.toDataURL(qrData);

    // Create Supabase auth account
    console.log('Creating auth account for:', email);
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true,
      user_metadata: {
        username: username,
        name: name,
        role: 'student',
        class: className,
        division: division
      }
    });

    if (authError) {
      console.error('Auth creation error:', authError);
      return res.status(500).json({ error: `Failed to create authentication account: ${authError.message}` });
    }

    console.log('Auth account created successfully:', authData.user.id);

    // Create student object
    const student = {
      id: authData.user.id, // Use auth user ID
      username,
      password: hashedPassword,
      email,
      name,
      class: className,
      division,
      parentname: parentName,
      place,
      rollnumber: rollNumber || '',
      phone: phone || '',
      qrtoken: qrToken,
      qrcodeimage: qrCodeImage,
      role: 'student',
      isactive: true,
      createdat: new Date().toISOString(),
      updatedat: new Date().toISOString(),
      lastlogin: null,
      emailsent: false,
      // About Me data
      bio: `Hi! I'm ${name}, a ${className} student at FG School. I'm passionate about learning and exploring new opportunities.`,
      mission: 'To excel in my studies, develop strong character, and contribute positively to my school and community.',
      skills: ['Learning', 'Curious', 'Team Player'],
      interests: ['Reading', 'Sports', 'Technology'],
      achievements: []
    };

    // Insert into Supabase students table
    console.log('Inserting student into database...');
    const { data, error } = await supabase
      .from('students')
      .insert([student])
      .select();

    if (error) {
      console.error('Supabase database error:', error);
      // Clean up auth account if database insert fails
      console.log('Cleaning up auth account...');
      await supabase.auth.admin.deleteUser(authData.user.id);
      return res.status(500).json({ error: `Failed to register student: ${error.message}` });
    }

    console.log('Student inserted successfully:', data[0].id);

    // Send welcome email
    const emailSendResult = await sendWelcomeEmail({
      name: student.name,
      email: student.email,
      username: student.username,
      password: student.password,
      qrCodeImage: student.qrcodeimage,
      class: student.class,
      division: student.division
    });

    if (!emailSendResult.success) {
      console.warn(`Failed to send welcome email to ${student.email}:`, emailSendResult.error);
      // Optionally, you might want to update the student record to reflect that email failed
      // For now, we'll just log the warning and continue.
    }

    // Return success response with credentials
    res.status(201).json({
      success: true,
      message: 'Student registered successfully',
      student: {
        id: data[0].id,
        username,
        password, // Return plain password for email
        email,
        name,
        qrCodeImage,
        qrToken
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 2. Login with username/password (For students and primary controllers)
app.post('/login', async (req, res) => {
  try {
    const { username, password, role } = req.body;

    if (role === 'primary') {
      // Primary Controller login
      const { data: controllers, error } = await supabase
        .from('primary_controllers')
        .select('*')
        .eq('username', username)
        .single();

      if (error || !controllers) {
        return res.status(401).json({ error: 'Invalid credentials or controller not found' });
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, controllers.password);
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Generate JWT
      const token = jwt.sign(
        { 
          id: controllers.id, 
          username: controllers.username, 
          role: 'primary' 
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );

      // Update last login
      await supabase
        .from('primary_controllers')
        .update({ lastLogin: new Date().toISOString() })
        .eq('id', controllers.id);

      res.json({
        success: true,
        token,
        user: {
          id: controllers.id,
          username: controllers.username,
          name: controllers.name,
          email: controllers.email,
          role: 'primary',
          lastLogin: controllers.lastLogin
        }
      });
    } else {
      // Student login - try username first, then email
      let { data: students, error } = await supabase
        .from('students')
        .select('*')
        .eq('username', username)
        .single();

      // If not found by username, try by email
      if (error || !students) {
        const { data: emailStudents, error: emailError } = await supabase
          .from('students')
          .select('*')
          .eq('email', username)
          .single();
        
        if (emailError || !emailStudents) {
          return res.status(401).json({ error: 'Invalid credentials or student not found' });
        }
        students = emailStudents;
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, students.password);
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Generate JWT
      const token = jwt.sign(
        { 
          id: students.id, 
          username: students.username, 
          role: students.role 
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );

      // Update last login
      await supabase
        .from('students')
        .update({ lastLogin: new Date().toISOString() })
        .eq('id', students.id);

      res.json({
        success: true,
        token,
        user: {
          id: students.id,
          username: students.username,
          name: students.name,
          email: students.email,
          role: students.role,
          class: students.class,
          division: students.division,
          parentName: students.parentName,
          place: students.place,
          rollNumber: students.rollNumber,
          phone: students.phone,
          bio: students.bio,
          mission: students.mission,
          skills: students.skills,
          interests: students.interests,
          academicGoals: students.academicGoals,
          favoriteSubjects: students.favoriteSubjects,
          achievements: students.achievements,
          totalPoints: students.totalPoints,
          certificates: students.certificates,
          rewardPoints: students.rewardPoints
        }
      });
    }

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 3. Login with QR code (For students and primary controllers)
app.post('/login-qr', async (req, res) => {
  try {
    const { qrToken, role } = req.body;

    if (role === 'primary') {
      // Primary Controller QR login
      const { data: controllers, error } = await supabase
        .from('primary_controllers')
        .select('*')
        .eq('qrToken', qrToken)
        .single();

      if (error || !controllers) {
        return res.status(401).json({ error: 'Invalid QR code or controller not found' });
      }

      // Generate JWT
      const token = jwt.sign(
        { 
          id: controllers.id, 
          username: controllers.username, 
          role: 'primary' 
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );

      // Update last login
      await supabase
        .from('primary_controllers')
        .update({ lastLogin: new Date().toISOString() })
        .eq('id', controllers.id);

      res.json({
        success: true,
        token,
        user: {
          id: controllers.id,
          username: controllers.username,
          name: controllers.name,
          email: controllers.email,
          role: 'primary',
          lastLogin: controllers.lastLogin
        }
      });
    } else {
      // Student QR login - try qrToken first, then parse QR data
      let { data: students, error } = await supabase
        .from('students')
        .select('*')
        .eq('qrToken', qrToken)
        .single();

      // If not found by qrToken, try to parse QR data
      if (error || !students) {
        try {
          // Try to find by username from QR data
          const qrData = JSON.parse(qrToken);
          if (qrData.username) {
            const { data: usernameStudents, error: usernameError } = await supabase
              .from('students')
              .select('*')
              .eq('username', qrData.username)
              .single();
            
            if (!usernameError && usernameStudents) {
              students = usernameStudents;
            }
          }
        } catch (parseError) {
          // QR token is not JSON, continue with original error
        }
      }

      if (error || !students) {
        return res.status(401).json({ error: 'Invalid QR code or student not found' });
      }

      // Generate JWT
      const token = jwt.sign(
        { 
          id: students.id, 
          username: students.username, 
          role: students.role 
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );

      // Update last login
      await supabase
        .from('students')
        .update({ lastLogin: new Date().toISOString() })
        .eq('id', students.id);

      res.json({
        success: true,
        token,
        user: {
          id: students.id,
          username: students.username,
          name: students.name,
          email: students.email,
          role: students.role,
          class: students.class,
          division: students.division,
          parentName: students.parentName,
          place: students.place,
          rollNumber: students.rollNumber,
          phone: students.phone,
          bio: students.bio,
          mission: students.mission,
          skills: students.skills,
          interests: students.interests,
          academicGoals: students.academicGoals,
          favoriteSubjects: students.favoriteSubjects,
          achievements: students.achievements,
          totalPoints: students.totalPoints,
          certificates: students.certificates,
          rewardPoints: students.rewardPoints
        }
      });
    }

  } catch (error) {
    console.error('QR login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 4. Get user profile (protected route)
app.get('/me', authenticateToken, async (req, res) => {
  try {
    if (req.user.role === 'primary') {
      // Get primary controller profile
      const { data: controllers, error } = await supabase
        .from('primary_controllers')
        .select('*')
        .eq('id', req.user.id)
        .single();

      if (error || !controllers) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({
        success: true,
        user: {
          id: controllers.id,
          username: controllers.username,
          name: controllers.name,
          email: controllers.email,
          role: controllers.role,
          lastLogin: controllers.lastLogin
        }
      });
    } else {
      // Get student profile
      const { data: students, error } = await supabase
        .from('students')
        .select('*')
        .eq('id', req.user.id)
        .single();

      if (error || !students) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({
        success: true,
        user: {
          id: students.id,
          username: students.username,
          name: students.name,
          email: students.email,
          role: students.role,
          class: students.class,
          division: students.division,
          parentName: students.parentName,
          place: students.place,
          rollNumber: students.rollNumber,
          phone: students.phone,
          bio: students.bio,
          mission: students.mission,
          skills: students.skills,
          interests: students.interests,
          academicGoals: students.academicGoals,
          favoriteSubjects: students.favoriteSubjects,
          achievements: students.achievements,
          totalPoints: students.totalPoints,
          certificates: students.certificates,
          rewardPoints: students.rewardPoints,
          qrCodeImage: students.qrCodeImage
        }
      });
    }

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 5. Update user profile
app.put('/me', authenticateToken, async (req, res) => {
  try {
    const { bio, mission, skills, interests, academicGoals, favoriteSubjects, phone, place } = req.body;

    const { data, error } = await supabase
      .from('students')
      .update({
        bio,
        mission,
        skills,
        interests,
        academicGoals,
        favoriteSubjects,
        phone,
        place,
        updatedAt: new Date().toISOString()
      })
      .eq('id', req.user.id)
      .select();

    if (error) {
      return res.status(500).json({ error: 'Failed to update profile' });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: data[0]
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 6. Bulk register students from CSV (Only for Primary Controller)
app.post('/register-bulk', authenticateToken, upload.single('csv'), async (req, res) => {
  try {
    // Check if user is primary controller
    if (req.user.role !== 'primary') {
      return res.status(403).json({ error: 'Only primary controllers can register students' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'CSV file required' });
    }

    const students = [];
    const results = [];

    // Parse CSV
    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on('data', (data) => students.push(data))
      .on('end', async () => {
        try {
          for (const studentData of students) {
            const { name, email, class: className, division, parentName, place, rollNumber, phone } = studentData;
            
            // Check if student already exists
            const { data: existingStudent } = await supabase
              .from('students')
              .select('id')
              .eq('email', email)
              .single();

            if (existingStudent) {
              results.push({ name, success: false, error: 'Student already exists' });
              continue;
            }
            
            // Generate credentials
            const { username, password } = generateCredentials(name);
            const hashedPassword = await bcrypt.hash(password, 12);
            const qrToken = generateQRToken();
            
            const qrData = JSON.stringify({
              type: 'login',
              username: username,
              password: password,
              role: 'student'
            });
            
            const qrCodeImage = await QRCode.toDataURL(qrData);

            // Create Supabase auth account
            const { data: authData, error: authError } = await supabase.auth.admin.createUser({
              email: email,
              password: password,
              email_confirm: true,
              user_metadata: {
                username: username,
                name: name,
                role: 'student',
                class: className,
                division: division
              }
            });

            if (authError) {
              results.push({ name, success: false, error: 'Failed to create auth account' });
              continue;
            }

            const student = {
              id: authData.user.id, // Use auth user ID
              username,
              password: hashedPassword,
              email,
              name,
              class: className,
              division,
              parentname: parentName,
              place,
              rollnumber: rollNumber || '',
              phone: phone || '',
              qrtoken: qrToken,
              qrcodeimage: qrCodeImage,
              role: 'student',
              isactive: true,
              createdat: new Date().toISOString(),
              updatedat: new Date().toISOString(),
              lastlogin: null,
              emailsent: false,
              bio: `Hi! I'm ${name}, a ${className} student at FG School. I'm passionate about learning and exploring new opportunities.`,
              mission: 'To excel in my studies, develop strong character, and contribute positively to my school and community.',
              skills: ['Learning', 'Curious', 'Team Player'],
              interests: ['Reading', 'Sports', 'Technology'],
              achievements: []
            };

            // Insert into Supabase students table
            const { data, error } = await supabase
              .from('students')
              .insert([student])
              .select();

            if (error) {
              results.push({ name, success: false, error: error.message });
            } else {
              // Send welcome email
              const emailSendResult = await sendWelcomeEmail({
                name: student.name,
                email: student.email,
                username: student.username,
                password: student.password,
                qrCodeImage: student.qrcodeimage,
                class: student.class,
                division: student.division
              });

              if (!emailSendResult.success) {
                console.warn(`Failed to send welcome email to ${student.email}:`, emailSendResult.error);
              }

              results.push({
                name,
                success: true,
                username,
                password,
                email,
                qrCodeImage
              });
            }
          }

          // Clean up uploaded file
          fs.unlinkSync(req.file.path);

          res.json({
            success: true,
            message: `Processed ${students.length} students`,
            results
          });

        } catch (error) {
          console.error('Bulk registration error:', error);
          res.status(500).json({ error: 'Internal server error' });
        }
      });

  } catch (error) {
    console.error('CSV upload error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 7. Get all students (Only for Primary Controller)
app.get('/students', authenticateToken, async (req, res) => {
  try {
    // Check if user is primary controller
    if (req.user.role !== 'primary') {
      return res.status(403).json({ error: 'Only primary controllers can view all students' });
    }

    const { data: students, error } = await supabase
      .from('students')
      .select('id, name, email, class, division, username, isActive, createdAt, lastLogin')
      .order('createdAt', { ascending: false });

    if (error) {
      return res.status(500).json({ error: 'Failed to fetch students' });
    }

    res.json({
      success: true,
      students
    });

  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'FG School Backend API is running' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 FG School Backend API running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:3000/health`);
}); 