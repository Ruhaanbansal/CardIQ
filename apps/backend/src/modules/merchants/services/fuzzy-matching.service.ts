import { Injectable } from '@nestjs/common';
import * as levenshtein from 'fast-levenshtein';

export interface FuzzyScore {
  target: string;
  score: number; // 0 to 100, where 100 is exact match
}

@Injectable()
export class FuzzyMatchingService {
  
  /**
   * Calculates a normalized Levenshtein similarity score between two strings.
   * Score ranges from 0 to 100.
   */
  calculateSimilarity(str1: string, str2: string): number {
    if (!str1 || !str2) return 0;
    
    const s1 = str1.toLowerCase().trim();
    const s2 = str2.toLowerCase().trim();

    if (s1 === s2) return 100;

    const distance = levenshtein.get(s1, s2);
    const maxLength = Math.max(s1.length, s2.length);

    // If strings are very short and distance is > 1, it's a poor match
    if (maxLength <= 3 && distance > 0) return 0;

    const similarity = ((maxLength - distance) / maxLength) * 100;
    return similarity;
  }

  /**
   * Finds the best match from a list of targets.
   */
  findBestMatch(source: string, targets: string[], threshold: number = 70): FuzzyScore | null {
    if (!source || !targets.length) return null;

    let bestScore = -1;
    let bestTarget = '';

    for (const target of targets) {
      const score = this.calculateSimilarity(source, target);
      if (score > bestScore) {
        bestScore = score;
        bestTarget = target;
      }
    }

    if (bestScore >= threshold) {
      return { target: bestTarget, score: bestScore };
    }

    return null;
  }
}
