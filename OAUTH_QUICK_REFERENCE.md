# 🚀 OAuth Quick Reference Card

**Use this for quick lookup while following the main guide (`OAUTH_SETUP_GUIDE.md`)**

---

## ✅ Environment Variables Status

**NO additional environment variables needed!** All required variables are already configured in `/workspace/.env`:

```bash
✅ EXPO_PUBLIC_SUPABASE_URL=https://wijsfrgbxmpzltobxxnq.supabase.co
✅ EXPO_PUBLIC_SUPABASE_ANON_KEY=<configured>
✅ EXPO_PUBLIC_AUTH_BROKER_URL=https://oauth.fastshot.ai
✅ EXPO_PUBLIC_PROJECT_ID=<configured>
```

**Important**: OAuth credentials (Client ID, Client Secret, etc.) go directly into the **Supabase Dashboard**, NOT into environment variables. This is more secure.

---

## 🔗 Critical URLs

### Your Supabase Project
- **Dashboard**: https://supabase.com/dashboard/project/wijsfrgbxmpzltobxxnq
- **Auth Providers**: https://supabase.com/dashboard/project/wijsfrgbxmpzltobxxnq/auth/providers
- **Users**: https://supabase.com/dashboard/project/wijsfrgbxmpzltobxxnq/auth/users
- **Database Tables**: https://supabase.com/dashboard/project/wijsfrgbxmpzltobxxnq/editor

### External Consoles
- **Google Cloud Console**: https://console.cloud.google.com
- **Apple Developer Portal**: https://developer.apple.com/account

### OAuth Redirect URIs (Use These Exactly)
```
https://oauth.fastshot.ai/callback
https://wijsfrgbxmpzltobxxnq.supabase.co/auth/v1/callback
```
⚠️ **Add BOTH URLs to both Google Cloud Console AND Apple Developer Portal**

---

## 📋 Information You'll Need to Save

### Google OAuth (from Google Cloud Console)
```
Client ID: _____________________________.apps.googleusercontent.com
Client Secret: GOCSPX-_____________________________
```

### Apple OAuth (from Apple Developer Portal)
```
Services ID: com.crochetly.auth
Team ID: __________ (10 characters)
Key ID: __________ (10 characters)
Private Key: (contents of .p8 file)
```

---

## 🎯 Quick Setup Checklist

### Google (Required for all platforms)
1. ☐ Create Google Cloud project
2. ☐ Enable Google+ API
3. ☐ Configure OAuth consent screen
4. ☐ Create OAuth client ID (Web application)
5. ☐ Add both redirect URIs
6. ☐ Copy Client ID and Secret
7. ☐ Enable Google in Supabase dashboard
8. ☐ Paste credentials
9. ☐ Save in Supabase
10. ☐ Test sign-in

### Apple (Required for iOS)
1. ☐ Create App ID with Sign in with Apple
2. ☐ Create Services ID
3. ☐ Configure domains and return URLs
4. ☐ Create and download .p8 key
5. ☐ Note Key ID and Team ID
6. ☐ Enable Apple in Supabase dashboard
7. ☐ Paste all credentials
8. ☐ Save in Supabase
9. ☐ Test on iOS device

---

## 🐛 Common Error Messages

| Error | Where | Fix |
|-------|-------|-----|
| `redirect_uri_mismatch` | Google | Add both URIs to Google Cloud Console |
| `invalid_client` | Apple | Verify Services ID matches exactly |
| `invalid_request` | Apple | Check domains configured in Services ID |
| `invalid_grant` | Apple | Ensure entire .p8 key is copied (including BEGIN/END lines) |
| `Access blocked` | Google | Enable Google+ API |
| Button doesn't appear | Apple on Android | Expected - Apple only works on iOS |

---

## 🔍 Where to Find Things

### In Google Cloud Console
- **Client ID & Secret**: APIs & Services → Credentials → Click on your OAuth client
- **Redirect URIs**: Same location, under "Authorized redirect URIs"

### In Apple Developer Portal
- **Team ID**: Top-right corner of any page (10 characters)
- **Services ID**: Certificates, Identifiers & Profiles → Identifiers → Services IDs
- **Key ID**: Certificates, Identifiers & Profiles → Keys → Click on your key

### In Supabase Dashboard
- **Enable Providers**: Authentication → Providers
- **View Users**: Authentication → Users
- **Check User Profiles**: Table Editor → user_profiles

---

## 🧪 Test Commands

```bash
# Start development server
npx expo start

# Check TypeScript
npx tsc --noEmit

# Check linting
npm run lint

# Clear cache if needed
npx expo start -c
```

---

## ✨ What Happens After Sign-In

1. User taps "Continue with Google/Apple"
2. Browser opens → User signs in
3. Browser closes → App shows loading
4. **Automatic actions**:
   - ✅ User session created in Supabase
   - ✅ User profile created in `user_profiles` table
   - ✅ Quiz data (skill_level, creation_intent) saved
   - ✅ Onboarding marked complete
   - ✅ User redirected to Dashboard
5. User can now use the full app!

---

## 🎯 Success Criteria

You know it's working when:
- ✅ Sign-in button opens browser
- ✅ Can authenticate with Google/Apple
- ✅ Browser closes automatically
- ✅ App navigates to Dashboard
- ✅ User appears in Supabase Users table
- ✅ Profile exists in user_profiles table with quiz data
- ✅ Reopening app shows Dashboard (not onboarding)

---

## 📞 Need More Detail?

See the full guide: `OAUTH_SETUP_GUIDE.md`

---

**Last Updated**: Your OAuth implementation is production-ready! Just needs provider credentials configured in Supabase Dashboard.
