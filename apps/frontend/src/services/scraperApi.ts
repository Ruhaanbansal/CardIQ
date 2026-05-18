import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';

export const scraperApi = {
  runJob: async (body: { bank: string; url: string; sourceType: string; priority?: number; cardId?: string }) => {
    const res = await axios.post(`${API_BASE}/scraper/run`, body);
    return res.data;
  },

  runAll: async () => {
    const res = await axios.post(`${API_BASE}/scraper/run-all`);
    return res.data;
  },

  retryJob: async (jobId: string) => {
    const res = await axios.post(`${API_BASE}/scraper/retry`, { jobId });
    return res.data;
  },

  getJobs: async (limit = 20) => {
    const res = await axios.get(`${API_BASE}/scraper/jobs`, { params: { limit } });
    return res.data;
  },

  getSnapshots: async (bank: string, limit = 10) => {
    const res = await axios.get(`${API_BASE}/scraper/snapshots`, { params: { bank, limit } });
    return res.data;
  },

  getChanges: async (limit = 20) => {
    const res = await axios.get(`${API_BASE}/scraper/changes`, { params: { limit } });
    return res.data;
  },

  getFailures: async (limit = 20) => {
    const res = await axios.get(`${API_BASE}/scraper/failures`, { params: { limit } });
    return res.data;
  },

  getSourceHealth: async () => {
    const res = await axios.get(`${API_BASE}/scraper/source-health`);
    return res.data;
  },
};
