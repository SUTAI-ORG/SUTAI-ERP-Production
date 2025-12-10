/**
 * Permissions utility functions
 * Handles role and permission management
 */

export interface Permission {
  id: number;
  title: string;
  created_at: string | null;
  updated_at: string | null;
  deleted_at: string | null;
  pivot?: {
    role_id: number;
    permission_id: number;
  };
}

export interface Role {
  id: number;
  title: string;
  created_at: string | null;
  updated_at: string | null;
  deleted_at: string | null;
  permissions: Permission[];
}

export interface RolesResponse {
  data: Role[];
}

/**
 * Get permissions from localStorage
 */
export const getPermissions = (): string[] => {
  if (typeof window === "undefined") return [];
  
  const userStr = localStorage.getItem("user");
  if (!userStr) {
    return [];
  }
  try {
    const raw = JSON.parse(userStr);
    const user = raw?.data ?? raw; // support { data: user } or plain user
    const roles: Role[] = Array.isArray(user?.roles) ? user.roles : [];

    // Extract all permission titles from all roles
    const permissions = new Set<string>();
    roles.forEach((role) => {
      role.permissions?.forEach((permission) => {
        permissions.add(permission.title);
      });
    });
    
    const permissionArray = Array.from(permissions);
    // Debug: show signed-in user summary and permissions
    if (typeof window !== "undefined") {
      console.log("[Permissions] Current user:", {
        id: user?.id,
        name: user?.name,
        email: user?.email,
        roles: roles.map((r) => r.title),
      });
      console.log("[Permissions] Permission titles:", permissionArray);
    }
    
    return permissionArray;
  } catch (error) {
    return [];
  }
};

/**
 * Get roles from localStorage
 */
export const getRoles = (): Role[] => {
  if (typeof window === "undefined") return [];
  
  const userStr = localStorage.getItem("user");
  if (!userStr) return [];
  
  try {
    const user = JSON.parse(userStr);
    return user.roles || [];
  } catch {
    return [];
  }
};

/**
 * Check if user has a specific permission
 */
const norm = (s: string) => s.trim();

const getPermissionSet = (): Set<string> =>
  new Set(getPermissions().map(norm));

export const hasPermission = (permissionTitle: string): boolean => {
  return getPermissionSet().has(norm(permissionTitle));
};

export const hasAnyPermission = (permissionTitles: string[]): boolean => {
  const set = getPermissionSet();
  return permissionTitles.some((t) => set.has(norm(t)));
};

export const hasAllPermissions = (permissionTitles: string[]): boolean => {
  const set = getPermissionSet();
  return permissionTitles.every((t) => set.has(norm(t)));
};

/**
 * Check if user has a specific role
 */
export const hasRole = (roleTitle: string): boolean => {
  const roles = getRoles();
  return roles.some((role) => role.title === roleTitle);
};

/**
 * Check if user has any of the specified roles
 */
export const hasAnyRole = (roleTitles: string[]): boolean => {
  const roles = getRoles();
  return roles.some((role) => roleTitles.includes(role.title));
};

