// ============================================================
// MULTI-TENANT SERVICE - Logical Data Isolation
// Ensures complete data separation between tenants
// ============================================================

import fs from 'fs'
import path from 'path'
import { SECURITY_CONFIG } from './config'

const TENANTS_FILE = path.join(process.cwd(), 'data', 'tenants.json')

export interface Tenant {
  id: string
  name: string
  domain: string
  plan: 'free' | 'business' | 'enterprise'
  active: boolean
  createdAt: string
  config: TenantConfig
  limits: TenantLimits
}

export interface TenantConfig {
  branding: {
    primaryColor: string
    logo?: string
    appName: string
  }
  features: {
    videoCall: boolean
    aiMatching: boolean
    premiumPlans: boolean
    analytics: boolean
  }
  security: {
    mfaRequired: boolean
    passwordPolicy: 'standard' | 'strict'
    sessionTimeout: number
    ipWhitelist: string[]
  }
}

export interface TenantLimits {
  maxUsers: number
  maxStorageMB: number
  maxApiCallsPerDay: number
  maxFileUploadMB: number
}

function getTenants(): Tenant[] {
  try {
    if (fs.existsSync(TENANTS_FILE)) {
      return JSON.parse(fs.readFileSync(TENANTS_FILE, 'utf-8'))
    }
  } catch {}
  
  // Default tenant
  const defaults: Tenant[] = [{
    id: 'default',
    name: 'Soulmate Sync',
    domain: 'localhost',
    plan: 'enterprise',
    active: true,
    createdAt: new Date().toISOString(),
    config: {
      branding: {
        primaryColor: '#7c3aed',
        appName: 'Soulmate Sync',
      },
      features: {
        videoCall: true,
        aiMatching: true,
        premiumPlans: true,
        analytics: true,
      },
      security: {
        mfaRequired: false,
        passwordPolicy: 'standard',
        sessionTimeout: 30,
        ipWhitelist: [],
      },
    },
    limits: {
      maxUsers: 100000,
      maxStorageMB: 50000,
      maxApiCallsPerDay: 1000000,
      maxFileUploadMB: 5,
    },
  }]
  
  saveTenants(defaults)
  return defaults
}

function saveTenants(tenants: Tenant[]) {
  const dir = path.dirname(TENANTS_FILE)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(TENANTS_FILE, JSON.stringify(tenants, null, 2))
}

/**
 * Resolve tenant from request headers or domain
 */
export function resolveTenant(headers: { [key: string]: string | undefined }): Tenant | null {
  const tenants = getTenants()
  
  // Try X-Tenant-ID header first
  const tenantId = headers[SECURITY_CONFIG.tenant.headerName.toLowerCase()] || 
                   headers[SECURITY_CONFIG.tenant.headerName]
  
  if (tenantId) {
    const tenant = tenants.find(t => t.id === tenantId && t.active)
    if (tenant) return tenant
  }
  
  // Try host/origin header
  const host = headers['host'] || headers['origin'] || ''
  const domain = host.replace(/^https?:\/\//, '').split(':')[0]
  
  const tenant = tenants.find(t => t.domain === domain && t.active)
  if (tenant) return tenant
  
  // Default tenant
  return tenants.find(t => t.id === SECURITY_CONFIG.tenant.defaultTenant) || null
}

/**
 * Create a new tenant
 */
export function createTenant(params: {
  name: string
  domain: string
  plan: 'free' | 'business' | 'enterprise'
}): Tenant {
  const tenants = getTenants()
  
  // Check domain uniqueness
  if (tenants.find(t => t.domain === params.domain)) {
    throw new Error('Domain already registered')
  }
  
  const planLimits: Record<string, TenantLimits> = {
    free: { maxUsers: 100, maxStorageMB: 500, maxApiCallsPerDay: 10000, maxFileUploadMB: 2 },
    business: { maxUsers: 10000, maxStorageMB: 10000, maxApiCallsPerDay: 100000, maxFileUploadMB: 5 },
    enterprise: { maxUsers: 100000, maxStorageMB: 50000, maxApiCallsPerDay: 1000000, maxFileUploadMB: 10 },
  }
  
  const tenant: Tenant = {
    id: `tenant_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    name: params.name,
    domain: params.domain,
    plan: params.plan,
    active: true,
    createdAt: new Date().toISOString(),
    config: {
      branding: { primaryColor: '#7c3aed', appName: params.name },
      features: {
        videoCall: params.plan !== 'free',
        aiMatching: params.plan !== 'free',
        premiumPlans: true,
        analytics: params.plan === 'enterprise',
      },
      security: {
        mfaRequired: params.plan === 'enterprise',
        passwordPolicy: params.plan === 'enterprise' ? 'strict' : 'standard',
        sessionTimeout: 30,
        ipWhitelist: [],
      },
    },
    limits: planLimits[params.plan],
  }
  
  tenants.push(tenant)
  saveTenants(tenants)
  return tenant
}

/**
 * Check tenant limits
 */
export function checkTenantLimit(tenantId: string, resource: 'users' | 'storage' | 'apiCalls' | 'fileUpload', currentUsage: number): boolean {
  const tenants = getTenants()
  const tenant = tenants.find(t => t.id === tenantId)
  if (!tenant) return false
  
  switch (resource) {
    case 'users': return currentUsage < tenant.limits.maxUsers
    case 'storage': return currentUsage < tenant.limits.maxStorageMB
    case 'apiCalls': return currentUsage < tenant.limits.maxApiCallsPerDay
    case 'fileUpload': return currentUsage < tenant.limits.maxFileUploadMB
    default: return true
  }
}

/**
 * Get tenant configuration
 */
export function getTenantConfig(tenantId: string): TenantConfig | null {
  const tenants = getTenants()
  const tenant = tenants.find(t => t.id === tenantId)
  return tenant?.config || null
}

/**
 * Update tenant configuration
 */
export function updateTenantConfig(tenantId: string, updates: Partial<TenantConfig>): boolean {
  const tenants = getTenants()
  const tenant = tenants.find(t => t.id === tenantId)
  if (!tenant) return false
  
  tenant.config = { ...tenant.config, ...updates }
  saveTenants(tenants)
  return true
}

/**
 * Scope data query to tenant (adds tenant filter)
 */
export function scopeToTenant<T extends { tenantId?: string }>(data: T[], tenantId: string): T[] {
  if (tenantId === 'default') return data // Default tenant sees all (backward compat)
  return data.filter(item => !item.tenantId || item.tenantId === tenantId)
}
