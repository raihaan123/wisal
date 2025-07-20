import { Request, Response, NextFunction, RequestHandler } from 'express';
import { Role, IRole } from '../models/Role';
import { Permission, IPermission } from '../models/Permission';
import jwt from 'jsonwebtoken';

// Extend Express Request interface to include user
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    roles: string[];
  };
}

// Custom error class for RBAC errors
export class RBACError extends Error {
  statusCode: number;
  
  constructor(message: string, statusCode: number = 403) {
    super(message);
    this.name = 'RBACError';
    this.statusCode = statusCode;
  }
}

/**
 * Check if user has specific permission
 * @param resource - The resource to check permission for
 * @param action - The action to perform on the resource
 * @returns Express middleware function
 */
export function checkPermission(resource: string, action: string): RequestHandler {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Check if user is authenticated
      if (!req.user) {
        throw new RBACError('Authentication required', 401);
      }

      // Check if user has roles
      if (!req.user.roles || req.user.roles.length === 0) {
        throw new RBACError('No roles assigned to user', 403);
      }

      // Check permission for each role
      const hasPermission = await checkUserPermission(req.user.roles, resource, action);
      
      if (!hasPermission) {
        throw new RBACError(
          `Access denied. Required permission: ${resource}:${action}`,
          403
        );
      }

      next();
    } catch (error) {
      if (error instanceof RBACError) {
        res.status(error.statusCode).json({
          success: false,
          error: error.message
        });
        return;
      }
      
      console.error('RBAC middleware error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error during permission check'
      });
      return;
    }
  };
}

/**
 * Check if user has any of the specified roles
 * @param allowedRoles - Array of role names that are allowed
 * @returns Express middleware function
 */
export function hasRole(...allowedRoles: string[]): RequestHandler {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Check if user is authenticated
      if (!req.user) {
        throw new RBACError('Authentication required', 401);
      }

      // Check if user has roles
      if (!req.user.roles || req.user.roles.length === 0) {
        throw new RBACError('No roles assigned to user', 403);
      }

      // Check if user has any of the allowed roles
      const hasAllowedRole = req.user.roles.some(role => 
        allowedRoles.includes(role)
      );

      if (!hasAllowedRole) {
        throw new RBACError(
          `Access denied. Required roles: ${allowedRoles.join(', ')}`,
          403
        );
      }

      next();
    } catch (error) {
      if (error instanceof RBACError) {
        res.status(error.statusCode).json({
          success: false,
          error: error.message
        });
        return;
      }
      
      console.error('RBAC middleware error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error during role check'
      });
    }
  };
}

/**
 * Check if user has all of the specified roles
 * @param requiredRoles - Array of role names that are all required
 * @returns Express middleware function
 */
export function hasAllRoles(...requiredRoles: string[]): RequestHandler {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Check if user is authenticated
      if (!req.user) {
        throw new RBACError('Authentication required', 401);
      }

      // Check if user has roles
      if (!req.user.roles || req.user.roles.length === 0) {
        throw new RBACError('No roles assigned to user', 403);
      }

      // Check if user has all required roles
      const hasAllRequiredRoles = requiredRoles.every(role => 
        req.user!.roles.includes(role)
      );

      if (!hasAllRequiredRoles) {
        throw new RBACError(
          `Access denied. All required roles needed: ${requiredRoles.join(', ')}`,
          403
        );
      }

      next();
    } catch (error) {
      if (error instanceof RBACError) {
        res.status(error.statusCode).json({
          success: false,
          error: error.message
        });
        return;
      }
      
      console.error('RBAC middleware error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error during role check'
      });
    }
  };
}

/**
 * Helper function to check if user roles have specific permission
 * @param userRoles - Array of user role names
 * @param resource - The resource to check
 * @param action - The action to check
 * @returns Promise<boolean>
 */
async function checkUserPermission(
  userRoles: string[], 
  resource: string, 
  action: string
): Promise<boolean> {
  try {
    // Fetch all active roles for the user
    const roles = await Role.find({
      name: { $in: userRoles },
      isActive: true
    });

    // Check if any role has the required permission
    return roles.some(role => 
      role.permissions.some(perm => 
        perm.resource === resource && 
        (perm.action === action || perm.action === 'manage')
      )
    );
  } catch (error) {
    console.error('Error checking user permissions:', error);
    return false;
  }
}

/**
 * Middleware to load user permissions into request
 * Useful for frontend to know what actions are available
 */
export async function loadUserPermissions(
  req: AuthenticatedRequest, 
  res: Response, 
  next: NextFunction
) {
  try {
    if (!req.user || !req.user.roles) {
      return next();
    }

    // Fetch all roles for the user
    const roles = await Role.find({
      name: { $in: req.user.roles },
      isActive: true
    });

    // Collect all unique permissions
    const permissionsSet = new Set<string>();
    
    roles.forEach(role => {
      role.permissions.forEach(perm => {
        permissionsSet.add(`${perm.resource}:${perm.action}`);
      });
    });

    // Add permissions to request object
    (req as any).userPermissions = Array.from(permissionsSet);

    next();
  } catch (error) {
    console.error('Error loading user permissions:', error);
    next();
  }
}

/**
 * Dynamic permission check based on request parameters
 * Useful for resource ownership checks
 */
export function checkResourceOwnership(
  resourceGetter: (req: AuthenticatedRequest) => Promise<{ ownerId: string } | null>
): RequestHandler {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new RBACError('Authentication required', 401);
      }

      const resource = await resourceGetter(req);
      
      if (!resource) {
        throw new RBACError('Resource not found', 404);
      }

      // Check if user is the owner or has manage permission
      const isOwner = resource.ownerId === req.user.id;
      const hasManagePermission = await checkUserPermission(
        req.user.roles, 
        'system', 
        'manage'
      );

      if (!isOwner && !hasManagePermission) {
        throw new RBACError('Access denied. You do not own this resource', 403);
      }

      next();
    } catch (error) {
      if (error instanceof RBACError) {
        res.status(error.statusCode).json({
          success: false,
          error: error.message
        });
        return;
      }
      
      console.error('Resource ownership check error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error during ownership check'
      });
    }
  };
}

// Export middleware functions
export default {
  checkPermission,
  hasRole,
  hasAllRoles,
  loadUserPermissions,
  checkResourceOwnership
};