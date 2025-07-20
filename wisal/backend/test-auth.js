// Quick test script for authentication functionality
const axios = require('axios');

const API_URL = 'http://localhost:4000/api';

async function testAuth() {
  console.log('🧪 Testing Authentication System...\n');

  // Test 1: Register a new seeker
  try {
    console.log('1️⃣ Testing Seeker Registration...');
    const seekerData = {
      email: 'test.seeker@example.com',
      password: 'Test123!@#',
      name: 'Test Seeker',
      role: 'seeker'
    };
    
    const seekerResponse = await axios.post(`${API_URL}/auth/register`, seekerData);
    console.log('✅ Seeker registered successfully:', {
      id: seekerResponse.data.user.id,
      email: seekerResponse.data.user.email,
      role: seekerResponse.data.user.role
    });
  } catch (error) {
    console.error('❌ Seeker registration failed:', error.response?.data || error.message);
  }

  // Test 2: Register a new lawyer
  try {
    console.log('\n2️⃣ Testing Lawyer Registration...');
    const lawyerData = {
      email: 'test.lawyer@example.com',
      password: 'Test123!@#',
      name: 'Test Lawyer',
      role: 'lawyer'
    };
    
    const lawyerResponse = await axios.post(`${API_URL}/auth/register`, lawyerData);
    console.log('✅ Lawyer registered successfully:', {
      id: lawyerResponse.data.user.id,
      email: lawyerResponse.data.user.email,
      role: lawyerResponse.data.user.role
    });
  } catch (error) {
    console.error('❌ Lawyer registration failed:', error.response?.data || error.message);
  }

  // Test 3: Register a new activist
  try {
    console.log('\n3️⃣ Testing Activist Registration...');
    const activistData = {
      email: 'test.activist@example.com',
      password: 'Test123!@#',
      name: 'Test Activist',
      role: 'activist'
    };
    
    const activistResponse = await axios.post(`${API_URL}/auth/register`, activistData);
    console.log('✅ Activist registered successfully:', {
      id: activistResponse.data.user.id,
      email: activistResponse.data.user.email,
      role: activistResponse.data.user.role
    });
  } catch (error) {
    console.error('❌ Activist registration failed:', error.response?.data || error.message);
  }

  // Test 4: Login test
  try {
    console.log('\n4️⃣ Testing Login...');
    const loginData = {
      email: 'test.seeker@example.com',
      password: 'Test123!@#'
    };
    
    const loginResponse = await axios.post(`${API_URL}/auth/login`, loginData);
    console.log('✅ Login successful:', {
      user: loginResponse.data.user.email,
      hasToken: !!loginResponse.data.token,
      hasRefreshToken: !!loginResponse.data.refreshToken
    });

    // Test 5: Get current user
    try {
      console.log('\n5️⃣ Testing Get Current User...');
      const meResponse = await axios.get(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${loginResponse.data.token}` }
      });
      console.log('✅ Current user fetched:', {
        id: meResponse.data.user._id,
        email: meResponse.data.user.email,
        role: meResponse.data.user.role,
        hasProfile: !!meResponse.data.profile
      });
    } catch (error) {
      console.error('❌ Get current user failed:', error.response?.data || error.message);
    }

  } catch (error) {
    console.error('❌ Login failed:', error.response?.data || error.message);
  }

  // Test 6: Invalid role test
  try {
    console.log('\n6️⃣ Testing Invalid Role Rejection...');
    const invalidData = {
      email: 'test.invalid@example.com',
      password: 'Test123!@#',
      name: 'Test Invalid',
      role: 'invalid_role'
    };
    
    await axios.post(`${API_URL}/auth/register`, invalidData);
    console.error('❌ Invalid role was accepted (should have failed)');
  } catch (error) {
    if (error.response?.status === 400) {
      console.log('✅ Invalid role correctly rejected:', error.response.data.error);
    } else {
      console.error('❌ Unexpected error:', error.response?.data || error.message);
    }
  }

  console.log('\n✨ Authentication tests completed!\n');
  console.log('LinkedIn OAuth URL: ' + API_URL + '/auth/linkedin');
  console.log('Note: LinkedIn OAuth requires valid client ID/secret in .env');
}

// Run the tests
testAuth().catch(console.error);