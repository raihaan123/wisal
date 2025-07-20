# Database Seeding Guide

## Quick Start

To seed mock data into your MongoDB database, run:

```bash
cd wisal/backend
npx ts-node scripts/seed-simple.ts
```

## Mock Data Created

The simple seed script creates:
- **5 Lawyer accounts**: lawyer1@example.com to lawyer5@example.com
- **3 Seeker accounts**: seeker1@example.com to seeker3@example.com
- **Password for all accounts**: Test123!@#

## API Verification

To verify the data is available in your app:

1. Check lawyers in the API:
   ```bash
   curl http://localhost:4000/api/lawyers/search | jq '.'
   ```

2. View all users in the database:
   ```bash
   npx ts-node -e "
   import mongoose from 'mongoose';
   mongoose.connect('mongodb://localhost:27017/wisal').then(async () => {
     const users = await mongoose.connection.collection('users').find({}).toArray();
     console.log('Total users:', users.length);
     console.log('User emails:', users.map(u => u.email));
     await mongoose.disconnect();
   }).catch(console.error);"
   ```

## Advanced Seeding

For more comprehensive mock data (50 lawyers, 25 seekers), you can try:
```bash
npm run seed:mock
```

Note: If you encounter timeout issues with the advanced script, use the simple script instead.

## Troubleshooting

If you get connection errors:
1. Ensure MongoDB is running: `docker ps | grep mongo`
2. Check the MongoDB URI in your .env file
3. Use the simple seed script which has better error handling