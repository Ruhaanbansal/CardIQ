'use client';

import React from 'react';
import { CardScore } from '../../types/recommendation.types';

interface Props { card: CardScore; rank?: number; }

const difficultyConfig: Record<string, { label: string; color: string }> = {
  easy:      { label: 'Easy Approval',    color: 'bg-green-100 text-green-800' },
  moderate:  { label: 'Moderate',         color: 'bg-yellow-100 text-yellow-800' },
  hard:      { label: 'Hard',             color: 'bg-orange-100 text-orange-800' },
  very_hard: { label: 'Very Selective',   color: 'bg-red-100 text-red-800' },
};

export function RecommendationCard({ card, rank }: Props) {
  const diff = difficultyConfig[card.approvalDifficulty] ?? difficultyConfig.moderate;

  return (
    <div className="relative border rounded-2xl p-6 bg-white shadow-sm hover:shadow-md transition-shadow space-y-4">
      {rank && (
        <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-blue-600 text-white text-sm font-bold flex items-center justify-center">
          #{rank}
        </div>
      )}

      {/* Header */}
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">{card.issuerName}</p>
        <h3 className="text-lg font-bold text-gray-900 leading-snug">{card.cardName}</h3>
        <div className="flex gap-2 mt-1 flex-wrap">
          <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium capitalize">
            {card.rewardType}
          </span>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${diff.color}`}>
            {diff.label}
          </span>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-3 gap-3 text-center border-y py-4">
        <div>
          <p className="text-xl font-bold text-green-600">₹{card.estimatedAnnualValueInr.toLocaleString('en-IN')}</p>
          <p className="text-xs text-gray-500 mt-0.5">Est. Annual Rewards</p>
        </div>
        <div>
          <p className="text-xl font-bold text-gray-800">{card.effectiveRewardRate.toFixed(2)}%</p>
          <p className="text-xs text-gray-500 mt-0.5">Effective Rate</p>
        </div>
        <div>
          <p className="text-xl font-bold text-purple-600">{card.approvalProbability}%</p>
          <p className="text-xs text-gray-500 mt-0.5">Approval Odds</p>
        </div>
      </div>

      {/* Fee */}
      <div className="flex justify-between items-center text-sm">
        <span className="text-gray-500">Annual Fee</span>
        <span className="font-semibold text-gray-800">
          {card.annualFee === 0 ? 'FREE' : `₹${card.annualFee.toLocaleString('en-IN')}`}
        </span>
      </div>
      <div className="flex justify-between items-center text-sm">
        <span className="text-gray-500">Fee-Adjusted Savings</span>
        <span className={`font-bold ${card.feeAdjustedSavings >= 0 ? 'text-green-600' : 'text-red-500'}`}>
          ₹{card.feeAdjustedSavings.toLocaleString('en-IN')}
        </span>
      </div>

      {/* Why This Card */}
      {card.reasoning.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-3 space-y-1">
          {card.reasoning.slice(0, 2).map((r, i) => (
            <p key={i} className="text-xs text-gray-600 flex gap-1">
              <span className="text-blue-500 shrink-0">›</span> {r}
            </p>
          ))}
        </div>
      )}

      {/* Warnings */}
      {card.warnings.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded p-2">
          {card.warnings.map((w, i) => (
            <p key={i} className="text-xs text-yellow-700">⚠ {w}</p>
          ))}
        </div>
      )}
    </div>
  );
}
