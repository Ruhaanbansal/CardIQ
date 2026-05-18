import axios from 'axios';

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';

const adminApi = axios.create({ baseURL: `${BASE}/admin` });

// Attach admin JWT from localStorage
adminApi.interceptors.request.use(cfg => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('cardiq_admin_token') : null;
  if (token && cfg.headers) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

export const adminApiService = {
  // System
  getSystemHealth:  ()            => adminApi.get('/system-health').then(r => r.data),
  getQueueStats:    ()            => adminApi.get('/queue-stats').then(r => r.data),

  // Cards
  getCards:         (search?: string, limit = 50) => adminApi.get('/cards', { params: { search, limit } }).then(r => r.data),
  createCard:       (body: any)   => adminApi.post('/cards', body).then(r => r.data),
  updateCard:       (id: string, body: any) => adminApi.put(`/cards/${id}`, body).then(r => r.data),
  deleteCard:       (id: string)  => adminApi.delete(`/cards/${id}`),

  // Rules
  getRules:         (cardId?: string) => adminApi.get('/rules', { params: { cardId } }).then(r => r.data),
  createRule:       (body: any)   => adminApi.post('/rules', body).then(r => r.data),
  updateRule:       (id: string, body: any) => adminApi.put(`/rules/${id}`, body).then(r => r.data),

  // Merchants
  getMerchantQueue: (limit = 50)  => adminApi.get('/merchants/review', { params: { limit } }).then(r => r.data),
  approveMerchant:  (merchantId: string) => adminApi.post('/merchants/approve', { merchantId }).then(r => r.data),
  mergeMerchants:   (sourceId: string, targetId: string) => adminApi.post('/merchants/merge', { sourceId, targetId }).then(r => r.data),

  // Scrapers
  getScraperJobs:   (limit = 30)  => adminApi.get('/scrapers', { params: { limit } }).then(r => r.data),
  retryAllScrapers: ()            => adminApi.post('/scrapers/retry-all').then(r => r.data),

  // Feature Flags
  getFlags:         (env?: string) => adminApi.get('/feature-flags', { params: { env } }).then(r => r.data),
  updateFlag:       (key: string, body: any) => adminApi.put(`/feature-flags/${key}`, body).then(r => r.data),
  killSwitch:       (key: string, kill: boolean) => adminApi.post(`/feature-flags/${key}/kill`, { kill }).then(r => r.data),

  // Audit
  getAuditLogs:     (limit = 100, action?: string) => adminApi.get('/audit-logs', { params: { limit, action } }).then(r => r.data),

  // Moderation
  suspendUser:      (id: string, reason: string) => adminApi.post(`/users/${id}/suspend`, { reason }).then(r => r.data),
  reinstateUser:    (id: string) => adminApi.post(`/users/${id}/reinstate`).then(r => r.data),

  // Benefit Changes
  getBenefitChanges: (limit = 20) => adminApi.get('/benefit-changes', { params: { limit } }).then(r => r.data),
  markChangeReviewed: (id: string) => adminApi.post(`/benefit-changes/${id}/reviewed`).then(r => r.data),
};
