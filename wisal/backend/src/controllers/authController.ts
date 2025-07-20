import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import User from '../models/User';
import SeekerProfile from '../models/SeekerProfile';
import LawyerProfile from '../models/LawyerProfile';
import ActivistProfile from '../models/ActivistProfile';
import { AuthRequest } from '../types';
import logger from '../utils/logger';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, name, role } = req.body;

    // Validate role
    if (!['seeker', 'lawyer', 'activist'].includes(role)) {
      res.status(400).json({ error: 'Invalid role specified' });
      return;
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ error: 'Email already registered' });
      return;
    }

    // Create user
    const user = await User.create({
      email,
      password,
      name,
      role,
      authProvider: 'local',
    });

    // Create profile based on role
    if (role === 'seeker') {
      await SeekerProfile.create({ userId: user._id });
    } else if (role === 'lawyer') {
      await LawyerProfile.create({ 
        userId: user._id,
        // MongoDB required fields with defaults
        location: {
          postcode: '',
          city: '',
          country: ''
        },
        specialisms: [], // Using specialisms instead of practiceAreas to match MongoDB
        qualifiedSince: new Date().getFullYear(), // Default to current year
        currentRole: '',
        employer: '',
        // Other optional fields
        practiceAreas: [],
        yearsOfExperience: 0,
        education: [],
        languages: ['English'],
        hourlyRate: 0,
        consultationFee: 0,
        verified: false
      });
    } else if (role === 'activist') {
      await ActivistProfile.create({ 
        userId: user._id, 
        causes: [], 
        followers: [],
        postsCount: 0,
        verificationStatus: 'pending'
      });
    }

    // Generate tokens
    const token = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    res.status(201).json({
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        authProvider: user.authProvider,
      },
      token,
      refreshToken,
    });
  } catch (error) {
    logger.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Find user and include password
    const user = await User.findOne({ email }).select('+password');
    if (!user || !await user.comparePassword(password)) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    // Check if account is active
    if (!user.isActive) {
      res.status(403).json({ error: 'Account is disabled' });
      return;
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate tokens
    const token = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    res.json({
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        authProvider: user.authProvider,
      },
      token,
      refreshToken,
    });
  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
};

export const linkedinCallback = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user as any;
    if (!user) {
      const errorUrl = new URL(`${process.env.FRONTEND_URL}/auth/error`);
      errorUrl.searchParams.append('error', 'authentication_failed');
      res.redirect(errorUrl.toString());
      return;
    }

    // Generate tokens
    const token = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Redirect to frontend with tokens
    const redirectUrl = new URL(`${process.env.FRONTEND_URL}/auth/callback`);
    redirectUrl.searchParams.append('token', token);
    redirectUrl.searchParams.append('refreshToken', refreshToken);
    redirectUrl.searchParams.append('role', user.role);

    res.redirect(redirectUrl.toString());
  } catch (error) {
    logger.error('LinkedIn callback error:', error);
    // Redirect to frontend error page instead of JSON response
    const errorUrl = new URL(`${process.env.FRONTEND_URL}/auth/error`);
    errorUrl.searchParams.append('error', 'authentication_error');
    res.redirect(errorUrl.toString());
  }
};

export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    // Verify refresh token
    const secret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET is not defined');
    }
    const decoded = jwt.verify(refreshToken, secret) as any;
    
    // Find user
    const user = await User.findById(decoded.userId);
    if (!user || !user.isActive) {
      res.status(401).json({ error: 'Invalid refresh token' });
      return;
    }

    // Generate new tokens
    const newToken = user.generateAccessToken();
    const newRefreshToken = user.generateRefreshToken();

    res.json({
      token: newToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    logger.error('Refresh token error:', error);
    res.status(401).json({ error: 'Invalid refresh token' });
  }
};

export const logout = async (_req: AuthRequest, res: Response): Promise<void> => {
  // In a real implementation, you might want to blacklist the token
  res.json({ message: 'Logged out successfully' });
};

export const verifyEmail = async (_req: Request, res: Response): Promise<void> => {
  try {
    // const { token } = req.params;

    // Verify token and update user
    // Implementation depends on email verification strategy

    res.json({ message: 'Email verified successfully' });
  } catch (error) {
    logger.error('Email verification error:', error);
    res.status(400).json({ error: 'Invalid verification token' });
  }
};

export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if user exists
      res.json({ message: 'If the email exists, a reset link has been sent' });
      return;
    }

    // Generate reset token and send email
    // Implementation depends on email service

    res.json({ message: 'If the email exists, a reset link has been sent' });
  } catch (error) {
    logger.error('Forgot password error:', error);
    res.status(500).json({ error: 'Failed to process request' });
  }
};

export const resetPassword = async (_req: Request, res: Response): Promise<void> => {
  try {
    // const { token, password } = req.body;

    // Verify token and reset password
    // Implementation depends on reset token strategy

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    logger.error('Reset password error:', error);
    res.status(400).json({ error: 'Invalid or expired reset token' });
  }
};

export const getCurrentUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user!._id).select('-password');
    
    let profile = null;
    if (user?.role === 'lawyer') {
      profile = await LawyerProfile.findOne({ userId: user._id });
    } else if (user?.role === 'seeker') {
      profile = await SeekerProfile.findOne({ userId: user._id });
    } else if (user?.role === 'activist') {
      profile = await ActivistProfile.findOne({ userId: user._id });
    }

    res.json({ user, profile });
  } catch (error) {
    logger.error('Get current user error:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
};

// Custom LinkedIn OAuth initialization
export const linkedinAuthCustom = async (req: Request, res: Response): Promise<void> => {
  try {
    // Generate a random state for CSRF protection
    const state = Math.random().toString(36).substring(7);
    
    // Store state in session or cache (you might want to implement proper session handling)
    // For now, we'll include it in the URL
    
    const authUrl = new URL('https://www.linkedin.com/oauth/v2/authorization');
    authUrl.searchParams.append('response_type', 'code');
    authUrl.searchParams.append('client_id', process.env.LINKEDIN_CLIENT_ID!);
    authUrl.searchParams.append('redirect_uri', process.env.LINKEDIN_CALLBACK_URL!);
    authUrl.searchParams.append('state', state);
    authUrl.searchParams.append('scope', 'openid profile email');
    
    res.redirect(authUrl.toString());
  } catch (error) {
    logger.error('LinkedIn auth initialization error:', error);
    res.status(500).json({ error: 'Failed to initialize LinkedIn authentication' });
  }
};

// Custom LinkedIn OAuth callback handler that bypasses passport
export const linkedinCallbackCustom = async (req: Request, res: Response): Promise<void> => {
  try {
    const { code, state, error, error_description } = req.query;

    // Handle OAuth errors
    if (error) {
      logger.error('LinkedIn OAuth error:', { error, error_description });
      const errorUrl = new URL(`${process.env.FRONTEND_URL}/auth/error`);
      errorUrl.searchParams.append('error', error as string);
      errorUrl.searchParams.append('description', (error_description as string) || 'OAuth authentication failed');
      res.redirect(errorUrl.toString());
      return;
    }

    if (!code) {
      const errorUrl = new URL(`${process.env.FRONTEND_URL}/auth/error`);
      errorUrl.searchParams.append('error', 'missing_code');
      errorUrl.searchParams.append('description', 'Authorization code not provided');
      res.redirect(errorUrl.toString());
      return;
    }

    // Exchange code for access token
    const tokenUrl = 'https://www.linkedin.com/oauth/v2/accessToken';
    const tokenParams = new URLSearchParams({
      grant_type: 'authorization_code',
      code: code as string,
      client_id: process.env.LINKEDIN_CLIENT_ID!,
      client_secret: process.env.LINKEDIN_CLIENT_SECRET!,
      redirect_uri: process.env.LINKEDIN_CALLBACK_URL!,
    });

    let tokenResponse;
    try {
      tokenResponse = await axios.post(tokenUrl, tokenParams, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json',
        },
      });
    } catch (error: any) {
      logger.error('Failed to exchange code for token:', {
        error: error.message,
        response: error.response?.data,
      });
      const errorUrl = new URL(`${process.env.FRONTEND_URL}/auth/error`);
      errorUrl.searchParams.append('error', 'token_exchange_failed');
      errorUrl.searchParams.append('description', 'Failed to obtain access token');
      res.redirect(errorUrl.toString());
      return;
    }

    const { access_token } = tokenResponse.data;

    // Fetch user info from LinkedIn
    let userInfo;
    try {
      const userInfoResponse = await axios.get('https://api.linkedin.com/v2/userinfo', {
        headers: {
          'Authorization': `Bearer ${access_token}`,
          'Accept': 'application/json',
        },
      });
      userInfo = userInfoResponse.data;
      logger.info('LinkedIn userinfo fetched:', { sub: userInfo.sub, email: userInfo.email });
    } catch (error: any) {
      logger.error('Failed to fetch LinkedIn userinfo:', {
        error: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      const errorUrl = new URL(`${process.env.FRONTEND_URL}/auth/error`);
      errorUrl.searchParams.append('error', 'userinfo_fetch_failed');
      errorUrl.searchParams.append('description', 'Failed to fetch user information from LinkedIn');
      res.redirect(errorUrl.toString());
      return;
    }

    // Process user data
    let user = await User.findOne({ linkedinId: userInfo.sub });

    if (user) {
      // Update last login
      user.lastLogin = new Date();
      await user.save();
    } else {
      // Check if user exists with this email
      const email = userInfo.email;
      if (!email) {
        const errorUrl = new URL(`${process.env.FRONTEND_URL}/auth/error`);
        errorUrl.searchParams.append('error', 'no_email');
        errorUrl.searchParams.append('description', 'No email found in LinkedIn profile');
        res.redirect(errorUrl.toString());
        return;
      }

      user = await User.findOne({ email });

      if (user) {
        // Link LinkedIn account
        user.linkedinId = userInfo.sub;
        user.profilePicture = userInfo.picture || user.profilePicture;
        user.lastLogin = new Date();
        await user.save();
      } else {
        // Create new user
        user = await User.create({
          email,
          linkedinId: userInfo.sub,
          name: `${userInfo.given_name || 'Unknown'} ${userInfo.family_name || 'User'}`.trim(),
          authProvider: 'linkedin',
          role: 'seeker', // Default role
          profilePicture: userInfo.picture,
          isVerified: true,
          lastLogin: new Date(),
        });

        // Create default seeker profile
        await SeekerProfile.create({ userId: user._id });
      }
    }

    // Generate tokens
    const token = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    // Redirect to frontend with tokens
    const redirectUrl = new URL(`${process.env.FRONTEND_URL}/auth/callback`);
    redirectUrl.searchParams.append('token', token);
    redirectUrl.searchParams.append('refreshToken', refreshToken);
    redirectUrl.searchParams.append('role', user.role);

    res.redirect(redirectUrl.toString());
  } catch (error) {
    logger.error('LinkedIn custom callback error:', error);
    const errorUrl = new URL(`${process.env.FRONTEND_URL}/auth/error`);
    errorUrl.searchParams.append('error', 'authentication_error');
    errorUrl.searchParams.append('description', 'An unexpected error occurred during authentication');
    res.redirect(errorUrl.toString());
  }
};