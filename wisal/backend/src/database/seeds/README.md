# Database Seeding

This directory contains seed files for populating the database with initial data.

## Available Seeds

### 1. RBAC Seed (`rbac.seed.ts`)
Seeds the Role-Based Access Control system with:
- Default permissions for all resources
- Default roles: admin, lawyer, seeker, activist
- Role-permission mappings

### 2. Mock Data Seed (`mock-data.seed.ts`)
Seeds comprehensive mock data for testing:
- **50 Lawyer profiles** with:
  - Diverse specializations (Employment, Immigration, Human Rights, etc.)
  - Multiple languages (15+ languages including Arabic, Spanish, French)
  - Realistic locations across 25 major cities worldwide
  - Education history from top law schools
  - Professional certifications
  - Availability schedules
  - Ratings and review counts
  - Hourly rates ($100-$300) with 30% offering free consultations
  
- **25 Seeker profiles** with:
  - Demographic information
  - Legal help categories
  - Communication preferences
  - Budget ranges

## Running Seeds

### Prerequisites
1. MongoDB must be running
2. Environment variables configured (`.env` file)

### Commands

```bash
# Seed RBAC data only
npm run seed:rbac

# Seed mock data only (includes RBAC)
npm run seed:mock

# Clear existing mock data and reseed
npm run seed:mock -- --clear

# Seed everything
npm run seed:all
```

## Test Accounts

After seeding, you can use these accounts for testing:

**Lawyer Account:**
- Email: `sarah.johnson1@example.com`
- Password: `Test123!@#`

**Seeker Account:**
- Email: `ahmed.hassan.seeker1@example.com`
- Password: `Test123!@#`

All mock accounts use the password: `Test123!@#`

## Data Characteristics

### Lawyer Specializations
The mock data includes lawyers specializing in:
- Employment Law
- Immigration Law
- Human Rights
- Civil Rights
- Criminal Defense
- Asylum Law
- International Law
- And 18 more specializations

### Geographic Distribution
Lawyers and seekers are distributed across:
- USA: New York, Los Angeles, Chicago, Houston, etc.
- UK: London, Manchester, Birmingham, Glasgow
- Canada: Toronto, Montreal, Vancouver
- Europe: Berlin, Paris, Amsterdam, Brussels
- Middle East: Dubai, Istanbul
- Australia: Sydney, Melbourne

### Languages Supported
The platform supports legal services in:
- English, Arabic, Spanish, French, Turkish
- Urdu, Hebrew, Persian, German, Italian
- Portuguese, Russian, Mandarin, Hindi, Bengali

## Development Notes

- All mock users have `@example.com` email addresses for easy identification
- Mock data is designed to test search functionality with diverse criteria
- Lawyer profiles include realistic professional backgrounds
- Data follows the Information Architecture document specifications
- Seeker profiles include various legal help scenarios

## Customization

To modify the seed data:
1. Edit the arrays at the top of `mock-data.seed.ts`
2. Adjust the counts in the seeding functions
3. Run with `--clear` flag to reset data

## Production Warning

⚠️ These seeds are for development/testing only. Do not run mock data seeds in production environments.