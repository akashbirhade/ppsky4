// ============================================================
// AUDIT LOGGING SERVICE - Security Event Trail
// Tracks all security-relevant actions for compliance
// ============================================================

import fs from 'fs'
import path from 'path'
import { SECURITY_CONFIG } from './config'

const AUDIT_FILE = path.join(process.cwd(), 'data', 'audit_log.json')

export type AuditEventType =
  | 'AUTH_LOGIN_SUCCESS'
  | 'AUTH_LOGIN_FAILED'
  | 'AUTH_LOGOUT'
  | 'AUTH_TOKEN_REFRESH'
  | 'AUTH_PASSWORD_CHANGE'
  | 'AUTH_ACCOUNT_LOCKED'
  | 'AUTH_REGISTER'
  | 'PROFILE_VIEW'
  | 'PROFILE_UPDATE'
  | 'PROFILE_DELETE'
  | 'CONTACT_VIEW'
  | 'CALL_INITIATED'
  | 'PAYMENT_ATTEMPT'
  | 'PAYMENT_SUCCESS'
  | 'PAYMENT_FAILED'
  | 'SUBSCRIPTION_ACTIVATED'
  | 'FILE_UPLOAD'
  | 'RATE_LIMIT_EXCEEDED'
  | 'INJECTION_ATTEMPT'
  | 'UNAUTHORIZED_ACCESS'
  | 'CSRF_VIOLATION'
  | 'SESSION_HIJACK_ATTEMPT'
  | 'ADMIN_ACTION'
  | 'DATA_EXPORT'
  | 'DATA_DELETION'
  | 'PERMISSION_DENIED'

export type AuditSeverity = 'INFO' | 'WARNING' | 'CRITICAL' | 'ALERT'

export interface AuditEntry {
  id: string
  timestamp: string
  eventType: AuditEventType
  severity: AuditSeverity
  userId?: string
  tenantId: string
  ip: string
  userAgent: string
  resource: string
  action: string
  details: Record<string, any>
  success: boolean
  riskScore: number
}

function getAuditLog(): AuditEntry[] {
  try {
    if (fs.existsSync(AUDIT_FILE)) {
      return JSON.parse(fs.readFileSync(AUDIT_FILE, 'utf-8'))
    }
  } catch {}
  return []
}

function saveAuditLog(entries: AuditEntry[]) {
  const dir = path.dirname(AUDIT_FILE)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  
  // Retention policy - keep only within retention period
  const cutoff = Date.now() - (SECURITY_CONFIG.audit.retentionDays * 24 * 60 * 60 * 1000)
  const filtered = entries.filter(e => new Date(e.timestamp).getTime() > cutoff)
  
  fs.writeFileSync(AUDIT_FILE, JSON.stringify(filtered, null, 2))
}

/**
 * Mask sensitive fields in audit details
 */
function maskSensitiveData(details: Record<string, any>): Record<string, any> {
  const masked = { ...details }
  for (const field of SECURITY_CONFIG.audit.sensitiveFields) {
    if (masked[field]) {
      const value = String(masked[field])
      masked[field] = value.slice(0, 2) + '***' + value.slice(-2)
    }
  }
  return masked
}

/**
 * Calculate risk score based on event type and context
 */
function calculateRiskScore(eventType: AuditEventType, success: boolean): number {
  const scores: Record<string, number> = {
    AUTH_LOGIN_FAILED: 30,
    AUTH_ACCOUNT_LOCKED: 70,
    RATE_LIMIT_EXCEEDED: 50,
    INJECTION_ATTEMPT: 90,
    UNAUTHORIZED_ACCESS: 80,
    CSRF_VIOLATION: 85,
    SESSION_HIJACK_ATTEMPT: 95,
    PERMISSION_DENIED: 40,
    PAYMENT_FAILED: 25,
    DATA_DELETION: 60,
    ADMIN_ACTION: 50,
  }
  return scores[eventType] || (success ? 5 : 20)
}

/**
 * Log a security audit event
 */
export function logAuditEvent(params: {
  eventType: AuditEventType
  severity?: AuditSeverity
  userId?: string
  tenantId?: string
  ip?: string
  userAgent?: string
  resource: string
  action: string
  details?: Record<string, any>
  success?: boolean
}): AuditEntry {
  const {
    eventType,
    severity,
    userId,
    tenantId = 'default',
    ip = 'unknown',
    userAgent = 'unknown',
    resource,
    action,
    details = {},
    success = true,
  } = params

  const riskScore = calculateRiskScore(eventType, success)
  const autoSeverity: AuditSeverity = riskScore >= 80 ? 'ALERT' 
    : riskScore >= 50 ? 'CRITICAL' 
    : riskScore >= 30 ? 'WARNING' 
    : 'INFO'

  const entry: AuditEntry = {
    id: `audit_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    timestamp: new Date().toISOString(),
    eventType,
    severity: severity || autoSeverity,
    userId,
    tenantId,
    ip,
    userAgent,
    resource,
    action,
    details: maskSensitiveData(details),
    success,
    riskScore,
  }

  const log = getAuditLog()
  log.push(entry)
  saveAuditLog(log)

  // Alert on high-risk events
  if (riskScore >= 80) {
    console.error(`[SECURITY ALERT] ${eventType} | User: ${userId || 'anonymous'} | IP: ${ip} | Risk: ${riskScore}`)
  }

  return entry
}

/**
 * Query audit log with filters
 */
export function queryAuditLog(filters: {
  userId?: string
  eventType?: AuditEventType
  tenantId?: string
  startDate?: string
  endDate?: string
  minRiskScore?: number
  limit?: number
}): AuditEntry[] {
  let entries = getAuditLog()

  if (filters.userId) entries = entries.filter(e => e.userId === filters.userId)
  if (filters.eventType) entries = entries.filter(e => e.eventType === filters.eventType)
  if (filters.tenantId) entries = entries.filter(e => e.tenantId === filters.tenantId)
  if (filters.startDate) entries = entries.filter(e => e.timestamp >= filters.startDate!)
  if (filters.endDate) entries = entries.filter(e => e.timestamp <= filters.endDate!)
  if (filters.minRiskScore) entries = entries.filter(e => e.riskScore >= filters.minRiskScore!)

  entries.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

  return entries.slice(0, filters.limit || 100)
}

/**
 * Get security threat summary
 */
export function getSecuritySummary(tenantId?: string): {
  totalEvents: number
  criticalAlerts: number
  failedLogins: number
  injectionAttempts: number
  rateLimitViolations: number
  topThreats: { ip: string; count: number }[]
} {
  let entries = getAuditLog()
  if (tenantId) entries = entries.filter(e => e.tenantId === tenantId)

  const last24h = entries.filter(e => 
    new Date(e.timestamp).getTime() > Date.now() - 24 * 60 * 60 * 1000
  )

  const ipCounts: Record<string, number> = {}
  last24h.filter(e => e.riskScore >= 50).forEach(e => {
    ipCounts[e.ip] = (ipCounts[e.ip] || 0) + 1
  })

  const topThreats = Object.entries(ipCounts)
    .map(([ip, count]) => ({ ip, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)

  return {
    totalEvents: last24h.length,
    criticalAlerts: last24h.filter(e => e.severity === 'ALERT' || e.severity === 'CRITICAL').length,
    failedLogins: last24h.filter(e => e.eventType === 'AUTH_LOGIN_FAILED').length,
    injectionAttempts: last24h.filter(e => e.eventType === 'INJECTION_ATTEMPT').length,
    rateLimitViolations: last24h.filter(e => e.eventType === 'RATE_LIMIT_EXCEEDED').length,
    topThreats,
  }
}
