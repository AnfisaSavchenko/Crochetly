-- Add quiz_responses column to user_profiles table
-- This column stores the complete quiz response data as JSON

ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS quiz_responses JSONB;

-- Create an index for better JSONB query performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_quiz_responses
    ON public.user_profiles USING GIN (quiz_responses);

-- Add a comment to document the column
COMMENT ON COLUMN public.user_profiles.quiz_responses IS 'Complete quiz response data stored as JSON. Contains: level, skills, target, motivation';
