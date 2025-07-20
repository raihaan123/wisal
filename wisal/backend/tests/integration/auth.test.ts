import request from 'supertest'
import { app } from '../../src/server'
import mongoose from 'mongoose'
import User from '../../src/models/User'

describe('Auth API Integration Tests', () => {
  let authToken: string
  let refreshToken: string
  const testUser = {
    name: 'Test User',
    email: 'test@example.com',
    password: 'testPassword123!',
    userType: 'seeker',
  }

  beforeAll(async () => {
    // Connect to test database
    const testDbUri = process.env.TEST_MONGODB_URI || 'mongodb://localhost:27017/wisal-test'
    await mongoose.connect(testDbUri)
  })

  afterAll(async () => {
    // Clean up and disconnect
    await User.deleteMany({})
    await mongoose.connection.close()
  })

  beforeEach(async () => {
    // Clear users before each test
    await User.deleteMany({})
  })

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send(testUser)
        .expect(201)

      expect(response.body).toHaveProperty('success', true)
      expect(response.body).toHaveProperty('user')
      expect(response.body).toHaveProperty('token')
      expect(response.body).toHaveProperty('refreshToken')
      expect(response.body.user.email).toBe(testUser.email)
      expect(response.body.user).not.toHaveProperty('password')

      authToken = response.body.token
      refreshToken = response.body.refreshToken
    })

    it('should not register user with existing email', async () => {
      // First registration
      await request(app)
        .post('/api/auth/register')
        .send(testUser)
        .expect(201)

      // Duplicate registration
      const response = await request(app)
        .post('/api/auth/register')
        .send(testUser)
        .expect(400)

      expect(response.body).toHaveProperty('success', false)
      expect(response.body).toHaveProperty('error')
    })

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: testUser.email,
          // Missing password and name
        })
        .expect(400)

      expect(response.body).toHaveProperty('success', false)
      expect(response.body).toHaveProperty('error')
    })
  })

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Create a user for login tests
      await request(app)
        .post('/api/auth/register')
        .send(testUser)
    })

    it('should login successfully with correct credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect(200)

      expect(response.body).toHaveProperty('success', true)
      expect(response.body).toHaveProperty('user')
      expect(response.body).toHaveProperty('token')
      expect(response.body).toHaveProperty('refreshToken')
      expect(response.body.user.email).toBe(testUser.email)
    })

    it('should fail with incorrect password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'wrongPassword',
        })
        .expect(401)

      expect(response.body).toHaveProperty('success', false)
      expect(response.body).toHaveProperty('error')
    })

    it('should fail with non-existent email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: testUser.password,
        })
        .expect(401)

      expect(response.body).toHaveProperty('success', false)
      expect(response.body).toHaveProperty('error')
    })
  })

  describe('POST /api/auth/refresh', () => {
    beforeEach(async () => {
      // Register and get tokens
      const response = await request(app)
        .post('/api/auth/register')
        .send(testUser)

      authToken = response.body.token
      refreshToken = response.body.refreshToken
    })

    it('should refresh token successfully', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken })
        .expect(200)

      expect(response.body).toHaveProperty('success', true)
      expect(response.body).toHaveProperty('token')
      expect(response.body).toHaveProperty('refreshToken')
      expect(response.body.token).not.toBe(authToken)
    })

    it('should fail with invalid refresh token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken: 'invalid-token' })
        .expect(401)

      expect(response.body).toHaveProperty('success', false)
      expect(response.body).toHaveProperty('error')
    })
  })

  describe('Protected Routes', () => {
    beforeEach(async () => {
      // Register and get token
      const response = await request(app)
        .post('/api/auth/register')
        .send(testUser)

      authToken = response.body.token
    })

    it('should access protected route with valid token', async () => {
      const response = await request(app)
        .get('/api/users/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body).toHaveProperty('success', true)
      expect(response.body).toHaveProperty('user')
      expect(response.body.user.email).toBe(testUser.email)
    })

    it('should fail to access protected route without token', async () => {
      const response = await request(app)
        .get('/api/users/me')
        .expect(401)

      expect(response.body).toHaveProperty('success', false)
      expect(response.body).toHaveProperty('error')
    })

    it('should fail with invalid token', async () => {
      const response = await request(app)
        .get('/api/users/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401)

      expect(response.body).toHaveProperty('success', false)
      expect(response.body).toHaveProperty('error')
    })
  })
})