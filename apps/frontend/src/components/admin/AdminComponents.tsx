'use client';

import React, { useEffect } from 'react';
import { useAdminStore } from '../../stores/adminStore';

// ─── SystemHealthPanel ────────────────────────────────────────────────────────
export function SystemHealthPanel() {
  const { health, loadHealth, isLoading } = useAdminStore();

  useEffect(() => { loadHealth(); }, []);

  if (isLoading) return <div className="animate-pulse h-40 bg-gray-100 rounded-2xl" />;
  if (!health) return null;

  const statusConfig = {
    healthy:  { bg: 'bg-green-50',  border: 'border-green-200', badge: 'bg-green-500', text: 'Healthy' },
    degraded: { bg: 'bg-yellow-50', border: 'border-yellow-200', badge: 'bg-yellow-500', text: 'Degraded' },
    critical: { bg: 'bg-red-50',    border: 'border-red-200',   badge: 'bg-red-500',   text: 'Critical' },
  };
  const cfg = statusConfig[health.overallStatus];

  return (
    <div className={`border rounded-2xl p-6 ${cfg.bg} ${cfg.border} space-y-4`}>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-800">System Health</h2>
        <div className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full text-white ${cfg.badge}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
          {cfg.text}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <HealthMetric label="Scraper Success" value={`${health.scraperHealth.successRate}%`} sub={`${health.scraperHealth.failedJobs} failed`} />
        <HealthMetric label="AI Providers" value={`${health.aiProviderHealth.available}/${health.aiProviderHealth.total}`} sub="Available" />
        <HealthMetric label="Queue Pending" value={String(health.queueHealth.pending)} sub={`${health.queueHealth.failed} failed`} />
        <HealthMetric label="Pending Reviews" value={String(health.pendingVerifications)} sub="Benefit changes" urgent={health.pendingVerifications > 5} />
      </div>

      <p className="text-xs text-gray-400">Last updated: {new Date(health.generatedAt).toLocaleTimeString()}</p>
    </div>
  );
}

function HealthMetric({ label, value, sub, urgent = false }: { label: string; value: string; sub: string; urgent?: boolean }) {
  return (
    <div className="bg-white rounded-xl p-4 border border-gray-100">
      <p className="text-xs text-gray-500 font-medium">{label}</p>
      <p className={`text-2xl font-black mt-1 ${urgent ? 'text-red-600' : 'text-gray-900'}`}>{value}</p>
      <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
    </div>
  );
}

// ─── FeatureFlagTable ─────────────────────────────────────────────────────────
export function FeatureFlagTable() {
  const { flags, loadFlags, updateFlag, killSwitch } = useAdminStore();

  useEffect(() => { loadFlags(); }, []);

  return (
    <div className="border rounded-2xl overflow-hidden bg-white">
      <div className="px-5 py-4 border-b flex items-center justify-between">
        <h3 className="font-bold text-gray-800">Feature Flags</h3>
        <span className="text-xs text-gray-400">{flags.length} flags</span>
      </div>
      <table className="w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="text-left px-4 py-3 text-gray-600 font-semibold">Key</th>
            <th className="text-left px-4 py-3 text-gray-600 font-semibold">Label</th>
            <th className="text-left px-4 py-3 text-gray-600 font-semibold">Rollout</th>
            <th className="text-left px-4 py-3 text-gray-600 font-semibold">Env</th>
            <th className="text-center px-4 py-3 text-gray-600 font-semibold">Enabled</th>
            <th className="text-center px-4 py-3 text-gray-600 font-semibold">Kill Switch</th>
          </tr>
        </thead>
        <tbody>
          {flags.map(f => (
            <tr key={f.key} className="border-t hover:bg-gray-50">
              <td className="px-4 py-3 font-mono text-xs text-blue-700">{f.key}</td>
              <td className="px-4 py-3 text-gray-700">{f.label}</td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="w-20 h-1.5 bg-gray-100 rounded-full">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${f.rolloutPercentage}%` }} />
                  </div>
                  <span className="text-xs text-gray-500">{f.rolloutPercentage}%</span>
                </div>
              </td>
              <td className="px-4 py-3 text-xs text-gray-500 capitalize">{f.environment}</td>
              <td className="px-4 py-3 text-center">
                <button
                  onClick={() => updateFlag(f.key, { isEnabled: !f.isEnabled })}
                  className={`w-10 h-5 rounded-full transition-colors ${f.isEnabled ? 'bg-green-500' : 'bg-gray-200'}`}
                >
                  <span className={`block w-4 h-4 bg-white rounded-full shadow mx-auto transition-transform ${f.isEnabled ? 'translate-x-2.5' : '-translate-x-2.5'}`} />
                </button>
              </td>
              <td className="px-4 py-3 text-center">
                <button
                  onClick={() => killSwitch(f.key, !f.isKillSwitch)}
                  className={`text-xs px-2 py-1 rounded font-medium ${f.isKillSwitch ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-500'}`}
                >
                  {f.isKillSwitch ? '☠ Active' : 'Arm'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── AuditLogTable ────────────────────────────────────────────────────────────
export function AuditLogTable() {
  const { auditLogs, loadAuditLogs } = useAdminStore();

  useEffect(() => { loadAuditLogs(); }, []);

  const actionColor: Record<string, string> = {
    CARD_CREATED: 'text-green-600', CARD_UPDATED: 'text-blue-600', CARD_DELETED: 'text-red-600',
    RULE_CREATED: 'text-green-600', RULE_UPDATED: 'text-blue-600',
    MERCHANT_APPROVED: 'text-green-600', MERCHANT_REJECTED: 'text-red-500',
    FLAG_UPDATED: 'text-purple-600', USER_SUSPENDED: 'text-red-600',
    SCRAPER_RETRY: 'text-orange-500',
  };

  return (
    <div className="border rounded-2xl overflow-hidden bg-white">
      <div className="px-5 py-4 border-b">
        <h3 className="font-bold text-gray-800">Audit Log</h3>
      </div>
      <div className="divide-y max-h-96 overflow-y-auto">
        {auditLogs.map((log: any) => (
          <div key={log.id} className="px-5 py-3 flex items-start justify-between gap-4 hover:bg-gray-50">
            <div className="flex-1 min-w-0">
              <span className={`text-xs font-bold ${actionColor[log.action] ?? 'text-gray-600'}`}>{log.action}</span>
              <span className="text-xs text-gray-400 ml-2">on {log.entityType}{log.entityId ? `:${log.entityId.slice(0, 8)}...` : ''}</span>
              <p className="text-xs text-gray-500 mt-0.5">{log.adminEmail} · {log.adminRole}</p>
            </div>
            <p className="text-xs text-gray-400 whitespace-nowrap">{new Date(log.timestamp).toLocaleString('en-IN', { hour12: false })}</p>
          </div>
        ))}
        {auditLogs.length === 0 && <p className="text-xs text-gray-400 px-5 py-6">No audit logs found.</p>}
      </div>
    </div>
  );
}

// ─── ScraperHealthPanel ───────────────────────────────────────────────────────
export function ScraperHealthPanel() {
  const { scraperJobs, loadScraperJobs } = useAdminStore();

  useEffect(() => { loadScraperJobs(); }, []);

  const statusColor: Record<string, string> = {
    completed: 'bg-green-100 text-green-700',
    running:   'bg-blue-100 text-blue-700',
    pending:   'bg-gray-100 text-gray-600',
    failed:    'bg-red-100 text-red-700',
    retrying:  'bg-orange-100 text-orange-700',
  };

  return (
    <div className="border rounded-2xl overflow-hidden bg-white">
      <div className="px-5 py-4 border-b flex items-center justify-between">
        <h3 className="font-bold text-gray-800">Scraper Jobs</h3>
        <span className="text-xs text-gray-400">{scraperJobs.length} recent jobs</span>
      </div>
      <div className="divide-y max-h-80 overflow-y-auto">
        {scraperJobs.map((job: any) => (
          <div key={job.id} className="px-5 py-3 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-gray-800">{job.bank}</p>
              <p className="text-xs text-gray-400 truncate max-w-xs">{job.url}</p>
            </div>
            <div className="flex items-center gap-2">
              {job.retryCount > 0 && <span className="text-xs text-orange-500">↺{job.retryCount}</span>}
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColor[job.status] ?? 'bg-gray-100 text-gray-500'}`}>
                {job.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── BenefitChangesPanel ──────────────────────────────────────────────────────
export function BenefitChangesPanel() {
  const { benefitChanges, loadBenefitChanges, markChangeReviewed } = useAdminStore();

  useEffect(() => { loadBenefitChanges(); }, []);

  const severityColor: Record<string, string> = {
    critical: 'bg-red-100 text-red-700 border-red-200',
    high:     'bg-orange-100 text-orange-700 border-orange-200',
    medium:   'bg-yellow-100 text-yellow-700 border-yellow-200',
    low:      'bg-blue-100 text-blue-700 border-blue-200',
  };

  return (
    <div className="border rounded-2xl overflow-hidden bg-white">
      <div className="px-5 py-4 border-b flex items-center justify-between">
        <h3 className="font-bold text-gray-800">Pending Benefit Changes</h3>
        <span className="text-xs font-bold text-red-600">{benefitChanges.length} unreviewed</span>
      </div>
      <div className="divide-y max-h-80 overflow-y-auto">
        {benefitChanges.map((c: any) => (
          <div key={c.id} className="px-5 py-3 flex items-start justify-between gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-gray-800">{c.bank}</p>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${severityColor[c.overallSeverity] ?? ''}`}>
                  {c.overallSeverity}
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">{c.changes?.length ?? 0} field change(s) detected</p>
            </div>
            <button
              onClick={() => markChangeReviewed(c.id)}
              className="text-xs px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 whitespace-nowrap"
            >
              Mark Reviewed
            </button>
          </div>
        ))}
        {benefitChanges.length === 0 && <p className="text-xs text-gray-400 px-5 py-6">No pending benefit changes.</p>}
      </div>
    </div>
  );
}
