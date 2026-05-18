import { create } from 'zustand';
import { adminApiService } from '../services/adminApi';

// ── Types ─────────────────────────────────────────────────────
interface SystemHealth {
  overallStatus: 'healthy' | 'degraded' | 'critical';
  scraperHealth: { successRate: number; failedJobs: number };
  aiProviderHealth: { available: number; total: number };
  queueHealth: { pending: number; failed: number };
  pendingVerifications: number;
  generatedAt: string;
}

interface AdminDashboardState {
  health: SystemHealth | null;
  flags: any[];
  auditLogs: any[];
  scraperJobs: any[];
  benefitChanges: any[];
  isLoading: boolean;
  error: string | null;

  loadHealth: () => Promise<void>;
  loadFlags: () => Promise<void>;
  loadAuditLogs: () => Promise<void>;
  loadScraperJobs: () => Promise<void>;
  loadBenefitChanges: () => Promise<void>;
  updateFlag: (key: string, data: any) => Promise<void>;
  killSwitch: (key: string, kill: boolean) => Promise<void>;
  markChangeReviewed: (id: string) => Promise<void>;
}

export const useAdminStore = create<AdminDashboardState>((set, get) => ({
  health: null,
  flags: [],
  auditLogs: [],
  scraperJobs: [],
  benefitChanges: [],
  isLoading: false,
  error: null,

  loadHealth: async () => {
    set({ isLoading: true });
    try { set({ health: await adminApiService.getSystemHealth() }); }
    catch (e: any) { set({ error: e.message }); }
    finally { set({ isLoading: false }); }
  },

  loadFlags: async () => {
    const flags = await adminApiService.getFlags();
    set({ flags });
  },

  loadAuditLogs: async () => {
    const auditLogs = await adminApiService.getAuditLogs(100);
    set({ auditLogs });
  },

  loadScraperJobs: async () => {
    const scraperJobs = await adminApiService.getScraperJobs(30);
    set({ scraperJobs });
  },

  loadBenefitChanges: async () => {
    const benefitChanges = await adminApiService.getBenefitChanges(20);
    set({ benefitChanges });
  },

  updateFlag: async (key, data) => {
    await adminApiService.updateFlag(key, data);
    await get().loadFlags();
  },

  killSwitch: async (key, kill) => {
    await adminApiService.killSwitch(key, kill);
    await get().loadFlags();
  },

  markChangeReviewed: async (id) => {
    await adminApiService.markChangeReviewed(id);
    set(s => ({ benefitChanges: s.benefitChanges.filter(c => c.id !== id) }));
  },
}));
