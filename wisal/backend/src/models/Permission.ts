import { Schema, model, Document } from 'mongoose';

// Define the Permission interface extending Document
export interface IPermission extends Document {
  resource: string;
  action: string;
  description: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Define available resources
export enum PermissionResource {
  USER = 'user',
  ROLE = 'role',
  CASE = 'case',
  LEGAL_ADVICE = 'legal_advice',
  CONSULTATION = 'consultation',
  DOCUMENT = 'document',
  PAYMENT = 'payment',
  REPORT = 'report',
  SYSTEM = 'system',
  AUDIT = 'audit',
  BACKUP = 'backup',
  SETTINGS = 'settings'
}

// Define available actions
export enum PermissionAction {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  MANAGE = 'manage'
}

// Create the Permission schema
const PermissionSchema = new Schema<IPermission>(
  {
    resource: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true
    },
    action: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      enum: Object.values(PermissionAction),
      index: true
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true
    }
  },
  {
    timestamps: true,
    collection: 'permissions'
  }
);

// Create compound index for resource and action
PermissionSchema.index({ resource: 1, action: 1 }, { unique: true });

// Virtual for permission string representation
PermissionSchema.virtual('permission').get(function() {
  return `${this.resource}:${this.action}`;
});

// Static method to generate standard CRUD permissions for a resource
PermissionSchema.statics.generateCRUDPermissions = function(resource: string, descriptions: {
  create?: string;
  read?: string;
  update?: string;
  delete?: string;
  list?: string;
  manage?: string;
} = {}) {
  const defaultDescriptions = {
    create: `Create new ${resource}`,
    read: `Read ${resource} details`,
    update: `Update ${resource} information`,
    delete: `Delete ${resource}`,
    list: `List all ${resource}s`,
    manage: `Full management access to ${resource}`
  };

  const permissions = [
    {
      resource,
      action: PermissionAction.CREATE,
      description: descriptions.create || defaultDescriptions.create
    },
    {
      resource,
      action: PermissionAction.READ,
      description: descriptions.read || defaultDescriptions.read
    },
    {
      resource,
      action: PermissionAction.UPDATE,
      description: descriptions.update || defaultDescriptions.update
    },
    {
      resource,
      action: PermissionAction.DELETE,
      description: descriptions.delete || defaultDescriptions.delete
    },
    {
      resource,
      action: PermissionAction.LIST,
      description: descriptions.list || defaultDescriptions.list
    },
    {
      resource,
      action: PermissionAction.MANAGE,
      description: descriptions.manage || defaultDescriptions.manage
    }
  ];

  return permissions;
};

// Static method to find permission by resource and action
PermissionSchema.statics.findByResourceAndAction = function(resource: string, action: string) {
  return this.findOne({ 
    resource: resource.toLowerCase(), 
    action: action.toLowerCase(),
    isActive: true 
  });
};

// Static method to find all permissions for a resource
PermissionSchema.statics.findByResource = function(resource: string) {
  return this.find({ 
    resource: resource.toLowerCase(),
    isActive: true 
  });
};

// Pre-save hook to ensure lowercase
PermissionSchema.pre('save', function(next) {
  if (this.isModified('resource')) {
    this.resource = this.resource.toLowerCase();
  }
  if (this.isModified('action')) {
    this.action = this.action.toLowerCase();
  }
  next();
});

// Export the Permission model
export const Permission = model<IPermission>('Permission', PermissionSchema);