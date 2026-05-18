import { Injectable, Logger } from '@nestjs/common';
import * as pdfParse from 'pdf-parse';
import { ScrapeJob, ScrapeResult } from '../interfaces/scraper.interface';
import axios from 'axios';

@Injectable()
export class PDFAdapter {
  private readonly logger = new Logger(PDFAdapter.name);

  async fetchAndParse(job: ScrapeJob): Promise<Omit<ScrapeResult, 'jobId' | 'isCached'> & { extractedText: string }> {
    const start = Date.now();

    const res = await axios.get(job.url, {
      responseType: 'arraybuffer',
      timeout: 30000,
      headers: { 'User-Agent': 'CardIQ/1.0 PDF Bot' },
    });

    const buffer = Buffer.from(res.data);
    const parsed = await pdfParse(buffer);

    return {
      bank: job.bank,
      url: job.url,
      rawPdfBuffer: buffer,
      rawText: parsed.text,
      extractedText: parsed.text,
      adapterUsed: 'pdf',
      fetchedAt: new Date(),
      httpStatus: res.status,
      fetchLatencyMs: Date.now() - start,
    };
  }
}
