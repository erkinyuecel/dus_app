/*
  # DentPrep Database Schema

  ## Overview
  Creates the complete database structure for the DentPrep dental exam preparation app.

  ## New Tables

  ### 1. user_profiles
  Stores user-specific information and preferences:
  - `id` (uuid, FK to auth.users) - References authenticated user
  - `full_name` (text) - User's full name
  - `exam_date` (date) - Target exam date for countdown
  - `created_at` (timestamptz) - Account creation timestamp
  - `updated_at` (timestamptz) - Last profile update

  ### 2. questions
  Contains all dental exam questions:
  - `id` (uuid, primary key) - Unique question identifier
  - `category` (text) - Topic category (e.g., "Oral Biology & Histology")
  - `difficulty` (text) - Easy, Medium, or Hard
  - `question_text` (text) - The actual question
  - `option_a` (text) - First answer option
  - `option_b` (text) - Second answer option
  - `option_c` (text) - Third answer option
  - `option_d` (text) - Fourth answer option
  - `correct_answer` (text) - Letter of correct option (A, B, C, or D)
  - `explanation` (text) - Detailed explanation of the answer
  - `created_at` (timestamptz) - Question creation timestamp

  ### 3. user_answers
  Tracks user responses and performance:
  - `id` (uuid, primary key) - Unique answer record identifier
  - `user_id` (uuid, FK to auth.users) - User who answered
  - `question_id` (uuid, FK to questions) - Question answered
  - `selected_answer` (text) - User's selected option (A, B, C, or D)
  - `is_correct` (boolean) - Whether answer was correct
  - `answered_at` (timestamptz) - When question was answered
  - Composite index on (user_id, question_id) for performance

  ### 4. study_streaks
  Tracks daily study activity:
  - `id` (uuid, primary key) - Unique streak record identifier
  - `user_id` (uuid, FK to auth.users) - User
  - `study_date` (date) - Date of study activity
  - `questions_answered` (integer) - Number of questions answered that day
  - `created_at` (timestamptz) - Record creation timestamp
  - Unique constraint on (user_id, study_date) to prevent duplicates

  ## Security
  - Row Level Security (RLS) enabled on all tables
  - Users can only access their own data
  - Questions table is readable by all authenticated users
  - Policies enforce user_id checks for data isolation
*/

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  exam_date date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create questions table
CREATE TABLE IF NOT EXISTS questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL,
  difficulty text NOT NULL CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
  question_text text NOT NULL,
  option_a text NOT NULL,
  option_b text NOT NULL,
  option_c text NOT NULL,
  option_d text NOT NULL,
  correct_answer text NOT NULL CHECK (correct_answer IN ('A', 'B', 'C', 'D')),
  explanation text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create user_answers table
CREATE TABLE IF NOT EXISTS user_answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id uuid NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  selected_answer text NOT NULL CHECK (selected_answer IN ('A', 'B', 'C', 'D')),
  is_correct boolean NOT NULL,
  answered_at timestamptz DEFAULT now()
);

-- Create index for faster queries on user answers
CREATE INDEX IF NOT EXISTS idx_user_answers_user_question 
  ON user_answers(user_id, question_id);

-- Create study_streaks table
CREATE TABLE IF NOT EXISTS study_streaks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  study_date date NOT NULL,
  questions_answered integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, study_date)
);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_streaks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- RLS Policies for questions (all authenticated users can read)
CREATE POLICY "Authenticated users can view questions"
  ON questions FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for user_answers
CREATE POLICY "Users can view own answers"
  ON user_answers FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own answers"
  ON user_answers FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for study_streaks
CREATE POLICY "Users can view own streaks"
  ON study_streaks FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own streaks"
  ON study_streaks FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own streaks"
  ON study_streaks FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);