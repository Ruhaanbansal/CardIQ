import React from 'react';
import { CheckCircle2, AlertTriangle, Info } from 'lucide-react';

interface ConfidenceIndicatorProps {
  level: 'high' | 'medium' | 'low';
}

export function ConfidenceIndicator({ level }: ConfidenceIndicatorProps) {
  const config = {
    high: { icon: CheckCircle2, color: 'text-success', bg: 'bg-success/10', text: 'High Confidence' },
    medium: { icon: Info, color: 'text-primary', bg: 'bg-primary/10', text: 'Estimated' },
    low: { icon: AlertTriangle, color: 'text-warning', bg: 'bg-warning/10', text: 'Approximation' },
  };

  const { icon: Icon, color, bg, text } = config[level];

  return (
    <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full ${bg} ${color} text-[10px] font-semibold uppercase tracking-wider`}>
      <Icon className="w-3 h-3" />
      {text}
    </div>
  );
}
