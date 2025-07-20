/**
 * Test script for LinkedIn OAuth implementation
 * This helps verify that the OAuth flow works correctly with the new LinkedIn OpenID Connect API
 */

const axios = require('axios');

// Configuration - update these with your actual values
const config = {
  clientId: process.env.LINKEDIN_CLIENT_ID || '78jk9ge83l1kez',
  clientSecret: process.env.LINKEDIN_CLIENT_SECRET || 'WPL_AP1.3UJgrAwqS8b0BMVl.lGtv8Q==',
  redirectUri: process.env.LINKEDIN_CALLBACK_URL || 'http://localhost:4000/api/auth/linkedin/callback',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
};

console.log('LinkedIn OAuth Test Script');
console.log('=========================\n');

console.log('Configuration:');
console.log(`Client ID: ${config.clientId}`);
console.log(`Redirect URI: ${config.redirectUri}`);
console.log(`Frontend URL: ${config.frontendUrl}\n`);

console.log('Available OAuth Endpoints:');
console.log('1. Standard Passport Route:');
console.log(`   GET ${config.redirectUri.replace('/callback', '')}`);
console.log(`   Callback: ${config.redirectUri}\n`);

console.log('2. Custom OAuth Route (if passport fails):');
console.log(`   GET ${config.redirectUri.replace('/callback', '-custom')}`);
console.log(`   Callback: ${config.redirectUri.replace('/callback', '/callback-custom')}\n`);

console.log('LinkedIn Authorization URL Format:');
const authUrl = new URL('https://www.linkedin.com/oauth/v2/authorization');
authUrl.searchParams.append('response_type', 'code');
authUrl.searchParams.append('client_id', config.clientId);
authUrl.searchParams.append('redirect_uri', config.redirectUri);
authUrl.searchParams.append('state', 'random_state_string');
authUrl.searchParams.append('scope', 'openid profile email');

console.log(authUrl.toString());
console.log('\n');

console.log('Testing Instructions:');
console.log('1. Start your backend server: npm run dev');
console.log('2. Visit one of the OAuth endpoints in your browser');
console.log('3. You should be redirected to LinkedIn for authorization');
console.log('4. After authorizing, you should be redirected back with tokens');
console.log('5. Check the backend logs for any errors\n');

console.log('Common Issues and Solutions:');
console.log('- "Invalid redirect_uri": Ensure the callback URL in LinkedIn app matches exactly');
console.log('- "Invalid scope": Ensure your LinkedIn app has OpenID Connect permissions');
console.log('- "Failed to fetch userinfo": The access token might be invalid or expired');
console.log('- Passport strategy fails: Use the custom OAuth routes instead\n');

// Optional: Test token exchange (requires a valid authorization code)
if (process.argv[2]) {
  const code = process.argv[2];
  console.log('Testing token exchange with code:', code);
  
  async function testTokenExchange() {
    try {
      const tokenUrl = 'https://www.linkedin.com/oauth/v2/accessToken';
      const params = new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        client_id: config.clientId,
        client_secret: config.clientSecret,
        redirect_uri: config.redirectUri,
      });

      const response = await axios.post(tokenUrl, params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      console.log('Token exchange successful!');
      console.log('Access token:', response.data.access_token);
      
      // Test userinfo endpoint
      const userInfoResponse = await axios.get('https://api.linkedin.com/v2/userinfo', {
        headers: {
          'Authorization': `Bearer ${response.data.access_token}`,
        },
      });
      
      console.log('User info:', userInfoResponse.data);
    } catch (error) {
      console.error('Token exchange failed:', error.response?.data || error.message);
    }
  }
  
  testTokenExchange();
} else {
  console.log('To test token exchange, run: node test-linkedin-oauth.js [authorization_code]');
}