/**
 * Role-Based Redirect Utility
 * Determines the appropriate landing page based on user role
 */

export const getRoleRedirectPath = (user) => {
  if (!user || !user.role_name) {
    return '/';
  }

  const role = user.role_name;

  // Role-specific landing pages
  const roleRoutes = {
    'Super Admin': '/users', // User management dashboard
    'Fleet Manager': '/vehicles', // Fleet management
    'Dispatcher': '/dispatch', // Dispatch operations
    'Safety Officer': '/drivers', // Driver management
    'Financial Analyst': '/analytics', // Financial reports
    'Manager': '/vehicles',
    'Driver': '/trips',
    'Admin': '/vehicles',
  };

  // Return role-specific route or default to dashboard
  return roleRoutes[role] || '/';
};

/**
 * Get navigation items based on role
 */
export const getRoleNavItems = (user) => {
  if (!user || !user.role_name) {
    return [];
  }

  const baseItems = [
    { path: '/', label: 'Dashboard', icon: 'LayoutDashboard' },
  ];

  const role = user.role_name;

  const roleNavItems = {
    'Super Admin': [
      ...baseItems,
      { path: '/users', label: 'User Management', icon: 'Users' },
      { path: '/vehicles', label: 'Vehicles', icon: 'Truck' },
      { path: '/drivers', label: 'Drivers', icon: 'User' },
      { path: '/trips', label: 'Trips', icon: 'MapPin' },
      { path: '/dispatch', label: 'Dispatch', icon: 'Send' },
      { path: '/maintenance', label: 'Maintenance', icon: 'Wrench' },
      { path: '/fuel', label: 'Fuel Logs', icon: 'Droplets' },
      { path: '/expenses', label: 'Expenses', icon: 'DollarSign' },
      { path: '/analytics', label: 'Analytics', icon: 'BarChart3' },
    ],
    'Fleet Manager': [
      ...baseItems,
      { path: '/vehicles', label: 'Vehicles', icon: 'Truck' },
      { path: '/drivers', label: 'Drivers', icon: 'User' },
      { path: '/trips', label: 'Trips', icon: 'MapPin' },
      { path: '/maintenance', label: 'Maintenance', icon: 'Wrench' },
      { path: '/fuel', label: 'Fuel Logs', icon: 'Droplets' },
      { path: '/expenses', label: 'Expenses', icon: 'DollarSign' },
      { path: '/analytics', label: 'Analytics', icon: 'BarChart3' },
    ],
    'Dispatcher': [
      ...baseItems,
      { path: '/dispatch', label: 'Dispatch', icon: 'Send' },
      { path: '/trips', label: 'Trips', icon: 'MapPin' },
      { path: '/vehicles', label: 'Vehicles', icon: 'Truck' },
    ],
    'Safety Officer': [
      ...baseItems,
      { path: '/drivers', label: 'Drivers', icon: 'User' },
      { path: '/analytics', label: 'Analytics', icon: 'BarChart3' },
    ],
    'Financial Analyst': [
      ...baseItems,
      { path: '/analytics', label: 'Analytics', icon: 'BarChart3' },
      { path: '/expenses', label: 'Expenses', icon: 'DollarSign' },
      { path: '/fuel', label: 'Fuel Logs', icon: 'Droplets' },
    ],
    'Manager': [
      ...baseItems,
      { path: '/vehicles', label: 'Vehicles', icon: 'Truck' },
      { path: '/drivers', label: 'Drivers', icon: 'User' },
      { path: '/trips', label: 'Trips', icon: 'MapPin' },
    ],
    'Driver': [
      ...baseItems,
      { path: '/trips', label: 'My Trips', icon: 'MapPin' },
    ],
    'Admin': [
      ...baseItems,
      { path: '/vehicles', label: 'Vehicles', icon: 'Truck' },
    ],
  };

  return roleNavItems[role] || baseItems;
};

/**
 * Get role color for UI display
 */
export const getRoleColor = (roleName) => {
  const roleColors = {
    'Super Admin': '#EF4444', // Red
    'Fleet Manager': '#3B82F6', // Blue
    'Dispatcher': '#F59E0B', // Amber
    'Safety Officer': '#10B981', // Emerald
    'Financial Analyst': '#8B5CF6', // Purple
    'Manager': '#6366F1', // Indigo
    'Driver': '#06B6D4', // Cyan
    'Admin': '#EC4899', // Pink
  };

  return roleColors[roleName] || '#6B7280'; // Gray default
};

/**
 * Get role badge style
 */
export const getRoleBadgeStyle = (roleName) => {
  const color = getRoleColor(roleName);
  return {
    background: `${color}20`,
    color: color,
    border: `1px solid ${color}40`,
    padding: '0.25rem 0.75rem',
    borderRadius: '0.375rem',
    fontSize: '0.75rem',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  };
};
