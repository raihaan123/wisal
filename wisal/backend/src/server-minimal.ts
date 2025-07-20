import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { Strategy as LinkedInStrategy } from 'passport-linkedin-oauth2';

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(passport.initialize());

// JWT Strategy
passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET || 'test-secret',
    },
    async (payload, done) => {
      // For now, just accept the token
      return done(null, { id: payload.userId, email: payload.email });
    }
  )
);

// LinkedIn Strategy
passport.use(
  new LinkedInStrategy(
    {
      clientID: process.env.LINKEDIN_CLIENT_ID || 'dummy',
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET || 'dummy',
      callbackURL: process.env.LINKEDIN_CALLBACK_URL || 'http://localhost:3001/api/auth/linkedin/callback',
      scope: ['openid', 'profile', 'email'],
    },
    async (accessToken, refreshToken, profile, done) => {
      console.log('LinkedIn profile:', profile);
      return done(null, profile);
    }
  )
);

// Routes
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// LinkedIn OAuth routes
app.get('/api/auth/linkedin', passport.authenticate('linkedin'));

app.get(
  '/api/auth/linkedin/callback',
  passport.authenticate('linkedin', { session: false }),
  (req, res) => {
    // In a real app, you'd generate a JWT here
    res.redirect(`${process.env.CORS_ORIGIN || 'http://localhost:3000'}/auth/success`);
  }
);

// MongoDB connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/wisal');
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
  }
};

// Start server
const PORT = process.env.PORT || 3001;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
});