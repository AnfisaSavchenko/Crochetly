# 🚀 Quick Start - 3 Steps to Get Running

Your app has been migrated to native Supabase OAuth with project **kyusuwdepygzjrxaewkn**.

## Step 1: Get Anon Key (2 minutes)

1. Open: https://supabase.com/dashboard/project/kyusuwdepygzjrxaewkn/settings/api
2. Copy the **anon public** key
3. Update `.env`:
   ```
   EXPO_PUBLIC_SUPABASE_ANON_KEY=<your_key_here>
   ```

## Step 2: Create Database (2 minutes)

1. Open: https://supabase.com/dashboard/project/kyusuwdepygzjrxaewkn/sql/new
2. Copy all content from `supabase/migrations/20250108_create_user_profiles.sql`
3. Paste and click **Run**

## Step 3: Enable OAuth (5 minutes)

### Google OAuth
1. Go to: https://supabase.com/dashboard/project/kyusuwdepygzjrxaewkn/auth/providers
2. Enable **Google**
3. Add your Client ID and Secret
4. Add redirect URL in Google Console:
   ```
   https://kyusuwdepygzjrxaewkn.supabase.co/auth/v1/callback
   ```

### Apple OAuth (iOS)
1. Same page, enable **Apple**
2. Add your Apple credentials
3. Add redirect URL in Apple Console:
   ```
   https://kyusuwdepygzjrxaewkn.supabase.co/auth/v1/callback
   ```

## Done! 🎉

Run your app:
```bash
npm start
```

Test authentication by going through the onboarding flow and signing in.

---

**See `MIGRATION_COMPLETE.md` for full details, troubleshooting, and architecture explanation.**
