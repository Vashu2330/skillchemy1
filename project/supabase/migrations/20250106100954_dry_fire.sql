/*
  # Initial Schema Setup for Skillchemy

  1. New Tables
    - users
      - id (uuid, primary key)
      - email (text, unique)
      - created_at (timestamp)
      - full_name (text)
      - avatar_url (text)
    
    - skills
      - id (uuid, primary key)
      - name (text, unique)
      - category (text)
      - created_at (timestamp)
    
    - user_skills
      - id (uuid, primary key)
      - user_id (uuid, references users)
      - skill_id (uuid, references skills)
      - is_teaching (boolean)
      - proficiency_level (text)
      - created_at (timestamp)
    
    - matches
      - id (uuid, primary key)
      - teacher_id (uuid, references users)
      - student_id (uuid, references users)
      - teaching_skill_id (uuid, references skills)
      - learning_skill_id (uuid, references skills)
      - status (text)
      - created_at (timestamp)
  
  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create users table
CREATE TABLE users (
  id uuid REFERENCES auth.users PRIMARY KEY,
  email text UNIQUE NOT NULL,
  full_name text,
  avatar_url text,
  created_at timestamptz DEFAULT now()
);

-- Create skills table
CREATE TABLE skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  category text,
  created_at timestamptz DEFAULT now()
);

-- Create user_skills table
CREATE TABLE user_skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users NOT NULL,
  skill_id uuid REFERENCES skills NOT NULL,
  is_teaching boolean NOT NULL,
  proficiency_level text CHECK (proficiency_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, skill_id, is_teaching)
);

-- Create matches table
CREATE TABLE matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id uuid REFERENCES users NOT NULL,
  student_id uuid REFERENCES users NOT NULL,
  teaching_skill_id uuid REFERENCES skills NOT NULL,
  learning_skill_id uuid REFERENCES skills NOT NULL,
  status text CHECK (status IN ('pending', 'accepted', 'rejected', 'completed')) DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read all skills"
  ON skills FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can read their own data"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own data"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can read their own skills"
  ON user_skills FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can manage their own skills"
  ON user_skills FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can read their matches"
  ON matches FOR SELECT
  TO authenticated
  USING (teacher_id = auth.uid() OR student_id = auth.uid());

CREATE POLICY "Users can update their matches"
  ON matches FOR UPDATE
  TO authenticated
  USING (teacher_id = auth.uid() OR student_id = auth.uid());