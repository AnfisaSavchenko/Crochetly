# OAuth 400 Bad Request Fix Guide

## Changes Made

### 1. **Fixed Scheme Mismatch** ✅
- **Before**: `app.json` had `scheme: "fastshot"`
- **After**: `scheme: "com.crochetly.app"` (matches bundle identifier)
- **Why**: The redirect URI must use the same scheme as configured in app.json

### 2. **Added iOS URL Scheme Configuration** ✅
- Added `CFBundleURLTypes` to `ios.infoPlist` in app.json
- Ensures iOS properly handles deep links with `com.crochetly.app://` scheme

### 3. **Removed Old Broker References** ✅
- Deleted `EXPO_PUBLIC_AUTH_BROKER_URL` from .env
- Cleaned up all broker-related configurations
- Now using **native Supabase OAuth** only

### 4. **Enhanced Logging & Error Handling** ✅
- Added comprehensive console logging throughout OAuth flow
- Clear error messages with actionable troubleshooting steps
- Environment variable validation on app startup

### 5. **Improved Deep Link Handling** ✅
- Enhanced callback handler with better parameter extraction
- Support for both PKCE flow (code) and implicit flow (tokens)
- Detailed logging of all OAuth parameters

---

## Required Supabase Dashboard Configuration

### Step 1: Add Redirect URL
Go to your Supabase Dashboard:

1. Navigate to **Authentication** → **URL Configuration**
2. Under **Redirect URLs**, add:
   ```
   com.crochetly.app://auth/callback
   ```
3. Click **Save**

⚠️ **CRITICAL**: This redirect URL must match exactly. Case-sensitive!

### Step 2: Enable OAuth Providers

#### For Google OAuth:
1. Go to **Authentication** → **Providers** → **Google**
2. Enable Google provider
3. Add your OAuth Client ID and Client Secret from Google Cloud Console
4. Authorized redirect URIs in Google Cloud Console should include:
   - `https://fldyoyeimoyoiygesjpf.supabase.co/auth/v1/callback`
5. Save configuration

#### For Apple OAuth:
1. Go to **Authentication** → **Providers** → **Apple**
2. Enable Apple provider
3. Add your Service ID, Team ID, Key ID, and Private Key from Apple Developer
4. Configure Apple Sign In service identifier with redirect URI:
   - `https://fldyoyeimoyoiygesjpf.supabase.co/auth/v1/callback`
5. Save configuration

### Step 3: Verify Environment Variables
Ensure your `.env` file contains:
```env
EXPO_PUBLIC_SUPABASE_URL=https://fldyoyeimoyoiygesjpf.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## Testing the OAuth Flow

### 1. Check Console Logs
When you trigger OAuth, you should see:

```
🔍 Environment Check:
  SUPABASE_URL: ✅ Set
  SUPABASE_ANON_KEY: ✅ Set

🚀 INITIATING GOOGLE SIGN-IN
═══════════════════════════════════════
📍 Redirect URI: com.crochetly.app://auth/callback
📍 Expected format: com.crochetly.app://auth/callback
⚠️  This MUST match a Redirect URL in Supabase Dashboard!
   Go to: Authentication → URL Configuration → Redirect URLs
═══════════════════════════════════════
✅ OAuth URL generated: https://...
🌐 Opening OAuth browser...
```

### 2. If You See 400 Bad Request
Check the detailed error logs:

```
❌ Supabase OAuth Error: [error details]
💥 400 BAD REQUEST - Likely causes:
   1. Redirect URI not whitelisted in Supabase
   2. OAuth provider not enabled
   3. Invalid OAuth credentials

🔧 To fix:
   • Add redirect URI to Supabase Dashboard
   • Verify Google/Apple OAuth is enabled
   • Check OAuth Client ID/Secret
```

### 3. Successful OAuth Flow
You should see:

```
📱 Browser result: success
✅ OAuth success, waiting for session establishment...

📥 OAuth callback received
═══════════════════════════════════════
🔍 All params: {...}
📦 Token Status:
  Access Token: ✅ Present
  Refresh Token: ✅ Present
  Auth Code: ✅ Present
🔐 Using PKCE flow (code exchange)...
✅ Session established successfully
   User ID: [user-id]
   Email: [user-email]
═══════════════════════════════════════
```

---

## Common Issues & Solutions

### Issue: "No authorization URL returned"
**Cause**: OAuth provider not properly configured in Supabase
**Solution**:
1. Verify provider is enabled in Supabase Dashboard
2. Check OAuth credentials (Client ID, Secret, etc.)
3. Ensure redirect URI is whitelisted

### Issue: "Failed to exchange code for session"
**Cause**: Redirect URI mismatch or PKCE flow issue
**Solution**:
1. Verify redirect URI exactly matches: `com.crochetly.app://auth/callback`
2. Check that `detectSessionInUrl: true` in supabaseClient.ts
3. Ensure deep link is properly configured in app.json

### Issue: Deep link not opening app
**Cause**: iOS URL scheme not properly configured
**Solution**:
1. Rebuild the app after changing app.json
2. Verify `CFBundleURLSchemes` includes `com.crochetly.app`
3. Test with: `npx uri-scheme open com.crochetly.app://auth/callback --ios`

### Issue: Environment variables not found
**Cause**: .env file not loaded or Metro bundler needs restart
**Solution**:
1. Verify .env file exists in project root
2. Restart Metro: Press `r` in terminal or kill and restart
3. Clear cache: `npm start -- --reset-cache`

---

## File Changes Summary

### Modified Files:
1. ✅ `app.json` - Updated scheme and added iOS URL configuration
2. ✅ `.env` - Removed old broker URL
3. ✅ `app/onboarding/auth.tsx` - Enhanced logging and error handling
4. ✅ `app/auth/callback.tsx` - Improved deep link parameter handling
5. ✅ `services/supabaseClient.ts` - Added environment validation logging

### Configuration:
- **Deep Link Scheme**: `com.crochetly.app://`
- **OAuth Callback Path**: `/auth/callback`
- **Full Redirect URI**: `com.crochetly.app://auth/callback`
- **PKCE Flow**: ✅ Enabled
- **Session Detection**: ✅ Enabled

---

## Next Steps

1. **Add Redirect URI** to Supabase Dashboard (most critical!)
2. **Enable OAuth Providers** (Google/Apple) with valid credentials
3. **Restart Development Server**: `npm start -- --reset-cache`
4. **Test OAuth Flow** and check console logs
5. **Verify Deep Link Handling** works on device/simulator

---

## Support

If issues persist after following this guide:
1. Check console logs for detailed error messages
2. Verify all redirect URIs match exactly (case-sensitive)
3. Test OAuth providers individually
4. Ensure app scheme is consistent across all configurations

**Remember**: The 400 Bad Request is almost always due to redirect URI mismatch or provider not being properly enabled in Supabase Dashboard.
