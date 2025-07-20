import { Schema, model, Document } from 'mongoose';

// Define the Permission interface for TypeScript
export interface IPermission {
  resource: string;
  action: string;
}

// Define the Role interface extending Document
export interface IRole extends Document {
  name: string;
  description: string;
  permissions: IPermission[];
  isActive: boolean;
  createdBy: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// Create the Role schema
const RoleSchema = new Schema<IRole>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    permissions: [
      {
        resource: {
          type: String,
          required: true,
          trim: true
        },
        action: {
          type: String,
          required: true,
          trim: true,
          enum: ['create', 'read', 'update', 'delete', 'list', 'manage']
        }
      }
    ],
    isActive: {
      type: Boolean,
      default: true,
      index: true
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  {
    timestamps: true,
    collection: 'roles'
  }
);

// Add indexes for performance
RoleSchema.index({ name: 1, isActive: 1 });
RoleSchema.index({ 'permissions.resource': 1, 'permissions.action': 1 });

// Virtual for permission count
RoleSchema.virtual('permissionCount').get(function() {
  return this.permissions.length;
});

// Method to check if role has specific permission
RoleSchema.methods.hasPermission = function(resource: string, action: string): boolean {
  return this.permissions.some(
    permission => permission.resource === resource && permission.action === action
  );
};

// Method to add permission
RoleSchema.methods.addPermission = function(resource: string, action: string): void {
  if (!this.hasPermission(resource, action)) {
    this.permissions.push({ resource, action });
  }
};

// Method to remove permission
RoleSchema.methods.removePermission = function(resource: string, action: string): void {
  this.permissions = this.permissions.filter(
    permission => !(permission.resource === resource && permission.action === action)
  );
};

// Static method to find active roles
RoleSchema.statics.findActive = function() {
  return this.find({ isActive: true });
};

// Static method to find role by name
RoleSchema.statics.findByName = function(name: string) {
  return this.findOne({ name: name.toLowerCase(), isActive: true });
};

// Pre-save hook to ensure role name is lowercase
RoleSchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.name = this.name.toLowerCase();
  }
  next();
});

// Export the Role model
export const Role = model<IRole>('Role', RoleSchema);