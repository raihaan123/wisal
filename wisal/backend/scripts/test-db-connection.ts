#!/usr/bin/env ts-node

import * as dotenv from 'dotenv';
import * as path from 'path';
import mongoose from 'mongoose';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

async function testConnection() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/wisal';
    console.log('🔗 Attempting to connect to MongoDB:', mongoUri);
    
    await mongoose.connect(mongoUri);
    console.log('✅ Successfully connected to MongoDB');
    
    // Test if we can query the database
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('📋 Available collections:', collections.map(c => c.name));
    
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('❌ Connection error:', error);
    process.exit(1);
  }
}

testConnection();