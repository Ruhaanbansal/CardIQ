import { Injectable, Logger } from '@nestjs/common';
import { Browser, BrowserContext, chromium } from 'playwright';
import { ScrapeResult, ScrapeJob } from '../interfaces/scraper.interface';

@Injectable()
export class PlaywrightAdapter {
  private readonly logger = new Logger(PlaywrightAdapter.name);
  private browser: Browser | null = null;

  async fetchPage(job: ScrapeJob): Promise<Omit<ScrapeResult, 'jobId' | 'isCached'>> {
    const start = Date.now();
    let context: BrowserContext | null = null;

    try {
      if (!this.browser) {
        this.browser = await chromium.launch({
          headless: true,
          args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
        });
      }

      context = await this.browser.newContext({
        userAgent:
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
          '(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        viewport: { width: 1280, height: 800 },
        extraHTTPHeaders: {
          'Accept-Language': 'en-IN,en;q=0.9',
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
      });

      const page = await context.newPage();

      // Anti-bot: Mask webdriver flag
      await page.addInitScript(() => {
        Object.defineProperty(navigator, 'webdriver', { get: () => false });
      });

      const response = await page.goto(job.url, {
        waitUntil: 'domcontentloaded',
        timeout: 30000,
      });

      // Wait for body to be present
      await page.waitForSelector('body', { timeout: 10000 });

      // Throttle to be respectful
      await page.waitForTimeout(1000 + Math.random() * 1000);

      const rawHtml = await page.content();

      return {
        bank: job.bank,
        url: job.url,
        rawHtml,
        adapterUsed: 'playwright',
        fetchedAt: new Date(),
        httpStatus: response?.status(),
        fetchLatencyMs: Date.now() - start,
      };
    } finally {
      await context?.close();
    }
  }

  async close() {
    await this.browser?.close();
    this.browser = null;
  }
}
