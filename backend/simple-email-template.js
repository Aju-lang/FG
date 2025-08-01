// Simple email template for student welcome emails
const generateWelcomeEmailHTML = (studentData) => {
  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to FG School</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #4F46E5; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .credentials { background: white; padding: 15px; margin: 15px 0; border-left: 4px solid #4F46E5; }
        .qr-section { text-align: center; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        .highlight { background: #FFD700; padding: 2px 4px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎓 Welcome to FG School!</h1>
        </div>
        
        <div class="content">
            <h2>Hello ${studentData.name}!</h2>
            
            <p>Welcome to FG School! We're excited to have you as part of our community.</p>
            
            <div class="credentials">
                <h3>📋 Your Login Credentials:</h3>
                <p><strong>Username:</strong> <span class="highlight">${studentData.username}</span></p>
                <p><strong>Password:</strong> <span class="highlight">${studentData.password}</span></p>
                <p><strong>Class:</strong> ${studentData.class}-${studentData.division}</p>
                <p><strong>Login URL:</strong> <a href="http://localhost:3000/login">http://localhost:3000/login</a></p>
            </div>
            
            <div class="qr-section">
                <h3>📱 Quick Login with QR Code</h3>
                <p>You can also log in using the QR code below:</p>
                <img src="${studentData.qrCodeImage}" alt="Login QR Code" style="max-width: 200px;">
            </div>
            
            <h3>🚀 Getting Started:</h3>
            <ol>
                <li>Visit <a href="http://localhost:3000/login">http://localhost:3000/login</a></li>
                <li>Enter your username and password</li>
                <li>Select "Student" as your role</li>
                <li>Click "Login" to access your dashboard</li>
            </ol>
            
            <h3>📚 What You Can Do:</h3>
            <ul>
                <li>View your academic progress</li>
                <li>Access your certificates</li>
                <li>Update your profile</li>
                <li>Connect with classmates</li>
            </ul>
            
            <p><strong>Need help?</strong> Contact your school administrator or visit our support page.</p>
        </div>
        
        <div class="footer">
            <p>© 2024 FG School. All rights reserved.</p>
            <p>This is an automated message. Please do not reply to this email.</p>
        </div>
    </div>
</body>
</html>
  `;
};

// Simple email template for plain text
const generateWelcomeEmailText = (studentData) => {
  return `
Welcome to FG School!

Hello ${studentData.name},

Welcome to FG School! We're excited to have you as part of our community.

Your Login Credentials:
- Username: ${studentData.username}
- Password: ${studentData.password}
- Class: ${studentData.class}-${studentData.division}
- Login URL: http://localhost:3000/login

Getting Started:
1. Visit http://localhost:3000/login
2. Enter your username and password
3. Select "Student" as your role
4. Click "Login" to access your dashboard

What You Can Do:
- View your academic progress
- Access your certificates
- Update your profile
- Connect with classmates

Need help? Contact your school administrator.

© 2024 FG School. All rights reserved.
  `;
};

module.exports = {
  generateWelcomeEmailHTML,
  generateWelcomeEmailText
}; 