# OAuth 500 Error - Diagnostics & Resolution Guide

## 🚨 Problem Summary
**Error**: 500 Internal Server Error from `oauth.fastshot.ai`
**Impact**: Google/Apple sign-in fails during OAuth flow

## 🔍 Root Cause Analysis

Based on investigation, the 500 error from the auth broker typically occurs due to:

### **Primary Cause (Most Likely)**
**OAuth Providers Not Configured in Supabase Dashboard**
- The auth broker successfully receives the request
- It attempts to initiate OAuth with your Supabase project
- Supabase returns an error because Google/Apple OAuth is not enabled
- This causes the broker to return a 500 error

### **Secondary Cause (Possible)**
**Project ID Configuration Mismatch**
- Current `EXPO_PUBLIC_PROJECT_ID`: `6f58d805-60a2-4644-92ea-b947bf1905a9`
- Supabase Project Reference: `wijsfrgbxmpzltobxxnq`
- If the broker is expecting the Supabase ref as the tenant ID, this mismatch could cause issues

---

## ✅ Fixes Implemented

### 1. **Enhanced Error Handling**
- Added detailed error messages that identify the specific issue
- 500 errors now display user-friendly messages with actionable steps
- Logging includes full error context for debugging

### 2. **Configuration Validation**
Created `/workspace/services/configValidator.ts` that:
- Validates all required environment variables on app startup
- Checks for common configuration issues
- Warns about potential mismatches
- Logs configuration details for debugging

### 3. **Comprehensive Logging**
Added diagnostic logging in:
- `app/onboarding/auth.tsx`: Logs all OAuth sign-in attempts
- `app/_layout.tsx`: Logs OAuth callback processing
- Configuration validator: Logs startup configuration

---

## 🔧 Required Actions

### **Step 1: Enable OAuth Providers in Supabase Dashboard**

#### For Google OAuth:
1. Go to [Supabase Dashboard](https://supabase.com/dashboard/project/wijsfrgbxmpzltobxxnq/auth/providers)
2. Click on **Authentication** → **Providers**
3. Find **Google** in the providers list
4. Click **Enable**
5. Enter your OAuth credentials:
   - **Client ID**: (from Google Cloud Console)
   - **Client Secret**: (from Google Cloud Console)
6. Set Redirect URL to: `https://oauth.fastshot.ai/callback`
   - ⚠️ **IMPORTANT**: The redirect URL must point to the auth broker, NOT your app
7. Click **Save**

#### For Apple OAuth:
1. In the same Providers section, find **Apple**
2. Click **Enable**
3. Enter your OAuth credentials:
   - **Service ID**: (from Apple Developer Portal)
   - **Team ID**: (from Apple Developer Portal)
   - **Key ID**: (from Apple Developer Portal)
   - **Private Key**: (from Apple Developer Portal - .p8 file)
4. Set Redirect URL to: `https://oauth.fastshot.ai/callback`
5. Click **Save**

### **Step 2: Verify Environment Configuration**

Check your `.env` file:
```bash
EXPO_PUBLIC_SUPABASE_URL=https://wijsfrgbxmpzltobxxnq.supabase.co ✅
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc... ✅
EXPO_PUBLIC_AUTH_BROKER_URL=https://oauth.fastshot.ai ✅
EXPO_PUBLIC_PROJECT_ID=6f58d805-60a2-4644-92ea-b947bf1905a9 ⚠️
```

**Potential Issue**: The `PROJECT_ID` might need to match your Supabase project ref.

#### To Test If This Is The Issue:
1. Temporarily change `EXPO_PUBLIC_PROJECT_ID` to `wijsfrgbxmpzltobxxnq`
2. Restart the app
3. Try OAuth sign-in again
4. If it works, the mismatch was the issue

### **Step 3: Test OAuth Flow**

After configuring OAuth providers:
1. Restart your app (to load new Supabase config)
2. Navigate to the auth screen
3. Click "Sign in with Google" or "Sign in with Apple"
4. Check console logs for diagnostic information:
   ```
   === Configuration Validation ===
   ✅ Configuration is valid

   === Environment Variables ===
   Project ID: 6f58d805-60a2-4644-92ea-b947bf1905a9
   Supabase URL: https://wijsfrgbxmpzltobxxnq.supabase.co
   ...
   ```

---

## 🎯 Expected Behavior After Fix

### ✅ Successful Flow:
1. User clicks "Sign in with Google/Apple"
2. Console logs: `=== Google Sign-In Started ===`
3. System browser opens with OAuth provider
4. User authenticates with Google/Apple
5. Browser redirects to `fastshot://auth/callback?ticket=...`
6. Console logs: `=== Auth Callback Success ===`
7. Profile is saved: `✅ User profile saved successfully`
8. User is redirected to home screen

### ❌ If Still Failing:
Check console logs for:
- Configuration validation errors
- Project ID mismatch warnings
- Detailed error messages

---

## 🔍 Debugging Commands

### Check Configuration:
```bash
# View all environment variables
cat /workspace/.env | grep EXPO_PUBLIC

# Check if config validator runs on startup
# (Look for validation output in console when app starts)
```

### Check Supabase OAuth Configuration:
```bash
# Open Supabase Dashboard
https://supabase.com/dashboard/project/wijsfrgbxmpzltobxxnq/auth/providers
```

---

## 📋 Verification Checklist

- [ ] Google OAuth enabled in Supabase Dashboard
- [ ] Google Client ID and Secret configured
- [ ] Redirect URL set to `https://oauth.fastshot.ai/callback`
- [ ] Apple OAuth enabled in Supabase Dashboard (if using iOS)
- [ ] Apple credentials configured
- [ ] `EXPO_PUBLIC_AUTH_BROKER_URL` is exactly `https://oauth.fastshot.ai`
- [ ] App restarted after Supabase changes
- [ ] Configuration validation passes on app startup
- [ ] Console shows diagnostic logs

---

## 🆘 If Problem Persists

1. **Check Fastshot System Configuration**:
   - The `EXPO_PUBLIC_PROJECT_ID` might need to be registered in the Fastshot system
   - Contact Fastshot support to verify project mapping

2. **Verify Supabase Project Active**:
   ```bash
   # Project status should be "ACTIVE_HEALTHY"
   Project: wijsfrgbxmpzltobxxnq
   Status: ACTIVE_HEALTHY ✅
   ```

3. **Enable Detailed Error Logging**:
   The app now logs detailed error information. Share these logs:
   - Configuration validation output
   - OAuth sign-in attempt logs
   - Auth callback error details

---

## 📝 Technical Details

### Auth Flow Architecture:
```
App → Auth Broker → Supabase → OAuth Provider
                      ↓
                  500 Error
                  (OAuth not configured)
```

### Deep Link Configuration:
- **Scheme**: `fastshot://`
- **Callback Path**: `auth/callback`
- **Full Callback URL**: `fastshot://auth/callback`
- **Configured in**: `app.json`

### Configuration Files Modified:
- ✅ `/workspace/app/onboarding/auth.tsx` - Enhanced error handling
- ✅ `/workspace/app/_layout.tsx` - Added validation & logging
- ✅ `/workspace/services/configValidator.ts` - New validator utility

---

## 🎉 Next Steps

1. **Enable OAuth providers in Supabase** (most critical)
2. **Restart the app** to see new diagnostic messages
3. **Test OAuth flow** and check console logs
4. **If successful**: OAuth will work seamlessly
5. **If still failing**: Share console logs for further investigation
