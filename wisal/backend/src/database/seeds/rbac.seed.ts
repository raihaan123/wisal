import mongoose from 'mongoose';
import { Role } from '../../models/Role';
import { Permission, PermissionResource, PermissionAction } from '../../models/Permission';

// Define default permissions for each resource
const defaultPermissions = [
  // User permissions
  { resource: PermissionResource.USER, action: PermissionAction.CREATE, description: 'Create new users' },
  { resource: PermissionResource.USER, action: PermissionAction.READ, description: 'Read user information' },
  { resource: PermissionResource.USER, action: PermissionAction.UPDATE, description: 'Update user information' },
  { resource: PermissionResource.USER, action: PermissionAction.DELETE, description: 'Delete users' },
  { resource: PermissionResource.USER, action: PermissionAction.LIST, description: 'List all users' },
  { resource: PermissionResource.USER, action: PermissionAction.MANAGE, description: 'Full user management' },

  // Role permissions
  { resource: PermissionResource.ROLE, action: PermissionAction.CREATE, description: 'Create new roles' },
  { resource: PermissionResource.ROLE, action: PermissionAction.READ, description: 'Read role information' },
  { resource: PermissionResource.ROLE, action: PermissionAction.UPDATE, description: 'Update role information' },
  { resource: PermissionResource.ROLE, action: PermissionAction.DELETE, description: 'Delete roles' },
  { resource: PermissionResource.ROLE, action: PermissionAction.LIST, description: 'List all roles' },
  { resource: PermissionResource.ROLE, action: PermissionAction.MANAGE, description: 'Full role management' },

  // Case permissions
  { resource: PermissionResource.CASE, action: PermissionAction.CREATE, description: 'Create new cases' },
  { resource: PermissionResource.CASE, action: PermissionAction.READ, description: 'Read case information' },
  { resource: PermissionResource.CASE, action: PermissionAction.UPDATE, description: 'Update case information' },
  { resource: PermissionResource.CASE, action: PermissionAction.DELETE, description: 'Delete cases' },
  { resource: PermissionResource.CASE, action: PermissionAction.LIST, description: 'List all cases' },
  { resource: PermissionResource.CASE, action: PermissionAction.MANAGE, description: 'Full case management' },

  // Legal advice permissions
  { resource: PermissionResource.LEGAL_ADVICE, action: PermissionAction.CREATE, description: 'Create legal advice' },
  { resource: PermissionResource.LEGAL_ADVICE, action: PermissionAction.READ, description: 'Read legal advice' },
  { resource: PermissionResource.LEGAL_ADVICE, action: PermissionAction.UPDATE, description: 'Update legal advice' },
  { resource: PermissionResource.LEGAL_ADVICE, action: PermissionAction.DELETE, description: 'Delete legal advice' },
  { resource: PermissionResource.LEGAL_ADVICE, action: PermissionAction.LIST, description: 'List all legal advice' },
  { resource: PermissionResource.LEGAL_ADVICE, action: PermissionAction.MANAGE, description: 'Full legal advice management' },

  // Consultation permissions
  { resource: PermissionResource.CONSULTATION, action: PermissionAction.CREATE, description: 'Create consultations' },
  { resource: PermissionResource.CONSULTATION, action: PermissionAction.READ, description: 'Read consultation details' },
  { resource: PermissionResource.CONSULTATION, action: PermissionAction.UPDATE, description: 'Update consultations' },
  { resource: PermissionResource.CONSULTATION, action: PermissionAction.DELETE, description: 'Delete consultations' },
  { resource: PermissionResource.CONSULTATION, action: PermissionAction.LIST, description: 'List all consultations' },
  { resource: PermissionResource.CONSULTATION, action: PermissionAction.MANAGE, description: 'Full consultation management' },

  // Document permissions
  { resource: PermissionResource.DOCUMENT, action: PermissionAction.CREATE, description: 'Upload documents' },
  { resource: PermissionResource.DOCUMENT, action: PermissionAction.READ, description: 'Read documents' },
  { resource: PermissionResource.DOCUMENT, action: PermissionAction.UPDATE, description: 'Update documents' },
  { resource: PermissionResource.DOCUMENT, action: PermissionAction.DELETE, description: 'Delete documents' },
  { resource: PermissionResource.DOCUMENT, action: PermissionAction.LIST, description: 'List all documents' },
  { resource: PermissionResource.DOCUMENT, action: PermissionAction.MANAGE, description: 'Full document management' },

  // Payment permissions
  { resource: PermissionResource.PAYMENT, action: PermissionAction.CREATE, description: 'Process payments' },
  { resource: PermissionResource.PAYMENT, action: PermissionAction.READ, description: 'View payment details' },
  { resource: PermissionResource.PAYMENT, action: PermissionAction.UPDATE, description: 'Update payment information' },
  { resource: PermissionResource.PAYMENT, action: PermissionAction.DELETE, description: 'Delete payment records' },
  { resource: PermissionResource.PAYMENT, action: PermissionAction.LIST, description: 'List all payments' },
  { resource: PermissionResource.PAYMENT, action: PermissionAction.MANAGE, description: 'Full payment management' },

  // Report permissions
  { resource: PermissionResource.REPORT, action: PermissionAction.CREATE, description: 'Generate reports' },
  { resource: PermissionResource.REPORT, action: PermissionAction.READ, description: 'View reports' },
  { resource: PermissionResource.REPORT, action: PermissionAction.LIST, description: 'List all reports' },
  { resource: PermissionResource.REPORT, action: PermissionAction.MANAGE, description: 'Full report management' },

  // System permissions
  { resource: PermissionResource.SYSTEM, action: PermissionAction.READ, description: 'View system information' },
  { resource: PermissionResource.SYSTEM, action: PermissionAction.UPDATE, description: 'Update system settings' },
  { resource: PermissionResource.SYSTEM, action: PermissionAction.MANAGE, description: 'Full system administration' },

  // Audit permissions
  { resource: PermissionResource.AUDIT, action: PermissionAction.READ, description: 'View audit logs' },
  { resource: PermissionResource.AUDIT, action: PermissionAction.LIST, description: 'List all audit logs' },
  { resource: PermissionResource.AUDIT, action: PermissionAction.MANAGE, description: 'Full audit management' },

  // Backup permissions
  { resource: PermissionResource.BACKUP, action: PermissionAction.CREATE, description: 'Create backups' },
  { resource: PermissionResource.BACKUP, action: PermissionAction.READ, description: 'View backup information' },
  { resource: PermissionResource.BACKUP, action: PermissionAction.DELETE, description: 'Delete backups' },
  { resource: PermissionResource.BACKUP, action: PermissionAction.LIST, description: 'List all backups' },
  { resource: PermissionResource.BACKUP, action: PermissionAction.MANAGE, description: 'Full backup management' },

  // Settings permissions
  { resource: PermissionResource.SETTINGS, action: PermissionAction.READ, description: 'View settings' },
  { resource: PermissionResource.SETTINGS, action: PermissionAction.UPDATE, description: 'Update settings' },
  { resource: PermissionResource.SETTINGS, action: PermissionAction.MANAGE, description: 'Full settings management' }
];

// Define default roles with their permissions
const defaultRoles = [
  {
    name: 'admin',
    description: 'Full system administrator with all permissions',
    permissions: [
      // Admin has manage permission on all resources
      { resource: PermissionResource.USER, action: PermissionAction.MANAGE },
      { resource: PermissionResource.ROLE, action: PermissionAction.MANAGE },
      { resource: PermissionResource.CASE, action: PermissionAction.MANAGE },
      { resource: PermissionResource.LEGAL_ADVICE, action: PermissionAction.MANAGE },
      { resource: PermissionResource.CONSULTATION, action: PermissionAction.MANAGE },
      { resource: PermissionResource.DOCUMENT, action: PermissionAction.MANAGE },
      { resource: PermissionResource.PAYMENT, action: PermissionAction.MANAGE },
      { resource: PermissionResource.REPORT, action: PermissionAction.MANAGE },
      { resource: PermissionResource.SYSTEM, action: PermissionAction.MANAGE },
      { resource: PermissionResource.AUDIT, action: PermissionAction.MANAGE },
      { resource: PermissionResource.BACKUP, action: PermissionAction.MANAGE },
      { resource: PermissionResource.SETTINGS, action: PermissionAction.MANAGE }
    ]
  },
  {
    name: 'lawyer',
    description: 'Legal professional providing consultations and advice',
    permissions: [
      // Lawyers can manage their own consultations and legal advice
      { resource: PermissionResource.CONSULTATION, action: PermissionAction.CREATE },
      { resource: PermissionResource.CONSULTATION, action: PermissionAction.READ },
      { resource: PermissionResource.CONSULTATION, action: PermissionAction.UPDATE },
      { resource: PermissionResource.CONSULTATION, action: PermissionAction.LIST },
      { resource: PermissionResource.LEGAL_ADVICE, action: PermissionAction.CREATE },
      { resource: PermissionResource.LEGAL_ADVICE, action: PermissionAction.READ },
      { resource: PermissionResource.LEGAL_ADVICE, action: PermissionAction.UPDATE },
      { resource: PermissionResource.LEGAL_ADVICE, action: PermissionAction.LIST },
      // Can view cases they're assigned to
      { resource: PermissionResource.CASE, action: PermissionAction.READ },
      { resource: PermissionResource.CASE, action: PermissionAction.UPDATE },
      { resource: PermissionResource.CASE, action: PermissionAction.LIST },
      // Can manage documents related to their cases
      { resource: PermissionResource.DOCUMENT, action: PermissionAction.CREATE },
      { resource: PermissionResource.DOCUMENT, action: PermissionAction.READ },
      { resource: PermissionResource.DOCUMENT, action: PermissionAction.UPDATE },
      { resource: PermissionResource.DOCUMENT, action: PermissionAction.LIST },
      // Can view their payments
      { resource: PermissionResource.PAYMENT, action: PermissionAction.READ },
      { resource: PermissionResource.PAYMENT, action: PermissionAction.LIST },
      // Can generate reports for their activities
      { resource: PermissionResource.REPORT, action: PermissionAction.CREATE },
      { resource: PermissionResource.REPORT, action: PermissionAction.READ },
      // Can read their own user profile
      { resource: PermissionResource.USER, action: PermissionAction.READ },
      { resource: PermissionResource.USER, action: PermissionAction.UPDATE }
    ]
  },
  {
    name: 'seeker',
    description: 'Legal service seeker requesting consultations',
    permissions: [
      // Seekers can create and view their own cases
      { resource: PermissionResource.CASE, action: PermissionAction.CREATE },
      { resource: PermissionResource.CASE, action: PermissionAction.READ },
      { resource: PermissionResource.CASE, action: PermissionAction.UPDATE },
      { resource: PermissionResource.CASE, action: PermissionAction.LIST },
      // Can view consultations they're part of
      { resource: PermissionResource.CONSULTATION, action: PermissionAction.READ },
      { resource: PermissionResource.CONSULTATION, action: PermissionAction.LIST },
      // Can view legal advice provided to them
      { resource: PermissionResource.LEGAL_ADVICE, action: PermissionAction.READ },
      { resource: PermissionResource.LEGAL_ADVICE, action: PermissionAction.LIST },
      // Can upload and view their documents
      { resource: PermissionResource.DOCUMENT, action: PermissionAction.CREATE },
      { resource: PermissionResource.DOCUMENT, action: PermissionAction.READ },
      { resource: PermissionResource.DOCUMENT, action: PermissionAction.LIST },
      // Can make and view their payments
      { resource: PermissionResource.PAYMENT, action: PermissionAction.CREATE },
      { resource: PermissionResource.PAYMENT, action: PermissionAction.READ },
      { resource: PermissionResource.PAYMENT, action: PermissionAction.LIST },
      // Can read and update their own profile
      { resource: PermissionResource.USER, action: PermissionAction.READ },
      { resource: PermissionResource.USER, action: PermissionAction.UPDATE }
    ]
  },
  {
    name: 'activist',
    description: 'Legal activist sharing information and resources',
    permissions: [
      // Activists can create and manage legal advice content
      { resource: PermissionResource.LEGAL_ADVICE, action: PermissionAction.CREATE },
      { resource: PermissionResource.LEGAL_ADVICE, action: PermissionAction.READ },
      { resource: PermissionResource.LEGAL_ADVICE, action: PermissionAction.UPDATE },
      { resource: PermissionResource.LEGAL_ADVICE, action: PermissionAction.LIST },
      // Can upload educational documents
      { resource: PermissionResource.DOCUMENT, action: PermissionAction.CREATE },
      { resource: PermissionResource.DOCUMENT, action: PermissionAction.READ },
      { resource: PermissionResource.DOCUMENT, action: PermissionAction.LIST },
      // Can view cases for educational purposes (anonymized)
      { resource: PermissionResource.CASE, action: PermissionAction.READ },
      { resource: PermissionResource.CASE, action: PermissionAction.LIST },
      // Can generate public reports
      { resource: PermissionResource.REPORT, action: PermissionAction.CREATE },
      { resource: PermissionResource.REPORT, action: PermissionAction.READ },
      // Can read and update their own profile
      { resource: PermissionResource.USER, action: PermissionAction.READ },
      { resource: PermissionResource.USER, action: PermissionAction.UPDATE }
    ]
  }
];

/**
 * Seed RBAC permissions and roles
 * @param systemUserId - The ID of the system user creating these records
 */
export async function seedRBAC(systemUserId: string) {
  try {
    console.log('🌱 Seeding RBAC permissions and roles...');

    // Create permissions
    console.log('Creating permissions...');
    for (const permData of defaultPermissions) {
      await Permission.findOneAndUpdate(
        { resource: permData.resource, action: permData.action },
        { ...permData, isActive: true },
        { upsert: true, new: true }
      );
    }
    console.log(`✅ Created ${defaultPermissions.length} permissions`);

    // Create roles
    console.log('Creating roles...');
    for (const roleData of defaultRoles) {
      const role = await Role.findOneAndUpdate(
        { name: roleData.name },
        {
          name: roleData.name,
          description: roleData.description,
          permissions: roleData.permissions,
          isActive: true,
          createdBy: systemUserId
        },
        { upsert: true, new: true }
      );
      console.log(`✅ Created role: ${role.name} with ${role.permissions.length} permissions`);
    }

    console.log('🎉 RBAC seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding RBAC:', error);
    throw error;
  }
}

/**
 * Remove all RBAC data (for testing/reset purposes)
 */
export async function clearRBAC() {
  try {
    console.log('🧹 Clearing RBAC data...');
    await Permission.deleteMany({});
    await Role.deleteMany({});
    console.log('✅ RBAC data cleared');
  } catch (error) {
    console.error('❌ Error clearing RBAC:', error);
    throw error;
  }
}

// If running this file directly
if (require.main === module) {
  (async () => {
    try {
      // Connect to MongoDB
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/wisal');
      
      // Use a default system user ID for seeding
      const systemUserId = new mongoose.Types.ObjectId().toString();
      
      // Clear existing data if requested
      if (process.argv.includes('--clear')) {
        await clearRBAC();
      }
      
      // Seed the data
      await seedRBAC(systemUserId);
      
      // Disconnect
      await mongoose.disconnect();
      process.exit(0);
    } catch (error) {
      console.error('Error:', error);
      process.exit(1);
    }
  })();
}