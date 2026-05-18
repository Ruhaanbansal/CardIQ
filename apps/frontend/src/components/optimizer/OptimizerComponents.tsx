'use client';

import React from 'react';
import { RankedCard, AlternativeCard } from '../../types/optimizer.types';

// ─── OptimizationResultCard ───────────────────────────────────────────────────
interface ResultProps { card: RankedCard; amount: number; }

export function OptimizationResultCard({ card, amount }: ResultProps) {
  return (
    <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-6 shadow-lg space-y-4">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-xs font-semibold text-blue-200 uppercase tracking-widest">Best Card for this Transaction</p>
          <h2 className="text-2xl font-bold mt-1">{card.cardName}</h2>
          <p className="text-blue-200 text-sm">{card.issuerName}</p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-black">₹{card.effectiveValueInr.toFixed(2)}</p>
          <p className="text-blue-200 text-sm">{card.effectiveRewardRate.toFixed(2)}% on ₹{amount.toLocaleString('en-IN')}</p>
        </div>
      </div>

      <div className="border-t border-white/20 pt-4 space-y-2">
        <p className="text-sm text-blue-100 font-medium">Why this card?</p>
        <p className="text-sm text-white/90">{card.reasoning}</p>
      </div>

      {card.warnings.length > 0 && (
        <div className="bg-white/10 rounded-lg p-3">
          {card.warnings.map((w, i) => (
            <p key={i} className="text-xs text-yellow-300">⚠ {w}</p>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── AlternativeCardsTable ────────────────────────────────────────────────────
interface AltProps { alternatives: AlternativeCard[]; }

export function AlternativeCardsTable({ alternatives }: AltProps) {
  if (!alternatives || alternatives.length === 0) return null;

  return (
    <div className="border rounded-xl overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="text-left px-4 py-3 text-gray-600 font-semibold">Card</th>
            <th className="text-right px-4 py-3 text-gray-600 font-semibold">Reward</th>
            <th className="text-right px-4 py-3 text-gray-600 font-semibold">Rate</th>
            <th className="text-left px-4 py-3 text-gray-600 font-semibold">Note</th>
          </tr>
        </thead>
        <tbody>
          {alternatives.map((alt) => (
            <tr key={alt.cardId} className="border-t hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3">
                <p className="font-medium text-gray-800">{alt.cardName}</p>
                <p className="text-xs text-gray-400">{alt.issuerName}</p>
              </td>
              <td className="px-4 py-3 text-right font-semibold">
                <span className={alt.differenceVsBest < 0 ? 'text-red-500' : 'text-green-600'}>
                  ₹{alt.effectiveValueInr.toFixed(2)}
                </span>
              </td>
              <td className="px-4 py-3 text-right text-gray-600">{alt.effectiveRewardRate.toFixed(2)}%</td>
              <td className="px-4 py-3 text-gray-500 text-xs max-w-xs">{alt.tradeoffNote}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── TransactionSummaryCard ───────────────────────────────────────────────────
interface SummaryProps { merchantName: string; amount: number; category: string; confidence: number; }

export function TransactionSummaryCard({ merchantName, amount, category, confidence }: SummaryProps) {
  const confColor = confidence >= 80 ? 'text-green-600' : confidence >= 60 ? 'text-yellow-600' : 'text-red-500';
  
  return (
    <div className="border rounded-xl p-4 bg-white flex items-center justify-between gap-4">
      <div>
        <p className="font-bold text-gray-900">{merchantName}</p>
        <p className="text-xs text-gray-400 mt-0.5 capitalize">{category.replace(/_/g, ' ')}</p>
      </div>
      <div className="text-right">
        <p className="text-xl font-bold text-gray-900">₹{amount.toLocaleString('en-IN')}</p>
        <p className={`text-xs font-medium ${confColor}`}>{confidence}% confidence</p>
      </div>
    </div>
  );
}
