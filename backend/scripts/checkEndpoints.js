const axios = require('axios');

const BASE = 'http://localhost:5000';
const endpoints = [
  '/api/health',
  '/api/predict/examples',
  '/api/events',
  '/api/admin/stats',
  '/api/admin/export?type=registrations',
  '/api/stats',
  '/api/crops/marketplace',
  '/api/ai-grader/status'
];

(async () => {
  for (const ep of endpoints) {
    try {
      const url = `${BASE}${ep}`;
      console.log(`REQUEST -> ${url}`);
      const res = await axios.get(url, { timeout: 5000 });
      console.log(`  ${ep} -> ${res.status} ${res.statusText}`);
      console.log(`  Body: ${JSON.stringify(res.data).substring(0,200)}`);
    } catch (err) {
      console.error(`  ERROR ${ep}:`, err.message);
      if (err.response) {
        console.error('  Response status:', err.response.status);
        console.error('  Response data:', JSON.stringify(err.response.data).substring(0,200));
      }
    }
  }
})();