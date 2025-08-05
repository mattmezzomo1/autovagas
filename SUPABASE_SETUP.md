# Supabase Database Setup Guide

This guide explains how to set up the database schema for the Autovagas application in Supabase.

## Prerequisites

1. A Supabase account and project
2. Access to the Supabase SQL Editor

## Setup Instructions

### Option 1: Using the SQL Editor in Supabase Dashboard

1. Log in to your Supabase dashboard and select your project
2. Navigate to the SQL Editor section
3. Create a new query
4. Copy the entire contents of the `supabase-schema.sql` file
5. Paste the SQL into the query editor
6. Run the query to create all tables, types, constraints, and indexes

### Option 2: Using the Supabase CLI

If you prefer using the Supabase CLI:

1. Install the Supabase CLI if you haven't already:
   ```bash
   npm install -g supabase
   ```

2. Log in to Supabase:
   ```bash
   supabase login
   ```

3. Link your project:
   ```bash
   supabase link --project-ref your-project-ref
   ```

4. Run the SQL file:
   ```bash
   supabase db execute --file supabase-schema.sql
   ```

## Database Schema Overview

The database schema includes the following tables:

1. **users** - Stores user information including authentication details and profile data
2. **companies** - Stores company profiles linked to company user accounts
3. **documents** - Stores user documents like resumes and cover letters
4. **jobs** - Stores job listings created by companies
5. **applications** - Tracks job applications made by users
6. **auto_apply_configs** - Stores configuration for the auto-apply feature
7. **suggestions** - Stores personalized suggestions for users
8. **courses** - Stores available courses for skill development
9. **user_courses** - Tracks user enrollment and progress in courses
10. **match_criteria** - Stores user preferences for job matching
11. **matches** - Tracks potential matches between users and jobs/companies

## Row-Level Security (RLS) Policies

After setting up the schema, you should configure Row-Level Security policies to control access to your data. Here are some recommended policies:

### Users Table

```sql
-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Users can read and update their own data
CREATE POLICY "Users can view and update own data" ON users
  FOR ALL
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Admin users can access all user data
CREATE POLICY "Admins can do anything" ON users
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );
```

### Jobs Table

```sql
-- Enable RLS
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

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
```

### Applications Table

```sql
-- Enable RLS
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

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

-- Admin users can access all applications
CREATE POLICY "Admins can do anything with applications" ON applications
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );
```

## Next Steps

After setting up the database schema:

1. Configure authentication in Supabase
2. Set up storage buckets for document uploads
3. Configure environment variables in your application to connect to Supabase
4. Test the connection between your application and Supabase

## Troubleshooting

If you encounter any issues during setup:

1. Check for any SQL syntax errors in the console
2. Ensure you have the necessary permissions in your Supabase project
3. Verify that the uuid-ossp extension is enabled
4. If you need to start over, you can drop all tables and recreate them
