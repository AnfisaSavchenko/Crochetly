# Supabase Database Setup Instructions

## 1. Get Your Anon Key

1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/kyusuwdepygzjrxaewkn
2. Navigate to **Settings** → **API**
3. Copy the **anon/public** key
4. Update `.env` file:
   - Replace `YOUR_NEW_ANON_KEY_HERE` with your actual anon key

## 2. Apply Database Migration

You have two options to set up the database:

### Option A: Using Supabase Dashboard (Recommended)

1. Go to **SQL Editor** in your Supabase Dashboard
2. Click **New Query**
3. Copy the entire content from `supabase/migrations/20250108_create_user_profiles.sql`
4. Paste it into the query editor
5. Click **Run** to execute the migration

### Option B: Using Supabase CLI

If you have the Supabase CLI installed:

```bash
supabase db push
```

## 3. Configure OAuth Providers

### Google OAuth Setup

1. Go to **Authentication** → **Providers** in Supabase Dashboard
2. Enable **Google** provider
3. Add your Google OAuth credentials:
   - Client ID
   - Client Secret
4. Add Redirect URLs:
   - `https://kyusuwdepygzjrxaewkn.supabase.co/auth/v1/callback`
   - `com.crochetly.app://auth/callback` (for native app)

### Apple OAuth Setup

1. In **Authentication** → **Providers**
2. Enable **Apple** provider
3. Add your Apple OAuth credentials:
   - Services ID
   - Team ID
   - Key ID
   - Private Key
4. Add Redirect URLs (same as Google)

## 4. Verify Setup

After completing the above steps:

1. The app should be able to connect to your Supabase project
2. Users can sign in with Google/Apple
3. User profiles will be saved to the `user_profiles` table
4. All data is protected by Row Level Security (RLS)

## Database Schema

The migration creates:

- **user_profiles** table with:
  - `id` (UUID, references auth.users)
  - `skill_level` (TEXT)
  - `creation_intent` (TEXT)
  - `onboarding_completed` (BOOLEAN)
  - `created_at` (TIMESTAMPTZ)
  - `updated_at` (TIMESTAMPTZ)

- **RLS Policies**: Users can only access their own data
- **Triggers**: Auto-update `updated_at` timestamp
- **Indexes**: Optimized queries on common fields

## Troubleshooting

If authentication fails:

1. Check that OAuth providers are enabled in Supabase Dashboard
2. Verify redirect URLs match exactly
3. Ensure anon key is correctly set in `.env`
4. Check Supabase logs in Dashboard for detailed error messages
