#!/usr/bin/env ts-node

import mongoose from 'mongoose';
import * as bcrypt from 'bcryptjs';
import User from '../src/models/User';
import LawyerProfile from '../src/models/LawyerProfile';
import SeekerProfile from '../src/models/SeekerProfile';

const MONGODB_URI = 'mongodb://localhost:27017/wisal';

async function seedSimpleData() {
  try {
    console.log('🔗 Connecting to MongoDB:', MONGODB_URI);
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Create some simple mock data
    const users = [];
    
    // Create 5 lawyer accounts
    for (let i = 1; i <= 5; i++) {
      const hashedPassword = await bcrypt.hash('Test123!@#', 10);
      const user = await User.create({
        email: `lawyer${i}@example.com`,
        password: hashedPassword,
        name: `Lawyer ${i}`,
        role: 'lawyer',
        roles: ['lawyer'],
        authProvider: 'local',
        isVerified: true,
        isActive: true
      });

      await LawyerProfile.create({
        userId: user._id,
        location: {
          city: 'New York',
          postcode: '10001',
          country: 'USA'
        },
        specialisms: ['Immigration Law', 'Human Rights'],
        qualifiedSince: 2015,
        currentRole: 'Senior Attorney',
        employer: 'Legal Aid Society',
        barNumber: `BAR00000${i}`,
        licenseState: 'New York',
        practiceAreas: ['Immigration Law', 'Asylum Law'],
        yearsOfExperience: 8,
        education: [{
          degree: 'JD',
          institution: 'NYU Law School',
          year: 2015
        }],
        languages: ['English', 'Spanish'],
        bio: `Experienced lawyer specializing in immigration and human rights law. Pro bono services available.`,
        hourlyRate: 150,
        consultationFee: 0,
        consultationTypes: ['chat', 'video', 'phone'],
        availability: {
          days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
          hours: [
            { day: 'Monday', start: '09:00', end: '17:00' },
            { day: 'Tuesday', start: '09:00', end: '17:00' },
            { day: 'Wednesday', start: '09:00', end: '17:00' },
            { day: 'Thursday', start: '09:00', end: '17:00' },
            { day: 'Friday', start: '09:00', end: '17:00' }
          ]
        },
        rating: {
          average: 4.5,
          count: 25
        },
        reviewCount: 25,
        completedConsultations: 50,
        verified: true,
        verifiedAt: new Date()
      });

      users.push(user);
      console.log(`✅ Created lawyer${i}@example.com`);
    }

    // Create 3 seeker accounts
    for (let i = 1; i <= 3; i++) {
      const hashedPassword = await bcrypt.hash('Test123!@#', 10);
      const user = await User.create({
        email: `seeker${i}@example.com`,
        password: hashedPassword,
        name: `Seeker ${i}`,
        role: 'seeker',
        roles: ['seeker'],
        authProvider: 'local',
        isVerified: true,
        isActive: true
      });

      await SeekerProfile.create({
        userId: user._id,
        demographics: {
          age: 30,
          gender: 'prefer_not_to_say',
          location: 'New York, USA',
          incomeLevel: 'medium'
        },
        legalHistory: {
          previousConsultations: 0,
          areasOfInterest: ['Immigration Law']
        },
        preferences: {
          communicationMethod: 'chat',
          languagePreference: 'English',
          budgetRange: {
            min: 0,
            max: 200
          }
        }
      });

      users.push(user);
      console.log(`✅ Created seeker${i}@example.com`);
    }

    console.log('\n🎉 Mock data seeding completed!');
    console.log('\n📝 Test accounts:');
    console.log('  Lawyer: lawyer1@example.com / Test123!@#');
    console.log('  Seeker: seeker1@example.com / Test123!@#');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the seeding
seedSimpleData().catch(console.error);