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

The app uses **@fastshot/auth** which handles OAuth through a broker service at `https://oauth.fastshot.ai`. This means redirect URLs must point to the broker, not directly to your app.

### Google OAuth Setup

1. **Go to Supabase Dashboard**:
   - Navigate to: https://supabase.com/dashboard/project/wijsfrgbxmpzltobxxnq
   - Click on **Authentication** → **Providers** → **Google**

2. **Enable Google Provider**:
   - Toggle the "Enable Sign in with Google" switch to **ON**

3. **Configure Redirect URLs**:
   - In the "Authorized Redirect URIs" section, add:
     ```
     https://oauth.fastshot.ai/callback
     ```
   - This allows the @fastshot/auth broker to handle OAuth callbacks

4. **Get Google OAuth Credentials** (if you don't have them):
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create a new project or select an existing one
   - Enable the Google+ API
   - Go to **APIs & Services** → **Credentials**
   - Create OAuth 2.0 Client ID (Web application type)
   - Add authorized redirect URIs:
     - `https://oauth.fastshot.ai/callback`
     - `https://wijsfrgbxmpzltobxxnq.supabase.co/auth/v1/callback`
   - Copy the **Client ID** and **Client Secret**

5. **Add Credentials to Supabase**:
   - Paste the Google **Client ID** and **Client Secret** in the Supabase provider settings
   - Click **Save**

### Apple OAuth Setup

1. **Go to Supabase Dashboard**:
   - Navigate to: https://supabase.com/dashboard/project/wijsfrgbxmpzltobxxnq
   - Click on **Authentication** → **Providers** → **Apple**

2. **Enable Apple Provider**:
   - Toggle the "Enable Sign in with Apple" switch to **ON**

3. **Configure Redirect URLs**:
   - In the "Authorized Redirect URIs" section, add:
     ```
     https://oauth.fastshot.ai/callback
     ```
   - This allows the @fastshot/auth broker to handle OAuth callbacks

4. **Get Apple OAuth Credentials** (if you don't have them):
   - Go to [Apple Developer Portal](https://developer.apple.com/account)
   - Create an **App ID** for your app (if not already created)
   - Create a **Services ID** for Sign in with Apple
   - Configure the Services ID:
     - Add `https://oauth.fastshot.ai` as an allowed domain
     - Add `https://oauth.fastshot.ai/callback` as a return URL
     - Add `https://wijsfrgbxmpzltobxxnq.supabase.co/auth/v1/callback` as a return URL
   - Create a **Sign in with Apple Key**
   - Download the key file (you'll need the Key ID and Team ID)

5. **Add Credentials to Supabase**:
   - Services ID (Client ID)
   - Team ID
   - Key ID
   - Private Key (contents of the .p8 file)
   - Click **Save**

### Important Notes

- **App Scheme**: The app uses `fastshot://` as its custom URL scheme (defined in `app.json`)
- **Broker Service**: @fastshot/auth handles the OAuth flow through `https://oauth.fastshot.ai`
- **Deep Linking**: After successful authentication, the broker redirects back to the app using the custom scheme
- **Environment Variables**: Make sure these are set in your `.env`:
  - `EXPO_PUBLIC_SUPABASE_URL=https://wijsfrgbxmpzltobxxnq.supabase.co`
  - `EXPO_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>`
  - `EXPO_PUBLIC_AUTH_BROKER_URL=https://oauth.fastshot.ai`

### Verification

To verify OAuth is working:

1. **Run the app**: `npx expo start`
2. **Navigate to onboarding**: Complete the first 5 screens
3. **Test Google Sign In**: Tap "Continue with Google" button
   - Should open browser with Google OAuth flow
   - After authentication, should redirect back to app
   - User profile should be saved to Supabase
4. **Test Apple Sign In** (iOS only): Tap "Continue with Apple" button
   - Should show Apple Sign In modal
   - After authentication, should redirect back to app
   - User profile should be saved to Supabase

### Troubleshooting

If OAuth is not working:

1. **Check Supabase Dashboard**: Verify providers are enabled and redirect URLs are correct
2. **Check Browser Console**: Look for OAuth errors during the flow
3. **Check App Logs**: Look for authentication errors in Metro bundler logs
4. **Verify Credentials**: Make sure Google/Apple OAuth credentials are correct
5. **Test Redirect URL**: Visit `https://oauth.fastshot.ai/callback` to ensure it's accessible

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
