import { Injectable } from '@nestjs/common';

export interface ParsedNarration {
  raw: string;
  paymentMode: 'UPI' | 'POS' | 'ECOM' | 'WALLET' | 'EMI' | 'UNKNOWN';
  merchantHint: string;
  locationHint?: string;
  providerHint?: string; // e.g., Razorpay, PayU
}

@Injectable()
export class NarrationParserService {
  
  parse(rawNarration: string): ParsedNarration {
    const result: ParsedNarration = {
      raw: rawNarration,
      paymentMode: 'UNKNOWN',
      merchantHint: rawNarration,
    };

    const upper = rawNarration.toUpperCase();

    // Detect Payment Mode
    if (upper.includes('UPI/') || upper.startsWith('UPI-') || upper.includes('@SBI') || upper.includes('@YBL') || upper.includes('@PAYTM')) {
      result.paymentMode = 'UPI';
    } else if (upper.includes('POS ') || upper.startsWith('POS/')) {
      result.paymentMode = 'POS';
    } else if (upper.includes('ECOM ') || upper.includes('MOTO ')) {
      result.paymentMode = 'ECOM';
    }

    // Attempt to extract provider hints
    if (upper.includes('RAZORPAY') || upper.includes('RZPX')) {
      result.providerHint = 'RAZORPAY';
    } else if (upper.includes('PAYU')) {
      result.providerHint = 'PAYU';
    } else if (upper.includes('PAYTM')) {
      result.providerHint = 'PAYTM';
    }

    // Clean out known bank prefix clutter to isolate the merchant hint
    let cleaned = upper;
    
    // HDFC standard pattern: POS XXXXXX MERCHANT NAME CITY
    if (cleaned.startsWith('POS ')) {
      cleaned = cleaned.replace(/^POS \d+ /, '');
    }

    // Remove UPI handles (e.g., swiggy@hdfcbank)
    cleaned = cleaned.replace(/[a-zA-Z0-9.\-_]+@[a-zA-Z0-9]+/, '');

    // Remove generic prefixes
    cleaned = cleaned.replace(/^(UPI\/P2M\/|UPI\/P2A\/|UPI\/|CRV\/)/, '');

    result.merchantHint = cleaned.trim();

    return result;
  }
}
