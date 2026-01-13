# OAuth Redirect URIs Configuration

## Your Supabase Project
- **Project ID**: kyusuwdepygzjrxaewkn
- **Project URL**: https://kyusuwdepygzjrxaewkn.supabase.co

## Redirect URIs to Configure

### In Supabase Dashboard
✅ Already configured automatically in Supabase

### In Google Cloud Console

Add these redirect URIs to your OAuth Client:

```
https://kyusuwdepygzjrxaewkn.supabase.co/auth/v1/callback
```

**Where to add**:
1. Go to Google Cloud Console: https://console.cloud.google.com
2. APIs & Services → Credentials
3. Select your OAuth 2.0 Client ID
4. Add to "Authorized redirect URIs"

### In Apple Developer Console

Add these redirect URIs to your Services ID:

```
https://kyusuwdepygzjrxaewkn.supabase.co/auth/v1/callback
```

**Where to add**:
1. Go to Apple Developer: https://developer.apple.com/account
2. Certificates, Identifiers & Profiles
3. Identifiers → Select your Services ID
4. Configure "Sign In with Apple"
5. Add to "Return URLs"

## Mobile Deep Link (Handled Automatically)

The app uses this deep link for OAuth callbacks:
```
com.crochetly.app://auth/callback
```

This is already configured in:
- `app.json` (scheme and intent filters)
- `app/onboarding/auth.tsx` (makeRedirectUri)

## Testing

After configuration, the OAuth flow will be:

1. User clicks "Sign in with Google/Apple"
2. Opens browser to: `https://kyusuwdepygzjrxaewkn.supabase.co/auth/v1/authorize?...`
3. User authenticates with provider
4. Provider redirects to: `https://kyusuwdepygzjrxaewkn.supabase.co/auth/v1/callback?code=...`
5. Supabase processes and redirects to: `com.crochetly.app://auth/callback?...`
6. App handles callback and creates session

## Common Issues

### "Invalid redirect URI" error
- **Cause**: Redirect URI not added to OAuth provider settings
- **Fix**: Add the exact URL shown above to your provider console

### "redirect_uri_mismatch" error
- **Cause**: URL doesn't match exactly (check for trailing slashes, http vs https)
- **Fix**: Copy the URL exactly as shown above

### Deep link not working
- **Cause**: App scheme not configured
- **Fix**: Already configured in `app.json` - rebuild app if needed

## Verification

To verify redirect URIs are correct:

1. Check Supabase Dashboard:
   - Go to Authentication → URL Configuration
   - Should see your project callback URL

2. Check provider console:
   - Verify redirect URI matches exactly
   - No typos, no trailing slashes

3. Test in app:
   - Should redirect to provider
   - Should redirect back to app
   - Check console logs for any errors
