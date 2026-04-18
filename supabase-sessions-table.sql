-- Create the sessions table for fitness session scheduling
CREATE TABLE IF NOT EXISTS sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_date DATE NOT NULL,
  session_time TEXT NOT NULL,
  status TEXT CHECK (status IN ('scheduled', 'cancelled')) DEFAULT 'scheduled',
  meeting_link TEXT,
  notified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create the holidays table for storing holiday ranges
CREATE TABLE IF NOT EXISTS holidays (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  reason TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create an index on holiday dates for better query performance
CREATE INDEX IF NOT EXISTS idx_holidays_dates ON holidays(start_date, end_date);

-- Create a trigger to update the updated_at column for holidays
CREATE TRIGGER update_holidays_updated_at
    BEFORE UPDATE ON holidays
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create an index on session_date for better query performance
CREATE INDEX IF NOT EXISTS idx_sessions_date ON sessions(session_date);

-- Create a unique constraint to prevent duplicate sessions for the same date and time
CREATE UNIQUE INDEX IF NOT EXISTS idx_sessions_date_time ON sessions(session_date, session_time);

-- Create an index on session_date for better query performance
CREATE INDEX IF NOT EXISTS idx_sessions_date ON sessions(session_date);

-- Create a unique constraint to prevent duplicate sessions for the same date and time
CREATE UNIQUE INDEX IF NOT EXISTS idx_sessions_date_time ON sessions(session_date, session_time);

-- Create a trigger to update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_sessions_updated_at
    BEFORE UPDATE ON sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();