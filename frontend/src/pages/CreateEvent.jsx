// src/pages/CreateEvent.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { eventAPI } from '../utils/api';
import { Calendar, MapPin, Users, Tag, FileText, Image, CheckCircle } from 'lucide-react';
import { toast } from 'react-hot-toast'; // If using react-hot-toast
// OR if you have another toast library, import it

export default function CreateEvent() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '10:00',
    venue: '',
    capacity: '',
    category: 'Technical',
    tags: '',
    imageUrl: '',
    status: 'published'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const categories = [
    'Technical', 'Workshop', 'Seminar', 'Cultural', 
    'Sports', 'Competition', 'Webinar', 'Conference', 'Other'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

// ADD THIS TO YOUR CreateEvent.jsx AFTER SUCCESSFUL EVENT CREATION:

const handleSubmit = async (e) => {
  e.preventDefault();
  
  try {
    // Your existing event creation code...
    const response = await fetch('http://localhost:5000/api/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(eventData)
    });

    const data = await response.json();

    if (data.success) {
      toast.success('Event created successfully!');
      
      // ✅ ADD THESE TWO LINES - Trigger refresh in EventCatalog
      localStorage.setItem('refreshEventCatalog', Date.now().toString());
      window.dispatchEvent(new Event('storage'));
      
      // Navigate or reset form
      navigate('/admin-dashboard');
    } else {
      toast.error(data.message || 'Failed to create event');
    }
  } catch (error) {
    console.error('Error creating event:', error);
    toast.error('Failed to create event');
  }
};

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 text-center max-w-md">
          <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Event Created Successfully!</h2>
          <p className="text-gray-300">Redirecting to events page...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Create New Event</h1>
          <p className="text-gray-300">Fill in the details to create an event</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 space-y-6">
          
          {/* Error Message */}
          {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-200 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Event Title */}
          <div>
            <label className="block text-white font-semibold mb-2">
              <FileText className="inline w-5 h-5 mr-2" />
              Event Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Hackathon 2025"
              required
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-white font-semibold mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe your event..."
              rows={4}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-white font-semibold mb-2">
                <Calendar className="inline w-5 h-5 mr-2" />
                Event Date *
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-white font-semibold mb-2">
                Time
              </label>
              <input
                type="time"
                name="time"
                value={formData.time}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          {/* Venue and Capacity */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-white font-semibold mb-2">
                <MapPin className="inline w-5 h-5 mr-2" />
                Venue *
              </label>
              <input
                type="text"
                name="venue"
                value={formData.venue}
                onChange={handleChange}
                placeholder="e.g., Main Auditorium"
                required
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-white font-semibold mb-2">
                <Users className="inline w-5 h-5 mr-2" />
                Capacity *
              </label>
              <input
                type="number"
                name="capacity"
                value={formData.capacity}
                onChange={handleChange}
                placeholder="e.g., 300"
                required
                min="1"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-white font-semibold mb-2">
              <Tag className="inline w-5 h-5 mr-2" />
              Category
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {categories.map(cat => (
                <option key={cat} value={cat} className="bg-slate-800">
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-white font-semibold mb-2">
              Tags (comma-separated)
            </label>
            <input
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              placeholder="e.g., coding, hackathon, tech"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Image URL */}
          <div>
            <label className="block text-white font-semibold mb-2">
              <Image className="inline w-5 h-5 mr-2" />
              Image URL (optional)
            </label>
            <input
              type="url"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleChange}
              placeholder="https://example.com/image.jpg"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-white font-semibold mb-2">
              Event Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="draft" className="bg-slate-800">Draft</option>
              <option value="published" className="bg-slate-800">Published</option>
            </select>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex-1 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg font-semibold transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Creating...' : 'Create Event'}
            </button>
          </div>
        </form>

        {/* Debug Info (Remove in production) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-4 p-4 bg-black/50 rounded-lg text-xs text-gray-400">
            <p><strong>User:</strong> {user?.email} ({user?.role})</p>
            <p><strong>Token:</strong> {localStorage.getItem('token') ? '✅ Present' : '❌ Missing'}</p>
          </div>
        )}
      </div>
    </div>
  );
}