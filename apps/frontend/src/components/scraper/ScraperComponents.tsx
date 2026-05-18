'use client';

import React from 'react';

// ─── FreshnessBadge ───────────────────────────────────────────────────────────
interface FreshnessProps { score: number; message: string; }

export function FreshnessBadge({ score, message }: FreshnessProps) {
  const color =
    score >= 80 ? 'bg-green-100 text-green-700 border-green-200' :
    score >= 50 ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
    'bg-red-100 text-red-600 border-red-200';

  const dot =
    score >= 80 ? 'bg-green-500' :
    score >= 50 ? 'bg-yellow-500' :
    'bg-red-500';

  return (
    <div className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot} animate-pulse`} />
      {message}
    </div>
  );
}

// ─── VerificationIndicator ────────────────────────────────────────────────────
type VerificationStatus = 'unverified' | 'auto_verified' | 'verified' | 'flagged' | 'stale';

interface VerificationProps { status: VerificationStatus; confidence?: number; }

const VERIFICATION_CONFIG: Record<VerificationStatus, { label: string; color: string; icon: string }> = {
  verified:       { label: 'Verified',       color: 'text-green-600',  icon: '✓' },
  auto_verified:  { label: 'Auto-Verified',  color: 'text-blue-600',   icon: '⚡' },
  unverified:     { label: 'Unverified',     color: 'text-gray-500',   icon: '○' },
  flagged:        { label: 'Needs Review',   color: 'text-orange-600', icon: '⚠' },
  stale:          { label: 'Stale',          color: 'text-red-500',    icon: '⏰' },
};

export function VerificationIndicator({ status, confidence }: VerificationProps) {
  const config = VERIFICATION_CONFIG[status];
  return (
    <div className={`flex items-center gap-1 text-xs font-medium ${config.color}`}>
      <span>{config.icon}</span>
      <span>{config.label}</span>
      {confidence !== undefined && <span className="text-gray-400">({confidence}%)</span>}
    </div>
  );
}

// ─── SourceHealthIndicator ────────────────────────────────────────────────────
interface SourceHealthProps {
  bank: string;
  successRate: string;
  total: number;
  failed: number;
}

export function SourceHealthIndicator({ bank, successRate, total, failed }: SourceHealthProps) {
  const pct = parseInt(successRate, 10);
  const color = pct >= 80 ? 'bg-green-500' : pct >= 50 ? 'bg-yellow-500' : 'bg-red-500';

  return (
    <div className="flex items-center justify-between p-3 border rounded-lg bg-white hover:shadow-sm transition-shadow">
      <div>
        <p className="font-semibold text-sm text-gray-800">{bank}</p>
        <p className="text-xs text-gray-400">{total} jobs · {failed} failed</p>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div className={`h-full ${color} rounded-full`} style={{ width: successRate }} />
        </div>
        <span className="text-xs font-bold text-gray-700">{successRate}</span>
      </div>
    </div>
  );
}

// ─── RetryWarningBanner ───────────────────────────────────────────────────────
export function RetryWarningBanner({ bank, retryCount, maxRetries }: { bank: string; retryCount: number; maxRetries: number }) {
  if (retryCount === 0) return null;
  const exhausted = retryCount >= maxRetries;

  return (
    <div className={`flex items-start gap-2 text-xs rounded-lg px-3 py-2 ${exhausted ? 'bg-red-50 border border-red-200 text-red-700' : 'bg-orange-50 border border-orange-200 text-orange-700'}`}>
      <span className="shrink-0 text-base">{exhausted ? '✕' : '↺'}</span>
      <span>
        {exhausted
          ? `${bank}: All ${maxRetries} retries exhausted. Manual review required.`
          : `${bank}: Retry ${retryCount}/${maxRetries} in progress.`}
      </span>
    </div>
  );
}
