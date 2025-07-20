import mongoose from 'mongoose';
import * as bcrypt from 'bcryptjs';
import User from '../../models/User';
import LawyerProfile from '../../models/LawyerProfile';
import SeekerProfile from '../../models/SeekerProfile';
import { seedRBAC } from './rbac.seed';

// Legal specialization tags from Information Architecture
const LEGAL_SPECIALIZATIONS = [
  'Employment Law',
  'Immigration Law',
  'Human Rights',
  'Civil Rights',
  'Criminal Defense',
  'Family Law',
  'Asylum Law',
  'International Law',
  'Constitutional Law',
  'Administrative Law',
  'Labor Law',
  'Housing Law',
  'Discrimination Law',
  'Protest Rights',
  'Freedom of Speech',
  'Police Misconduct',
  'Refugee Law',
  'Deportation Defense',
  'Work Permits',
  'Student Rights',
  'Healthcare Rights',
  'Disability Rights',
  'Environmental Justice',
  'Media Law',
  'Digital Rights'
];

// Practice areas (more detailed specializations)
const PRACTICE_AREAS = [
  'Workplace Discrimination',
  'Wrongful Termination',
  'Visa Applications',
  'Green Card Process',
  'Citizenship Applications',
  'Deportation Proceedings',
  'Political Asylum',
  'Religious Persecution',
  'War Crimes Documentation',
  'Protest Arrests',
  'Free Speech Violations',
  'Police Brutality',
  'Housing Discrimination',
  'Tenant Rights',
  'Family Reunification',
  'Child Custody',
  'Domestic Violence',
  'Educational Rights',
  'Healthcare Access',
  'Disability Accommodations'
];

// Languages commonly needed
const LANGUAGES = [
  'English',
  'Arabic',
  'Spanish',
  'French',
  'Turkish',
  'Urdu',
  'Hebrew',
  'Persian',
  'German',
  'Italian',
  'Portuguese',
  'Russian',
  'Mandarin',
  'Hindi',
  'Bengali'
];

// Cities for location diversity
const CITIES = [
  { city: 'New York', postcode: '10001', country: 'USA' },
  { city: 'Los Angeles', postcode: '90001', country: 'USA' },
  { city: 'Chicago', postcode: '60601', country: 'USA' },
  { city: 'Houston', postcode: '77001', country: 'USA' },
  { city: 'Philadelphia', postcode: '19101', country: 'USA' },
  { city: 'San Francisco', postcode: '94101', country: 'USA' },
  { city: 'Washington', postcode: '20001', country: 'USA' },
  { city: 'Boston', postcode: '02101', country: 'USA' },
  { city: 'Detroit', postcode: '48201', country: 'USA' },
  { city: 'Seattle', postcode: '98101', country: 'USA' },
  { city: 'London', postcode: 'EC1A 1BB', country: 'UK' },
  { city: 'Manchester', postcode: 'M1 1AD', country: 'UK' },
  { city: 'Birmingham', postcode: 'B1 1AA', country: 'UK' },
  { city: 'Glasgow', postcode: 'G1 1AA', country: 'UK' },
  { city: 'Toronto', postcode: 'M5A 1A1', country: 'Canada' },
  { city: 'Montreal', postcode: 'H1A 0A1', country: 'Canada' },
  { city: 'Vancouver', postcode: 'V5K 0A1', country: 'Canada' },
  { city: 'Sydney', postcode: '2000', country: 'Australia' },
  { city: 'Melbourne', postcode: '3000', country: 'Australia' },
  { city: 'Berlin', postcode: '10115', country: 'Germany' },
  { city: 'Paris', postcode: '75001', country: 'France' },
  { city: 'Amsterdam', postcode: '1011', country: 'Netherlands' },
  { city: 'Brussels', postcode: '1000', country: 'Belgium' },
  { city: 'Dubai', postcode: '00000', country: 'UAE' },
  { city: 'Istanbul', postcode: '34000', country: 'Turkey' }
];

// Law firms and organizations
const EMPLOYERS = [
  'Human Rights Watch Legal Team',
  'ACLU',
  'Center for Constitutional Rights',
  'International Justice Mission',
  'Lawyers Without Borders',
  'Legal Aid Society',
  'Public Defender Office',
  'Immigration Rights Clinic',
  'Civil Liberties Union',
  'Pro Bono Partnership',
  'Justice Initiative',
  'Equal Rights Advocates',
  'Refugee Legal Support',
  'Community Law Center',
  'Independent Practice',
  'Social Justice Law Firm',
  'International Law Partners',
  'Rights & Justice LLP',
  'Freedom Law Group',
  'Liberty Legal Services'
];

// Educational institutions
const LAW_SCHOOLS = [
  'Harvard Law School',
  'Yale Law School',
  'Stanford Law School',
  'Columbia Law School',
  'NYU School of Law',
  'University of Chicago Law School',
  'Georgetown Law',
  'UC Berkeley School of Law',
  'Oxford University Faculty of Law',
  'Cambridge University Faculty of Law',
  'London School of Economics',
  'McGill University Faculty of Law',
  'University of Toronto Faculty of Law',
  'Melbourne Law School',
  'National Law School of India',
  'American University Cairo',
  'Tel Aviv University Faculty of Law',
  'Sorbonne Law School',
  'Humboldt University Faculty of Law',
  'University of Amsterdam Law School'
];

// First names
const FIRST_NAMES = [
  'Sarah', 'Ahmed', 'Maria', 'David', 'Fatima', 'Michael', 'Aisha', 'James',
  'Leila', 'Robert', 'Zainab', 'William', 'Noor', 'John', 'Yasmin', 'Christopher',
  'Hana', 'Daniel', 'Amira', 'Matthew', 'Salma', 'Anthony', 'Maryam', 'Mark',
  'Layla', 'Thomas', 'Dina', 'Charles', 'Rania', 'Joseph', 'Sara', 'Richard',
  'Omar', 'Ali', 'Hassan', 'Ibrahim', 'Khalid', 'Yusuf', 'Tariq', 'Malik',
  'Emma', 'Olivia', 'Sophia', 'Isabella', 'Charlotte', 'Amelia', 'Harper', 'Evelyn'
];

// Last names
const LAST_NAMES = [
  'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez',
  'Martinez', 'Anderson', 'Taylor', 'Thomas', 'Moore', 'Jackson', 'Martin', 'Lee',
  'Ahmed', 'Hassan', 'Khan', 'Ali', 'Hussein', 'Abdullah', 'Rahman', 'Ibrahim',
  'Patel', 'Singh', 'Kumar', 'Sharma', 'Chen', 'Wang', 'Liu', 'Zhang',
  'Cohen', 'Levy', 'Mizrahi', 'Rosenberg', 'Goldstein', 'Friedman', 'Shapiro', 'Weiss',
  'Murphy', 'OBrien', 'Kelly', 'Sullivan', 'Walsh', 'Ryan', 'Connor', 'Fitzgerald'
];

// Seeker occupations
const OCCUPATIONS = [
  'Student',
  'Teacher',
  'Healthcare Worker',
  'Engineer',
  'Artist',
  'Journalist',
  'Social Worker',
  'Retail Worker',
  'Construction Worker',
  'Restaurant Worker',
  'Activist',
  'NGO Worker',
  'Translator',
  'Community Organizer',
  'Researcher',
  'IT Professional',
  'Small Business Owner',
  'Freelancer',
  'Unemployed',
  'Refugee'
];

// Help categories for seekers
const HELP_CATEGORIES = [
  'Facing deportation proceedings',
  'Workplace discrimination based on nationality',
  'Visa application denied',
  'Political asylum seeking',
  'Family separation due to immigration',
  'Protest-related arrests',
  'Housing discrimination',
  'Employment rights violation',
  'Healthcare access issues',
  'Educational discrimination',
  'Police harassment',
  'Wrongful termination',
  'Religious discrimination',
  'Free speech violations',
  'Citizenship application help'
];

/**
 * Generate a random element from an array
 */
function randomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Generate random elements from an array
 */
function randomElements<T>(array: T[], min: number, max: number): T[] {
  const count = Math.floor(Math.random() * (max - min + 1)) + min;
  const result: T[] = [];
  const available = [...array];
  
  for (let i = 0; i < count && available.length > 0; i++) {
    const index = Math.floor(Math.random() * available.length);
    result.push(available[index]);
    available.splice(index, 1);
  }
  
  return result;
}

/**
 * Generate a realistic bio for a lawyer
 */
function generateLawyerBio(name: string, specializations: string[], yearsExperience: number): string {
  const intros = [
    `${name} is a dedicated legal professional with ${yearsExperience} years of experience specializing in`,
    `With over ${yearsExperience} years in practice, ${name} focuses on`,
    `${name} brings ${yearsExperience} years of expertise in`,
    `As an experienced attorney with ${yearsExperience} years in the field, ${name} specializes in`,
    `${name} has spent ${yearsExperience} years advocating for clients in`
  ];
  
  const middles = [
    'committed to protecting the rights of marginalized communities',
    'passionate about social justice and equal access to legal representation',
    'dedicated to fighting for those who cannot afford traditional legal services',
    'focused on providing compassionate and effective legal advocacy',
    'working tirelessly to ensure justice for all'
  ];
  
  const endings = [
    'Available for pro bono consultations.',
    'Offering sliding scale fees based on client needs.',
    'Committed to accessible legal services.',
    'Providing culturally sensitive legal support.',
    'Dedicated to community-based legal solutions.'
  ];
  
  const intro = randomElement(intros);
  const middle = randomElement(middles);
  const ending = randomElement(endings);
  const specs = specializations.slice(0, 3).join(', ');
  
  return `${intro} ${specs}. ${name} is ${middle}. ${ending}`;
}

/**
 * Generate working hours for availability
 */
function generateWorkingHours() {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const hours = [];
  
  // Most lawyers work weekdays
  for (const day of days) {
    if (Math.random() > 0.2) { // 80% chance of working each weekday
      hours.push({
        day,
        start: '09:00',
        end: Math.random() > 0.5 ? '17:00' : '18:00'
      });
    }
  }
  
  // Some work weekends
  if (Math.random() > 0.7) { // 30% chance
    hours.push({
      day: 'Saturday',
      start: '10:00',
      end: '14:00'
    });
  }
  
  return hours;
}

/**
 * Clear existing mock data
 */
async function clearMockData() {
  console.log('🧹 Clearing existing mock data...');
  
  // Find and delete all users except the system user
  const mockUsers = await User.find({
    email: { $regex: /@example\.com$/ }
  });
  
  for (const user of mockUsers) {
    await LawyerProfile.deleteOne({ userId: user._id });
    await SeekerProfile.deleteOne({ userId: user._id });
  }
  
  await User.deleteMany({
    email: { $regex: /@example\.com$/ }
  });
  
  console.log('✅ Mock data cleared');
}

/**
 * Seed mock lawyers
 */
async function seedLawyers() {
  console.log('👨‍⚖️ Creating lawyer accounts...');
  const lawyers = [];
  
  for (let i = 1; i <= 50; i++) {
    const firstName = randomElement(FIRST_NAMES);
    const lastName = randomElement(LAST_NAMES);
    const name = `${firstName} ${lastName}`;
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@example.com`;
    const location = randomElement(CITIES);
    
    // Create user account
    const hashedPassword = await bcrypt.hash('Test123!@#', 10);
    const user = await User.create({
      email,
      password: hashedPassword,
      name,
      role: 'lawyer',
      roles: ['lawyer'],
      authProvider: 'local',
      isVerified: true,
      isActive: true
    });
    
    // Generate lawyer profile data
    const yearsExperience = Math.floor(Math.random() * 25) + 3; // 3-28 years
    const qualifiedSince = new Date().getFullYear() - yearsExperience;
    const specializations = randomElements(LEGAL_SPECIALIZATIONS, 2, 5);
    const practiceAreas = randomElements(PRACTICE_AREAS, 3, 6);
    const languages = randomElements(LANGUAGES, 1, 4);
    languages.push('English'); // Ensure English is always included
    const uniqueLanguages = Array.from(new Set(languages));
    
    // Education
    const education = [
      {
        degree: 'Juris Doctor (JD)',
        institution: randomElement(LAW_SCHOOLS),
        year: qualifiedSince - 3
      }
    ];
    
    if (Math.random() > 0.5) { // 50% have additional degree
      education.unshift({
        degree: randomElement(['BA', 'BS', 'BBA', 'MA', 'MS']),
        institution: randomElement(LAW_SCHOOLS),
        year: qualifiedSince - 7
      });
    }
    
    // Certifications
    const certifications = [];
    if (Math.random() > 0.6) { // 40% have certifications
      certifications.push(...randomElements([
        'Board Certified Immigration Law',
        'Certified Civil Rights Attorney',
        'Human Rights Law Certificate',
        'International Law Certification',
        'Mediation Certificate',
        'Pro Bono Excellence Award'
      ], 1, 3));
    }
    
    // Create lawyer profile
    const lawyerProfile = await LawyerProfile.create({
      userId: user._id,
      location,
      specialisms: specializations,
      qualifiedSince,
      currentRole: randomElement([
        'Senior Attorney',
        'Partner',
        'Associate Attorney',
        'Legal Director',
        'Managing Attorney',
        'Staff Attorney',
        'Senior Counsel',
        'Legal Advocate',
        'Principal Attorney',
        'Lead Counsel'
      ]),
      employer: randomElement(EMPLOYERS),
      barNumber: `BAR${String(i).padStart(6, '0')}`,
      licenseState: location.city,
      practiceAreas,
      yearsOfExperience: yearsExperience,
      education,
      certifications,
      languages: uniqueLanguages,
      bio: generateLawyerBio(name, specializations, yearsExperience),
      hourlyRate: Math.floor(Math.random() * 200) + 100, // $100-$300
      consultationFee: Math.random() > 0.7 ? 0 : Math.floor(Math.random() * 50) + 25, // 30% offer free consultation
      availability: {
        days: generateWorkingHours().map(h => h.day),
        hours: generateWorkingHours()
      },
      rating: {
        average: Math.floor(Math.random() * 20 + 30) / 10, // 3.0-5.0
        count: Math.floor(Math.random() * 100) + 5
      },
      reviewCount: Math.floor(Math.random() * 50) + 5,
      completedConsultations: Math.floor(Math.random() * 200) + 10,
      verified: true,
      verifiedAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000), // Random date in past year
      verificationNotes: 'Credentials verified via automated system'
    });
    
    lawyers.push({ user, profile: lawyerProfile });
    
    if (i % 10 === 0) {
      console.log(`  Created ${i} lawyers...`);
    }
  }
  
  console.log(`✅ Created ${lawyers.length} lawyer accounts`);
  return lawyers;
}

/**
 * Seed mock seekers
 */
async function seedSeekers() {
  console.log('👥 Creating seeker accounts...');
  const seekers = [];
  
  for (let i = 1; i <= 25; i++) {
    const firstName = randomElement(FIRST_NAMES);
    const lastName = randomElement(LAST_NAMES);
    const name = `${firstName} ${lastName}`;
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}.seeker${i}@example.com`;
    const location = randomElement(CITIES);
    
    // Create user account
    const hashedPassword = await bcrypt.hash('Test123!@#', 10);
    const user = await User.create({
      email,
      password: hashedPassword,
      name,
      role: 'seeker',
      roles: ['seeker'],
      authProvider: 'local',
      isVerified: true,
      isActive: true
    });
    
    // Create seeker profile
    const seekerProfile = await SeekerProfile.create({
      userId: user._id,
      demographics: {
        age: Math.floor(Math.random() * 40) + 20, // 20-60
        gender: randomElement(['male', 'female', 'non-binary', 'prefer_not_to_say']),
        location: `${location.city}, ${location.country}`,
        incomeLevel: randomElement(['low', 'medium', 'high', 'prefer_not_to_say'])
      },
      legalHistory: {
        previousConsultations: Math.floor(Math.random() * 5),
        areasOfInterest: randomElements(PRACTICE_AREAS, 1, 3)
      },
      preferences: {
        communicationMethod: randomElement(['chat', 'video', 'phone']),
        languagePreference: randomElement(LANGUAGES),
        budgetRange: {
          min: 0,
          max: Math.floor(Math.random() * 300) + 50 // $50-$350
        }
      }
    });
    
    seekers.push({ user, profile: seekerProfile });
  }
  
  console.log(`✅ Created ${seekers.length} seeker accounts`);
  return seekers;
}

/**
 * Main seeding function
 */
export async function seedMockData() {
  try {
    console.log('🌱 Starting mock data seeding...');
    console.log('📍 Environment:', process.env.NODE_ENV || 'development');
    
    // Clear existing mock data if requested
    if (process.argv.includes('--clear')) {
      await clearMockData();
    }
    
    // Seed RBAC first
    const systemUserId = new mongoose.Types.ObjectId().toString();
    await seedRBAC(systemUserId);
    
    // Seed lawyers
    const lawyers = await seedLawyers();
    
    // Seed seekers
    const seekers = await seedSeekers();
    
    // Summary
    console.log('\n📊 Seeding Summary:');
    console.log(`  ✅ ${lawyers.length} lawyers created`);
    console.log(`  ✅ ${seekers.length} seekers created`);
    console.log(`  ✅ RBAC permissions and roles configured`);
    
    console.log('\n🎉 Mock data seeding completed successfully!');
    console.log('\n📝 Sample accounts for testing:');
    console.log('  Lawyer: sarah.johnson1@example.com / Test123!@#');
    console.log('  Seeker: ahmed.hassan.seeker1@example.com / Test123!@#');
    
    return { lawyers, seekers };
  } catch (error) {
    console.error('❌ Error seeding mock data:', error);
    throw error;
  }
}

// If running this file directly
if (require.main === module) {
  (async () => {
    try {
      // Connect to MongoDB
      const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/wisal';
      console.log('🔗 Connecting to MongoDB:', mongoUri);
      await mongoose.connect(mongoUri);
      console.log('✅ Connected to MongoDB');
      
      // Seed the data
      await seedMockData();
      
      // Disconnect
      await mongoose.disconnect();
      console.log('🔌 Disconnected from MongoDB');
      process.exit(0);
    } catch (error) {
      console.error('❌ Fatal error:', error);
      process.exit(1);
    }
  })();
}