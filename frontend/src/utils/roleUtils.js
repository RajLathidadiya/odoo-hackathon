/**
 * Role and Permission Utilities
 */

// Define role hierarchy and permissions
export const ROLES = {
  SUPER_ADMIN: 'Super Admin',
  FLEET_MANAGER: 'Fleet Manager',
  DISPATCHER: 'Dispatcher',
  SAFETY_OFFICER: 'Safety Officer',
  FINANCIAL_ANALYST: 'Financial Analyst',
};

// Define what each role can do
export const ROLE_PERMISSIONS = {
  [ROLES.SUPER_ADMIN]: {
    label: 'System Administrator',
    description: 'Full system access',
    canManageUsers: true,
    canManageVehicles: true,
    canManageDrivers: true,
    canManageTrips: true,
    canDispatch: true,
    canViewAnalytics: true,
    canViewFinancial: true,
    menuItems: [
      'dashboard',
      'vehicles',
      'drivers',
      'trips',
      'dispatch',
      'maintenance',
      'fuel',
      'expenses',
      'analytics',
      'users',
    ],
  },
  [ROLES.FLEET_MANAGER]: {
    label: 'Fleet Manager',
    description: 'Manage vehicles, drivers, and trips',
    canManageUsers: false,
    canManageVehicles: true,
    canManageDrivers: true,
    canManageTrips: true,
    canDispatch: false,
    canViewAnalytics: true,
    canViewFinancial: false,
    menuItems: [
      'dashboard',
      'vehicles',
      'drivers',
      'trips',
      'maintenance',
      'fuel',
      'expenses',
      'analytics',
    ],
  },
  [ROLES.DISPATCHER]: {
    label: 'Dispatcher',
    description: 'Assign and manage trip dispatch',
    canManageUsers: false,
    canManageVehicles: false,
    canManageDrivers: false,
    canManageTrips: false,
    canDispatch: true,
    canViewAnalytics: true,
    canViewFinancial: false,
    menuItems: [
      'dashboard',
      'dispatch',
      'trips',
      'vehicles',
      'drivers',
    ],
  },
  [ROLES.SAFETY_OFFICER]: {
    label: 'Safety Officer',
    description: 'Monitor driver safety and compliance',
    canManageUsers: false,
    canManageVehicles: false,
    canManageDrivers: false,
    canManageTrips: false,
    canDispatch: false,
    canViewAnalytics: true,
    canViewFinancial: false,
    menuItems: [
      'dashboard',
      'drivers',
      'analytics',
    ],
  },
  [ROLES.FINANCIAL_ANALYST]: {
    label: 'Financial Analyst',
    description: 'View financial reports and analytics',
    canManageUsers: false,
    canManageVehicles: false,
    canManageDrivers: false,
    canManageTrips: false,
    canDispatch: false,
    canViewAnalytics: true,
    canViewFinancial: true,
    menuItems: [
      'dashboard',
      'analytics',
      'expenses',
      'fuel',
      'maintenance',
    ],
  },
};

/**
 * Get role color for UI badges
 */
export const getRoleColor = (role) => {
  const colors = {
    [ROLES.SUPER_ADMIN]: '#ef4444', // red
    [ROLES.FLEET_MANAGER]: '#3b82f6', // blue
    [ROLES.DISPATCHER]: '#f59e0b', // amber
    [ROLES.SAFETY_OFFICER]: '#8b5cf6', // purple
    [ROLES.FINANCIAL_ANALYST]: '#10b981', // green
  };
  return colors[role] || '#6b7280';
};

/**
 * Get role badge text with description
 */
export const getRoleBadge = (role) => {
  const permissions = ROLE_PERMISSIONS[role];
  return permissions ? permissions.label : role;
};

/**
 * Check if user can perform action
 */
export const canUserAction = (userRole, action) => {
  const permissions = ROLE_PERMISSIONS[userRole];
  if (!permissions) return false;
  return permissions[action] === true;
};

/**
 * Get accessible menu items for role
 */
export const getMenuItemsForRole = (role) => {
  const permissions = ROLE_PERMISSIONS[role];
  return permissions ? permissions.menuItems : [];
};

/**
 * Check if role should see financial reports
 */
export const canViewFinancial = (role) => {
  return canUserAction(role, 'canViewFinancial');
};

/**
 * Check if role can manage users
 */
export const canManageUsers = (role) => {
  return canUserAction(role, 'canManageUsers');
};

/**
 * Check if role can manage fleet assets
 */
export const canManageFleet = (role) => {
  return (
    canUserAction(role, 'canManageVehicles') ||
    canUserAction(role, 'canManageDrivers')
  );
};

/**
 * Check if role can perform dispatch operations
 */
export const canDispatch = (role) => {
  return canUserAction(role, 'canDispatch');
};
