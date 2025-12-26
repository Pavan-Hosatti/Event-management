const fetch = require('node-fetch');

const BASE = process.env.BASE_URL || 'http://localhost:5000';

const endpoints = [
  { method: 'GET', url: '/api/health' },
  { method: 'GET', url: '/api/predict/examples' },
  { method: 'GET', url: '/api/events' },
  { method: 'GET', url: '/api/admin/stats' },
  { method: 'GET', url: '/api/admin/export?type=registrations' },
  { method: 'GET', url: '/api/stats' },
  { method: 'GET', url: '/api/crops/marketplace' },
  { method: 'GET', url: '/api/ai-grader/status' }
];

(async () => {
  for (const ep of endpoints) {
    try {
      const res = await fetch(`${BASE}${ep.url}`);
      console.log(`${ep.method} ${ep.url} -> ${res.status}`);
      const text = await res.text();
      console.log('  Body:', text.substring(0, 200).replace(/\n/g, ' '));
    } catch (err) {
      console.error(`Error hitting ${ep.url}:`, err.message);
    }
  }
})();
