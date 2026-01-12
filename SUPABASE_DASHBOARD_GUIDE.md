# 📊 Supabase Dashboard Configuration Guide

This guide shows you **exactly** what to enter in the Supabase Dashboard once you have your OAuth credentials from Google and Apple.

---

## 🟢 Step 1: Access Supabase Auth Providers

1. Go to: https://supabase.com/dashboard/project/fldyoyeimoyoiygesjpf
2. In the left sidebar, click **Authentication**
3. Click on **Providers** (sub-menu under Authentication)
4. You'll see a list of auth providers

---

## 🔵 Google OAuth Configuration

### Finding the Google Section
- Scroll down in the Providers list until you see **Google**
- It has the colorful Google "G" logo

### Toggle ON
1. Find the toggle switch at the top-right of the Google section
2. Click to turn it **ON** (it will turn green/blue)

### Fill in the Form

You'll see a form with these fields:

#### Field 1: "Client ID (for OAuth)"
```
Paste your Google Client ID here
Example: 123456789012-abc123def456.apps.googleusercontent.com
```
- This is from Google Cloud Console → Credentials
- It's a long string ending in `.apps.googleusercontent.com`

#### Field 2: "Client Secret (for OAuth)"
```
Paste your Google Client Secret here
Example: GOCSPX-abc123xyz789
```
- Also from Google Cloud Console → Credentials
- Usually starts with `GOCSPX-`

#### Field 3: "Authorized Redirect URIs"
```
This should already show:
https://wijsfrgbxmpzltobxxnq.supabase.co/auth/v1/callback
```
- ✅ **Leave this as-is** - Supabase fills it automatically
- ⚠️ **Don't change or delete this**

### Additional Settings (Optional)
- **Skip nonce check**: Leave **unchecked** (default)
- **Additional Scopes**: Leave empty (default scopes are fine)

### Save Configuration
1. Scroll to the bottom of the Google section
2. Click the **Save** button
3. You should see a success message

✅ **Google is now configured!**

---

## 🍎 Apple OAuth Configuration

### Finding the Apple Section
- Scroll down in the Providers list until you see **Apple**
- It has the black Apple logo

### Toggle ON
1. Find the toggle switch at the top-right of the Apple section
2. Click to turn it **ON** (it will turn green/blue)

### Fill in the Form

You'll see a form with these fields:

#### Field 1: "Services ID"
```
Enter: com.crochetly.auth
```
- This is the Services ID you created in Apple Developer Portal
- It's like a bundle identifier but for the auth service
- **Must match exactly** what you created in Apple Developer

#### Field 2: "Team ID"
```
Enter your 10-character Team ID
Example: A1B2C3D4E5
```
- Found in the top-right corner of Apple Developer Portal
- Always 10 alphanumeric characters
- Associated with your Apple Developer account

#### Field 3: "Key ID"
```
Enter your 10-character Key ID
Example: AB12CD34EF
```
- Found when you created the Sign in with Apple Key
- Also visible in Certificates, Identifiers & Profiles → Keys
- Always 10 alphanumeric characters

#### Field 4: "Secret Key"
```
Paste the ENTIRE contents of your .p8 file
Must include these lines:
-----BEGIN PRIVATE KEY-----
<many lines of random characters>
-----END PRIVATE KEY-----
```

⚠️ **Important**:
- Open the .p8 file in a text editor (Notepad, TextEdit, VS Code)
- Copy **EVERYTHING** including the BEGIN and END lines
- Don't modify or format the key
- The key should be multiple lines

**Example format** (your actual key will be different):
```
-----BEGIN PRIVATE KEY-----
MIGTAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBHkwdwIBAQQg7pGrS9/+7zQj9qKl
j5cYGj4YKwPpL6RqjrCzPWd5N0OgCgYIKoZIzj0DAQehRANCAAS6i1LJ6jJVLw==
-----END PRIVATE KEY-----
```

#### Field 5: "Authorized Redirect URIs"
```
This should already show:
https://wijsfrgbxmpzltobxxnq.supabase.co/auth/v1/callback
```
- ✅ **Leave this as-is** - Supabase fills it automatically
- ⚠️ **Don't change or delete this**

### Save Configuration
1. Scroll to the bottom of the Apple section
2. Click the **Save** button
3. You should see a success message

✅ **Apple is now configured!**

---

## 🔍 Verification

After saving both providers, verify your configuration:

### Check Provider Status
1. Still in Authentication → Providers
2. Both Google and Apple should show:
   - ✅ Toggle is **ON** (green/blue)
   - ✅ "Enabled" badge or indicator
   - ✅ No error messages

### View Configuration (Optional)
- You can click on each provider again to view the configuration
- Client IDs and keys are partially hidden for security
- You can update credentials anytime if needed

---

## 🧪 Test Authentication

### Quick Test in Supabase
1. Go to **Authentication** → **Users**
2. Currently, you should see "No users" or empty table
3. After you test sign-in in the app, you'll see users appear here

### Test in Your App
1. Start Expo: `npx expo start`
2. Open app on device/simulator
3. Complete onboarding to the Account Gate screen
4. Tap "Continue with Google" or "Continue with Apple"
5. Sign in with your account
6. Return to Supabase → Authentication → Users
7. You should now see your user account!

### Verify User Profile Data
1. In Supabase Dashboard, go to **Table Editor** (left sidebar)
2. Click on **user_profiles** table
3. You should see a row with:
   - `id`: Your user UUID
   - `skill_level`: The skill level you selected in onboarding
   - `creation_intent`: The intents you selected
   - `onboarding_completed`: `true`
   - `created_at` and `updated_at`: Timestamps

✅ **If you see this data, everything is working perfectly!**

---

## ❌ Common Configuration Mistakes

### Google Section
| Mistake | How to Identify | Fix |
|---------|----------------|-----|
| Forgot to enable | Toggle is OFF | Click toggle to turn ON |
| Wrong Client ID | Sign-in fails with "invalid_client" | Double-check Client ID in Google Cloud Console |
| Wrong Client Secret | Sign-in fails or redirects incorrectly | Get new Client Secret from Google Cloud Console |
| Modified Redirect URI | Sign-in fails with "redirect_uri_mismatch" | Reset to default Supabase URI |

### Apple Section
| Mistake | How to Identify | Fix |
|---------|----------------|-----|
| Forgot to enable | Toggle is OFF | Click toggle to turn ON |
| Wrong Services ID | Sign-in fails with "invalid_client" | Verify in Apple Developer Portal |
| Wrong Team ID | Sign-in fails immediately | Check top-right corner of Apple Developer Portal |
| Wrong Key ID | Sign-in fails with key error | Check Keys section in Apple Developer Portal |
| Incomplete .p8 key | Sign-in fails with "invalid_grant" | Copy entire file including BEGIN/END lines |
| Missing BEGIN/END lines | Sign-in fails with parse error | Re-copy the entire .p8 file |

---

## 🔄 Updating Credentials Later

If you need to change OAuth credentials:

1. Go to **Authentication** → **Providers**
2. Find the provider (Google or Apple)
3. Click on it to expand (if collapsed)
4. Update the fields
5. Click **Save**

**Note**: The provider must be **enabled** (toggle ON) to edit fields.

---

## 🎯 Success Indicators

You'll know the configuration is correct when:

✅ **In Supabase Dashboard**:
- Both providers show as "Enabled"
- No error messages
- Credentials are saved (fields show `••••••`)

✅ **In Your App**:
- Sign-in button works (opens browser)
- Can complete authentication flow
- Browser closes and returns to app
- User appears in Supabase Users table
- User profile created with quiz data

✅ **In Logs** (Expo terminal):
- See: "Auth successful for user: [email]"
- See: "User profile saved successfully after authentication"
- No error messages about invalid_client or redirect_uri

---

## 📞 Still Having Issues?

### Check Logs
1. In Supabase Dashboard, go to **Logs** (left sidebar)
2. Look for authentication-related errors
3. Errors will show which provider failed and why

### Test Individual Providers
- Test Google first (easier setup)
- Once Google works, then configure Apple
- This helps isolate which provider has issues

### Clear and Retry
1. Toggle provider OFF in Supabase
2. Wait 5 seconds
3. Toggle provider ON
4. Re-enter all credentials
5. Save and test again

---

## ✨ Final Notes

- **Security**: OAuth credentials in Supabase are encrypted and secure
- **Updates**: You can change credentials anytime without affecting existing users
- **Multiple Providers**: Users can link both Google and Apple to the same account
- **Production Ready**: This same configuration works for both development and production

**You're all set!** Once both providers are enabled and configured in Supabase, your authentication is fully functional. 🎉

---

**Related Guides**:
- Full setup instructions: `OAUTH_SETUP_GUIDE.md`
- Quick reference: `OAUTH_QUICK_REFERENCE.md`
