import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Users, MapPin, Clock, Search, Filter, Edit, Trash2, Eye, Download } from 'lucide-react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '/api';
const axiosInstance = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

const AdminEvents = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
    const response = await axiosInstance.get('/events');  // Changed here! 
      setEvents(response.data.events || response.data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = events.filter(event => {
    if (search && !event.title.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    if (filter !== 'all' && event.status !== filter) {
      return false;
    }
    return true;
  });

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Event Management</h1>
          <p className="text-gray-600">Manage all events, registrations, and attendance</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-6 mb-6 shadow">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search events..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <button
              onClick={() => navigate('/create-event')}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Create Event
            </button>
          </div>
        </div>

        {/* Events Table */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading events...</p>
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="p-8 text-center">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No events found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Event</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date & Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Venue</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Registrations</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredEvents.map((event) => (
                    <tr key={event._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-900">{event.title}</p>
                          <p className="text-sm text-gray-500">{event.category}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span>{new Date(event.date).toLocaleDateString()}</span>
                          {event.time && (
                            <>
                              <Clock className="w-4 h-4 text-gray-400 ml-2" />
                              <span>{event.time}</span>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span>{event.venue}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-gray-400" />
                          <span>{event.registered || 0}/{event.capacity}</span>
                          {event.capacity > 0 && (
                            <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-blue-500"
                                style={{ width: `${Math.min((event.registered || 0) / event.capacity * 100, 100)}%` }}
                              ></div>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          event.status === 'published' ? 'bg-green-100 text-green-800' :
                          event.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                          event.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {event.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => navigate(`/admin/events/${event._id}/manage`)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                            title="Manage"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => navigate(`/create-event?edit=${event._id}`)}
                            className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg" title="Delete">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminEvents;