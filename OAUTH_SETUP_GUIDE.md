# 🔐 OAuth Configuration Guide for Crochetly

This guide will walk you through setting up Google and Apple OAuth authentication for your Crochetly app. The process takes about 15-20 minutes.

---

## ✅ Prerequisites (Already Completed)

- ✅ Supabase project created: `wijsfrgbxmpzltobxxnq`
- ✅ Database schema configured
- ✅ @fastshot/auth package installed
- ✅ App code ready for OAuth
- ✅ Environment variables configured

---

## 📱 Part 1: Google OAuth Setup (10 minutes)

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Click **Select a project** → **New Project**
3. Enter project name: `Crochetly` (or any name)
4. Click **Create**
5. Wait for project to be created, then select it

### Step 2: Enable Google+ API (Required)

1. In Google Cloud Console, go to **APIs & Services** → **Library**
2. Search for "Google+ API"
3. Click on **Google+ API**
4. Click **Enable**
5. Wait for it to enable (takes a few seconds)

### Step 3: Configure OAuth Consent Screen

1. Go to **APIs & Services** → **OAuth consent screen**
2. Select **External** (unless you have a Google Workspace)
3. Click **Create**

4. Fill in required fields:
   - **App name**: `Crochetly`
   - **User support email**: Your email address
   - **Developer contact email**: Your email address
   - Leave other fields as default

5. Click **Save and Continue**
6. On "Scopes" page, click **Save and Continue** (no changes needed)
7. On "Test users" page, click **Save and Continue** (skip for now)
8. Review and click **Back to Dashboard**

### Step 4: Create OAuth 2.0 Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click **+ Create Credentials** → **OAuth client ID**
3. If prompted to configure consent screen, you already did this (skip)

4. Configure OAuth client:
   - **Application type**: Select **Web application**
   - **Name**: `Crochetly Web Client`

5. **Authorized JavaScript origins**: Leave empty (not needed)

6. **Authorized redirect URIs**: Add these TWO URLs (click + ADD URI for each):
   ```
   https://oauth.fastshot.ai/callback
   ```
   ```
   https://wijsfrgbxmpzltobxxnq.supabase.co/auth/v1/callback
   ```

7. Click **Create**

8. **IMPORTANT**: A dialog will show your credentials. **Copy and save these**:
   - ✏️ **Client ID** (looks like: `123456789-abc123.apps.googleusercontent.com`)
   - ✏️ **Client Secret** (looks like: `GOCSPX-abc123xyz`)

   💡 **Tip**: Keep this browser tab open or download the JSON file

### Step 5: Configure Google in Supabase Dashboard

1. Open [Supabase Dashboard](https://supabase.com/dashboard/project/wijsfrgbxmpzltobxxnq/auth/providers)
2. Click on **Authentication** (left sidebar) → **Providers**
3. Find **Google** in the provider list
4. Toggle **Enable Sign in with Google** to **ON**

5. Fill in the form:
   - **Client ID (for OAuth)**: Paste the Client ID from Step 4
   - **Client Secret (for OAuth)**: Paste the Client Secret from Step 4
   - **Authorized Redirect URIs**: Should already show your Supabase URL (no changes needed)

6. Click **Save** at the bottom

✅ **Google OAuth is now configured!**

---

## 🍎 Part 2: Apple OAuth Setup (15-20 minutes) - iOS Only

⚠️ **Note**: Apple Sign-In requires:
- An Apple Developer account ($99/year)
- A registered App ID and Services ID
- This is only needed for iOS builds

### Step 1: Create App ID

1. Go to [Apple Developer Account](https://developer.apple.com/account)
2. Navigate to **Certificates, Identifiers & Profiles**
3. Click **Identifiers** → **+ (plus button)**

4. Select **App IDs** → Click **Continue**
5. Select **App** → Click **Continue**

6. Configure App ID:
   - **Description**: `Crochetly App`
   - **Bundle ID**: Select **Explicit**
   - **Bundle ID**: `com.crochetly.app` (matches your app.json)

7. **Capabilities**: Scroll down and check **Sign in with Apple**
8. Click **Continue** → **Register**

### Step 2: Create Services ID

1. Still in **Identifiers**, click **+ (plus button)** again
2. Select **Services IDs** → Click **Continue**

3. Configure Services ID:
   - **Description**: `Crochetly Auth Service`
   - **Identifier**: `com.crochetly.auth` (must be different from App ID)

4. Check **Sign in with Apple**
5. Click **Continue** → **Register**

### Step 3: Configure Services ID for Web Auth

1. In the Identifiers list, click on the **Services ID** you just created (`com.crochetly.auth`)
2. Check **Sign in with Apple** if not already checked
3. Click **Configure** (next to Sign in with Apple)

4. Configure domains and URLs:
   - **Primary App ID**: Select `Crochetly App` (from Step 1)

   - **Domains and Subdomains**: Add BOTH of these (click + for each):
     ```
     oauth.fastshot.ai
     ```
     ```
     wijsfrgbxmpzltobxxnq.supabase.co
     ```

   - **Return URLs**: Add BOTH of these (click + for each):
     ```
     https://oauth.fastshot.ai/callback
     ```
     ```
     https://wijsfrgbxmpzltobxxnq.supabase.co/auth/v1/callback
     ```

5. Click **Next** → **Done**
6. Click **Continue** → **Save**

### Step 4: Create Sign in with Apple Key

1. In Apple Developer, go to **Keys** (left sidebar)
2. Click **+ (plus button)**

3. Configure Key:
   - **Key Name**: `Crochetly Sign in with Apple Key`
   - Check **Sign in with Apple**
   - Click **Configure**

4. Select **Primary App ID**: `Crochetly App`
5. Click **Save**
6. Click **Continue** → **Register**

7. **IMPORTANT**: Download the key file (.p8 file)
   - ⚠️ **This is the ONLY time you can download this file!**
   - Save it securely (e.g., in a password manager)

8. **Copy and save these values** (you'll need them):
   - ✏️ **Key ID**: 10-character string shown on the download page
   - ✏️ **Team ID**: Found in the top-right corner of Apple Developer account (10-character string)
   - ✏️ **Services ID**: `com.crochetly.auth` (from Step 2)
   - ✏️ **Key file contents**: Open the .p8 file in a text editor and copy all contents

### Step 5: Configure Apple in Supabase Dashboard

1. Open [Supabase Dashboard](https://supabase.com/dashboard/project/wijsfrgbxmpzltobxxnq/auth/providers)
2. Click on **Authentication** → **Providers**
3. Find **Apple** in the provider list
4. Toggle **Enable Sign in with Apple** to **ON**

5. Fill in the form:
   - **Services ID**: Paste `com.crochetly.auth` (from Step 2)
   - **Team ID**: Paste your Team ID (from Step 4)
   - **Key ID**: Paste your Key ID (from Step 4)
   - **Secret Key**: Paste the ENTIRE contents of the .p8 file (including `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`)

6. Click **Save** at the bottom

✅ **Apple OAuth is now configured!**

---

## 🧪 Part 3: Testing Authentication (5 minutes)

### Test Google Sign-In

1. Start your Expo development server:
   ```bash
   npx expo start
   ```

2. Open the app on your device or simulator

3. Complete the onboarding flow (screens 1-5)

4. On the Account Gate screen (Screen 6), tap **"Continue with Google"**

5. You should see:
   - ✅ Browser opens with Google sign-in
   - ✅ Sign in with your Google account
   - ✅ Browser closes and returns to app
   - ✅ Loading indicator appears briefly
   - ✅ App navigates to the main Dashboard
   - ✅ Your quiz data is saved

6. Verify in Supabase:
   - Go to [Supabase Dashboard → Authentication → Users](https://supabase.com/dashboard/project/wijsfrgbxmpzltobxxnq/auth/users)
   - You should see your user account
   - Go to **Table Editor** → **user_profiles**
   - Your profile should have `skill_level` and `creation_intent` data

### Test Apple Sign-In (iOS Only)

1. **Important**: Apple Sign-In only works on physical iOS devices or iOS simulators, NOT on Android

2. Repeat the onboarding flow

3. Tap **"Continue with Apple"**

4. You should see:
   - ✅ Apple's native sign-in dialog
   - ✅ Sign in with your Apple ID
   - ✅ Choose to share or hide email
   - ✅ App receives authentication
   - ✅ App navigates to Dashboard

---

## 🔧 Troubleshooting

### Google Sign-In Issues

**Problem**: "OAuth callback error: redirect_uri_mismatch"
- **Solution**: Double-check that BOTH redirect URIs are added in Google Cloud Console:
  - `https://oauth.fastshot.ai/callback`
  - `https://wijsfrgbxmpzltobxxnq.supabase.co/auth/v1/callback`

**Problem**: "Access blocked: This app's request is invalid"
- **Solution**: Make sure you enabled the Google+ API in Step 2

**Problem**: Browser doesn't close after signing in
- **Solution**: Check that your app.json has the correct `scheme: "fastshot"`

### Apple Sign-In Issues

**Problem**: "invalid_client"
- **Solution**: Verify that the Services ID in Supabase exactly matches the one from Apple Developer Portal

**Problem**: "invalid_request: redirect_uri mismatch"
- **Solution**: Make sure BOTH domains are configured in the Services ID:
  - `oauth.fastshot.ai`
  - `wijsfrgbxmpzltobxxnq.supabase.co`

**Problem**: "invalid_grant: private key error"
- **Solution**: Ensure you copied the ENTIRE .p8 key file contents, including the `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----` lines

**Problem**: Apple Sign-In button doesn't appear
- **Solution**: This is expected on Android! Apple Sign-In only works on iOS. The code uses `Platform.OS === 'ios'` to conditionally show the button.

### General Issues

**Problem**: "Authentication Error: Failed to complete sign in"
- **Solution**: Check the Expo logs in your terminal for detailed error messages

**Problem**: User profile not saved after sign-in
- **Solution**: Check browser console logs. The auth callback in `_layout.tsx` should log "Auth successful for user: [email]"

**Problem**: Stuck on loading screen
- **Solution**: The `useAuthCallback` hook might be waiting. Check that the deep link scheme `fastshot://` is working by testing other deep links

---

## 📋 Checklist

Use this to track your progress:

### Google OAuth
- [ ] Created Google Cloud project
- [ ] Enabled Google+ API
- [ ] Configured OAuth consent screen
- [ ] Created OAuth 2.0 credentials
- [ ] Added both redirect URIs
- [ ] Copied Client ID and Client Secret
- [ ] Enabled Google in Supabase
- [ ] Pasted credentials in Supabase
- [ ] Saved configuration in Supabase
- [ ] Tested Google sign-in

### Apple OAuth (iOS)
- [ ] Created App ID in Apple Developer
- [ ] Enabled Sign in with Apple for App ID
- [ ] Created Services ID
- [ ] Configured domains and return URLs
- [ ] Created Sign in with Apple Key
- [ ] Downloaded .p8 key file
- [ ] Noted Key ID and Team ID
- [ ] Enabled Apple in Supabase
- [ ] Pasted all credentials in Supabase
- [ ] Saved configuration in Supabase
- [ ] Tested Apple sign-in on iOS device

---

## 📞 Support Resources

- **Supabase Auth Docs**: https://supabase.com/docs/guides/auth
- **Google OAuth Docs**: https://developers.google.com/identity/protocols/oauth2
- **Apple Sign-In Docs**: https://developer.apple.com/sign-in-with-apple/
- **@fastshot/auth Docs**: Check `/workspace/node_modules/@fastshot/auth/README.md`

---

## 🎉 Success!

Once both providers are configured and tested:
- ✅ Users can sign in with Google (all platforms)
- ✅ Users can sign in with Apple (iOS only)
- ✅ Quiz data is automatically saved to their profile
- ✅ Onboarding is marked complete
- ✅ Users can access the full app

Your authentication is production-ready! 🚀

---

**Need Help?** If you encounter any issues not covered in the troubleshooting section, check the Expo development server logs for detailed error messages.
