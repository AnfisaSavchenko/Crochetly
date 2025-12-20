# Supabase Setup for Crochetly

## Required Dependencies

Install the following dependencies:

```bash
npm install @supabase/supabase-js expo-web-browser expo-linking
```

## Environment Variables

Add the following to your `.env` file:

```
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Database Schema

Create a `user_profiles` table in your Supabase database:

```sql
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  skill_level TEXT CHECK (skill_level IN ('beginner', 'intermediate', 'advanced')),
  creation_intent TEXT,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Create policy for users to read/write their own profile
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);
```

## OAuth Configuration

### Google OAuth

1. Go to Supabase Dashboard → Authentication → Providers
2. Enable Google provider
3. Add your Google OAuth credentials
4. Add redirect URL: `your-app-scheme://onboarding/auth`

### Apple OAuth

1. Go to Supabase Dashboard → Authentication → Providers
2. Enable Apple provider
3. Add your Apple OAuth credentials
4. Add redirect URL: `your-app-scheme://onboarding/auth`

## App Configuration

Update your `app.json` to include your custom scheme:

```json
{
  "expo": {
    "scheme": "crochetly"
  }
}
```

## Testing

Once configured, the Google and Apple sign-in buttons in the onboarding flow will work properly, saving user quiz data to their Supabase profile.
