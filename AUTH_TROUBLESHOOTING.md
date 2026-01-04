# Authentication System Audit - Complete Analysis

## 🔍 Executive Summary

**Issue Found**: Critical Project ID mismatch causing 500 Internal Server Error from oauth.fastshot.ai
**Root Cause**: EXPO_PUBLIC_PROJECT_ID was set to incorrect UUID instead of Supabase project reference
**Status**: ✅ **FIXED** - Configuration corrected and validation enhanced

---

## 🚨 The Problem (RESOLVED)

### What Was Wrong

The `.env` file had a mismatched project ID:

```env
# ❌ BEFORE (WRONG)
EXPO_PUBLIC_PROJECT_ID=6f58d805-60a2-4644-92ea-b947bf1905a9
EXPO_PUBLIC_SUPABASE_URL=https://wijsfrgbxmpzltobxxnq.supabase.co

# ✅ AFTER (FIXED)
EXPO_PUBLIC_PROJECT_ID=wijsfrgbxmpzltobxxnq
EXPO_PUBLIC_SUPABASE_URL=https://wijsfrgbxmpzltobxxnq.supabase.co
```

### Why This Caused 500 Errors

1. **User clicks "Sign in with Google/Apple"** in the app
2. **App sends OAuth request** to `oauth.fastshot.ai` with parameters:
   ```
   https://oauth.fastshot.ai/v1/auth/google/start?tenant=6f58d805-60a2-4644-92ea-b947bf1905a9&...
   ```
3. **Auth broker receives wrong tenant ID** (`6f58d805...`) that doesn't exist
4. **Broker cannot find Supabase configuration** for that tenant
5. **Result: 500 Internal Server Error** ❌

### The Fix

The `EXPO_PUBLIC_PROJECT_ID` must be the **Supabase project reference** (the subdomain from your Supabase URL):

- Extract from: `https://wijsfrgbxmpzltobxxnq.supabase.co`
- Project ref: `wijsfrgbxmpzltobxxnq`
- Set: `EXPO_PUBLIC_PROJECT_ID=wijsfrgbxmpzltobxxnq`

---

## 📋 Complete OAuth Flow (How It Works)

### Step-by-Step Authentication Process

```
┌─────────────────────────────────────────────────────────────────────┐
│  1. User clicks "Sign in with Google/Apple" in app                  │
│     Location: app/onboarding/auth.tsx                               │
└─────────────────────────────────────────────────────────────────────┘
                                  ↓
┌─────────────────────────────────────────────────────────────────────┐
│  2. App validates configuration (NEW)                                │
│     - ConfigValidator.validateForOAuth()                            │
│     - Checks PROJECT_ID matches Supabase ref                        │
│     - Blocks sign-in if mismatch detected                           │
└─────────────────────────────────────────────────────────────────────┘
                                  ↓
┌─────────────────────────────────────────────────────────────────────┐
│  3. App constructs OAuth start URL                                   │
│     URL: https://oauth.fastshot.ai/v1/auth/[provider]/start         │
│     Parameters:                                                      │
│       - tenant: wijsfrgbxmpzltobxxnq (PROJECT_ID)                   │
│       - return_to: fastshot://auth/callback                         │
│       - mode: browser                                               │
│       - login_hint: (optional, for Google)                          │
│     Location: @fastshot/auth/src/utils/deepLink.ts                 │
└─────────────────────────────────────────────────────────────────────┘
                                  ↓
┌─────────────────────────────────────────────────────────────────────┐
│  4. System browser opens OAuth URL                                   │
│     - Uses expo-web-browser's openAuthSessionAsync                  │
│     - User sees Google/Apple sign-in page                           │
└─────────────────────────────────────────────────────────────────────┘
                                  ↓
┌─────────────────────────────────────────────────────────────────────┐
│  5. Auth broker looks up Supabase configuration                      │
│     - Queries tenant: wijsfrgbxmpzltobxxnq                          │
│     - Retrieves OAuth credentials (Client ID/Secret)                │
│     - Initiates OAuth flow with provider                            │
└─────────────────────────────────────────────────────────────────────┘
                                  ↓
┌─────────────────────────────────────────────────────────────────────┐
│  6. User completes authentication with provider                      │
│     - Enters credentials                                            │
│     - Grants permissions                                            │
│     - Provider redirects back to broker                             │
└─────────────────────────────────────────────────────────────────────┘
                                  ↓
┌─────────────────────────────────────────────────────────────────────┐
│  7. Auth broker generates one-time ticket                            │
│     - Creates short-lived ticket (60 seconds)                       │
│     - Redirects browser to: fastshot://auth/callback?ticket=xxx     │
└─────────────────────────────────────────────────────────────────────┘
                                  ↓
┌─────────────────────────────────────────────────────────────────────┐
│  8. App receives deep link callback                                  │
│     - useAuthCallback hook detects deep link                        │
│     - Parses ticket from URL                                        │
│     Location: @fastshot/auth/src/hooks/useAuthCallback.ts          │
└─────────────────────────────────────────────────────────────────────┘
                                  ↓
┌─────────────────────────────────────────────────────────────────────┐
│  9. App exchanges ticket for Supabase session                        │
│     POST https://oauth.fastshot.ai/v1/auth/exchange                 │
│     Body: { "ticket": "xxx" }                                       │
│     Returns: { "access_token": "...", "refresh_token": "..." }     │
│     Location: @fastshot/auth/src/utils/ticketExchange.ts           │
└─────────────────────────────────────────────────────────────────────┘
                                  ↓
┌─────────────────────────────────────────────────────────────────────┐
│  10. Session restored to Supabase client                             │
│      - supabase.auth.setSession(tokens)                             │
│      - Session persisted to AsyncStorage                            │
│      Location: @fastshot/auth/src/utils/session.ts                 │
└─────────────────────────────────────────────────────────────────────┘
                                  ↓
┌─────────────────────────────────────────────────────────────────────┐
│  11. onSuccess callback fired (app/_layout.tsx)                      │
│       - Save user profile to Supabase user_profiles table           │
│       - Mark onboarding as complete in AsyncStorage                 │
│       - User automatically redirected to home screen                │
└─────────────────────────────────────────────────────────────────────┘
```

---

## ✅ Comprehensive Audit Results

### 1. Environment Variable Audit

| Variable | Status | Value | Notes |
|----------|--------|-------|-------|
| EXPO_PUBLIC_PROJECT_ID | ✅ FIXED | `wijsfrgbxmpzltobxxnq` | Now matches Supabase ref |
| EXPO_PUBLIC_SUPABASE_URL | ✅ VALID | `https://wijsfrgbxmpzltobxxnq.supabase.co` | Correct format |
| EXPO_PUBLIC_SUPABASE_ANON_KEY | ✅ VALID | `eyJhbGci...` (JWT) | Valid JWT token |
| EXPO_PUBLIC_AUTH_BROKER_URL | ✅ VALID | `https://oauth.fastshot.ai` | Correct broker URL |

**Configuration Validator**: `services/configValidator.ts`
- ✅ Validates all required environment variables
- ✅ Checks Supabase URL format
- ✅ Validates JWT token structure
- ✅ Detects PROJECT_ID mismatch (NOW CATCHES THE ISSUE!)

### 2. Redirect & Deep Link Logic

**File**: `app/_layout.tsx` (lines 37-107)

✅ **useAuthCallback Implementation**:
- Correctly listens for `fastshot://auth/callback` deep links
- Properly handles ticket parameter extraction
- Exchanges ticket for session via `@fastshot/auth`
- No infinite redirect loops detected
- Navigation handled correctly by index.tsx redirect logic

✅ **Deep Link Configuration**:
- Scheme: `fastshot://`
- Path: `auth/callback`
- Handles both success (ticket) and error (error, error_description) params

✅ **Error Handling**:
- Enhanced error messages with specific troubleshooting steps
- Detects 500 errors and provides actionable guidance
- Handles ticket exchange failures gracefully
- No empty catch blocks - all errors are logged and displayed

### 3. Supabase Profile Sync

**File**: `services/authService.ts` (lines 39-55)

✅ **saveUserProfileAfterAuth** Implementation:
- Retrieves quiz data from AsyncStorage
- Writes to `user_profiles` table with proper structure
- Marks onboarding as complete
- **Error Handling**: Comprehensive try/catch with specific error messages
- **Failure Modes Detected**:
  - RLS policy blocking write
  - Table doesn't exist
  - Network connectivity issues
  - All logged and displayed to user with actionable guidance

✅ **Database Schema** (inferred from code):
```sql
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  skill_level TEXT,
  creation_intent TEXT,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMP WITH TIME ZONE
);
```

### 4. Broker Communication

**File**: `@fastshot/auth/src/utils/deepLink.ts` (lines 55-76)

✅ **buildOAuthStartUrl** Implementation:
```typescript
function buildOAuthStartUrl(provider, params) {
  const endpoint = provider === 'google'
    ? '/v1/auth/google/start'
    : '/v1/auth/apple/start';
  const url = new URL(endpoint, AUTH_CONFIG.AUTH_BROKER_URL);

  url.searchParams.set('tenant', params.tenant);      // ✅ NOW CORRECT
  url.searchParams.set('return_to', params.returnTo); // ✅ fastshot://auth/callback
  url.searchParams.set('mode', params.mode);          // ✅ browser

  return url.toString();
}
```

**Parameters Sent to Broker** (AFTER FIX):
- ✅ `tenant=wijsfrgbxmpzltobxxnq` (CORRECT - matches Supabase ref)
- ✅ `return_to=fastshot://auth/callback` (CORRECT)
- ✅ `mode=browser` (CORRECT)

### 5. Silent Errors Check

✅ **No Silent Errors Found**:
- All catch blocks have proper error logging
- All errors shown to user via Alert.alert
- Enhanced error messages with troubleshooting steps
- Console logging for debugging throughout

---

## 🛠️ Improvements Made

### 1. Fixed Environment Configuration
- ✅ Updated `EXPO_PUBLIC_PROJECT_ID` to match Supabase project reference
- ✅ Verified all environment variables are correctly formatted

### 2. Enhanced Configuration Validation
- ✅ Added `ConfigValidator.validateForOAuth()` method
- ✅ Blocks sign-in if configuration is invalid
- ✅ Throws descriptive errors with fix instructions
- ✅ Validates PROJECT_ID matches Supabase URL

### 3. Pre-Flight Validation in Auth Screen
- ✅ Added validation before OAuth initiation
- ✅ User sees error immediately if config is wrong
- ✅ Prevents wasted OAuth attempts with bad config

### 4. Comprehensive Error Messages
- ✅ Enhanced all error messages with troubleshooting steps
- ✅ Specific guidance for 500 errors
- ✅ Explains ticket exchange failures
- ✅ Provides actionable next steps

### 5. Created Verification Script
- ✅ Added `scripts/verify-auth-config.ts`
- ✅ Run before deployment to catch config issues
- ✅ Displays complete OAuth flow for reference

---

## 🎯 Next Steps for User

### 1. Verify Configuration (DONE ✅)
```bash
# Configuration is now valid
EXPO_PUBLIC_PROJECT_ID=wijsfrgbxmpzltobxxnq ✅
```

### 2. Enable OAuth Providers in Supabase Dashboard

The app-side configuration is now correct. The remaining step is to configure OAuth providers in Supabase:

#### For Google OAuth:
1. Go to: https://supabase.com/dashboard/project/wijsfrgbxmpzltobxxnq
2. Navigate to: **Authentication → Providers → Google**
3. Enable Google provider
4. Add **Client ID** and **Client Secret** from Google Cloud Console
5. Set **Authorized redirect URIs** to:
   ```
   https://oauth.fastshot.ai/v1/auth/callback
   https://wijsfrgbxmpzltobxxnq.supabase.co/auth/v1/callback
   ```

#### For Apple OAuth:
1. Go to: **Authentication → Providers → Apple**
2. Enable Apple provider
3. Add **Service ID**, **Team ID**, and **Key ID** from Apple Developer Portal
4. Upload **Private Key** (.p8 file)
5. Set **Return URL** to:
   ```
   https://oauth.fastshot.ai/v1/auth/callback
   ```

### 3. Test Authentication
1. ✅ Configuration is valid
2. ⏳ Enable providers in Supabase Dashboard (see above)
3. 🧪 Test sign-in with Google/Apple in the app
4. 🎉 Users should now successfully authenticate!

---

## 🔄 OAuth Flow Summary

### What Happens Behind the Scenes

1. **App → Auth Broker**: "I want to sign in with Google for tenant wijsfrgbxmpzltobxxnq"
2. **Auth Broker**: "Let me look up the OAuth credentials for that tenant..."
3. **Auth Broker → Google**: "Start OAuth flow with these credentials"
4. **User → Google**: Enters credentials and grants permissions
5. **Google → Auth Broker**: "Here's the authorization code"
6. **Auth Broker → Google**: "Exchange code for tokens"
7. **Auth Broker**: "Create Supabase session with these tokens"
8. **Auth Broker → App**: "Here's a one-time ticket: xxx"
9. **App → Auth Broker**: "Exchange ticket xxx for session tokens"
10. **Auth Broker → App**: "Here are the access_token and refresh_token"
11. **App**: "Save session to Supabase client and redirect to home"

### Why the Tenant Parameter is Critical

The **tenant** parameter (`EXPO_PUBLIC_PROJECT_ID`) is how the auth broker knows:
- Which Supabase project you're using
- Which OAuth credentials to use (your Google/Apple Client ID/Secret)
- Which redirect URLs are valid
- Which database to create the user in

**If the tenant is wrong**, the broker can't find your configuration → 500 error ❌
**If the tenant is correct**, everything works smoothly → 200 success ✅

---

## 📊 Validation Commands

Run these to verify everything is configured correctly:

```bash
# 1. Verify TypeScript compilation
npx tsc --noEmit

# 2. Run linter
npm run lint

# 3. Run custom auth verification (optional)
npx ts-node scripts/verify-auth-config.ts
```

All commands should pass with no errors ✅

---

## 🐛 Troubleshooting Guide

### If You Still See 500 Errors After Fix

1. **Verify .env file was reloaded**:
   - Stop the Expo dev server
   - Clear Metro bundler cache: `npx expo start --clear`
   - Restart the app

2. **Check Supabase Dashboard**:
   - Are Google/Apple OAuth providers **enabled**?
   - Are OAuth credentials (Client ID/Secret) configured?
   - Are redirect URLs set to `https://oauth.fastshot.ai/v1/auth/callback`?

3. **Verify PROJECT_ID**:
   ```bash
   echo $EXPO_PUBLIC_PROJECT_ID
   # Should output: wijsfrgbxmpzltobxxnq
   ```

4. **Check console logs**:
   - Look for "Configuration Validation" output on app start
   - Should show: "✅ Project ID matches Supabase project reference"

### Common Error Messages Explained

| Error | Cause | Fix |
|-------|-------|-----|
| 500 Internal Server Error | Broker can't find tenant config | Verify PROJECT_ID, enable OAuth in Supabase |
| Invalid or expired ticket | Ticket > 60 seconds old | Retry sign-in (tickets expire quickly) |
| Profile Save Error | RLS blocking write | Check RLS policies on user_profiles table |
| Configuration Error | Validation failed | Run verify-auth-config.ts to see details |

---

## ✅ Conclusion

### Issue Summary
- **Found**: PROJECT_ID mismatch causing auth broker to fail with 500 error
- **Fixed**: Updated EXPO_PUBLIC_PROJECT_ID to match Supabase project reference
- **Enhanced**: Added comprehensive validation and error handling
- **Status**: ✅ **APP-SIDE CONFIGURATION COMPLETE**

### Remaining Steps
1. ⏳ Enable OAuth providers in Supabase Dashboard (user action required)
2. 🧪 Test authentication flow
3. 🎉 Launch to users!

### Code Quality
- ✅ TypeScript compilation passes
- ✅ Linting passes with no errors
- ✅ All error paths have proper handling
- ✅ No silent failures or empty catch blocks
- ✅ Comprehensive inline documentation added
- ✅ Validation prevents future configuration mistakes

**The authentication system is now robust, well-documented, and ready for production!** 🚀
