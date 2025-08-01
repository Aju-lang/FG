-- FG School Database Schema for Supabase

-- Create students table
CREATE TABLE IF NOT EXISTS students (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  class VARCHAR(50) NOT NULL,
  division VARCHAR(10) NOT NULL,
  parentName VARCHAR(255) NOT NULL,
  place VARCHAR(255) NOT NULL,
  rollNumber VARCHAR(50),
  phone VARCHAR(20),
  qrToken VARCHAR(100) UNIQUE NOT NULL,
  qrCodeImage TEXT,
  role VARCHAR(20) DEFAULT 'student',
  isActive BOOLEAN DEFAULT true,
  createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updatedAt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  lastLogin TIMESTAMP WITH TIME ZONE,
  emailSent BOOLEAN DEFAULT false,
  
  -- About Me data
  bio TEXT,
  mission TEXT,
  skills TEXT[] DEFAULT '{}',
  interests TEXT[] DEFAULT '{}',
  academicGoals TEXT[] DEFAULT '{}',
  favoriteSubjects TEXT[] DEFAULT '{}',
  achievements JSONB DEFAULT '[]',
  totalPoints INTEGER DEFAULT 0,
  certificates INTEGER DEFAULT 0,
  rewardPoints INTEGER DEFAULT 0,
  
  -- Marks and academic data
  marks JSONB DEFAULT '{}',
  attendance JSONB DEFAULT '{}',
  certificates_earned JSONB DEFAULT '[]',
  classes_attended JSONB DEFAULT '[]',
  leadership_position VARCHAR(255),
  
  -- Additional fields
  profileImage TEXT,
  aboutMeUrl TEXT
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_students_username ON students(username);
CREATE INDEX IF NOT EXISTS idx_students_email ON students(email);
CREATE INDEX IF NOT EXISTS idx_students_qrToken ON students(qrToken);
CREATE INDEX IF NOT EXISTS idx_students_class ON students(class);
CREATE INDEX IF NOT EXISTS idx_students_isActive ON students(isActive);

-- Create RLS policies
ALTER TABLE students ENABLE ROW LEVEL SECURITY;

-- Policy for service role to manage all data (for our backend)
CREATE POLICY "Service role can manage all data" ON students
  FOR ALL USING (auth.role() = 'service_role');

-- Policy for authenticated users to read their own data
CREATE POLICY "Users can view own profile" ON students
  FOR SELECT USING (auth.uid()::text = id::text);

-- Policy for authenticated users to update their own data
CREATE POLICY "Users can update own profile" ON students
  FOR UPDATE USING (auth.uid()::text = id::text);

-- Create function to update updatedAt timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updatedAt = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updatedAt
CREATE TRIGGER update_students_updated_at 
  BEFORE UPDATE ON students 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Create achievements table (optional)
CREATE TABLE IF NOT EXISTS achievements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  studentId UUID REFERENCES students(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  date DATE NOT NULL,
  points INTEGER DEFAULT 0,
  createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create certificates table (optional)
CREATE TABLE IF NOT EXISTS certificates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  studentId UUID REFERENCES students(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  issuedDate DATE NOT NULL,
  certificateUrl TEXT,
  createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create leadership_positions table (optional)
CREATE TABLE IF NOT EXISTS leadership_positions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  studentId UUID REFERENCES students(id) ON DELETE CASCADE,
  position VARCHAR(255) NOT NULL,
  description TEXT,
  startDate DATE NOT NULL,
  endDate DATE,
  isActive BOOLEAN DEFAULT true,
  createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create primary_controllers table
CREATE TABLE IF NOT EXISTS primary_controllers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  qrToken VARCHAR(100) UNIQUE NOT NULL,
  qrCodeImage TEXT,
  role VARCHAR(20) DEFAULT 'primary',
  isActive BOOLEAN DEFAULT true,
  createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updatedAt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  lastLogin TIMESTAMP WITH TIME ZONE
);

-- Create indexes for primary_controllers
CREATE INDEX IF NOT EXISTS idx_primary_controllers_username ON primary_controllers(username);
CREATE INDEX IF NOT EXISTS idx_primary_controllers_email ON primary_controllers(email);
CREATE INDEX IF NOT EXISTS idx_primary_controllers_qrToken ON primary_controllers(qrToken);

-- Enable RLS for primary_controllers
ALTER TABLE primary_controllers ENABLE ROW LEVEL SECURITY;

-- Policy for service role to manage all data
CREATE POLICY "Service role can manage all primary_controllers data" ON primary_controllers
  FOR ALL USING (auth.role() = 'service_role');

-- Create trigger to automatically update updatedAt for primary_controllers
CREATE TRIGGER update_primary_controllers_updated_at 
  BEFORE UPDATE ON primary_controllers 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data for testing
INSERT INTO students (
  username, password, email, name, class, division, parentName, place,
  qrToken, bio, mission, skills, interests, academicGoals, favoriteSubjects
) VALUES (
  'teststudent101',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/5J5K5K5', -- hashed 'testpassword'
  'test@fg-school.com',
  'Test Student',
  '10th',
  'A',
  'Test Parent',
  'Test City',
  'test_qr_token_123',
  'Hi! I''m Test Student, a 10th student at FG School. I''m passionate about learning and exploring new opportunities.',
  'To excel in my studies, develop strong character, and contribute positively to my school and community.',
  ARRAY['Learning', 'Curious', 'Team Player'],
  ARRAY['Reading', 'Sports', 'Technology'],
  ARRAY['Maintain good grades in all subjects', 'Participate actively in class discussions'],
  ARRAY['Mathematics', 'Science']
) ON CONFLICT (username) DO NOTHING; 