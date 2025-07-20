# LinkedIn OAuth Debugging Guide

## Issue
The LinkedIn OAuth redirect gets stuck loading after signing in.

## Root Causes & Solutions

### 1. **Redirect URI Mismatch**
The most common cause is that the redirect URI in your LinkedIn app doesn't match exactly what your backend sends.

**Current Configuration:**
- Backend redirect URI: `http://localhost:4000/api/auth/linkedin/callback-custom`
- Frontend callback: `http://localhost:3000/auth/callback`

**To Fix:**
1. Log into [LinkedIn Developer Portal](https://www.linkedin.com/developers/apps)
2. Go to your app's Auth tab
3. Under "Authorized redirect URLs", ensure you have:
   ```
   http://localhost:4000/api/auth/linkedin/callback-custom
   ```
   ⚠️ **Must match EXACTLY** - no trailing slashes, exact protocol (http/https)

### 2. **Enhanced Error Handling**
I've updated both frontend and backend to handle errors better:

#### Frontend (`OAuthCallback.tsx`):
- Added comprehensive logging
- Better error messages
- Clears tokens on error
- Handles all error scenarios from backend

#### Backend (`authController.ts`):
- Added detailed logging at each step
- All errors now redirect to frontend `/auth/callback` with error params
- Logs token exchange details
- Logs user creation/update process

### 3. **Debug Endpoint**
Access `http://localhost:4000/api/auth/linkedin/debug` to verify:
- Environment variables are set
- Correct callback URLs
- LinkedIn client configuration

### 4. **Test Script**
Run the test script to verify OAuth flow:
```bash
cd wisal/scripts
./test-linkedin-oauth.sh
```

## Debugging Steps

### 1. **Check Browser Console**
When you get stuck on the loading screen:
1. Open DevTools (F12)
2. Check Console tab for errors
3. Look for logs starting with "OAuth Callback"
4. Check Network tab for failed requests

### 2. **Check Backend Logs**
The backend now logs:
- "LinkedIn callback initiated with query params"
- "Exchanging authorization code for access token"
- "Token exchange successful/failed"
- "LinkedIn userinfo fetched"
- "Successfully authenticated user, redirecting to frontend"

### 3. **Common Issues & Solutions**

#### Issue: "Invalid redirect_uri"
**Solution:** The redirect URI in LinkedIn app settings doesn't match exactly.

#### Issue: "Failed to exchange code for token"
**Solution:** Check that:
- LinkedIn client ID and secret are correct
- The authorization code hasn't expired (they're single-use)

#### Issue: "Failed to fetch user information"
**Solution:** Your LinkedIn app might not have the correct permissions. Ensure it has access to:
- `openid`
- `profile`
- `email`

#### Issue: Page loads but stays on loading screen
**Solution:** Check browser console for JavaScript errors. The `checkAuth()` call might be failing.

## Quick Fix Checklist

1. ✅ Verify LinkedIn app redirect URI matches exactly: `http://localhost:4000/api/auth/linkedin/callback-custom`
2. ✅ Check environment variables are set correctly in `.env`
3. ✅ Ensure both frontend (port 3000) and backend (port 4000) are running
4. ✅ Clear browser cache and cookies
5. ✅ Try in incognito/private browsing mode
6. ✅ Check browser console for specific error messages

## Testing the Fix

1. Start backend: `cd wisal/backend && npm run dev`
2. Start frontend: `cd wisal/frontend && npm run dev`
3. Visit: `http://localhost:4000/api/auth/linkedin-custom`
4. Complete LinkedIn authorization
5. Check browser console for debug logs
6. Should redirect to dashboard on success

## Environment Variables Required

```env
# Backend (.env)
LINKEDIN_CLIENT_ID=your_client_id
LINKEDIN_CLIENT_SECRET=your_client_secret
LINKEDIN_CALLBACK_URL=http://localhost:4000/api/auth/linkedin/callback-custom
FRONTEND_URL=http://localhost:3000
JWT_SECRET=your_jwt_secret
```

## Still Having Issues?

1. Check the exact error in browser console
2. Look at backend logs for specific failure point
3. Verify LinkedIn app settings match local configuration
4. Try the debug endpoint: `http://localhost:4000/api/auth/linkedin/debug`
5. Clear all browser data for localhost and try again