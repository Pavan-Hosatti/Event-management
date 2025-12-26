import React, { useState } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

const MOCK = {
  title: 'Suggested Plan for Event',
  items: [
    'Optimal date: Saturday, Feb 20, 2026',
    'Target audience: Students & Enthusiasts (2nd–3rd year)',
    'Promotion: Email + WhatsApp + Posters (Low budget)',
    'Expected turnout: 120–150'
  ]
};

export default function AISuggestions() {
  const { t } = useTranslation();
  const [form, setForm] = useState({ title: '', date: '', venue: '', audience: '', budget: '' });
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState(null);
  const [error, setError] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuggestions(null);

    try {
      const res = await axios.post(`${API_BASE}/ai/event-suggestions`, form, { timeout: 20000 });
      setSuggestions(res?.data?.suggestions ?? MOCK);
    } catch (err) {
      console.warn('AI service failed:', err?.message);
      setError(t('ai.errorContact'));
      setSuggestions(MOCK);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-slate-800 pt-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow">
          <h1 className="text-2xl font-bold text-indigo-900 dark:text-white mb-4">{t('aiSuggestions.title', 'AI Event Suggestions')}</h1>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">{t('aiSuggestions.subtitle', 'Tell us a bit about your event and we will suggest dates, promotion and expected turnout.')}</p>

          <form onSubmit={submit} className="space-y-4">
            <input
              className="w-full p-3 rounded border bg-white text-gray-900"
              placeholder={t('aiSuggestions.fields.title', 'Event title')}
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />

            <div className="grid grid-cols-2 gap-4">
              <input
                className="p-3 rounded border bg-white text-gray-900"
                placeholder={t('aiSuggestions.fields.date', 'Preferred date')}
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />
              <input
                className="p-3 rounded border bg-white text-gray-900"
                placeholder={t('aiSuggestions.fields.venue', 'Venue / online')}
                value={form.venue}
                onChange={(e) => setForm({ ...form, venue: e.target.value })}
              />
            </div>

            <input
              className="w-full p-3 rounded border bg-white text-gray-900"
              placeholder={t('aiSuggestions.fields.audience', 'Target audience (comma separated)')}
              value={form.audience}
              onChange={(e) => setForm({ ...form, audience: e.target.value })}
            />

            <input
              className="w-full p-3 rounded border bg-white text-gray-900"
              placeholder={t('aiSuggestions.fields.budget', 'Promotion budget (INR)')}
              value={form.budget}
              onChange={(e) => setForm({ ...form, budget: e.target.value })}
            />

            <div className="flex items-center justify-between">
              <button type="submit" disabled={loading} className="px-5 py-2 rounded-lg bg-indigo-600 text-white font-semibold">
                {loading ? t('aiSuggestions.loading', 'Generating...') : t('aiSuggestions.submit', 'Get suggestions')}
              </button>

              <button type="button" onClick={() => { setForm({ title: '', date: '', venue: '', audience: '', budget: '' }); setSuggestions(null); setError(null); }} className="text-sm text-gray-500">
                {t('aiSuggestions.reset', 'Reset')}
              </button>
            </div>
          </form>

          {error && <div className="mt-4 p-3 rounded bg-yellow-50 text-yellow-700">{error}</div>}

          {suggestions && (
            <div className="mt-6 bg-gray-50 dark:bg-slate-900 rounded-lg p-4">
              <h2 className="font-semibold text-lg mb-2">{suggestions.title}</h2>
              <ul className="list-disc list-inside text-sm space-y-2 text-gray-700 dark:text-gray-300">
                {suggestions.items.map((it, i) => (<li key={i}>{it}</li>))}
              </ul>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

