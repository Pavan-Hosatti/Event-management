import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { eventAPI } from '../utilis/api';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const CreateEventMinimal = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    if (!title || !date) {
      setMessage({ type: 'error', text: 'Please provide title and date' });
      return;
    }

    setIsSubmitting(true);

try {
  const response = await eventAPI.create({ title, date });
  // OR if you're using the default api instance:
  // const response = await api.post('/events/create', { title, date });
  
  setMessage({ type: 'success', text: 'Event created successfully' });
  setTimeout(() => navigate('/admin-dashboard'), 1200);
} catch (err) {
  setMessage({ type: 'error', text: err.message || 'Error creating event' });
} finally {
  setIsSubmitting(false);
}
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
          <div className="flex items-center gap-3 mb-4">
            <Calendar className="w-6 h-6 text-indigo-600" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('Create New Event')}</h1>
          </div>

          {message && (
            <div className={`p-3 rounded-md mb-4 ${message.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('Event Title')}</label>
              <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-700 dark:text-white" placeholder="Tech Summit 2026" />
            </div>

            <div>
              <label className="block text-sm font medium text-gray-700 dark:text-gray-300 mb-1">{t('Date')}</label>
              <input value={date} onChange={(e) => setDate(e.target.value)} type="date" className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-700 dark:text-white" />
            </div>

            <div className="flex items-center gap-3">
              <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
                {isSubmitting ? 'Saving...' : 'Create Event'}
              </button>
              <button type="button" onClick={() => navigate(-1)} className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                Cancel
              </button>
            </div>

            <p className="text-sm text-gray-500 mt-3">{t('You can add more details from the admin dashboard after creating the event.')}</p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateEventMinimal;
