import dotenv from 'dotenv'
import path from 'path'

// Load test environment variables
dotenv.config({ path: path.join(__dirname, '../.env.test') })

// Set test environment
process.env.NODE_ENV = 'test'
process.env.JWT_SECRET = 'test-jwt-secret'
process.env.JWT_REFRESH_SECRET = 'test-jwt-refresh-secret'
process.env.SESSION_SECRET = 'test-session-secret'

// Suppress console logs during tests unless explicitly needed
if (process.env.SHOW_LOGS !== 'true') {
  global.console = {
    ...console,
    log: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  }
}

// Increase timeout for database operations
jest.setTimeout(30000)

// Global test utilities
export const testHelpers = {
  generateRandomEmail: () => `test-${Date.now()}-${Math.random().toString(36).substring(7)}@example.com`,
  
  generateRandomUser: () => ({
    name: `Test User ${Date.now()}`,
    email: testHelpers.generateRandomEmail(),
    password: 'TestPassword123!',
    userType: Math.random() > 0.5 ? 'seeker' : 'lawyer',
  }),
  
  wait: (ms: number) => new Promise(resolve => setTimeout(resolve, ms)),
}