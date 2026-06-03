// ============================================================
// ROLE-BASED ACCESS CONTROL (RBAC) SERVICE
// Fine-grained permission checks
// ============================================================

import { ROLES, PERMISSIONS, Role } from './config'
import { verifyAccessToken, TokenPayload } from './jwt'
import { logAuditEvent } from './audit'

export interface AuthenticatedUser {
  userId: string
  email: string
  role: Role
  tenantId: string
  sessionId: string
  permissions: string[]
}

/**
 * Get permissions for a role
 */
export function getPermissionsForRole(role: Role): string[] {
  return Object.entries(PERMISSIONS)
    .filter(([_, roles]) => roles.includes(role))
    .map(([permission]) => permission)
}

/**
 * Check if a role has a specific permission
 */
export function hasPermission(role: Role, permission: string): boolean {
  const allowedRoles = PERMISSIONS[permission]
  if (!allowedRoles) return false
  return allowedRoles.includes(role)
}

/**
 * Authenticate request from Authorization header
 */
export function authenticateRequest(authHeader: string | null): AuthenticatedUser | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }

  const token = authHeader.slice(7)
  const payload = verifyAccessToken(token)

  if (!payload) return null

  return {
    userId: payload.userId,
    email: payload.email,
    role: payload.role,
    tenantId: payload.tenantId,
    sessionId: payload.sessionId,
    permissions: getPermissionsForRole(payload.role),
  }
}

/**
 * Authorization guard - checks permission
 */
export function authorize(
  user: AuthenticatedUser | null,
  permission: string,
  resource?: string,
  ip?: string
): { authorized: boolean; error?: string } {
  if (!user) {
    return { authorized: false, error: 'Authentication required' }
  }

  if (!hasPermission(user.role, permission)) {
    // Log unauthorized access attempt
    logAuditEvent({
      eventType: 'PERMISSION_DENIED',
      userId: user.userId,
      tenantId: user.tenantId,
      ip: ip || 'unknown',
      resource: resource || permission,
      action: `Attempted: ${permission}`,
      details: { role: user.role, requiredPermission: permission },
      success: false,
    })

    return { authorized: false, error: 'Insufficient permissions' }
  }

  return { authorized: true }
}

/**
 * Resource ownership check - ensure user can only access their own data
 */
export function authorizeOwnership(
  user: AuthenticatedUser,
  resourceOwnerId: string,
  permission: string
): boolean {
  // Admin/Super Admin can access any resource
  if (user.role === ROLES.ADMIN || user.role === ROLES.SUPER_ADMIN) {
    return true
  }

  // Regular users can only access their own resources
  return user.userId === resourceOwnerId && hasPermission(user.role, permission)
}

/**
 * Tenant isolation guard - ensures data access within tenant boundary
 */
export function authorizeTenant(
  user: AuthenticatedUser,
  resourceTenantId: string
): boolean {
  // Super admin can access cross-tenant
  if (user.role === ROLES.SUPER_ADMIN) return true
  
  return user.tenantId === resourceTenantId
}

/**
 * Premium feature guard
 */
export function authorizePremium(user: AuthenticatedUser): { authorized: boolean; error?: string } {
  if (user.role === ROLES.PREMIUM || user.role === ROLES.ADMIN || user.role === ROLES.SUPER_ADMIN) {
    return { authorized: true }
  }
  return { authorized: false, error: 'Premium subscription required' }
}

/**
 * Compose multiple authorization checks
 */
export function authorizeAll(
  checks: Array<() => { authorized: boolean; error?: string }>
): { authorized: boolean; errors: string[] } {
  const errors: string[] = []
  
  for (const check of checks) {
    const result = check()
    if (!result.authorized && result.error) {
      errors.push(result.error)
    }
  }
  
  return { authorized: errors.length === 0, errors }
}

/**
 * Extract user info from cookie-based JWT (for existing auth system compatibility)
 */
export function authenticateFromCookie(cookieHeader: string | null): AuthenticatedUser | null {
  if (!cookieHeader) return null

  const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split('=')
    acc[key] = value
    return acc
  }, {} as Record<string, string>)

  const token = cookies['auth_token'] || cookies['access_token']
  if (!token) return null

  const payload = verifyAccessToken(token)
  if (!payload) return null

  return {
    userId: payload.userId,
    email: payload.email,
    role: payload.role,
    tenantId: payload.tenantId,
    sessionId: payload.sessionId,
    permissions: getPermissionsForRole(payload.role),
  }
}
