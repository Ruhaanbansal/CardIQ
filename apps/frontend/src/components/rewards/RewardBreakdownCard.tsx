'use client';

import React from 'react';

export function RewardBreakdownCard({ result }: { result: any }) {
  if (!result) return null;

  return (
    <div className="border rounded-xl p-6 bg-white shadow-sm space-y-4 max-w-lg">
      <div className="flex justify-between items-center border-b pb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Reward Breakdown</h3>
          <p className="text-sm text-gray-500">Transaction: ₹{result.transactionAmount}</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-green-600">
            {result.rewardValue} <span className="text-sm uppercase">{result.rewardType}</span>
          </p>
          <p className="text-sm font-medium text-gray-600">
            {result.effectiveRewardRate.toFixed(2)}% ROI (₹{result.effectiveValueInr})
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-gray-700">Applied Logic:</h4>
        <ul className="text-sm space-y-1 text-gray-600">
          {result.appliedRules.map((rule: string, i: number) => (
            <li key={i} className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              {rule}
            </li>
          ))}
          {result.excludedRules.map((rule: string, i: number) => (
            <li key={`ex-${i}`} className="flex items-start text-red-500">
              <span className="mr-2">✗</span>
              {rule}
            </li>
          ))}
        </ul>
      </div>

      {result.warnings.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
          <h4 className="text-xs font-bold text-yellow-800 uppercase tracking-wide">Warnings</h4>
          <ul className="mt-1 text-sm text-yellow-700 list-disc list-inside">
            {result.warnings.map((warn: string, i: number) => (
              <li key={i}>{warn}</li>
            ))}
          </ul>
        </div>
      )}

      {result.capImpact && (
        <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm text-blue-800">
          <strong>Cap Applied:</strong> Reward was reduced from {result.capImpact.originalReward} to {result.capImpact.cappedReward} due to a {result.capImpact.capType} cap.
        </div>
      )}
    </div>
  );
}
