import { prisma } from './prisma'

export type AuditAction =
  | 'USER_LOGIN'
  | 'USER_LOGOUT'
  | 'USER_REGISTER'
  | 'USER_UPDATE'
  | 'PASSWORD_CHANGE'
  | 'TENANT_CREATE'
  | 'TENANT_UPDATE'
  | 'SOURCE_CREATE'
  | 'SOURCE_UPDATE'
  | 'SOURCE_DELETE'
  | 'SOURCE_SYNC'
  | 'ARTICLE_CREATE'
  | 'ARTICLE_UPDATE'
  | 'API_KEY_CREATE'
  | 'AI_SEO_GENERATE'
  | 'AI_GRAMMAR_CHECK'
  | 'SYSTEM_ERROR'

export interface AuditLogParams {
  actorId: string
  actorRole: string
  action: AuditAction
  resourceType: string
  resourceId: string
  ipAddress?: string
  userAgent?: string
  oldValue?: Record<string, any>
  newValue?: Record<string, any>
  metadata?: Record<string, any>
}

/**
 * Creates an immutable audit log entry.
 * @param params AuditLogParams
 */
export async function createAuditLog(params: AuditLogParams) {
  try {
    await prisma.auditLog.create({
      data: {
        actorId: params.actorId,
        actorRole: params.actorRole,
        action: params.action,
        resourceType: params.resourceType,
        resourceId: params.resourceId,
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
        oldValue: params.oldValue,
        newValue: params.newValue,
        metadata: params.metadata,
      },
    })
  } catch (error) {
    // Failsafe: Audit logging failure should not crash the app, but should be reported to stderr
    console.error('CRITICAL: Failed to write audit log', error)
    // In a real production system, this might trigger a pager duty alert or fallback to a file log
  }
}
