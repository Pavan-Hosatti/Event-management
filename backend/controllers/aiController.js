const axios = require('axios');
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:5001';

exports.getEventSuggestions = async (req, res) => {
  try {
    const payload = req.body;

    // Try forwarding to ML service
    try {
      const response = await axios.post(`${ML_SERVICE_URL}/event-suggestions`, payload, { timeout: 15000 });
      if (response?.data) return res.json({ success: true, suggestions: response.data });
    } catch (err) {
      console.warn('ML service forward failed:', err.message);
    }

    // Fallback: simple rule-based suggestions
    const { title = 'Event', date = '', venue = '', audience = '', budget = '' } = payload;
    const items = [];
    if (date) items.push(`Optimal date: ${date}`);
    if (audience) items.push(`Target audience: ${audience}`);
    items.push(`Promotion: Email + WhatsApp + Posters (budget: ${budget || 'low'})`);
    items.push('Expected turnout: 50–150 based on size and promotion');

    return res.json({ success: true, suggestions: { title: `Suggested Plan for ${title}`, items } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'AI suggestions failed', error: err.message });
  }
};