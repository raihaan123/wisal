import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import User from '../models/User';
import { JWTPayload } from '../types';
import logger from '../utils/logger';

// JWT Strategy
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET!,
};

passport.use(
  new JwtStrategy(jwtOptions, async (payload: JWTPayload, done) => {
    try {
      const user = await User.findById(payload.userId).select('-password');
      
      if (user && user.isActive) {
        return done(null, user);
      }
      
      return done(null, false);
    } catch (error) {
      logger.error('JWT Strategy error:', error);
      return done(error, false);
    }
  })
);


// LinkedIn OAuth Strategy is disabled in favor of custom implementation
// The passport-linkedin-oauth2 package is outdated (6 years) and doesn't support
// the newer OpenID Connect flow properly. We use custom OAuth implementation
// in authController.ts instead (linkedinAuthCustom and linkedinCallbackCustom).
//
// If you want to re-enable this, you'll need to either:
// 1. Use a different library like openid-client
// 2. Override the type definitions with 'as any'
// 3. Continue using the custom implementation

passport.serializeUser((user: any, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await User.findById(id).select('-password');
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;