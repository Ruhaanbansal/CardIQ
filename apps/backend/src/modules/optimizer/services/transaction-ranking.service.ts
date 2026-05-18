import { Injectable } from '@nestjs/common';
import { RankedCard, AlternativeCard } from '../interfaces/optimizer.interface';

@Injectable()
export class TransactionRankingService {
  /**
   * Sorts simulated cards by effective INR value (descending).
   * Assigns ranks and generates per-card reasoning string.
   */
  rank(cards: Omit<RankedCard, 'rank' | 'reasoning'>[]): RankedCard[] {
    const sorted = [...cards].sort((a, b) => b.effectiveValueInr - a.effectiveValueInr);

    return sorted.map((card, index) => ({
      ...card,
      rank: index + 1,
      reasoning: this.buildReasoning(card, index),
    }));
  }

  private buildReasoning(card: Omit<RankedCard, 'rank' | 'reasoning'>, index: number): string {
    if (index === 0) {
      return `Best option — earns ₹${card.effectiveValueInr.toFixed(2)} ` +
        `(${card.effectiveRewardRate.toFixed(2)}% effective rate) on this transaction.`;
    }

    if (card.effectiveValueInr === 0 && card.exclusionsApplied.length > 0) {
      return `Not recommended — transaction category is excluded on this card.`;
    }

    return `Alternative — earns ₹${card.effectiveValueInr.toFixed(2)} ` +
      `(${card.effectiveRewardRate.toFixed(2)}% effective rate).`;
  }
}

@Injectable()
export class AlternativeRankingService {
  /**
   * Builds the alternatives list (all cards except rank-1), with tradeoff notes.
   */
  buildAlternatives(rankedCards: RankedCard[]): AlternativeCard[] {
    if (rankedCards.length <= 1) return [];

    const best = rankedCards[0];

    return rankedCards.slice(1).map(card => {
      const diff = card.effectiveValueInr - best.effectiveValueInr;
      let tradeoffNote: string;

      if (card.exclusionsApplied.length > 0) {
        tradeoffNote = 'Excluded — this category earns no rewards on this card.';
      } else if (card.capImpact?.capHit) {
        tradeoffNote = 'Cap applied — reward was limited by monthly cap.';
      } else if (Math.abs(diff) < 5) {
        tradeoffNote = 'Nearly identical reward — consider using this card to preserve your best card\'s cap.';
      } else {
        tradeoffNote = `Earns ₹${Math.abs(diff).toFixed(2)} less than the best card.`;
      }

      return {
        cardId: card.cardId,
        cardName: card.cardName,
        issuerName: card.issuerName,
        effectiveValueInr: card.effectiveValueInr,
        effectiveRewardRate: card.effectiveRewardRate,
        differenceVsBest: diff,
        tradeoffNote,
      };
    });
  }
}
