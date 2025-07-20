#!/usr/bin/env ts-node

/**
 * Script to seed mock data into the database
 * 
 * Usage:
 *   npm run seed:mock          - Add mock data (keeps existing)
 *   npm run seed:mock -- --clear - Clear existing mock data first
 */

import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

import { seedMockData } from '../src/database/seeds/mock-data.seed';

// Run the seeding
seedMockData()
  .then(() => {
    console.log('✅ Mock data seeding script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Mock data seeding script failed:', error);
    process.exit(1);
  });