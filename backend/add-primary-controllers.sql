-- Add Primary Controllers Table to FG School Database
-- Run this in Supabase SQL Editor

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

-- Policy for service role to manage all data (only if it doesn't exist)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'primary_controllers' 
    AND policyname = 'Service role can manage all primary_controllers data'
  ) THEN
    CREATE POLICY "Service role can manage all primary_controllers data" ON primary_controllers
      FOR ALL USING (auth.role() = 'service_role');
  END IF;
END $$;

-- Create trigger to automatically update updatedAt for primary_controllers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updatedAt = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger (only if it doesn't exist)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_primary_controllers_updated_at'
  ) THEN
    CREATE TRIGGER update_primary_controllers_updated_at 
      BEFORE UPDATE ON primary_controllers 
      FOR EACH ROW 
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- Insert a default primary controller for testing
INSERT INTO primary_controllers (
  username, 
  password, 
  email, 
  name, 
  qrToken
) VALUES (
  'admin',
  '$2a$12$2yQV18ZqbD3qzhuDz3O.3.X3hrFoAAlJnXyIaS4.BmFoGaGwW0I66', -- hashed 'admin123'
  'admin@fgschool.com',
  'Admin Controller',
  'admin_qr_token_123'
) ON CONFLICT (username) DO NOTHING;

-- Success message
SELECT 'Primary Controllers table created successfully!' as message; 