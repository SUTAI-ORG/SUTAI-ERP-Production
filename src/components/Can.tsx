/**
 * Can component for conditional rendering based on permissions
 * Checks permissions from database (localStorage)
 */

"use client";

import React, { useEffect, useState } from "react";
import { hasPermission, hasAnyPermission, hasAllPermissions } from "@/lib/rbac";

interface CanProps {
  permission?: string;
  permissions?: string[];
  requireAll?: boolean;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Can component - conditionally renders children based on user permissions
 * 
 * @example
 * // Single permission
 * <Can permission="user_menu_show">
 *   <UserMenu />
 * </Can>
 * 
 * @example
 * // Multiple permissions (any)
 * <Can permissions={["users.edit", "users.delete"]}>
 *   <UserActions />
 * </Can>
 * 
 * @example
 * // Multiple permissions (all required)
 * <Can permissions={["users.edit", "users.delete"]} requireAll>
 *   <AdvancedUserActions />
 * </Can>
 * 
 * @example
 * // With fallback
 * <Can permission="users.delete" fallback={<p>No access</p>}>
 *   <DeleteButton />
 * </Can>
 */
export function Can({
  permission,
  permissions,
  requireAll = false,
  fallback = null,
  children,
}: CanProps) {
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let access = false;

    if (permission) {
      access = hasPermission(permission);
    } else if (permissions) {
      if (requireAll) {
        access = hasAllPermissions(permissions);
      } else {
        access = hasAnyPermission(permissions);
      }
    } else {
      // No permission specified, show by default
      access = true;
    }

    setHasAccess(access);
    setLoading(false);
  }, [permission, permissions, requireAll]);

  if (loading) {
    return null;
  }

  if (!hasAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
