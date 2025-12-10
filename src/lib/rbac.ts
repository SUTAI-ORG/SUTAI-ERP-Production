/**
 * RBAC (Role-Based Access Control) system
 * Checks user permissions from database (localStorage)
 */

import { getPermissions, getRoles } from "./permissions";

/**
 * Get user permissions from database (localStorage)
 * @returns Array of permission titles from user's roles
 */
export function getUserPermissions(): string[] {
  return getPermissions();
}

/**
 * Get user roles from database (localStorage)
 * @returns Array of roles
 */
export function getUserRoles() {
  return getRoles();
}

/**
 * Normalize permission string for comparison
 */
function normalizePermission(permission: string): string {
  return permission.toLowerCase().trim();
}

/**
 * Check if user has a specific permission
 * @param permission - Permission string to check (e.g., "user_menu_show", "users.view")
 * @returns true if user has the permission
 */
export function hasPermission(permission: string): boolean {
  const permissions = getUserPermissions();
  // If permissions are not loaded yet, fallback to allowing access
  if (!permissions || permissions.length === 0) {
    return true;
  }
  const normalizedPermission = normalizePermission(permission);
  
  // Check exact match first
  if (permissions.includes(permission)) {
    return true;
  }
  
  // Check case-insensitive match
  const hasAccess = permissions.some(
    (p) => normalizePermission(p) === normalizedPermission
  );

  return hasAccess;
}

/**
 * Check if user has any of the specified permissions
 * @param permissions - Array of permission strings to check
 * @returns true if user has at least one permission
 */
export function hasAnyPermission(permissions: string[]): boolean {
  const userPermissions = getUserPermissions();
  if (!userPermissions || userPermissions.length === 0) {
    return true;
  }
  return permissions.some((permission) => userPermissions.includes(permission));
}

/**
 * Check if user has all of the specified permissions
 * @param permissions - Array of permission strings to check
 * @returns true if user has all permissions
 */
export function hasAllPermissions(permissions: string[]): boolean {
  const userPermissions = getUserPermissions();
  if (!userPermissions || userPermissions.length === 0) {
    return true;
  }
  return permissions.every((permission) => userPermissions.includes(permission));
}
