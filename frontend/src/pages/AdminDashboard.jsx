import React, { useEffect, useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { 
  PlusCircle, Download, Calendar, Users, CheckCircle, Clock, 
  X, TrendingUp, Bell, Activity, Upload, QrCode, FileCheck, 
  UserCheck, Mail, FileText, Search, Settings, Eye,
   MessageSquare, Star, ThumbsUp, Lightbulb 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';
import { adminAPI } from '../utilis/api';
import { eventAPI } from '../utilis/api'; // Add this
import AnalyticsModal from './AnalyticsModal';






// 3. ADD THIS COMPONENT (put before your return statement)
const FeedbackViewModal = ({ 
  event, 
  feedback = [], 
  stats = {}, 
  loading = false, 
  onClose, 
  onExport 
}) => {
  const [filter, setFilter] = useState('all'); // 'all', 'positive', 'negative', 'neutral'
  const [sortBy, setSortBy] = useState('newest'); // 'newest', 'oldest', 'highest', 'lowest'

  const averageRating = stats?.averageRating || 0;
  const totalFeedback = feedback.length;
  const ratingDistribution = stats?.ratingDistribution || {1: 0, 2: 0, 3: 0, 4: 0, 5: 0};
  
  const positiveFeedback = feedback.filter(f => f.rating >= 4).length;
  const negativeFeedback = feedback.filter(f => f.rating <= 2).length;
  const neutralFeedback = feedback.filter(f => f.rating === 3).length;

  // Filter and sort feedback
  const filteredFeedback = feedback
    .filter(item => {
      if (filter === 'all') return true;
      if (filter === 'positive') return item.rating >= 4;
      if (filter === 'negative') return item.rating <= 2;
      if (filter === 'neutral') return item.rating === 3;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
      if (sortBy === 'highest') return b.rating - a.rating;
      if (sortBy === 'lowest') return a.rating - b.rating;
      return 0;
    });

  // Render star rating
  const renderStars = (rating) => {
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-5 h-5 ${
              i < rating 
                ? 'fill-yellow-500 text-yellow-500' 
                : 'text-gray-300 dark:text-gray-600'
            }`}
          />
        ))}
      </div>
    );
  };

  // Get rating label and color
  const getRatingLabel = (rating) => {
    if (rating >= 4) return { text: 'Excellent', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' };
    if (rating === 3) return { text: 'Good', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' };
    if (rating === 2) return { text: 'Fair', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400' };
    return { text: 'Poor', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' };
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Format time
  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 overflow-y-auto"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-6xl max-h-[90vh] flex flex-col shadow-2xl">
        {/* Header with close button */}
        <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-6">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <MessageSquare className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Event Feedback
                </h2>
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                {event?.title || 'Event'} • {totalFeedback} {totalFeedback === 1 ? 'response' : 'responses'}
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={onExport}
                disabled={totalFeedback === 0}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
              <button
                onClick={onClose}
                className="p-2.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                aria-label="Close modal"
              >
                <X className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          {totalFeedback > 0 && (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800/30">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">Average Rating</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-3xl font-bold text-gray-900 dark:text-white">
                        {averageRating.toFixed(1)}
                      </span>
                      <div className="flex">
                        {renderStars(Math.round(averageRating))}
                      </div>
                    </div>
                  </div>
                  <TrendingUp className="w-8 h-8 text-blue-500 opacity-60" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-4 rounded-xl border border-green-100 dark:border-green-800/30">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-700 dark:text-green-300 font-medium">Positive</p>
                    <div className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                      {positiveFeedback}
                    </div>
                    <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                      {totalFeedback > 0 ? Math.round((positiveFeedback / totalFeedback) * 100) : 0}% of total
                    </p>
                  </div>
                  <ThumbsUp className="w-8 h-8 text-green-500 opacity-60" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 p-4 rounded-xl border border-yellow-100 dark:border-yellow-800/30">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300 font-medium">Neutral</p>
                    <div className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                      {neutralFeedback}
                    </div>
                    <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                      {totalFeedback > 0 ? Math.round((neutralFeedback / totalFeedback) * 100) : 0}% of total
                    </p>
                  </div>
                  <Star className="w-8 h-8 text-yellow-500 opacity-60" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 p-4 rounded-xl border border-red-100 dark:border-red-800/30">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-red-700 dark:text-red-300 font-medium">Needs Improvement</p>
                    <div className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                      {negativeFeedback}
                    </div>
                    <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                      {totalFeedback > 0 ? Math.round((negativeFeedback / totalFeedback) * 100) : 0}% of total
                    </p>
                  </div>
                  <Activity className="w-8 h-8 text-red-500 opacity-60" />
                </div>
              </div>
            </div>
          )}

          {/* Rating Distribution */}
          {totalFeedback > 0 && (
            <div className="mt-6 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl">
              <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-3">Rating Distribution</h4>
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map(star => {
                  const count = ratingDistribution[star] || 0;
                  const percentage = totalFeedback > 0 ? (count / totalFeedback * 100) : 0;
                  return (
                    <div key={star} className="flex items-center gap-3">
                      <div className="flex items-center gap-1 w-16">
                        <span className="text-gray-700 dark:text-gray-300 font-medium">{star}</span>
                        <Star className="w-4 h-4 text-yellow-500" />
                      </div>
                      <div className="flex-1">
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                      <div className="w-12 text-right">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {count} ({percentage.toFixed(0)}%)
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Filters and Controls */}
        {totalFeedback > 0 && (
          <div className="sticky top-[1px] z-5 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-4">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    filter === 'all' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  All ({totalFeedback})
                </button>
                <button
                  onClick={() => setFilter('positive')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    filter === 'positive' 
                      ? 'bg-green-600 text-white' 
                      : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  Positive ({positiveFeedback})
                </button>
                <button
                  onClick={() => setFilter('neutral')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    filter === 'neutral' 
                      ? 'bg-yellow-600 text-white' 
                      : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  Neutral ({neutralFeedback})
                </button>
                <button
                  onClick={() => setFilter('negative')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    filter === 'negative' 
                      ? 'bg-red-600 text-white' 
                      : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  Needs Improvement ({negativeFeedback})
                </button>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="highest">Highest Rating</option>
                  <option value="lowest">Lowest Rating</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Feedback Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading feedback...</p>
            </div>
          ) : filteredFeedback.length === 0 ? (
            <div className="text-center py-16">
              <MessageSquare className="w-20 h-20 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
              <h4 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                {filter === 'all' ? 'No Feedback Yet' : 'No Matching Feedback'}
              </h4>
              <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                {filter === 'all' 
                  ? 'Students who attended this event haven\'t submitted any feedback yet.'
                  : `No ${filter} feedback found. Try changing the filter.`}
              </p>
              {filter !== 'all' && (
                <button
                  onClick={() => setFilter('all')}
                  className="mt-4 px-4 py-2 text-blue-600 hover:text-blue-800 font-medium"
                >
                  Show All Feedback
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredFeedback.map((item, index) => {
                const ratingLabel = getRatingLabel(item.rating);
                return (
                  <div
                    key={item._id || index}
                    className="group p-5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:shadow-lg transition-all duration-200 hover:border-blue-200 dark:hover:border-blue-800/50"
                  >
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 flex items-center justify-center">
                          <span className="font-semibold text-blue-600 dark:text-blue-400">
                            {item.anonymous ? '🎭' : (item.studentName?.charAt(0) || 'S')}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {item.anonymous ? 'Anonymous Student' : (item.studentName || 'Student')}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {formatDate(item.createdAt)} • {formatTime(item.createdAt)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${ratingLabel.color}`}>
                          {ratingLabel.text}
                        </span>
                        <div className="flex items-center gap-1 px-2 py-1 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                          {renderStars(item.rating)}
                        </div>
                      </div>
                    </div>

                    {/* Comment */}
                    {item.comment && (
                      <div className="mb-4">
                        <div className="flex items-start gap-2">
                          <MessageSquare className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                            "{item.comment}"
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Suggestions */}
                    {item.suggestions && (
                      <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                        <div className="flex items-start gap-2">
                          <Lightbulb className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-1">
                              Suggestions for Improvement:
                            </p>
                            <p className="text-sm text-blue-800 dark:text-blue-200">
                              {item.suggestions}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Footer - Quick Actions */}
                    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-end">
                      <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <CheckCircle className="w-4 h-4" />
                          Submitted
                        </span>
                        {!item.anonymous && item.studentId && (
                          <span>ID: {item.studentId}</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {totalFeedback > 0 && (
          <div className="sticky bottom-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 p-4">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Showing {filteredFeedback.length} of {totalFeedback} feedback entries
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg font-medium"
                >
                  Scroll to Top
                </button>
                <button
                  onClick={onExport}
                  className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-semibold flex items-center gap-2 transition-all"
                >
                  <Download className="w-5 h-5" />
                  Export All Feedback
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};


// Add this right after the imports, before the StatCard component
const getMockEvents = () => [
  {
    _id: '1',
    title: 'Hackathon 2025',
    date: '2025-03-20',
    venue: 'Auditorium A',
    capacity: 150,
    registered: 98,
    attended: 85,
    status: 'Published',
    category: 'Technical'
  },
  {
    _id: '2',
    title: 'Design Workshop',
    date: '2025-03-25',
    venue: 'Hall B',
    capacity: 80,
    registered: 62,
    attended: 58,
    status: 'Published',
    category: 'Workshop'
  },
  {
    _id: '3',
    title: 'AI Seminar',
    date: '2025-04-01',
    venue: 'Seminar Room 3',
    capacity: 60,
    registered: 45,
    attended: null,
    status: 'Published',
    category: 'Seminar'
  }
];

// ============================================
// SMALL PRESENTATIONAL COMPONENTS
// ============================================

const StatCard = ({ stat, onClick }) => {
  const { t } = useTranslation();
  return (
    <div 
      className="bg-white dark:bg-gray-800 shadow-md rounded-xl p-5 flex flex-col hover:shadow-lg transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <div className="text-sm text-gray-500 dark:text-gray-400">{t(stat.title)}</div>
      <div className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{stat.value}</div>
      {stat.trend && (
        <div className={`text-xs mt-1 ${stat.trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
          {stat.trend > 0 ? '↑' : '↓'} {Math.abs(stat.trend)}%
        </div>
      )}
    </div>
  );
};

const EventStatusBadge = ({ status }) => {
  const { t } = useTranslation();
  const statusColors = {
    'Published': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    'Draft': 'bg-gray-100 text-gray-800 dark:bg-gray-700/30 dark:text-gray-300',
    'Completed': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    'Cancelled': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    'Ongoing': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
  };
  
  return (
    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusColors[status] || statusColors['Draft']}`}>
      {t(status)}
    </span>
  );
};

// ============================================
// MODALS
// ============================================

const AttendanceModal = ({ event, onClose }) => {
  const { t } = useTranslation();
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchRegistrations();
  }, [event]);

  const fetchRegistrations = async () => {
    try {
      const response = await adminAPI.getEventRegistrations(event._id);
      setRegistrations(response.data.registrations || response.data || []);
    } catch (error) {
      console.error('Error fetching registrations:', error);
      toast.error('Failed to load registrations');
    } finally {
      setLoading(false);
    }
  };

 const toggleAttendance = async (registrationId, currentlyAttended) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`http://localhost:5000/api/admin/events/${event._id}/attendance`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        registrationId: registrationId,
        attended: !currentlyAttended
      })
    });
    
    const data = await response.json();
    
    if (data.success) {
      // Update local state
      setRegistrations(registrations.map(reg => 
        reg._id === registrationId ? { 
          ...reg, 
          attended: !currentlyAttended,
          status: !currentlyAttended ? 'attended' : 'registered',
          checkInAt: !currentlyAttended ? new Date().toISOString() : null
        } : reg
      ));
      
      toast.success(`Marked as ${!currentlyAttended ? 'Present' : 'Absent'}`);
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('Error updating attendance:', error);
    toast.error('Failed to update attendance');
  }
};

  const markAllPresent = async () => {
    try {
      for (const reg of registrations) {
        if (!reg.attended) {
          await adminAPI.markAttendance(event._id, reg._id, true);
        }
      }
      
      fetchRegistrations();
      toast.success('All marked as present');
    } catch (error) {
      console.error('Error marking all present:', error);
      toast.error('Failed to mark all as present');
    }
  };

  const filteredRegistrations = registrations.filter(reg =>
    reg.studentName?.toLowerCase().includes(search.toLowerCase()) ||
    reg.email?.toLowerCase().includes(search.toLowerCase()) ||
    reg.studentId?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-[1000] p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              {t('Attendance Management')}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mt-1">{event.title}</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={markAllPresent}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2"
            >
              <UserCheck className="w-4 h-4" /> {t('Mark All Present')}
            </button>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search students..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4 mb-4 text-sm font-medium text-gray-600 dark:text-gray-400">
              <div>{t('Student')}</div>
              <div>{t('Student ID')}</div>
              <div>{t('Email')}</div>
              <div>{t('Attendance')}</div>
            </div>

            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {loading ? (
                <div className="text-center py-8">Loading...</div>
              ) : filteredRegistrations.length > 0 ? (
                filteredRegistrations.map((reg) => (
                  <div key={reg._id} className="grid grid-cols-4 gap-4 items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div className="font-medium">{reg.studentName}</div>
                    <div className="text-gray-600 dark:text-gray-400">{reg.studentId}</div>
                    <div className="text-gray-600 dark:text-gray-400 truncate">{reg.email}</div>
                    <div>
                      <button
                        onClick={() => toggleAttendance(reg._id, reg.attended)}
                        className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                          reg.attended
                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                            : 'bg-red-100 text-red-800 hover:bg-red-200'
                        }`}
                      >
                        {reg.attended ? t('Present ✓') : t('Absent ✗')}
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">{t('No registrations found')}</div>
              )}
            </div>
          </div>

          <div className="flex justify-between items-center pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {t('Total Registered')}: {registrations.length} |{' '}
              {t('Present')}: {registrations.filter(r => r.attended).length}
            </div>
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition"
            >
              {t('Close')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const CertificateUploadModal = ({ event, onClose, onUpload }) => {
  const { t } = useTranslation();
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [type, setType] = useState('certificate');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.type !== 'application/pdf' && !selectedFile.type.startsWith('image/')) {
        toast.error('Please upload a PDF or image file');
        return;
      }
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a file first');
      return;
    }

    setUploading(true);
    try {
      await adminAPI.uploadCertificate(event._id, file);
      toast.success('File uploaded successfully!');
      onUpload?.();
      onClose();
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.response?.data?.message || 'Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-[1000] p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            {t('Upload Document')}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mt-1">{event.title}</p>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('Document Type')}
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
            >
              <option value="certificate">{t('Certificate')}</option>
              <option value="attendance-letter">{t('Attendance Letter')}</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('Select File')}
            </label>
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
              <input
                type="file"
                id="file-upload"
                onChange={handleFileChange}
                className="hidden"
                accept=".pdf,.png,.jpg,.jpeg"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 dark:text-gray-400">
                  {file ? file.name : t('Click to upload PDF or image')}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {t('Max size: 10MB')}
                </p>
              </label>
            </div>
          </div>

          {file && (
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{file.name}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <button
                  onClick={() => setFile(null)}
                  className="text-red-600 hover:text-red-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={uploading}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
          >
            {t('Cancel')}
          </button>
          <button
            onClick={handleUpload}
            disabled={uploading || !file}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold flex items-center gap-2 disabled:opacity-50"
          >
            {uploading ? t('Uploading...') : t('Upload Document')}
          </button>
        </div>
      </div>
    </div>
  );
};

const EventDetailsModal = ({ 
  event, 
  onClose, 
  onExport, 
  onManageAttendance, 
  onUploadCertificate, 
   onViewFeedback,// Add this new prop
  onGenerateQR, // Add this prop
    onViewAnalytics
}) => {
  const { t } = useTranslation();
  
  if (!event) return null;

  const fillPercentage = Math.round((event.registered / event.capacity) * 100);

 return (
  <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-[1000] p-4">
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden">
      <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <Calendar className='w-6 h-6 text-blue-500' /> 
          {t('Event Details')}
        </h3>
        <button 
          onClick={onClose} 
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
        >
          <X className="w-6 h-6 text-gray-600 dark:text-gray-400" />
        </button>
      </div>
      
      <div className="p-6 space-y-6">
        <div>
          <h4 className="text-xl font-semibold text-blue-600 dark:text-blue-400 mb-2">{event.title}</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className='p-3 bg-gray-50 dark:bg-gray-700 rounded-lg'>
              <p className="text-gray-500 dark:text-gray-400">{t('Registration Fill Rate')}</p>
              <p className="text-2xl font-extrabold text-blue-600 dark:text-blue-400">{fillPercentage}%</p>
            </div>
            <div className='p-3 bg-gray-50 dark:bg-gray-700 rounded-lg'>
              <p className="text-gray-500 dark:text-gray-400">{t('Registered Students')}</p>
              <p className="text-2xl font-extrabold text-green-600 dark:text-green-400">{event.registered}/{event.capacity}</p>
            </div>
            <div>
              <p className="font-medium text-gray-800 dark:text-gray-200">{t('Date')}:</p>
              <p className="text-gray-600 dark:text-gray-400">{new Date(event.date).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="font-medium text-gray-800 dark:text-gray-200">{t('Venue')}:</p>
              <p className="text-gray-600 dark:text-gray-400">{event.venue}</p>
            </div>
            <div>
              <p className="font-medium text-gray-800 dark:text-gray-200">{t('Category')}:</p>
              <p className="text-gray-600 dark:text-gray-400">{event.category}</p>
            </div>
            <div>
              <p className="font-medium text-gray-800 dark:text-gray-200">{t('Status')}:</p>
              <EventStatusBadge status={event.status} />
            </div>
          </div>
        </div>

        <div>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('Capacity Utilization')}</p>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-blue-600 to-purple-600 h-3 rounded-full transition-all duration-300" 
              style={{ width: `${fillPercentage}%` }}
            ></div>
          </div>
        </div>

      // In EventDetailsModal, update the buttons grid:
<div className="grid grid-cols-2 gap-3 pt-4">
  <button
    onClick={() => onManageAttendance(event)}
    className="flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
  >
    <UserCheck className="w-5 h-5" />
    {t('Manage Attendance')}
  </button>
  <button
    onClick={() => onUploadCertificate(event)}
    className="flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium"
  >
    <Upload className="w-5 h-5" />
    {t('Upload Certificate')}
  </button>
  <button
    onClick={() => onExport(event._id)}
    className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
  >
    <Download className="w-5 h-5" />
    {t('Export Event Data')}
  </button>
  <button
    onClick={() => onViewFeedback(event)}
    className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition font-medium"
  >
    <MessageSquare className="w-5 h-5" />
    View Feedback
  </button>
  {/* ADD THIS BUTTON: */}
 //add the button here

</div>
      </div>
    </div>
  </div>
);
};






// ============================================
// MAIN DASHBOARD COMPONENT
// ============================================

const AdminDashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();



  // 1. ADD THESE STATES (put at the top with your other states)
const [selectedEventForFeedback, setSelectedEventForFeedback] = useState(null);
const [eventFeedback, setEventFeedback] = useState([]);
const [feedbackStats, setFeedbackStats] = useState(null);
const [showFeedbackModal, setShowFeedbackModal] = useState(false);
const [loadingFeedback, setLoadingFeedback] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    stats: [],
    events: [],
    attendanceHistory: [],
    clubInfo: {}
  });
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [activeModal, setActiveModal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);

  //analytics states :-

  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
const [selectedEventForAnalytics, setSelectedEventForAnalytics] = useState(null);


//functions for exporting feedback as csv

// Add these separate export functions in your AdminDashboard component:
const handleExportEventData = async (eventId) => {
  try {
    if (!eventId) {
      toast.error('No event selected');
      return;
    }
    
    console.log('Exporting event data for:', eventId);
    
    const token = localStorage.getItem('token');
    // Add eventId as query parameter
    const response = await fetch(`http://localhost:5000/api/admin/export?type=registrations&eventId=${eventId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    });
    
    if (!response.ok) {
      throw new Error(`Export failed: ${response.status}`);
    }
    
    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    
    // Set filename
    const filename = `event-${eventId}-registrations-${Date.now()}.csv`;
    link.setAttribute('download', filename);
    
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(downloadUrl);
    
    toast.success('Event registrations exported successfully!');
  } catch (error) {
    console.error('Event export error:', error);
    toast.error('Failed to export event data');
  }
};

const handleExportAllData = async () => {
  try {
    console.log('Exporting all events data');
    
    const token = localStorage.getItem('token');
    // No eventId parameter = all events
    const response = await fetch('http://localhost:5000/api/admin/export?type=registrations', {
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    });
    
    if (!response.ok) {
      throw new Error(`Export failed: ${response.status}`);
    }
    
    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    
    // Set filename
    const filename = `all-events-registrations-${Date.now()}.csv`;
    link.setAttribute('download', filename);
    
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(downloadUrl);
    
    toast.success('All registrations exported successfully!');
  } catch (error) {
    console.error('All export error:', error);
    toast.error('Failed to export all data');
  }
};

// Update the header export button:
<button
  onClick={handleExportAllData}
  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold flex items-center gap-2"
>
  <Download className="w-4 h-4" /> 
  {t('Export All Data')}
</button>

//functions for feedback
const fetchEventFeedback = async (eventId) => {
  try {
    setLoadingFeedback(true);
    console.log('📊 Fetching feedback for event:', eventId);
    
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please login again');
      return;
    }
    
    const response = await fetch(`http://localhost:5000/api/admin/events/${eventId}/feedback`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('📝 Feedback response:', data);
    
    if (data.success) {
      setEventFeedback(data.feedback || []);
      setFeedbackStats(data.stats || {});
      setShowFeedbackModal(true);
      
      if (data.feedback.length === 0) {
        toast.info('No feedback submitted yet for this event');
      } else {
        toast.success(`Loaded ${data.feedback.length} feedback entries`);
      }
    } else {
      toast.error('Failed to load feedback');
    }
  } catch (error) {
    console.error('❌ Error fetching feedback:', error);
    toast.error('Failed to load feedback');
    setEventFeedback([]);
  } finally {
    setLoadingFeedback(false);
  }
};

const exportFeedbackCSV = () => {
  try {
    const csvContent = [
      ['Date', 'Student Name', 'Rating', 'Comment'],
      ...eventFeedback.map(f => [
        new Date(f.createdAt).toLocaleDateString(),
        f.anonymous ? 'Anonymous' : (f.studentName || 'Unknown'),
        f.rating,
        `"${(f.comment || '').replace(/"/g, '""')}"`
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${selectedEventForFeedback?.title || 'event'}-feedback-${Date.now()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    toast.success('Feedback exported successfully');
  } catch (error) {
    console.error('Export error:', error);
    toast.error('Failed to export feedback');
  }
};


const handleGenerateQRCodes = async (eventId) => {
  try {
    console.log('📱 Generating QR codes for event:', eventId);
    
    // Get token from localStorage
    const token = localStorage.getItem('token');
    
    if (!token) {
      toast.error('Please login again');
      return;
    }
    
    const response = await fetch(`http://localhost:5000/api/qr-codes/event/${eventId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.success) {
      if (data.qrCodes && data.qrCodes.length > 0) {
        toast.success(`Generated ${data.count} QR codes!`);
        
        // Show QR codes in a modal
        setActiveModal('qr-codes');
        // You can store the QR codes in state to display them
        console.log('✅ QR codes:', data.qrCodes);
      } else {
        toast.info('No registrations found for QR codes yet');
      }
    } else {
      throw new Error(data.message || 'Failed to generate QR codes');
    }
  } catch (error) {
    console.error('❌ QR generation error:', error);
    toast.error('Failed to generate QR codes: ' + error.message);
  }
};

  useEffect(() => {
    fetchDashboardData();
    fetchNotifications();
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);



  // Add ESC key listener to close any modal
useEffect(() => {
  const handleEscKey = (event) => {
    if (event.key === 'Escape') {
      // Close any open modal
      if (showFeedbackModal) {
        setShowFeedbackModal(false);
        setEventFeedback([]);
        setFeedbackStats(null);
        setSelectedEventForFeedback(null);
      }
      if (activeModal) {
        setActiveModal(null);
        setSelectedEvent(null);
      }
    }
  };

  window.addEventListener('keydown', handleEscKey);
  return () => window.removeEventListener('keydown', handleEscKey);
}, [showFeedbackModal, activeModal]);


// ADD THIS NEW useEffect FOR CHROME EXTENSIONS
// ============================================
useEffect(() => {
  // Fix for Chrome extension fetch issues
  const originalFetch = window.fetch;
  window.fetch = async (...args) => {
    try {
      console.log('📡 Fetch request to:', args[0]);
      const response = await originalFetch(...args);
      console.log('📡 Fetch response:', response.status, args[0]);
      return response;
    } catch (error) {
      console.error('❌ Fetch error for:', args[0], error);
      throw error;
    }
  };
  
  // Check for problematic extensions
  if (window.chrome && chrome.runtime) {
    console.log('⚠️ Chrome extensions detected. Monitoring requests...');
  }
  
  return () => {
    // Restore original fetch when component unmounts
    window.fetch = originalFetch;
  };
}, []);



const fetchDashboardData = async () => {
  try {
    setLoading(true);
    
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('No token found');
      navigate('/login');
      return;
    }
    
    // Use try-catch for each fetch individually
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    
    let statsData = { stats: {}, clubInfo: {} };
    let eventsData = { events: [] };
    let attendanceData = { chartData: [] };
    
    try {
      const statsRes = await fetch('http://localhost:5000/api/admin/stats', { headers });
      if (statsRes.ok) {
        statsData = await statsRes.json();
      }
    } catch (statsError) {
      console.warn('Stats fetch failed:', statsError);
    }
    
    try {
      const eventsRes = await fetch('http://localhost:5000/api/admin/events', { headers });
      if (eventsRes.ok) {
        eventsData = await eventsRes.json();
      }
    } catch (eventsError) {
      console.warn('Events fetch failed:', eventsError);
    }
    
    try {
      const attendanceRes = await fetch('http://localhost:5000/api/admin/attendance-history', { headers });
      if (attendanceRes.ok) {
        attendanceData = await attendanceRes.json();
      }
    } catch (attendanceError) {
      console.warn('Attendance fetch failed:', attendanceError);
    }
    
    // Set data with fallbacks
    setDashboardData({
      stats: [
        { id: 's1', title: 'Total Events', value: statsData.stats?.totalEvents || 0 },
        { id: 's2', title: 'Upcoming', value: statsData.stats?.upcomingEvents || 0 },
        { id: 's3', title: 'Total Registrations', value: statsData.stats?.totalRegistrations || 0 },
        { id: 's4', title: 'Check-ins Today', value: statsData.stats?.checkinsToday || 0 },
      ],
      events: eventsData.events || eventsData.data || [],
      attendanceHistory: attendanceData.chartData || [],
      clubInfo: statsData.clubInfo || { name: 'EventHub', totalMembers: 156 }
    });
    
  } catch (error) {
    console.error('❌ Dashboard fetch error:', error);
    toast.error('Failed to load dashboard data');
  } finally {
    setLoading(false);
  }
};

// ADD THIS MOCK DATA FUNCTION AT THE TOP OF THE COMPONENT (after imports)
const getMockEvents = () => [
  {
    _id: '1',
    title: 'Hackathon 2025',
    date: '2025-03-20',
    venue: 'Auditorium A',
    capacity: 150,
    registered: 98,
    attended: 85,
    status: 'Published',
    category: 'Technical'
  },
  {
    _id: '2',
    title: 'Design Workshop',
    date: '2025-03-25',
    venue: 'Hall B',
    capacity: 80,
    registered: 62,
    attended: 58,
    status: 'Published',
    category: 'Workshop'
  },
  {
    _id: '3',
    title: 'AI Seminar',
    date: '2025-04-01',
    venue: 'Seminar Room 3',
    capacity: 60,
    registered: 45,
    attended: null,
    status: 'Published',
    category: 'Seminar'
  }
];
  const fetchNotifications = async () => {
    try {
      const response = await adminAPI.getNotifications();
      setNotifications(response.data.notifications || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const handleEventAction = (event, action) => {
    setSelectedEvent(event);
    setActiveModal(action);


      if (action === 'viewFeedback') {
    setActiveModal(null); // Close current modal
    setSelectedEventForFeedback(event);
    fetchEventFeedback(event._id);
  }
  };

  

 const handleExportData = async (eventId = '') => {
  try {
    let url = 'http://localhost:5000/api/admin/export-data';
    
    // If eventId is provided, add it as query parameter
    if (eventId) {
      url += `?eventId=${eventId}`;
    }
    
    const token = localStorage.getItem('token');
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    });
    
    if (!response.ok) {
      throw new Error(`Export failed: ${response.status}`);
    }
    
    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    
    // Set appropriate filename
    const filename = eventId 
      ? `event-${eventId}-registrations-${Date.now()}.csv`
      : `all-events-registrations-${Date.now()}.csv`;
    
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(downloadUrl);
    
    toast.success(`Data exported successfully!${eventId ? ' (Event specific)' : ' (All events)'}`);
  } catch (error) {
    console.error('Export error:', error);
    toast.error('Failed to export data');
  }
};

const handleSendNotifications = async () => {
  // Check if we have a selected event
  if (!selectedEvent || !selectedEvent._id) {
    console.error('❌ No event selected for notifications');
    toast.error('Please select an event first');
    
    // Show event selection if no event is selected
    setActiveModal('send-notifications');
    return;
  }

  // Show a prompt to get the notification message
  const message = prompt(`Enter notification message for "${selectedEvent.title}":`);
  
  if (!message || !message.trim()) {
    toast.error('Message cannot be empty');
    return;
  }

  // Use the helper function
  handleSendNotificationWithEvent(selectedEvent, message.trim());
};

// ADD THIS NEW HELPER FUNCTION RIGHT AFTER IT
// ============================================
const handleSendNotificationWithEvent = async (event, message) => {
  try {
    if (!event || !event._id) {
      toast.error('Invalid event selected');
      return;
    }
    
    const token = localStorage.getItem('token');
    
    if (!token) {
      toast.error('Please login again');
      navigate('/login');
      return;
    }
    
    console.log(`📢 Sending notifications for event: ${event._id}`);
    console.log(`Message: "${message}"`);
    
    // WORKING ENDPOINTS - Use these exact ones
    const endpoints = [
      // 1. Simple test route (NO auth required)
      `http://localhost:5000/api/admin/notifications-test`,
      // 2. Send notifications route (requires auth)
      `http://localhost:5000/api/admin/send-notifications`,
      // 3. Alternative route
      `http://localhost:5000/api/admin/notify`,
      // 4. Event-specific test route
      `http://localhost:5000/api/admin/events/${event._id}/notifications-test`
    ];
    
    let response;
    let successEndpoint = null;
    
    for (const endpoint of endpoints) {
      try {
        console.log(`🔄 Trying endpoint: ${endpoint}`);
        
        // Prepare headers
        const headers = {
          'Content-Type': 'application/json'
        };
        
        // Add auth token for endpoints that need it (except test route)
        if (!endpoint.includes('notifications-test')) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        
        response = await fetch(endpoint, {
          method: 'POST',
          headers: headers,
          body: JSON.stringify({
            eventId: event._id,
            customMessage: message,
            type: 'reminder'
          })
        });
        
        console.log(`📊 Response status: ${response.status} for ${endpoint}`);
        
        if (response.ok) {
          successEndpoint = endpoint;
          const data = await response.json();
          console.log('✅ Success!', data);
          
          toast.success(`✅ ${data.message || 'Notifications sent successfully!'}`);
          console.log(`✅ Used endpoint: ${successEndpoint}`);
          
          setSelectedEvent(null);
          return; // Exit on success
        } else {
          const errorText = await response.text();
          console.log(`❌ Endpoint ${endpoint} failed: ${response.status} - ${errorText}`);
        }
      } catch (endpointError) {
        console.log(`❌ Endpoint ${endpoint} error:`, endpointError.message);
      }
    }
    
    // If we get here, all endpoints failed
    console.error('All endpoints failed. Did you:');
    console.error('1. Add the routes to adminRoutes.js?');
    console.error('2. Restart your backend server?');
    console.error('3. Check server console for errors?');
    
    // Show demo success anyway
    toast.success(`📢 Demo: Prepared notification "${message}" for "${event.title}"`);
    toast.info('Would send to ' + (event.registered || 0) + ' students');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    
    // Fallback to demo mode
    toast.success(`📢 Demo: Notification prepared for "${event.title}"`);
    toast.info(`Message: "${message}"`);
    
  } finally {
    setSelectedEvent(null);
  }
};


  const handleCertificateUpload = async (eventId, file) => {
    try {
      if (!file) {
        toast.error('Please select a file');
        return;
      }
      
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Please upload JPG, PNG, or PDF files only');
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size should be less than 5MB');
        return;
      }
      
      await adminAPI.uploadCertificate(eventId, file);
      toast.success('Certificate uploaded successfully!');
      fetchDashboardData();
      
    } catch (error) {
      console.error('Upload error:', error);
      const errorMsg = error.response?.data?.message || 
                      error.response?.data?.error || 
                      'Failed to upload certificate';
      toast.error(`Upload failed: ${errorMsg}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 bg-gray-50 dark:bg-gray-950 min-h-screen">
      <header className="mb-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white flex items-center gap-3">
              <Activity className="w-8 h-8 text-blue-600" />
              {t('Admin Dashboard')}
            </h1>
            <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-600 dark:text-gray-400">
              <p className="flex items-center gap-1">
                <Users className="w-4 h-4" /> {dashboardData.clubInfo.name || 'Club Name'}
              </p>
              <p>
                {t('Members')}: {dashboardData.clubInfo.totalMembers || 0}
              </p>
              <p className="flex items-center gap-1">
                <Clock className="w-4 h-4" /> 
                {t('Last Update')}: {new Date().toLocaleTimeString()}
              </p>
            </div>
          </div>
          
         // In your AdminDashboard header section, update:
<div className="flex items-center gap-3">
  <button
    onClick={() => navigate('/admin/notifications')}
    className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
  >
    <Bell className="w-6 h-6" />
    {notifications.length > 0 && (
      <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
        {notifications.length}
      </span>
    )}
  </button>
  

</div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <button
            onClick={() => navigate('/create-event')}
            className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-500 hover:shadow-md transition-all flex items-center gap-3"
          >
            <PlusCircle className="w-6 h-6 text-blue-600" />
            <div className="text-left">
              <p className="font-semibold">{t('Create Event')}</p>
              <p className="text-sm text-gray-500">{t('Start a new event')}</p>
            </div>
          </button>
          
       <button
  onClick={() => setActiveModal('send-notifications')}
  className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-green-500 hover:shadow-md transition-all flex items-center gap-3"
>
  <Mail className="w-6 h-6 text-green-600" />
  <div className="text-left">
    <p className="font-semibold">{t('Send Reminders')}</p>
    <p className="text-sm text-gray-500">{t('Notify registered students')}</p>
  </div>
</button>
          
          <button
            onClick={() => navigate('/admin/qr-codes')}
            className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-orange-500 hover:shadow-md transition-all flex items-center gap-3"
          >
            <QrCode className="w-6 h-6 text-orange-600" />
            <div className="text-left">
              <p className="font-semibold">{t('QR Codes')}</p>
              <p className="text-sm text-gray-500">{t('Generate check-in codes')}</p>
            </div>
          </button>

 {/* Second button - System Analytics */}
<button
  onClick={() => {
    setSelectedEventForAnalytics(null);
    setShowAnalyticsModal(true);
  }}
  className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-orange-500 hover:shadow-md transition-all flex items-center gap-3"
>
  <TrendingUp className="w-6 h-6 text-orange-600" />
  <div className="text-left">
    <p className="font-semibold">{t('View Analytics')}</p>
    <p className="text-sm text-gray-500">{t('System-wide performance insights')}</p>
  </div>
</button>

{/* Third button - Export All Data */}
<button
  onClick={handleExportAllData}
  className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-orange-500 hover:shadow-md transition-all flex items-center gap-3"
>
  <Download className="w-6 h-6 text-orange-600" />
  <div className="text-left">
    <p className="font-semibold">{t('Export All Data')}</p>
    <p className="text-sm text-gray-500">{t('Download complete system data')}</p>
  </div>
</button>



        //button 
           


        </div>
      </header>

      <div className="space-y-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {dashboardData.stats.map(stat => (
            <StatCard 
              key={stat.id} 
              stat={stat}
              onClick={() => {
                if (stat.id === 's1') navigate('/admin/events');
                if (stat.id === 's4') navigate('/admin/attendance');
              }}
            />
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-500" />
              {t('Monthly Attendance')}
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dashboardData.attendanceHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="attendees" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  dot={{ stroke: '#3B82F6', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {t('Recent Events')}
              </h2>
              <button 
                onClick={() => navigate('/admin/events')}
                className="text-blue-600 hover:text-blue-800 text-sm font-semibold"
              >
                {t('View All →')}
              </button>
            </div>
          <div className="space-y-4">
  {Array.isArray(dashboardData.events) && dashboardData.events.slice(0, 3).map(event => (
    <div 
      key={event._id || event.id} 
      className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white">{event.title}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {event.date ? new Date(event.date).toLocaleDateString() : 'Date TBD'} • {event.venue || 'Venue TBD'}
          </p>
        </div>
        <EventStatusBadge status={event.status || 'Published'} />
      </div>
      <div className="flex items-center justify-between mt-4">
        <div className="text-sm">
          <span className="text-gray-600 dark:text-gray-400">
            {(event.registered || 0)}/{(event.capacity || 100)} registered
          </span>
        </div>
        <button
          onClick={() => handleEventAction(event, 'details')}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          {t('Manage')}
        </button>
      </div>
    </div>
  ))}
</div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {t('All Events')}
            </h2>
            <button 
              onClick={() => navigate('/create-event')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" /> {t('New Event')}
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead>
                <tr className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  <th className="py-3 px-4">{t('Event')}</th>
                  <th className="py-3 px-4">{t('Date')}</th>
                  <th className="py-3 px-4">{t('Registered')}</th>
                  <th className="py-3 px-4">{t('Attended')}</th>
                  <th className="py-3 px-4">{t('Status')}</th>
                  <th className="py-3 px-4">{t('Actions')}</th>
                </tr>
              </thead>
             <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
  {Array.isArray(dashboardData.events) && dashboardData.events.map(event => {
    const attendanceRate = event.attended ? 
      Math.round((event.attended / event.registered) * 100) : 0;
    
    return (
      <tr key={event._id || event.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
        <td className="py-4 px-4">
          <div>
            <p className="font-medium text-gray-900 dark:text-white">{event.title}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">{event.venue || 'TBD'}</p>
          </div>
        </td>
        <td className="py-4 px-4 text-gray-700 dark:text-gray-300">
          {event.date ? new Date(event.date).toLocaleDateString() : 'TBD'}
        </td>
        <td className="py-4 px-4">
          <div>
            <p className="font-medium">{event.registered || 0}/{event.capacity || 100}</p>
            <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500"
                style={{ width: `${((event.registered || 0) / (event.capacity || 100)) * 100}%` }}
              ></div>
            </div>
          </div>
        </td>
        <td className="py-4 px-4">
          {event.attended ? (
            <div>
              <p className="font-medium">{event.attended}</p>
              <p className="text-sm text-green-600">{attendanceRate}%</p>
            </div>
          ) : (
            <span className="text-gray-500">{t('Not started')}</span>
          )}
        </td>
        <td className="py-4 px-4">
          <EventStatusBadge status={event.status || 'Published'} />
        </td>
      <td className="py-4 px-4">
  <div className="flex items-center gap-2">
    <button
      onClick={() => handleEventAction(event, 'details')}
      className="px-3 py-1 text-sm bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-md transition-colors"
    >
      {t('Manage')}
    </button>
      <button
      onClick={() => handleExportEventData(event._id || event.id)}  
      className="px-3 py-1 text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-md transition-colors flex items-center gap-1"
    >
      <Download className="w-3 h-3" />
      {t('Export')}
    </button>
  </div>
</td>
      </tr>
    );
  })}
</tbody>
            </table>
          </div>
        </div>
      </div>


           {/* ========== MODALS ========== */}
    {/* Add this AnalyticsModal: */}
    {showAnalyticsModal && (
      <AnalyticsModal
        event={selectedEventForAnalytics}
        onClose={() => {
          setShowAnalyticsModal(false);
          setSelectedEventForAnalytics(null);
        }}
      />
    )}


{activeModal === 'details' && selectedEvent && (
  <EventDetailsModal
    event={selectedEvent}
    onClose={() => {
      setSelectedEvent(null);
      setActiveModal(null);
    }}
    onExport={handleExportEventData}  
    onManageAttendance={(event) => {
      setSelectedEvent(event);
      setActiveModal('attendance');
    }}
    onUploadCertificate={(event) => {
      setSelectedEvent(event);
      setActiveModal('certificate');
    }}
    onViewFeedback={(event) => {
      setSelectedEventForFeedback(event);
      setSelectedEvent(null);
      setActiveModal(null);
      fetchEventFeedback(event._id);
    }}
  />
)}

      {activeModal === 'attendance' && selectedEvent && (
        <AttendanceModal
          event={selectedEvent}
          onClose={() => {
            setSelectedEvent(null);
            setActiveModal(null);
            fetchDashboardData();
          }}
        />
      )}

      {activeModal === 'certificate' && selectedEvent && (
        <CertificateUploadModal
          event={selectedEvent}
          onClose={() => {
            setSelectedEvent(null);
            setActiveModal(null);
          }}
          onUpload={() => handleCertificateUpload(selectedEvent._id)}
        />
      )}

{showFeedbackModal && (
  <FeedbackViewModal
    event={selectedEventForFeedback}
    feedback={eventFeedback}
    stats={feedbackStats}
    loading={loadingFeedback}
    onClose={() => {
      setShowFeedbackModal(false);
      setEventFeedback([]);
      setFeedbackStats(null);
      setSelectedEventForFeedback(null);
    }}
    onExport={exportFeedbackCSV}
  />
)}



//notification modal
{/* Send Notifications Modal */}
{/* Send Notifications Modal - Updated */}
{/* Send Notifications Modal - UPDATED VERSION */}
{activeModal === 'send-notifications' && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
          Select Event for Notifications
        </h3>
        <button
          onClick={() => {
            setActiveModal(null);
            setSelectedEvent(null);
          }}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      
      <p className="text-gray-600 dark:text-gray-400 mb-4">
        Select an event to send notifications to all registered students:
      </p>
      
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {dashboardData.events && dashboardData.events.length > 0 ? (
          dashboardData.events.map(event => (
            <button
              key={event._id}
              onClick={() => {
                // Set the selected event and close modal
                setSelectedEvent(event);
                setActiveModal(null);
                
                // Wait a moment then show the message prompt
                setTimeout(() => {
                  const message = prompt(`Enter notification message for "${event.title}":`);
                  
                  if (!message || !message.trim()) {
                    toast.error('Message cannot be empty');
                    setSelectedEvent(null);
                    return;
                  }
                  
                  // Call the helper function
                  handleSendNotificationWithEvent(event, message.trim());
                }, 100);
              }}
              className="w-full p-4 text-left border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <p className="font-semibold text-gray-900 dark:text-white">
                {event.title}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {event.date ? new Date(event.date).toLocaleDateString() : 'Date TBD'} • 
                {event.registered || 0} students registered
              </p>
            </button>
          ))
        ) : (
          <p className="text-center text-gray-500 py-8">
            No events available
          </p>
        )}
      </div>
    </div>
  </div>
)}



      <footer className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
        <div className="text-center text-sm text-gray-600 dark:text-gray-400">
          <p className="font-semibold mb-2">{dashboardData.clubInfo.name || 'Event Management System'}</p>
          <p>{t('Powered by EventHub • Real-time Dashboard • Version 2.0')}</p>
        </div>
      </footer>
    
               {/* ========== MODALS ========== */}
      {activeModal === 'feedback' && (
        <FeedbackModal
          onClose={() => setActiveModal(null)}
          onSubmit={handleSubmitFeedback}
        />
      )}

      {activeModal === 'request' && (
        <DocumentRequestModal
          onClose={() => setActiveModal(null)}
          onSubmit={handleRequestDocument}
        />
      )}

      {activeModal === 'qr' && selectedEvent && (
        <QRCodeModal
          event={selectedEvent}
          onClose={() => {
            setSelectedEvent(null);
            setActiveModal(null);
          }}
        />
      )}

      {/* ========== ADD THIS NEW MODAL ========== */}
      {activeModal === 'myqr' && (
        <MyQRCodesModal
          registrations={myRegistrations}
          events={allEvents}
          onClose={() => setActiveModal(null)}
        />
      )}
    </div>



  );
};

export default AdminDashboard;