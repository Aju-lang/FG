-- Add qrToken column to students table
-- Run this in Supabase SQL Editor

-- Add qrToken column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'students' 
    AND column_name = 'qrToken'
  ) THEN
    ALTER TABLE students ADD COLUMN qrToken VARCHAR(100) UNIQUE;
  END IF;
END $$;

-- Add qrCodeImage column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'students' 
    AND column_name = 'qrCodeImage'
  ) THEN
    ALTER TABLE students ADD COLUMN qrCodeImage TEXT;
  END IF;
END $$;

-- Create index for qrToken if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'students' 
    AND indexname = 'idx_students_qrToken'
  ) THEN
    CREATE INDEX idx_students_qrToken ON students(qrToken);
  END IF;
END $$;

-- Success message
SELECT 'QR Token columns added successfully!' as message; 