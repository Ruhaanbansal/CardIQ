import { Injectable } from '@nestjs/common';

@Injectable()
export class NormalizationService {
  private readonly STOP_WORDS = new Set([
    'pvt', 'ltd', 'limited', 'inc', 'corp', 'corporation', 'llp', 'llc',
    'online', 'retail', 'services', 'systems', 'india', 'private'
  ]);

  private readonly CITY_SUFFIXES = new Set([
    'blr', 'bengaluru', 'bangalore', 'mum', 'mumbai', 'del', 'delhi',
    'hyd', 'hyderabad', 'chn', 'chennai', 'pune', 'gurgaon', 'noida'
  ]);

  /**
   * Cleans a raw merchant name into a normalized search string.
   * e.g., "SWIGGY LIMITED BLR" -> "swiggy"
   */
  normalize(rawName: string): string {
    if (!rawName) return '';

    let text = rawName.toLowerCase();

    // 1. Remove standard payment prefixes/suffixes that slip past the parser
    text = text.replace(/^(vpa|upi|pos|ecom|neft|rtgs|imps|ach)[\/\-]/i, '');
    
    // 2. Remove special characters, keep alphanumeric and spaces
    text = text.replace(/[^a-z0-9\s]/g, ' ');

    // 3. Tokenize and filter out stop words and cities
    const tokens = text.split(/\s+/).filter(token => {
      return token.length > 1 && 
             !this.STOP_WORDS.has(token) && 
             !this.CITY_SUFFIXES.has(token);
    });

    // 4. Handle exact specific edge cases (e.g., amzn -> amazon)
    const processedTokens = tokens.map(t => {
      if (t === 'amzn') return 'amazon';
      if (t === 'mktplace') return 'marketplace';
      if (t === 'pmts') return 'payments';
      return t;
    });

    return processedTokens.join(' ').trim();
  }
}
