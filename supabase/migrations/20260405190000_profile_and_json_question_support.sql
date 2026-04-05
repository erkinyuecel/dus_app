-- Extend user profile preferences for DUS customization.
ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS language text DEFAULT 'en' CHECK (language IN ('tr', 'en')),
  ADD COLUMN IF NOT EXISTS target_department text,
  ADD COLUMN IF NOT EXISTS target_base_score numeric(5,2);

-- JSON-first question integration: keep user answers independent from questions table.
ALTER TABLE user_answers DROP CONSTRAINT IF EXISTS user_answers_question_id_fkey;
ALTER TABLE user_answers ALTER COLUMN question_id TYPE text USING question_id::text;

-- Helpful lookup index for recent answer retrieval.
CREATE INDEX IF NOT EXISTS idx_user_answers_user_answered_at
  ON user_answers(user_id, answered_at DESC);
