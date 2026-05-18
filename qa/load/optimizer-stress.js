import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 50 },  // Ramp up to 50 users
    { duration: '1m', target: 50 },   // Stay at 50 users for 1 min
    { duration: '30s', target: 200 }, // Spike to 200 users (stress test HPA)
    { duration: '30s', target: 0 },   // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests must complete below 500ms
    http_req_failed: ['rate<0.01'],   // Error rate must be less than 1%
  },
};

const BASE_URL = __ENV.API_BASE_URL || 'http://localhost:3001';

export default function () {
  const payload = JSON.stringify({
    merchantName: 'Amazon',
    amount: 5000,
    walletCardIds: ['sbi_cashback', 'hdfc_millennia', 'axis_atlas']
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
      // 'Authorization': `Bearer ${__ENV.TEST_TOKEN}`,
    },
  };

  const res = http.post(`${BASE_URL}/api/optimizer/calculate`, payload, params);

  check(res, {
    'is status 200': (r) => r.status === 200,
    'has bestCardId': (r) => r.json().bestCardId !== undefined,
  });

  sleep(1);
}
