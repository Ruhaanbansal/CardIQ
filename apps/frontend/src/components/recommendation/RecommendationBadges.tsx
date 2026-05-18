'use client';

import React from 'react';

interface Props { warnings: string[]; }

export function OverlapWarningBanner({ warnings }: Props) {
  if (!warnings || warnings.length === 0) return null;

  return (
    <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 space-y-2">
      <div className="flex items-center gap-2">
        <span className="text-orange-500 text-lg">⚠</span>
        <h4 className="text-sm font-bold text-orange-800">Stack Overlap Detected</h4>
      </div>
      <ul className="space-y-1">
        {warnings.map((w, i) => (
          <li key={i} className="text-sm text-orange-700 flex gap-2">
            <span className="shrink-0">•</span> {w}
          </li>
        ))}
      </ul>
    </div>
  );
}

interface ConfidenceProps { score: number; }

export function ConfidenceIndicator({ score }: ConfidenceProps) {
  const color = score >= 80 ? 'bg-green-500' : score >= 60 ? 'bg-yellow-400' : 'bg-red-400';
  const label = score >= 80 ? 'High Confidence' : score >= 60 ? 'Moderate Confidence' : 'Low Confidence';

  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${score}%` }} />
      </div>
      <span className="text-xs font-medium text-gray-600 whitespace-nowrap">{score}% · {label}</span>
    </div>
  );
}

interface ApprovalBadgeProps {
  probability: number;
  difficulty: 'easy' | 'moderate' | 'hard' | 'very_hard';
}

export function ApprovalProbabilityBadge({ probability, difficulty }: ApprovalBadgeProps) {
  const styles: Record<string, string> = {
    easy:      'bg-green-100 text-green-800 border-green-200',
    moderate:  'bg-yellow-100 text-yellow-800 border-yellow-200',
    hard:      'bg-orange-100 text-orange-800 border-orange-200',
    very_hard: 'bg-red-100 text-red-800 border-red-200',
  };

  return (
    <div className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${styles[difficulty]}`}>
      <span className="text-base">{probability}%</span>
      <span className="opacity-75">Approval Odds</span>
    </div>
  );
}
