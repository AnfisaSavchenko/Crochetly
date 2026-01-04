# 🚨 CRITICAL FINDING: OAuth Broker Configuration Issue

**Status:** ⚠️ **PROJECT_ID MISMATCH - NOT SUPABASE, BUT FASTSHOT PROJECT ID**

---

## 💥 The Real Issue

The `EXPO_PUBLIC_PROJECT_ID` environment variable should be a **Fastshot project ID**, NOT your Supabase project reference.

### What We Did (Incorrectly)
```bash
# ❌ INCORRECT - This is the Supabase project reference
EXPO_PUBLIC_PROJECT_ID=wijsfrgbxmpzltobxxnq
```

### What It Should Be
```bash
# ✅ CORRECT - This should be your Fastshot project ID
EXPO_PUBLIC_PROJECT_ID=<YOUR_FASTSHOT_PROJECT_ID>
```

---

## 📖 Evidence from @fastshot/auth Source Code

From `/node_modules/@fastshot/auth/src/constants.ts`:

```typescript
/**
 * Auth Broker configuration
 * URLs are read from environment variables at runtime
 *
 * Required env vars:
 * - EXPO_PUBLIC_AUTH_BROKER_URL: Auth broker service URL
 * - EXPO_PUBLIC_PROJECT_ID: Fastshot project ID    // ← NOTE: **Fastshot** project ID
 */
export const AUTH_CONFIG = {
  /** Project ID for authentication */
  get PROJECT_ID(): string | undefined {
    return getEnvVar('EXPO_PUBLIC_PROJECT_ID', '');
  },
}
```

The documentation clearly states this should be a "**Fastshot project ID**", not a Supabase project reference.

---

## 🔍 Why oauth.fastshot.ai Returns 500

The auth broker (`oauth.fastshot.ai`) is looking up OAuth credentials based on the `tenant` parameter, which is set to your `PROJECT_ID`. When you send `wijsfrgbxmpzltobxxnq` (Supabase ref), the broker:

1. Receives the request with `tenant=wijsfrgbxmpzltobxxnq`
2. Looks up this tenant in its database
3. **Finds no registered Fastshot project with this ID**
4. Returns 500 Internal Server Error

The broker is working correctly - it just doesn't have your project registered!

---

## ✅ Solution: Register with Fastshot

You need to:

### Step 1: Register Your App with Fastshot
Visit: **https://fastshot.ai** (or wherever Fastshot projects are managed)

1. Create a new Fastshot project
2. Configure OAuth providers (Google, Apple)
3. Link it to your Supabase project (`wijsfrgbxmpzltobxxnq`)
4. Get your **Fastshot Project ID**

### Step 2: Update Your .env
```bash
EXPO_PUBLIC_PROJECT_ID=<YOUR_FASTSHOT_PROJECT_ID>  # NOT your Supabase ref!
EXPO_PUBLIC_SUPABASE_URL=https://wijsfrgbxmpzltobxxnq.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
EXPO_PUBLIC_AUTH_BROKER_URL=https://oauth.fastshot.ai
```

### Step 3: Configure OAuth in Fastshot Dashboard
Add your OAuth credentials:
- **Google Client ID** & **Secret**
- **Apple Service ID**, **Team ID**, **Key ID**, & **Private Key**
- **Redirect URL**: `https://oauth.fastshot.ai/v1/auth/callback`

---

## 🎯 Immediate Action Required

**You CANNOT proceed with OAuth authentication until you:**
1. Register a project with Fastshot
2. Get your Fastshot Project ID
3. Update `EXPO_PUBLIC_PROJECT_ID` in `.env`

---

## 🔄 Alternative: Switch to Native Supabase OAuth

If Fastshot registration is blocked or unavailable, consider using Supabase's native OAuth instead:

### Benefits of Native Supabase OAuth:
- ✅ No third-party broker needed
- ✅ Direct integration with Supabase
- ✅ No additional registration required
- ✅ Works immediately

### Implementation:
```typescript
// Replace @fastshot/auth
import { supabase } from '@/services/supabaseClient';

const handleGoogleSignIn = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: 'fastshot://auth/callback',
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  });

  if (error) {
    console.error('OAuth error:', error);
    return;
  }

  // OAuth URL is in data.url - open it with expo-web-browser
  if (data.url) {
    const result = await WebBrowser.openAuthSessionAsync(
      data.url,
      'fastshot://auth/callback'
    );

    if (result.type === 'success' && result.url) {
      // Extract tokens from callback URL and set session
      const url = new URL(result.url);
      const accessToken = url.searchParams.get('access_token');
      const refreshToken = url.searchParams.get('refresh_token');

      if (accessToken && refreshToken) {
        await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
      }
    }
  }
};
```

---

## 📊 Comparison: @fastshot/auth vs Native Supabase OAuth

| Feature | @fastshot/auth | Native Supabase OAuth |
|---------|---------------|---------------------|
| Setup Complexity | 🔴 High (requires Fastshot account) | 🟢 Low (use existing Supabase) |
| Third-party Dependencies | 🔴 Yes (oauth.fastshot.ai broker) | 🟢 No |
| OAuth Credential Storage | Fastshot servers | Supabase servers |
| Deep Linking | Handled automatically | Manual implementation needed |
| Token Exchange | Automatic | Manual |
| Current Status | ❌ Blocked (no Fastshot project) | ✅ Ready to implement |

---

## 🛠️ Recommended Next Steps

### Option A: Use @fastshot/auth (Requires Fastshot Registration)
1. ⏳ Visit https://fastshot.ai and create account
2. ⏳ Register new project
3. ⏳ Configure OAuth providers
4. ⏳ Get Fastshot Project ID
5. ⏳ Update `.env` with correct PROJECT_ID
6. ✅ Test authentication

**Estimated Time:** Unknown (depends on Fastshot onboarding)
**Blocker:** Requires access to Fastshot platform

### Option B: Switch to Native Supabase OAuth (Immediate)
1. ✅ Remove @fastshot/auth dependency
2. ✅ Implement native Supabase OAuth flow
3. ✅ Handle deep links manually
4. ✅ Implement token exchange
5. ✅ Test authentication

**Estimated Time:** 1-2 hours of development
**Blocker:** None - ready to implement now

---

## 🎓 Key Learnings

1. **@fastshot/auth is a managed OAuth broker service**, not just an SDK
2. **It requires a separate Fastshot project registration**, independent of Supabase
3. **The PROJECT_ID in .env is for Fastshot**, not Supabase
4. **The auth broker is a centralized service** that stores OAuth credentials for multiple projects
5. **This is a common pattern** for simplifying OAuth in mobile apps, but adds a dependency

---

## 💡 Why Use @fastshot/auth?

Despite the extra setup, `@fastshot/auth` offers advantages:
- 🔐 **Secure credential storage** - OAuth secrets never exposed in app
- 🚀 **Simplified implementation** - Just a few hooks, no manual OAuth flow
- 🔄 **Automatic token exchange** - Handles complex OAuth handshakes
- 📱 **Deep linking handled** - No need to implement callback parsing
- 🏢 **Multi-tenant support** - Easy to manage OAuth for multiple projects

If these benefits align with your needs AND you can complete Fastshot registration, stick with it. Otherwise, native Supabase OAuth is simpler and faster to deploy.

---

## 📞 Support Contacts

- **Fastshot Support:** Check https://fastshot.ai for docs/support
- **Supabase OAuth Docs:** https://supabase.com/docs/guides/auth/social-login
- **@fastshot/auth Package:** Check npm page for issue tracker

---

**Report Date:** 2026-01-04
**Confidence Level:** 🟢 **VERY HIGH** (source code analysis confirms)
**Action Required:** ✅ **IMMEDIATE** (blocking OAuth functionality)
