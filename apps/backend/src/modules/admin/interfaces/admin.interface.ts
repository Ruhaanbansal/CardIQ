// ============================================================
// CARDIQ ADMIN MODULE — RBAC INTERFACES
// ============================================================

export type AdminRole =
  | 'SUPER_ADMIN'
  | 'ADMIN'
  | 'OPERATIONS_MANAGER'
  | 'DATA_VERIFIER'
  | 'CONTENT_MANAGER'
  | 'SUPPORT_AGENT'
  | 'ANALYTICS_VIEWER';

export type AdminPermission =
  | 'card:read'      | 'card:write'     | 'card:delete'
  | 'rule:read'      | 'rule:write'
  | 'merchant:read'  | 'merchant:approve' | 'merchant:merge'
  | 'scraper:read'   | 'scraper:retry'
  | 'flag:read'      | 'flag:write'
  | 'ai:read'        | 'ai:control'
  | 'cache:read'     | 'cache:invalidate'
  | 'queue:read'     | 'queue:control'
  | 'user:read'      | 'user:moderate'
  | 'audit:read'
  | 'admin:create';

export const ROLE_PERMISSIONS: Record<AdminRole, AdminPermission[]> = {
  SUPER_ADMIN:       ['card:read','card:write','card:delete','rule:read','rule:write','merchant:read','merchant:approve','merchant:merge','scraper:read','scraper:retry','flag:read','flag:write','ai:read','ai:control','cache:read','cache:invalidate','queue:read','queue:control','user:read','user:moderate','audit:read','admin:create'],
  ADMIN:             ['card:read','card:write','rule:read','rule:write','merchant:read','merchant:approve','scraper:read','scraper:retry','flag:read','flag:write','ai:read','cache:read','queue:read','user:read','audit:read'],
  OPERATIONS_MANAGER:['card:read','rule:read','merchant:read','scraper:read','scraper:retry','flag:read','ai:read','cache:read','queue:read','queue:control','audit:read'],
  DATA_VERIFIER:     ['card:read','card:write','rule:read','rule:write','merchant:read','merchant:approve','audit:read'],
  CONTENT_MANAGER:   ['card:read','card:write','rule:read','merchant:read','audit:read'],
  SUPPORT_AGENT:     ['card:read','merchant:read','user:read','audit:read'],
  ANALYTICS_VIEWER:  ['card:read','rule:read','ai:read','audit:read'],
};

// ── Audit Interfaces ──────────────────────────────────────────
export type AuditAction =
  | 'CARD_CREATED' | 'CARD_UPDATED' | 'CARD_DELETED'
  | 'RULE_CREATED' | 'RULE_UPDATED'
  | 'MERCHANT_APPROVED' | 'MERCHANT_MERGED' | 'MERCHANT_REJECTED'
  | 'SCRAPER_RETRY' | 'SCRAPER_DISABLED'
  | 'FLAG_UPDATED' | 'FLAG_CREATED'
  | 'CACHE_INVALIDATED'
  | 'USER_SUSPENDED' | 'USER_REINSTATED'
  | 'ADMIN_LOGIN' | 'PERMISSION_CHANGED';

export interface AdminAuditEvent {
  adminId: string;
  adminEmail: string;
  adminRole: AdminRole;
  action: AuditAction;
  entityType: string;
  entityId?: string;
  previousValue?: any;
  newValue?: any;
  ipAddress?: string;
  sessionId?: string;
  timestamp: Date;
}

// ── Feature Flag Interfaces ───────────────────────────────────
export type FlagEnvironment = 'development' | 'staging' | 'production';

export interface FeatureFlag {
  key: string;
  label: string;
  description: string;
  isEnabled: boolean;
  rolloutPercentage: number;  // 0–100
  environment: FlagEnvironment;
  isKillSwitch: boolean;
  expiresAt?: Date;
  createdBy: string;
  updatedAt: Date;
}

// ── System Health ─────────────────────────────────────────────
export interface SystemHealthSummary {
  overallStatus: 'healthy' | 'degraded' | 'critical';
  scraperHealth: { successRate: number; failedJobs: number };
  aiProviderHealth: { available: number; total: number };
  queueHealth: { pending: number; failed: number };
  cacheHealth: { hitRate: number; isRedisUp: boolean };
  pendingVerifications: number;
  pendingMerchantReviews: number;
  generatedAt: Date;
}
