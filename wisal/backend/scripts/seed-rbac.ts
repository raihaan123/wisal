#!/usr/bin/env ts-node

import * as dotenv from 'dotenv';
import mongoose from 'mongoose';
import { seedRBAC, clearRBAC } from '../src/database/seeds/rbac.seed';

// Load environment variables
dotenv.config();

async function main() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/wisal';
    await mongoose.connect(mongoUri);
    
    console.log('✅ Connected to MongoDB');
    
    // Use a default system user ID for seeding
    const systemUserId = new mongoose.Types.ObjectId().toString();
    
    // Clear existing data if --clear flag is provided
    if (process.argv.includes('--clear')) {
      await clearRBAC();
    }
    
    // Seed the RBAC data
    await seedRBAC(systemUserId);
    
    console.log('✅ RBAC seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error during RBAC seeding:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the main function
main().catch(console.error);