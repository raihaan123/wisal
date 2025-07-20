/**
 * RBAC Middleware Usage Examples
 * 
 * This file demonstrates how to use the RBAC middleware in routes
 */

import express from 'express';
import { authenticate, optionalAuth, checkPermission, hasRole, hasAllRoles, loadUserPermissions } from './auth';

const router = express.Router();

// Example 1: Check for specific permission
router.get('/api/users',
  authenticate,
  checkPermission('user', 'list'),
  async (req, res) => {
    // Only users with 'user:list' permission can access this
    res.json({ message: 'User list' });
  }
);

// Example 2: Check for any of the specified roles
router.post('/api/legal-advice',
  authenticate,
  hasRole('lawyer', 'activist', 'admin'),
  async (req, res) => {
    // Only lawyers, activists, or admins can create legal advice
    res.json({ message: 'Legal advice created' });
  }
);

// Example 3: Check for all specified roles (user must have ALL roles)
router.delete('/api/system/critical-operation',
  authenticate,
  hasAllRoles('admin', 'super-admin'),
  async (req, res) => {
    // Only users with BOTH admin AND super-admin roles can perform this
    res.json({ message: 'Critical operation performed' });
  }
);

// Example 4: Load user permissions for frontend
router.get('/api/auth/permissions',
  authenticate,
  loadUserPermissions,
  async (req: any, res) => {
    // Returns user's permissions for frontend to enable/disable features
    res.json({
      permissions: req.userPermissions || []
    });
  }
);

// Example 5: Combine multiple middleware
router.put('/api/cases/:id',
  authenticate,
  checkPermission('case', 'update'),
  async (req, res) => {
    // User must be authenticated AND have case:update permission
    res.json({ message: 'Case updated' });
  }
);

// Example 6: Resource ownership check (custom implementation)
router.delete('/api/documents/:id',
  authenticate,
  checkPermission('document', 'delete'),
  async (req: any, res, next) => {
    try {
      // Additional check: user can only delete their own documents
      // unless they have 'document:manage' permission
      const document = await getDocument(req.params.id);
      
      if (document.ownerId !== req.user.id) {
        // Check if user has manage permission
        const hasManagePermission = req.user.roles.some((role: string) => 
          // This would need to be implemented with actual role checking
          role === 'admin'
        );
        
        if (!hasManagePermission) {
          return res.status(403).json({ error: 'Cannot delete document owned by another user' });
        }
      }
      
      return res.json({ message: 'Document deleted' });
    } catch (error) {
      return next(error);
    }
  }
);

// Example 7: Public route (no auth required)
router.get('/api/public/legal-resources',
  async (req, res) => {
    // Anyone can access this
    res.json({ message: 'Public legal resources' });
  }
);

// Example 8: Optional auth with different responses
router.get('/api/legal-advice',
  optionalAuth,
  async (req: any, res) => {
    if (req.user) {
      // Authenticated user gets personalized content
      res.json({ 
        message: 'Personalized legal advice',
        userId: req.user.id 
      });
    } else {
      // Non-authenticated user gets generic content
      res.json({ 
        message: 'Generic legal advice' 
      });
    }
  }
);

// Helper function (would be in a service)
async function getDocument(id: string) {
  // Mock implementation
  return { id, ownerId: 'some-user-id' };
}

// Route groups with common permissions
const adminRouter = express.Router();

// All routes in adminRouter require admin role
adminRouter.use(authenticate, hasRole('admin'));

adminRouter.get('/users', async (req, res) => {
  res.json({ message: 'Admin: User list' });
});

adminRouter.post('/roles', async (req, res) => {
  res.json({ message: 'Admin: Role created' });
});

adminRouter.put('/settings', async (req, res) => {
  res.json({ message: 'Admin: Settings updated' });
});

// Permission combinations for complex scenarios
router.post('/api/reports/financial',
  authenticate,
  // User needs EITHER admin role OR both report:create AND payment:read permissions
  async (req: any, res, next) => {
    const isAdmin = req.user.roles.includes('admin');
    
    if (!isAdmin) {
      // Check for specific permissions
      return checkPermission('report', 'create')(req, res, () => {
        checkPermission('payment', 'read')(req, res, next);
      });
    }
    
    next();
  },
  async (req, res) => {
    res.json({ message: 'Financial report generated' });
  }
);

export default router;