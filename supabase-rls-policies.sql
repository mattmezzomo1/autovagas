-- Supabase Row-Level Security (RLS) Policies
-- Run this script after setting up the schema to secure your data

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE auto_apply_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_criteria ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

-- Users Table Policies
-- Users can read and update their own data
CREATE POLICY "Users can view and update own data" ON users
  FOR ALL
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Admin users can access all user data
CREATE POLICY "Admins can do anything with users" ON users
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- Companies Table Policies
-- Company owners can manage their company profile
CREATE POLICY "Company owners can manage their company" ON companies
  FOR ALL
  USING (auth.uid() = userId)
  WITH CHECK (auth.uid() = userId);

-- All users can view company profiles
CREATE POLICY "Anyone can view companies" ON companies
  FOR SELECT
  USING (true);

-- Admin users can manage all companies
CREATE POLICY "Admins can do anything with companies" ON companies
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- Documents Table Policies
-- Users can manage their own documents
CREATE POLICY "Users can manage their own documents" ON documents
  FOR ALL
  USING (auth.uid() = userId)
  WITH CHECK (auth.uid() = userId);

-- Admin users can access all documents
CREATE POLICY "Admins can do anything with documents" ON documents
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- Jobs Table Policies
-- Company users can manage their own job listings
CREATE POLICY "Companies can manage their own jobs" ON jobs
  FOR ALL
  USING (auth.uid() = companyUserId)
  WITH CHECK (auth.uid() = companyUserId);

-- All users can view active jobs
CREATE POLICY "Anyone can view active jobs" ON jobs
  FOR SELECT
  USING (isActive = true);

-- Admin users can access all jobs
CREATE POLICY "Admins can do anything with jobs" ON jobs
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- Applications Table Policies
-- Users can manage their own applications
CREATE POLICY "Users can manage their own applications" ON applications
  FOR ALL
  USING (auth.uid() = userId)
  WITH CHECK (auth.uid() = userId);

-- Companies can view applications for their jobs
CREATE POLICY "Companies can view applications for their jobs" ON applications
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM jobs
      WHERE jobs.id = applications.jobId AND jobs.companyUserId = auth.uid()
    )
  );

-- Companies can update applications for their jobs
CREATE POLICY "Companies can update applications for their jobs" ON applications
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM jobs
      WHERE jobs.id = applications.jobId AND jobs.companyUserId = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM jobs
      WHERE jobs.id = applications.jobId AND jobs.companyUserId = auth.uid()
    )
  );

-- Admin users can access all applications
CREATE POLICY "Admins can do anything with applications" ON applications
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- Auto Apply Configs Table Policies
-- Users can manage their own auto apply configs
CREATE POLICY "Users can manage their own auto apply configs" ON auto_apply_configs
  FOR ALL
  USING (auth.uid() = userId)
  WITH CHECK (auth.uid() = userId);

-- Admin users can access all auto apply configs
CREATE POLICY "Admins can do anything with auto apply configs" ON auto_apply_configs
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- Suggestions Table Policies
-- Users can view their own personalized suggestions
CREATE POLICY "Users can view their own suggestions" ON suggestions
  FOR SELECT
  USING (auth.uid() = userId OR userId IS NULL);

-- Admin users can manage all suggestions
CREATE POLICY "Admins can do anything with suggestions" ON suggestions
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- Courses Table Policies
-- All users can view courses
CREATE POLICY "Anyone can view courses" ON courses
  FOR SELECT
  USING (true);

-- Admin users can manage courses
CREATE POLICY "Admins can manage courses" ON courses
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- User Courses Table Policies
-- Users can manage their own course enrollments
CREATE POLICY "Users can manage their own course enrollments" ON user_courses
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Admin users can access all user course enrollments
CREATE POLICY "Admins can do anything with user courses" ON user_courses
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- Match Criteria Table Policies
-- Users can manage their own match criteria
CREATE POLICY "Users can manage their own match criteria" ON match_criteria
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Admin users can access all match criteria
CREATE POLICY "Admins can do anything with match criteria" ON match_criteria
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- Matches Table Policies
-- Users can view matches where they are the initiator or receiver
CREATE POLICY "Users can view their own matches" ON matches
  FOR SELECT
  USING (auth.uid() = initiator_id OR auth.uid() = receiver_id);

-- Users can update matches where they are the receiver
CREATE POLICY "Users can respond to matches" ON matches
  FOR UPDATE
  USING (auth.uid() = receiver_id)
  WITH CHECK (auth.uid() = receiver_id);

-- Admin users can access all matches
CREATE POLICY "Admins can do anything with matches" ON matches
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );
