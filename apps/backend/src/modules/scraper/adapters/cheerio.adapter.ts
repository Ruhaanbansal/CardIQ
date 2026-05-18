import { Injectable } from '@nestjs/common';
import * as cheerio from 'cheerio';
import { ScrapeResult, ScrapeJob } from '../interfaces/scraper.interface';
import axios from 'axios';

@Injectable()
export class CheerioAdapter {
  async fetchPage(job: ScrapeJob): Promise<Omit<ScrapeResult, 'jobId' | 'isCached'>> {
    const start = Date.now();

    const res = await axios.get(job.url, {
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; CardIQ/1.0; +https://cardiq.in/bot)',
        Accept: 'text/html,application/xhtml+xml',
      },
      maxRedirects: 5,
    });

    return {
      bank: job.bank,
      url: job.url,
      rawHtml: res.data as string,
      adapterUsed: 'cheerio',
      fetchedAt: new Date(),
      httpStatus: res.status,
      fetchLatencyMs: Date.now() - start,
    };
  }

  extractText(html: string): string {
    const $ = cheerio.load(html);
    // Remove scripts, styles, and nav noise
    $('script, style, nav, footer, header, .cookie-banner, .popup').remove();
    return $('body').text().replace(/\s+/g, ' ').trim();
  }

  extractTableData(html: string): string[][] {
    const $ = cheerio.load(html);
    const tables: string[][] = [];
    $('table').each((_, table) => {
      $(table).find('tr').each((_, row) => {
        const cells = $(row)
          .find('td, th')
          .map((_, el) => $(el).text().trim())
          .get();
        if (cells.length > 0) tables.push(cells);
      });
    });
    return tables;
  }
}
