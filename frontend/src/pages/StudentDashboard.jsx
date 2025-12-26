import React, { useEffect, useState } from 'react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, 
  XAxis, YAxis, CartesianGrid, AreaChart, Area
} from 'recharts';
import { 
  Calendar, Award, Clock, Users, Search, CheckCircle, 
  XCircle, TrendingUp, Download, Eye, X, Bell, 
  ChevronRight, Filter, MapPin, BookOpen, QrCode,
  User, FileText, Star, Settings, HelpCircle, FileCheck,
  ChevronDown, ChevronUp, ExternalLink, Activity,
  MessageSquare, Upload, Shield, Mail
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { studentAPI, eventAPI, documentAPI } from '../utilis/api';
import { ChevronLeft } from 'lucide-react'; // ADD THIS

// ============================================
// COMPONENTS
// ============================================

const StatCard = ({ icon: Icon, title, value, change, color, description }) => {
  return (
    <div 
      className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 hover:border-blue-200"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm text-gray-600 font-medium mb-2">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {description && (
            <p className="text-xs text-gray-500 mt-1">{description}</p>
          )}
        </div>
        <div className={`p-3 rounded-xl ${color} shadow-sm`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
      {change !== undefined && (
        <div className="flex items-center mt-2">
          <div className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
            change >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {change >= 0 ? (
              <ChevronUp className="w-3 h-3 mr-1" />
            ) : (
              <ChevronDown className="w-3 h-3 mr-1" />
            )}
            {Math.abs(change)}%
          </div>
          <span className="text-gray-500 text-xs ml-2">from last month</span>
        </div>
      )}
    </div>
  );
};

const EventCard = ({ event, onView, onRegister, isRegistered, onDownload, onQRCode }) => {
  const spotsLeft = event.capacity - event.registeredCount;
  const isFull = spotsLeft <= 0;
  const isPastEvent = new Date(event.date) < new Date();
  const hasCertificate = event.certificateAvailable;
  const hasAttended = event.attended;

  return (
    <div className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 hover:border-blue-300">
      <div className="relative">
        <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
          <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-blue-700 text-xs font-semibold rounded-full shadow-sm">
            {event.category || 'Workshop'}
          </span>
          {hasCertificate && (
            <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full shadow-sm">
              Certificate Ready
            </span>
          )}
        </div>
        
        <div className="absolute top-4 right-4 z-10">
          {isRegistered ? (
            <span className="inline-flex items-center px-3 py-1.5 bg-green-100 text-green-800 text-xs font-semibold rounded-full shadow-sm">
              <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
              Registered
            </span>
          ) : isFull ? (
            <span className="inline-flex items-center px-3 py-1.5 bg-red-100 text-red-800 text-xs font-semibold rounded-full shadow-sm">
              <XCircle className="w-3.5 h-3.5 mr-1.5" />
              Full
            </span>
          ) : (
            <span className="inline-flex items-center px-3 py-1.5 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full shadow-sm">
              Available
            </span>
          )}
        </div>
        
        <div className="h-40 bg-gradient-to-r from-blue-600 to-indigo-700 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
          <div className="absolute bottom-4 left-4 right-4">
            <h3 className="text-lg font-bold text-white line-clamp-2">{event.title}</h3>
          </div>
        </div>
      </div>
      
      <div className="p-5">
        <div className="space-y-3 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="w-4 h-4 text-blue-500 mr-2 flex-shrink-0" />
            <span className="font-medium">
              {new Date(event.date).toLocaleDateString('en-US', { 
                weekday: 'short', 
                month: 'short', 
                day: 'numeric' 
              })}
            </span>
            <Clock className="w-4 h-4 text-blue-500 mx-2" />
            <span>{event.time || '10:00 AM'}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="w-4 h-4 text-blue-500 mr-2 flex-shrink-0" />
            <span className="line-clamp-1">{event.venue}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Users className="w-4 h-4 text-blue-500 mr-2 flex-shrink-0" />
            <span>{event.registeredCount} of {event.capacity} registered</span>
            <div className="ml-2 px-2 py-0.5 bg-blue-50 text-blue-700 text-xs font-medium rounded">
              {spotsLeft} left
            </div>
          </div>
        </div>
        
        <div className="mb-4">
          <div className="flex justify-between text-xs text-gray-600 mb-1">
            <span>Registration progress</span>
            <span className="font-semibold">{Math.round((event.registeredCount / event.capacity) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-500 ${
                isFull ? 'bg-red-500' : 'bg-gradient-to-r from-blue-500 to-indigo-600'
              }`}
              style={{ width: `${Math.min((event.registeredCount / event.capacity) * 100, 100)}%` }}
            ></div>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => onView(event)}
            className="flex-1 py-2.5 px-3 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 text-sm font-semibold transition-colors flex items-center justify-center gap-2"
          >
            <Eye className="w-4 h-4" />
            Details
          </button>
          
          {!isPastEvent ? (
            !isRegistered && !isFull && (
              <button
                onClick={() => onRegister(event)}
                className="flex-1 py-2.5 px-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 text-sm font-semibold transition-colors"
              >
                Register
              </button>
            )
          ) : isRegistered && (
            <div className="flex gap-2 flex-1">
              {hasAttended && hasCertificate && (
                <button
                  onClick={() => onDownload && onDownload(event)}
                  className="flex-1 py-2.5 px-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Certificate
                </button>
              )}
              {onQRCode && (
                <button
                  onClick={() => onQRCode(event)}
                  className="flex-1 py-2.5 px-3 bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-lg hover:from-orange-700 hover:to-amber-700 text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  <QrCode className="w-4 h-4" />
                  QR Code
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const FeedbackModal = ({ onClose, onSubmit }) => {
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState('');
  const [anonymous, setAnonymous] = useState(false);

  const handleSubmit = () => {
    onSubmit({
      rating,
      feedback,
      anonymous,
      timestamp: new Date().toISOString()
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-900">Submit Feedback</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              How would you rate this event?
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className={`text-2xl ${star <= rating ? 'text-yellow-500' : 'text-gray-300'}`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your feedback
            </label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows="4"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="What did you like about the event? Any suggestions for improvement?"
            />
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="anonymous"
              checked={anonymous}
              onChange={(e) => setAnonymous(e.target.checked)}
              className="h-4 w-4 text-blue-600 rounded"
            />
            <label htmlFor="anonymous" className="ml-2 text-sm text-gray-700">
              Submit anonymously
            </label>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!feedback.trim()}
              className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 font-medium disabled:opacity-50"
            >
              Submit Feedback
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const DocumentRequestModal = ({ onClose, onSubmit }) => {
  const [documentType, setDocumentType] = useState('certificate');
  const [eventId, setEventId] = useState('');
  const [purpose, setPurpose] = useState('');
  const [urgency, setUrgency] = useState('normal');

  const handleSubmit = () => {
    onSubmit({
      documentType,
      eventId,
      purpose,
      urgency,
      requestedAt: new Date().toISOString()
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-900">Request Document</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Document Type
            </label>
            <select
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="certificate">Certificate of Attendance</option>
              <option value="letter">Participation Letter</option>
              <option value="transcript">Event Transcript</option>
              <option value="other">Other Document</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Event (Optional)
            </label>
            <input
              type="text"
              value={eventId}
              onChange={(e) => setEventId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Enter event name or ID"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Purpose
            </label>
            <textarea
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Explain why you need this document"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Urgency
            </label>
            <select
              value={urgency}
              onChange={(e) => setUrgency(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="low">Low (Within 2 weeks)</option>
              <option value="normal">Normal (Within 1 week)</option>
              <option value="high">High (Within 3 days)</option>
              <option value="urgent">Urgent (Within 24 hours)</option>
            </select>
          </div>
          
          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!purpose.trim()}
              className="flex-1 py-3 px-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 font-medium disabled:opacity-50"
            >
              Submit Request
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// PASTE THIS AFTER YOUR IMPORTS
const StudentQRCodeModal = ({ registration, event, onClose }) => {
  const [qrCode, setQRCode] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQR = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(
          `http://localhost:5000/api/qr-codes/student/event/${event._id}`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        const data = await res.json();
        if (data.success) setQRCode(data.qrCode);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchQR();
  }, []);

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999] p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-md w-full" onClick={e => e.stopPropagation()}>
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
          <div className="flex justify-between">
            <div>
              <h3 className="text-xl font-bold">QR Code</h3>
              <p className="text-sm">{event.title}</p>
            </div>
            <button onClick={onClose} className="text-2xl">×</button>
          </div>
        </div>
        <div className="p-6 text-center">
          {loading ? (
            <div className="py-12">Loading...</div>
          ) : qrCode ? (
            <>
              <img src={qrCode} className="w-64 h-64 mx-auto border-2 border-dashed border-gray-300 p-4 rounded" />
              <p className="mt-4 font-mono text-lg">{registration._id.slice(-8).toUpperCase()}</p>
              <button 
                onClick={() => {
                  const a = document.createElement('a');
                  a.href = qrCode;
                  a.download = 'qr-code.png';
                  a.click();
                }}
                className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg"
              >
                Download
              </button>
            </>
          ) : (
            <div className="py-12">QR not available</div>
          )}
        </div>
      </div>
    </div>
  );
};




// ADD THIS function to calculate REAL activity data:




// ============================================
// MAIN DASHBOARD
// ============================================

const StudentDashboard = () => {
 const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [activeSection, setActiveSection] = useState('upcoming');
  const [activeModal, setActiveModal] = useState(null);
  
  // ✅ Renamed from "notification" to "toastNotification"
  const [toastNotification, setToastNotification] = useState({ 
    show: false, 
    message: '', 
    type: 'success' 
  });
  
  const [activityTimeRange, setActivityTimeRange] = useState('6months');
  const [activityChartData, setActivityChartData] = useState([]);
  
  // Data states
  const [allEvents, setAllEvents] = useState([]);
  const [myRegistrations, setMyRegistrations] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [stats, setStats] = useState({
    totalRegistrations: 0,
    eventsAttended: 0,
    upcomingEvents: 0,
    certificatesEarned: 0,
    attendanceRate: 0
  });

  // QR code states
  const [showQR, setShowQR] = useState(false);
  const [qrReg, setQrReg] = useState(null);
  const [qrEvent, setQrEvent] = useState(null);
  const [loadingQR, setLoadingQR] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrCodeData, setQrCodeData] = useState(null);
  
  // ✅ ADD THESE for notifications feature
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
     const calculateActivityData = () => {
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const today = new Date();
  
  // Determine how many months to show
  const monthsToShow = activityTimeRange === '6months' ? 6 : 
                       activityTimeRange === '1year' ? 12 : 
                       24; // all time = 24 months
  
  const activityData = [];
  
  for (let i = monthsToShow - 1; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    
    const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
    const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);
    
    // Count registrations in this month
    const registrationsThisMonth = myRegistrations.filter(reg => {
      const regDate = new Date(reg.registeredAt);
      return regDate >= monthStart && regDate <= monthEnd;
    }).length;
    
    // Count attended events in this month
    const attendedThisMonth = myRegistrations.filter(reg => {
      if (!reg.checkInAt && !reg.attended && reg.status !== 'attended') {
        return false;
      }
      
      const attendDate = reg.checkInAt ? new Date(reg.checkInAt) : new Date(reg.registeredAt);
      return attendDate >= monthStart && attendDate <= monthEnd;
    }).length;
    
    activityData.push({
      month: `${monthNames[date.getMonth()]} ${date.getFullYear().toString().slice(-2)}`,
      registrations: registrationsThisMonth,
      attended: attendedThisMonth
    });
  }
  
  return activityData;
};

    // ✅ ADD THIS useEffect HERE
  useEffect(() => {
    if (myRegistrations.length > 0) {
      const data = calculateActivityData();
      setActivityChartData(data);
      console.log('📊 Activity chart data:', data);
    }
  }, [myRegistrations, activityTimeRange]);


  // Get user from localStorage
  const user = JSON.parse(localStorage.getItem('user') || '{}');






// REPLACE fetchDashboardData in StudentDashboard.jsx WITH THIS:

// REPLACE fetchDashboardData in StudentDashboard.jsx:

const fetchDashboardData = async (silent = false) => {
  if (!silent) setLoading(true);
  try {
    console.log('📊 Fetching student dashboard data...');
    
    // Get user from localStorage
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    console.log('👤 User:', userData.name, userData.id);

    // Fetch all events
    const eventsRes = await fetch('http://localhost:5000/api/events');
    const eventsData = await eventsRes.json();
    const events = eventsData.events || eventsData.data || eventsData || [];
    setAllEvents(events);
    console.log(`✅ Loaded ${events.length} events`);

    // Fetch user registrations
    let registrations = [];
    if (userData.id) {
      try {
        const regRes = await fetch(
          `http://localhost:5000/api/events/registrations/user/${userData.id}`, 
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          }
        );
        
        if (regRes.ok) {
          const regData = await regRes.json();
          registrations = regData.registrations || regData.data || [];
          setMyRegistrations(registrations);
          console.log(`✅ Loaded ${registrations.length} registrations`);
          
          // Log attendance details
          registrations.forEach(reg => {
            console.log('Registration:', {
              event: reg.event?.title || reg.eventId,
              status: reg.status,
              attended: reg.attended,
              checkInAt: reg.checkInAt,
              certificateIssued: reg.certificateIssued
            });
          });
        }
      } catch (err) {
        console.warn('Could not fetch registrations:', err);
        setMyRegistrations([]);
      }
    }

    setDocuments([]);

    // ✅ CALCULATE STATS WITH PROPER LOGIC
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Events attended = has checkInAt OR status === 'attended' OR attended === true
    const attended = registrations.filter(r => 
      r.checkInAt || r.status === 'attended' || r.attended === true
    ).length;
    
    console.log(`✅ Events attended: ${attended}`);
    
    // Certificates = certificateIssued === true
    const certificates = registrations.filter(r => r.certificateIssued === true).length;
    console.log(`✅ Certificates: ${certificates}`);
    
    // Upcoming events = registered AND event date > today
    const upcoming = registrations.filter(r => {
      const event = events.find(e => 
        e._id === r.eventId || e._id === r.event?._id
      ) || r.event;
      
      if (!event || !event.date) return false;
      
      const eventDate = new Date(event.date);
      eventDate.setHours(0, 0, 0, 0);
      
      return eventDate > today;
    }).length;
    
    console.log(`✅ Upcoming events: ${upcoming}`);
    
    // Attendance rate
    const attendanceRate = registrations.length > 0 ? 
      Math.round((attended / registrations.length) * 100) : 0;
    
    console.log(`✅ Attendance rate: ${attendanceRate}%`);

    // ✅ UPDATE STATS
    setStats({
      totalRegistrations: registrations.length,
      eventsAttended: attended,
      upcomingEvents: upcoming,
      certificatesEarned: certificates,
      attendanceRate
    });

    console.log('✅ Dashboard stats updated:', {
      totalRegistrations: registrations.length,
      eventsAttended: attended,
      upcomingEvents: upcoming,
      certificatesEarned: certificates,
      attendanceRate
    });

  } catch (error) {
    console.error('❌ Failed to fetch dashboard data:', error);
    if (!silent) {
      toast.error('Failed to load dashboard data');
    }
    
    // Only reset if not silent
    if (!silent) {
      setStats({
        totalRegistrations: 0,
        eventsAttended: 0,
        upcomingEvents: 0,
        certificatesEarned: 0,
        attendanceRate: 0
      });
    }
  } finally {
    if (!silent) setLoading(false);
  }
};

// Add this function after fetchDashboardData:
const fetchNotifications = async () => {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) return;
    
    const response = await fetch('http://localhost:5000/api/student/notifications', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await response.json();
    
    if (data.success) {
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    }
  } catch (error) {
    console.error('Failed to fetch notifications:', error);
  }
};

// ✅ ADD AUTO-REFRESH EVERY 30 SECONDS
useEffect(() => {
  fetchDashboardData();
    fetchNotifications(); 
  // Auto-refresh
  const interval = setInterval(() => {
    console.log('🔄 Auto-refreshing dashboard...');
    fetchDashboardData();
      fetchNotifications(); 
  }, 30000);
  
  return () => clearInterval(interval);
}, []);

  const handleRegisterEvent = async (event) => {
    try {
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      
      await eventAPI.register(event._id, {
        userId: userData.id,
        studentName: userData.name || userData.username,
        email: userData.email,
        department: userData.department
      });
      
      showNotification(`Successfully registered for ${event.title}`, 'success');
      fetchDashboardData(); // Refresh data
    } catch (error) {
      console.error('Registration error:', error);
      showNotification(error.response?.data?.message || 'Registration failed', 'error');
    }
  };

  const handleDownloadCertificate = async (event) => {
    try {
      // Find registration for this event
      const registration = myRegistrations.find(reg => 
        reg.eventId === event._id || reg.event?._id === event._id
      );
      
      if (!registration) {
        toast.error('No registration found for this event');
        return;
      }

      // Download certificate
      const response = await eventAPI.downloadCertificate(event._id, registration._id);
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = `certificate-${event.title}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      showNotification('Certificate downloaded successfully', 'success');
    } catch (error) {
      console.error('Download error:', error);
      showNotification('Certificate not available yet', 'error');
    }
  };


// ADD THIS NEW COMPONENT to StudentDashboard.jsx:
const MyQRCodesModal = ({ registrations, events, onClose }) => {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [qrCode, setQRCode] = useState(null);
  const [loading, setLoading] = useState(false);

  const getAttendanceStatus = (reg) => {
    if (reg.checkInAt || reg.status === 'attended' || reg.attended) {
      return 'present';
    }
    
    const event = events.find(e => e._id === reg.eventId || e._id === reg.event?._id);
    if (event && new Date(event.date) < new Date()) {
      return 'absent';
    }
    
    return 'pending';
  };

  const fetchQRCode = async (eventId, registrationId) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      // Try to get QR code from backend
      const response = await fetch(`http://localhost:5000/api/student/events/${eventId}/qr-code`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.qrCode) {
          setQRCode(data.qrCode);
        } else {
          // Generate QR code locally as fallback
          generateLocalQRCode(eventId, registrationId, user);
        }
      } else {
        // Generate QR code locally
        generateLocalQRCode(eventId, registrationId, user);
      }
    } catch (error) {
      console.error('QR fetch error:', error);
      generateLocalQRCode(eventId, registrationId, JSON.parse(localStorage.getItem('user') || '{}'));
    } finally {
      setLoading(false);
    }
  };

  const generateLocalQRCode = async (eventId, registrationId, user) => {
    try {
      const QRCode = import('qrcode');
      const qrData = {
        eventId: eventId,
        registrationId: registrationId,
        studentId: user.id || user._id,
        studentName: user.name || user.username,
        timestamp: Date.now()
      };
      
      const qrCodeDataUrl = await QRCode.toDataURL(JSON.stringify(qrData));
      setQRCode(qrCodeDataUrl);
    } catch (err) {
      console.error('Local QR generation error:', err);
      toast.error('Failed to generate QR code');
    }
  };

  // REPLACE handleDownloadCertificate in StudentDashboard.jsx:

const handleDownloadCertificate = async (event) => {
  try {
    console.log('📥 Downloading certificate for event:', event.title);
    
    // Find registration for this event
    const registration = myRegistrations.find(reg => 
      reg.eventId === event._id || 
      reg.event?._id === event._id ||
      reg.eventId?._id === event._id
    );
    
    if (!registration) {
      toast.error('No registration found for this event');
      return;
    }

    console.log('Registration found:', registration);

    // Check if attended
    if (!registration.attended && !registration.checkInAt && registration.status !== 'attended') {
      toast.error('You were marked absent. Cannot download certificate.');
      return;
    }

    // Check if certificate issued
    if (!registration.certificateIssued) {
      toast.error('Certificate not yet issued by organizer');
      return;
    }

    // Download certificate
    const response = await fetch(
      `http://localhost:5000/api/events/${event._id}/registrations/${registration._id}/certificate/download`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      }
    );

    if (!response.ok) {
      throw new Error('Failed to download certificate');
    }

    // Get the blob
    const blob = await response.blob();
    
    // Create download link
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `certificate-${event.title.replace(/\s+/g, '-')}.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    
    toast.success('Certificate downloaded successfully!');
    
  } catch (error) {
    console.error('❌ Download error:', error);
    toast.error('Failed to download certificate: ' + error.message);
  }
};

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b">
          <div>
            <h3 className="text-xl font-bold text-gray-900">My QR Codes & Certificates</h3>
            <p className="text-gray-600 text-sm">View your registered events</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {selectedEvent && qrCode ? (
            <div className="text-center">
              <button
                onClick={() => {
                  setSelectedEvent(null);
                  setQRCode(null);
                }}
                className="mb-4 text-blue-600 hover:text-blue-800 flex items-center gap-2"
              >
                <ChevronLeft className="w-4 h-4" /> Back to events
              </button>
              
              <div className="bg-white p-6 rounded-lg border-2 border-dashed border-gray-300 inline-block">
                <img src={qrCode} alt="QR Code" className="w-64 h-64" />
              </div>
              
              <p className="mt-4 text-gray-600">
                Show this QR code at event entrance for check-in
              </p>
              
              <div className="flex gap-3 mt-6 justify-center">
                <button
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = qrCode;
                    link.download = `qr-${selectedEvent.title}.png`;
                    link.click();
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Download QR
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  Print
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {registrations.length === 0 ? (
                <div className="text-center py-12">
                  <QrCode className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">No registered events yet</p>
                  <p className="text-gray-500 text-sm mt-2">Register for events to see QR codes</p>
                </div>
              ) : (
                registrations.map((reg) => {
                  const event = events.find(e => 
                    e._id === reg.eventId || e._id === reg.event?._id
                  ) || reg.event;
                  
                  if (!event) return null;
                  
                  const status = getAttendanceStatus(reg);
                  const isPastEvent = new Date(event.date) < new Date();
                  
                  return (
                    <div key={reg._id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">
                            {event.title}
                          </h4>
                          <p className="text-sm text-gray-600 mt-1">
                            {new Date(event.date).toLocaleDateString('en-US', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric'
                            })}
                            {event.venue && ` • ${event.venue}`}
                          </p>
                          <div className="mt-2">
                            {status === 'present' && (
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Present ✓
                              </span>
                            )}
                            {status === 'absent' && (
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                <XCircle className="w-3 h-3 mr-1" />
                                Absent ✗
                              </span>
                            )}
                            {status === 'pending' && (
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                <Clock className="w-3 h-3 mr-1" />
                                Pending
                              </span>
                            )}
                          </div>
                          
                          {status === 'present' && reg.certificateIssued && (
                            <p className="text-xs text-green-600 mt-2">
                              ✓ Certificate available
                            </p>
                          )}
                        </div>
                        
                        <div className="flex flex-col gap-2">
                          {/* QR Code button for registered events */}
                          {(status === 'present' || status === 'pending') && (
                            <button
                              onClick={() => {
                                setSelectedEvent(event);
                                fetchQRCode(event._id, reg._id);
                              }}
                              className="px-3 py-1.5 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg text-sm font-medium whitespace-nowrap"
                            >
                              View QR Code
                            </button>
                          )}
                          
                          {/* Certificate button only if present AND certificate issued */}
                          {status === 'present' && reg.certificateIssued && (
                            <button
                              onClick={() => handleDownloadCertificate(event._id, reg._id)}
                              className="px-3 py-1.5 bg-green-100 text-green-700 hover:bg-green-200 rounded-lg text-sm font-medium whitespace-nowrap"
                            >
                              Download Certificate
                            </button>
                          )}
                          
                          {/* Feedback button if absent */}
                          {status === 'absent' && (
                            <button
                              onClick={() => {
                                toast.info('Feedback form will open for this event');
                                // You can implement feedback here
                              }}
                              className="px-3 py-1.5 bg-orange-100 text-orange-700 hover:bg-orange-200 rounded-lg text-sm font-medium whitespace-nowrap"
                            >
                              Give Feedback
                            </button>
                          )}
                          
                          {/* Show message if pending */}
                          {status === 'pending' && !isPastEvent && (
                            <span className="px-3 py-1.5 text-gray-500 text-sm text-center">
                              Wait for event date
                            </span>
                          )}
                          
                          {/* Show message if no certificate */}
                          {status === 'present' && !reg.certificateIssued && (
                            <span className="px-3 py-1.5 text-gray-500 text-sm text-center">
                              Certificate pending
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                }).filter(Boolean)
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};





// UPDATE the Quick Actions button in StudentDashboard:
// Replace the "My QR Codes" button in Quick Actions:
<button 
  onClick={() => setActiveModal('myqr')}
  className="w-full flex items-center justify-between p-3 hover:bg-blue-50 rounded-lg transition-colors group"
>
  <div className="flex items-center">
    <div className="p-2 bg-blue-100 rounded-lg mr-3 group-hover:bg-blue-200 transition-colors">
      <QrCode className="w-4 h-4 text-blue-600" />
    </div>
    <span className="font-medium text-gray-900">My QR Codes & Certificates</span>
  </div>
  <ChevronRight className="w-4 h-4 text-gray-400" />
</button>


// ADD at the bottom before closing tags:
{activeModal === 'myqr' && (
  <MyQRCodesModal
    registrations={myRegistrations}
    events={allEvents}
    onClose={() => setActiveModal(null)}
  />
)}


 // REPLACE handleSubmitFeedback in StudentDashboard.jsx:

const handleSubmitFeedback = async (feedbackData) => {
  try {
    console.log('📝 Submitting feedback for event:', selectedEvent.title);
    
    // Find registration for this event
    const registration = myRegistrations.find(reg => 
      reg.eventId === selectedEvent._id || 
      reg.event?._id === selectedEvent._id ||
      reg.eventId?._id === selectedEvent._id
    );
    
    if (!registration) {
      toast.error('No registration found for this event');
      return;
    }

    // Check if attended
    if (!registration.attended && !registration.checkInAt && registration.status !== 'attended') {
      toast.error('You were marked absent. Please attend the event to give feedback.');
      setActiveModal(null);
      return;
    }

    // Get user
    const userData = JSON.parse(localStorage.getItem('user') || '{}');

    // Submit feedback
    const response = await fetch(
      `http://localhost:5000/api/events/${selectedEvent._id}/feedback`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          userId: userData.id,
          rating: feedbackData.rating,
          comment: feedbackData.feedback,
          anonymous: feedbackData.anonymous
        })
      }
    );

    const data = await response.json();

    if (data.success) {
      toast.success('Feedback submitted successfully!');
      setActiveModal(null);
      setSelectedEvent(null);
      fetchDashboardData(); // Refresh data
    } else {
      throw new Error(data.message || 'Failed to submit feedback');
    }
    
  } catch (error) {
    console.error('❌ Feedback error:', error);
    
    if (error.message.includes('already submitted')) {
      toast.error('You have already submitted feedback for this event');
    } else {
      toast.error('Failed to submit feedback: ' + error.message);
    }
  }
};

  // Add this function after handleSubmitFeedback or before the return statement
  const generateLocalQRCode = async (event, registration, user) => {
    try {
      const QRCode = await import('qrcode');
      
      const qrData = {
        eventId: event._id,
        eventTitle: event.title,
        registrationId: registration._id,
        studentId: user.id || user._id,
        studentName: user.name || user.username || 'Student',
        timestamp: Date.now()
      };
      
      const qrCodeDataUrl = await QRCode.toDataURL(JSON.stringify(qrData));
      
      setQrCodeData({
        qrCode: qrCodeDataUrl,
        eventName: event.title,
        studentName: user.name || user.username || 'Student',
        checkInCode: registration._id.toString().slice(-8).toUpperCase(),
        registrationId: registration._id
      });
      
      setShowQRModal(true);
    } catch (err) {
      console.error('Local QR generation error:', err);
      toast.error('Failed to generate QR code');
    }
  };

  const handleRequestDocument = async (requestData) => {
    try {
      await documentAPI.requestDocument({
        ...requestData,
        userId: user.id
      });
      showNotification('Document request submitted!', 'success');
      fetchDashboardData();
    } catch (error) {
      console.error('Document request error:', error);
      showNotification('Request failed. Please try again.', 'error');
    }
  };

 const showNotification = (message, type = 'success') => {
  setToastNotification({ show: true, message, type });
  setTimeout(() => {
    setToastNotification({ show: false, message: '', type: 'success' });
  }, 3000);
};

  const isRegistered = (eventId) => {
    return myRegistrations.some(reg => 
      reg.eventId === eventId || 
      reg.event?._id === eventId ||
      reg.eventId?._id === eventId
    );
  };

  const hasAttended = (eventId) => {
    const registration = myRegistrations.find(reg => 
      reg.eventId === eventId || 
      reg.event?._id === eventId ||
      reg.eventId?._id === eventId
    );
    return registration?.attended || registration?.status === 'attended' || false;
  };

  const upcomingEvents = allEvents.filter(event => {
    const eventDate = new Date(event.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (eventDate < today) return false;
    
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        event.category?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = filterCategory === 'all' || event.category === filterCategory;
    
    return matchesSearch && matchesCategory;
  });

  const pastEvents = allEvents.filter(event => new Date(event.date) < new Date());
  
  const attendedEvents = allEvents.filter(event => hasAttended(event._id));
  
  const myCertificates = myRegistrations.filter(reg => 
    reg.certificateIssued || reg.certificateAvailable
  );
  
  const categories = ['all', ...new Set(allEvents.map(e => e.category).filter(Boolean))];

  const activityData = [
    { month: 'Jan', registrations: 3, attended: 2 },
    { month: 'Feb', registrations: 5, attended: 4 },
    { month: 'Mar', registrations: 7, attended: 6 },
    { month: 'Apr', registrations: 4, attended: 3 },
    { month: 'May', registrations: 8, attended: 7 },
    { month: 'Jun', registrations: 6, attended: 5 }
  ];

  const categoryData = categories
    .filter(cat => cat !== 'all')
    .map(cat => ({
      name: cat,
      value: myRegistrations.filter(r => r.event?.category === cat).length
    }))
    .filter(stat => stat.value > 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-16 h-16 mb-4">
            <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <h3 className="text-lg font-semibold text-gray-700">Loading Dashboard</h3>
          <p className="text-gray-500 text-sm mt-2">Preparing your learning journey...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
    {toastNotification.show && (
  <div className={`fixed top-6 right-6 z-50 px-6 py-3 rounded-lg shadow-lg text-white font-medium flex items-center gap-2 animate-slideIn ${
    toastNotification.type === 'success' ? 'bg-gradient-to-r from-green-500 to-emerald-600' :
    toastNotification.type === 'error' ? 'bg-gradient-to-r from-red-500 to-pink-600' :
    'bg-gradient-to-r from-blue-500 to-cyan-600'
  }`}>
    {toastNotification.type === 'success' && <CheckCircle className="w-4 h-4" />}
    {toastNotification.type === 'error' && <XCircle className="w-4 h-4" />}
    {toastNotification.message}
  </div>
)}

      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-sm border-b border-gray-200">
        <div className="px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg shadow">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Student Portal</h1>
                <p className="text-sm text-gray-600">Welcome, {user.name || 'Student'}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center relative">
                <Search className="absolute left-3 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search events, certificates..."
                  className="pl-10 pr-4 py-2.5 w-64 bg-gray-100 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                />
              </div>
              
            {/* REPLACE WITH THIS: */}
<div className="relative">
  <button
    onClick={() => setActiveModal('notifications')}
    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
  >
    <Bell className="w-5 h-5 text-gray-600" />
    {unreadCount > 0 && (
      <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
        {unreadCount > 9 ? '9+' : unreadCount}
      </span>
    )}
  </button>
</div>
              
              <div className="flex items-center gap-3">
                <div className="hidden md:block text-right">
                  <p className="text-sm font-semibold text-gray-900">{user.name || 'Student'}</p>
                  <p className="text-xs text-gray-500">Student ID: {user.id?.slice(-6) || 'N/A'}</p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold shadow">
                  {(user.name || 'S').charAt(0)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="px-8 py-6">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Dashboard Overview</h2>
          <p className="text-gray-600 mb-6">Track your events, attendance, and certificates</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard 
              icon={Calendar}
              title="Total Registrations"
              value={stats.totalRegistrations}
              change={12}
              color="bg-gradient-to-r from-blue-500 to-blue-600"
              description="Events registered"
            />
            <StatCard 
              icon={CheckCircle}
              title="Events Attended"
              value={stats.eventsAttended}
              change={8}
              color="bg-gradient-to-r from-green-500 to-emerald-600"
              description="Completed successfully"
            />
            <StatCard 
              icon={Award}
              title="Certificates"
              value={stats.certificatesEarned}
              change={15}
              color="bg-gradient-to-r from-yellow-500 to-orange-500"
              description="Achievements unlocked"
            />
            <StatCard 
              icon={Activity}
              title="Attendance Rate"
              value={`${stats.attendanceRate}%`}
              change={5}
              color="bg-gradient-to-r from-purple-500 to-pink-600"
              description="Overall participation"
            />
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-xl border border-gray-200">
              <div className="flex border-b border-gray-200">
                {['upcoming', 'attended', 'certificates'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveSection(tab)}
                    className={`flex-1 py-4 text-sm font-semibold transition-colors ${
                      activeSection === tab 
                        ? 'text-blue-600 border-b-2 border-blue-600' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {tab === 'upcoming' && '📅 Upcoming Events'}
                    {tab === 'attended' && '✅ Attended Events'}
                    {tab === 'certificates' && '🏆 My Certificates'}
                  </button>
                ))}
              </div>
              
              <div className="p-6">
                {activeSection === 'upcoming' && (
                  <>
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-lg font-bold text-gray-900">Upcoming Events</h3>
                      <div className="flex items-center gap-3">
                        <select
                          value={filterCategory}
                          onChange={(e) => setFilterCategory(e.target.value)}
                          className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          {categories.map(cat => (
                            <option key={cat} value={cat}>
                              {cat === 'all' ? 'All Categories' : cat}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    
                    {upcomingEvents.length > 0 ? (
                      <div className="grid md:grid-cols-2 gap-6">
                        {upcomingEvents.slice(0, 4).map(event => {
                          const registered = isRegistered(event._id);
                          const attended = hasAttended(event._id);
                          const certificateAvailable = myCertificates.some(
                            cert => cert.eventId === event._id || cert.event?._id === event._id
                          );

                          return (
                            <EventCard
                              key={event._id}
                              event={{
                                ...event,
                                certificateAvailable,
                                attended
                              }}
                              onView={setSelectedEvent}
                              onRegister={handleRegisterEvent}
                              isRegistered={registered}
                              onDownload={handleDownloadCertificate}
                              onQRCode={(e) => {
                                setSelectedEvent(e);
                                setActiveModal('qr');
                              }}
                            />
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h4 className="text-lg font-semibold text-gray-700 mb-2">No upcoming events</h4>
                        <p className="text-gray-500">Check back later for new events and workshops</p>
                      </div>
                    )}
                  </>
                )}
                
              // REPLACE the 'attended' section in StudentDashboard.jsx:

{activeSection === 'attended' && (
  <>
    <h3 className="text-lg font-bold text-gray-900 mb-6">Your Attendance Records</h3>
    {attendedEvents.length > 0 ? (
      <div className="space-y-4">
        {attendedEvents.map(event => {
          // Find registration for this event
          const registration = myRegistrations.find(reg => 
            reg.eventId === event._id || 
            reg.event?._id === event._id ||
            reg.eventId?._id === event._id
          );
          
          const isPresent = registration?.attended || 
                           registration?.checkInAt || 
                           registration?.status === 'attended';
          
          const hasCertificate = registration?.certificateIssued;
          
          return (
            <div key={event._id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{event.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    {new Date(event.date).toLocaleDateString()} • {event.venue}
                  </p>
                  <div className="mt-2">
                    {isPresent ? (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Present
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        <XCircle className="w-3 h-3 mr-1" />
                        Absent
                      </span>
                    )}
                    {hasCertificate && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 ml-2">
                        <Award className="w-3 h-3 mr-1" />
                        Certificate Available
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {isPresent ? (
                    <>
                      {hasCertificate && (
                        <button
                          onClick={() => handleDownloadCertificate(event)}
                          className="px-3 py-1.5 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg text-sm font-medium flex items-center gap-1"
                        >
                          <Download className="w-4 h-4" />
                          Download Certificate
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setSelectedEvent(event);
                          setActiveModal('feedback');
                        }}
                        className="px-3 py-1.5 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg text-sm font-medium flex items-center gap-1"
                      >
                        <MessageSquare className="w-4 h-4" />
                        Give Feedback
                      </button>
                    </>
                  ) : (
                    <div className="text-right">
                      <p className="text-sm text-red-600 mb-2">You were marked absent</p>
                      <button
                        onClick={() => {
                          setSelectedEvent(event);
                          setActiveModal('feedback');
                        }}
                        className="px-3 py-1.5 bg-orange-100 text-orange-700 hover:bg-orange-200 rounded-lg text-sm font-medium"
                      >
                        Share Your Experience
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    ) : (
      <div className="text-center py-12">
        <FileCheck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h4 className="text-lg font-semibold text-gray-700 mb-2">No attendance records yet</h4>
        <p className="text-gray-500">Attend events to generate attendance proofs</p>
      </div>
    )}
  </>
)}
                
                {activeSection === 'certificates' && (
                  <>
                    <h3 className="text-lg font-bold text-gray-900 mb-6">Your Certificates</h3>
                    {myCertificates.length > 0 ? (
                      <div className="grid md:grid-cols-2 gap-4">
                        {myCertificates.map((reg, index) => {
                          const event = allEvents.find(e => 
                            e._id === reg.eventId || 
                            e._id === reg.event?._id ||
                            e._id === reg.eventId?._id
                          );
                          
                          return (
                            <div key={reg._id || index} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                              <div className="flex items-start gap-3">
                                <div className="p-2 bg-yellow-100 rounded-lg">
                                  <Award className="w-6 h-6 text-yellow-600" />
                                </div>
                                <div className="flex-1">
                                  <h4 className="font-semibold text-gray-900">
                                    {event?.title || reg.event?.title || 'Certificate'}
                                  </h4>
                                  <p className="text-sm text-gray-600 mt-1">
                                    Issued: {new Date(reg.issuedAt || new Date()).toLocaleDateString()}
                                  </p>
                                  <div className="flex gap-2 mt-3">
                                    <button
                                      onClick={() => event && handleDownloadCertificate(event)}
                                      className="px-3 py-1.5 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg text-sm font-medium"
                                    >
                                      Download
                                    </button>
                                    <button
                                      onClick={() => setActiveModal('request')}
                                      className="px-3 py-1.5 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg text-sm font-medium"
                                    >
                                      Request Copy
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <Award className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h4 className="text-lg font-semibold text-gray-700 mb-2">No certificates yet</h4>
                        <p className="text-gray-500">Complete events to earn certificates</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

           <div className="bg-white rounded-xl border border-gray-200 p-6">
  <div className="flex justify-between items-center mb-6">
    <h3 className="text-lg font-bold text-gray-900">Activity Overview</h3>
    <select 
      value={activityTimeRange}
      onChange={(e) => setActivityTimeRange(e.target.value)}
      className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
    >
      <option value="6months">Last 6 months</option>
      <option value="1year">Last year</option>
      <option value="alltime">All time (2 years)</option>
    </select>
  </div>
  
  {activityChartData.length > 0 ? (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={activityChartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="month" stroke="#666" />
        <YAxis stroke="#666" />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: '#fff', 
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
          }}
          labelStyle={{ fontWeight: 'bold', color: '#111827' }}
        />
        <Area 
          type="monotone" 
          dataKey="registrations" 
          stroke="#3b82f6" 
          fill="url(#colorRegistrations)" 
          fillOpacity={0.3}
          strokeWidth={2}
          name="Registered"
        />
        <Area 
          type="monotone" 
          dataKey="attended" 
          stroke="#10b981" 
          fill="url(#colorAttended)" 
          fillOpacity={0.3}
          strokeWidth={2}
          name="Attended"
        />
        <defs>
          <linearGradient id="colorRegistrations" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
          </linearGradient>
          <linearGradient id="colorAttended" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
          </linearGradient>
        </defs>
      </AreaChart>
    </ResponsiveContainer>
  ) : (
    <div className="h-[300px] flex items-center justify-center">
      <div className="text-center">
        <Activity className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-600">No activity data yet</p>
        <p className="text-sm text-gray-500 mt-1">Register for events to see your progress</p>
      </div>
    </div>
  )}
  
  {/* Legend */}
  {activityChartData.length > 0 && (
    <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t">
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
        <span className="text-sm text-gray-600">Registered</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full bg-green-500"></div>
        <span className="text-sm text-gray-600">Attended</span>
      </div>
    </div>
  )}
  
  {/* Summary Stats */}
  {activityChartData.length > 0 && (
    <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t">
      <div className="text-center">
        <p className="text-2xl font-bold text-blue-600">
          {activityChartData.reduce((sum, item) => sum + item.registrations, 0)}
        </p>
        <p className="text-xs text-gray-600 mt-1">Total Registrations</p>
      </div>
      <div className="text-center">
        <p className="text-2xl font-bold text-green-600">
          {activityChartData.reduce((sum, item) => sum + item.attended, 0)}
        </p>
        <p className="text-xs text-gray-600 mt-1">Total Attended</p>
      </div>
      <div className="text-center">
        <p className="text-2xl font-bold text-purple-600">
          {activityChartData.reduce((sum, item) => sum + item.registrations, 0) > 0
            ? Math.round(
                (activityChartData.reduce((sum, item) => sum + item.attended, 0) / 
                 activityChartData.reduce((sum, item) => sum + item.registrations, 0)) * 100
              )
            : 0}%
        </p>
        <p className="text-xs text-gray-600 mt-1">Attendance Rate</p>
      </div>
    </div>
  )}
</div>
          </div>

          <div className="space-y-8">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Event Categories</h3>
              {categoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {categoryData.map((entry, i) => (
                        <Cell 
                          key={`cell-${i}`} 
                          fill={['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899', '#6366f1'][i % 6]} 
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-8">
                  <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No category data available</p>
                </div>
              )}
            </div>

            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl p-6 text-white">
              <h3 className="text-lg font-bold mb-6">Quick Stats</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-blue-100">Active Registrations</span>
                  <span className="font-bold">{stats.upcomingEvents}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-blue-100">Certificates Pending</span>
                  <span className="font-bold">{Math.max(0, stats.eventsAttended - stats.certificatesEarned)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-blue-100">Hours Completed</span>
                  <span className="font-bold">{stats.eventsAttended * 4}h</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-blue-100">Current Streak</span>
                  <span className="font-bold">7 days 🔥</span>
                </div>
              </div>
            </div>

          // REPLACE Quick Actions section in StudentDashboard.jsx:



                            // REPLACE the Quick Actions section with this SUPER USEFUL section:

<div className="space-y-8">
  {/* 1. MY PROGRESS */}
  <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl p-6 text-white">
    <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
      <TrendingUp className="w-5 h-5" />
      My Progress
    </h3>
    
    <div className="space-y-4">
      {/* Attendance Rate Progress Bar */}
      <div>
        <div className="flex justify-between text-sm mb-2">
          <span className="text-blue-100">Attendance Rate</span>
          <span className="font-bold">{stats.attendanceRate}%</span>
        </div>
        <div className="w-full bg-blue-800/30 rounded-full h-3">
          <div 
            className="bg-white h-3 rounded-full transition-all duration-500"
            style={{ width: `${stats.attendanceRate}%` }}
          ></div>
        </div>
      </div>

      {/* Certificates Progress */}
      <div>
        <div className="flex justify-between text-sm mb-2">
          <span className="text-blue-100">Certificates Earned</span>
          <span className="font-bold">{stats.certificatesEarned} / {stats.eventsAttended}</span>
        </div>
        <div className="w-full bg-blue-800/30 rounded-full h-3">
          <div 
            className="bg-yellow-400 h-3 rounded-full transition-all duration-500"
            style={{ 
              width: stats.eventsAttended > 0 
                ? `${(stats.certificatesEarned / stats.eventsAttended) * 100}%` 
                : '0%' 
            }}
          ></div>
        </div>
      </div>

      {/* Points/Level System */}
      <div className="pt-4 border-t border-blue-500/30">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-blue-100">Activity Points</span>
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-yellow-400" />
            <span className="font-bold text-lg">
              {stats.eventsAttended * 100 + stats.certificatesEarned * 50}
            </span>
          </div>
        </div>
        <p className="text-xs text-blue-200">
          Earn points by attending events and collecting certificates
        </p>
      </div>
    </div>
  </div>

  {/* 2. UPCOMING DEADLINES */}
  <div className="bg-white rounded-xl border border-gray-200 p-6">
    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
      <Clock className="w-5 h-5 text-orange-500" />
      Upcoming Events
    </h3>
    
    {upcomingEvents.length > 0 ? (
      <div className="space-y-3">
        {upcomingEvents.slice(0, 3).map((event) => {
          const daysUntil = Math.ceil(
            (new Date(event.date) - new Date()) / (1000 * 60 * 60 * 24)
          );
          const registered = isRegistered(event._id);
          
          return (
            <div key={event._id} className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-medium text-gray-900 text-sm">{event.title}</h4>
                {registered && (
                  <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                    Registered
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between text-xs text-gray-600">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>{new Date(event.date).toLocaleDateString()}</span>
                </div>
                <span className={`font-medium ${
                  daysUntil <= 3 ? 'text-red-600' : 
                  daysUntil <= 7 ? 'text-orange-600' : 
                  'text-blue-600'
                }`}>
                  {daysUntil === 0 ? 'Today' : 
                   daysUntil === 1 ? 'Tomorrow' : 
                   `${daysUntil} days`}
                </span>
              </div>
              {!registered && (
                <button
                  onClick={() => navigate('/events')}
                  className="mt-2 w-full py-1.5 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700"
                >
                  Register Now
                </button>
              )}
            </div>
          );
        })}
      </div>
    ) : (
      <div className="text-center py-6">
        <Calendar className="w-10 h-10 text-gray-300 mx-auto mb-2" />
        <p className="text-sm text-gray-500">No upcoming events</p>
      </div>
    )}
    
    {upcomingEvents.length > 3 && (
      <button
        onClick={() => navigate('/events')}
        className="mt-4 w-full text-sm text-blue-600 hover:text-blue-800 font-medium"
      >
        View all {upcomingEvents.length} events →
      </button>
    )}
  </div>

  {/* 3. RECENT ACTIVITY */}
{/* 3. RECENT ACTIVITY */}
<div className="bg-white rounded-xl border border-gray-200 p-6">
  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
    <Activity className="w-5 h-5 text-purple-500" />
    Recent Activity
  </h3>
  
  <div className="space-y-3">
    {myRegistrations.slice(0, 5).map((reg) => {
      const event = allEvents.find(e => e._id === reg.eventId || e._id === reg.event?._id) || reg.event;
      if (!event) return null;
      
      const isFutureEvent = new Date(event.date) > new Date();
      const hasAttended = reg.attended || reg.checkInAt || reg.status === 'attended';
      
      // ✅ Check if QR code exists in registration data
      const hasQRCode = reg.qrCode || reg.qrCodeData;
      
      // ✅ Show QR button if:
      // 1. Event is in future OR
      // 2. QR code exists in registration (even if past event)
      const showQRBtn = (isFutureEvent && !hasAttended) || hasQRCode;
      
      return (
        <div key={reg._id} className="flex items-center justify-between pb-3 border-b last:border-0">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${hasAttended ? 'bg-green-100' : 'bg-blue-100'}`}>
              {hasAttended ? 
                <CheckCircle className="w-4 h-4 text-green-600" /> : 
                <Calendar className="w-4 h-4 text-blue-600" />
              }
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">{event.title}</p>
              <p className="text-xs text-gray-500">
                {hasAttended ? '✓ Attended' : 
                 isFutureEvent ? `⏰ ${new Date(event.date).toLocaleDateString()}` :
                 `📅 ${new Date(event.date).toLocaleDateString()}`}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {showQRBtn && (
              <button
                onClick={async () => {
                  try {
                    setLoadingQR(true);
                    const user = JSON.parse(localStorage.getItem('user') || '{}');
                    
                    // ✅ TRY 1: Check if QR already exists in registration data
                    if (reg.qrCode) {
                      console.log('✅ Using existing QR from registration:', reg._id);
                      setQrCodeData({
                        qrCode: reg.qrCode,
                        eventName: event.title,
                        studentName: reg.studentName || user.name,
                        checkInCode: reg._id.toString().slice(-8).toUpperCase(),
                        registrationId: reg._id,
                        isOrganizerQR: true
                      });
                      setShowQRModal(true);
                      toast.success('QR code loaded!');
                      return;
                    }
                    
                    // ✅ TRY 2: Fetch from backend
                    const token = localStorage.getItem('token');
                    const response = await fetch(
                      `http://localhost:5000/api/qr-codes/student/event/${event._id}`,
                      {
                        method: 'GET',
                        headers: {
                          'Authorization': `Bearer ${token}`,
                          'Content-Type': 'application/json'
                        }
                      }
                    );
                    
                    const data = await response.json();
                    
                    if (data.success && data.qrCode) {
                      console.log('✅ Got QR from backend API');
                      setQrCodeData({
                        qrCode: data.qrCode,
                        eventName: data.event?.title || event.title,
                        studentName: data.registration?.studentName || user.name,
                        checkInCode: data.registration?.checkInCode || reg._id.toString().slice(-8).toUpperCase(),
                        registrationId: data.registration?.id || reg._id,
                        isOrganizerQR: true
                      });
                      setShowQRModal(true);
                      toast.success('Organizer QR code loaded!');
                    } else {
                      // ✅ TRY 3: Generate local QR as fallback
                      console.log('⚠️ Generating local QR as fallback');
                      generateLocalQRCode(event, reg, user);
                    }
                  } catch (error) {
                    console.error('❌ Error loading QR:', error);
                    // Final fallback: Generate local QR
                    const user = JSON.parse(localStorage.getItem('user') || '{}');
                    generateLocalQRCode(event, reg, user);
                  } finally {
                    setLoadingQR(false);
                  }
                }}
                className="relative group"
                disabled={loadingQR}
                title="View organizer-generated QR code"
              >
                {loadingQR ? (
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                ) : (
                  <>
                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg blur opacity-75 group-hover:opacity-100"></div>
                    <div className="relative px-3 py-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center gap-2">
                      <QrCode className="w-4 h-4 text-white" />
                      <span className="text-xs text-white font-medium">QR Code</span>
                    </div>
                  </>
                )}
              </button>
            )}
            
            {hasAttended && (
              <div className="px-3 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                ✓ Checked in
              </div>
            )}
          </div>
        </div>
      );
    })}
  </div>
</div>

  {/* 4. ACHIEVEMENTS UNLOCKED */}
  <div className="bg-white rounded-xl border border-gray-200 p-6">
    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
      <Award className="w-5 h-5 text-yellow-500" />
      Achievements
    </h3>
    
    <div className="space-y-3">
      {/* First Event */}
      <div className={`flex items-center gap-3 p-3 rounded-lg ${
        stats.totalRegistrations >= 1 ? 'bg-yellow-50 border border-yellow-200' : 'bg-gray-50'
      }`}>
        <div className={`text-2xl ${stats.totalRegistrations >= 1 ? '' : 'grayscale opacity-40'}`}>
          🎯
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-900">First Step</p>
          <p className="text-xs text-gray-500">Register for your first event</p>
        </div>
        {stats.totalRegistrations >= 1 && (
          <CheckCircle className="w-5 h-5 text-green-600" />
        )}
      </div>

      {/* Perfect Attendee */}
      <div className={`flex items-center gap-3 p-3 rounded-lg ${
        stats.attendanceRate === 100 && stats.totalRegistrations >= 3 ? 
        'bg-yellow-50 border border-yellow-200' : 'bg-gray-50'
      }`}>
        <div className={`text-2xl ${
          stats.attendanceRate === 100 && stats.totalRegistrations >= 3 ? '' : 'grayscale opacity-40'
        }`}>
          ⭐
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-900">Perfect Attendee</p>
          <p className="text-xs text-gray-500">100% attendance rate (min 3 events)</p>
        </div>
        {stats.attendanceRate === 100 && stats.totalRegistrations >= 3 && (
          <CheckCircle className="w-5 h-5 text-green-600" />
        )}
      </div>

      {/* Certificate Collector */}
      <div className={`flex items-center gap-3 p-3 rounded-lg ${
        stats.certificatesEarned >= 5 ? 'bg-yellow-50 border border-yellow-200' : 'bg-gray-50'
      }`}>
        <div className={`text-2xl ${stats.certificatesEarned >= 5 ? '' : 'grayscale opacity-40'}`}>
          🏆
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-900">Certificate Collector</p>
          <p className="text-xs text-gray-500">Earn 5 certificates</p>
        </div>
        {stats.certificatesEarned >= 5 ? (
          <CheckCircle className="w-5 h-5 text-green-600" />
        ) : (
          <span className="text-xs text-gray-500">{stats.certificatesEarned}/5</span>
        )}
      </div>

      {/* Event Explorer */}
      <div className={`flex items-center gap-3 p-3 rounded-lg ${
        stats.totalRegistrations >= 10 ? 'bg-yellow-50 border border-yellow-200' : 'bg-gray-50'
      }`}>
        <div className={`text-2xl ${stats.totalRegistrations >= 10 ? '' : 'grayscale opacity-40'}`}>
          🚀
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-900">Event Explorer</p>
          <p className="text-xs text-gray-500">Register for 10 events</p>
        </div>
        {stats.totalRegistrations >= 10 ? (
          <CheckCircle className="w-5 h-5 text-green-600" />
        ) : (
          <span className="text-xs text-gray-500">{stats.totalRegistrations}/10</span>
        )}
      </div>
    </div>
  </div>
</div>





{/* ✅ REMOVE DocumentRequestModal from modals at bottom */}
{/* Keep only: FeedbackModal, MyQRCodesModal, QRCodeModal */}
          </div>
        </div>
      </main>

      <footer className="mt-12 px-8 py-6 border-t border-gray-200">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded">
                <Activity className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold text-gray-900">Student Portal</span>
            </div>
            <p className="text-gray-500 text-sm mt-1">University Event Management v2.0</p>
          </div>
          <div className="text-sm text-gray-500">
            © 2024 University Events Platform. All rights reserved.
          </div>
        </div>
      </footer>

    
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


//qr code modals trial and error
      {/* ✅ ADD QR CODE MODAL HERE */}
    {showQRModal && qrCodeData && (
  <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999] p-4">
    <div className="bg-white rounded-2xl max-w-md w-full">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white rounded-t-2xl">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold">🎫 Official Event QR Code</h3>
            <p className="text-sm opacity-90">{qrCodeData.eventName}</p>
            <p className="text-xs opacity-80 mt-1">
              {qrCodeData.isOrganizerQR 
                ? "✓ Generated by organizer • Official check-in code"
                : "Local QR code • Show at entrance"}
            </p>
          </div>
          <button 
            onClick={() => {
              setShowQRModal(false);
              setQrCodeData(null);
            }} 
            className="text-2xl hover:opacity-80"
          >
            ×
          </button>
        </div>
      </div>
      
      <div className="p-6 text-center">
        {/* Organizer's QR Code */}
        <div className={`inline-block p-4 bg-white border-2 rounded-xl mb-4 shadow-lg ${
          qrCodeData.isOrganizerQR ? 'border-blue-200' : 'border-gray-200'
        }`}>
          <img 
            src={qrCodeData.qrCode} 
            alt="Event QR Code" 
            className="w-64 h-64"
          />
          <div className={`mt-2 text-xs font-medium ${
            qrCodeData.isOrganizerQR ? 'text-blue-600' : 'text-gray-600'
          }`}>
            {qrCodeData.isOrganizerQR 
              ? '✓ Official Organizer QR' 
              : '⚠️ Local QR (Use as backup)'}
          </div>
        </div>
        
        {/* Student Info */}
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            Student: <span className="font-semibold">{qrCodeData.studentName}</span>
          </p>
          <p className="text-sm text-gray-600 mt-1">
            Check-in Code: <code className="bg-gray-200 px-2 py-1 rounded font-mono">{qrCodeData.checkInCode}</code>
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Registration ID: {qrCodeData.registrationId?.slice(-8)}
          </p>
        </div>
        
        <div className="flex gap-3 mt-4 justify-center">
          <button
            onClick={() => {
              const link = document.createElement('a');
              link.href = qrCodeData.qrCode;
              link.download = `event-qr-${qrCodeData.eventName.replace(/\s+/g, '-')}.png`;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Save QR
          </button>
          
          <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium flex items-center gap-2"
          >
            <FileText className="w-4 h-4" />
            Print
          </button>
        </div>
        
        <div className="mt-6 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-xs text-yellow-800">
            <strong>Important:</strong> {
              qrCodeData.isOrganizerQR 
                ? "This is the official QR code generated by the event organizer. Show it at the event entrance for check-in."
                : "This is a local QR code. Show it at the event entrance if the organizer's QR is not available."
            }
          </p>
        </div>
      </div>
    </div>
  </div>
)}

      {/* ✅ ADD NOTIFICATIONS MODAL HERE */}
{activeModal === 'notifications' && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-2xl max-w-md w-full max-h-[80vh] overflow-hidden">
      <div className="flex justify-between items-center p-6 border-b">
        <div>
          <h3 className="text-xl font-bold text-gray-900">Notifications</h3>
          <p className="text-sm text-gray-600">
            {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={async () => {
              try {
                const token = localStorage.getItem('token');
                await fetch('http://localhost:5000/api/student/notifications', {
                  method: 'DELETE',
                  headers: {
                    'Authorization': `Bearer ${token}`
                  }
                });
                fetchNotifications();
                setActiveModal(null);
              } catch (error) {
                console.error('Clear error:', error);
              }
            }}
            className="text-sm text-red-600 hover:text-red-800"
          >
            Clear All
          </button>
          <button
            onClick={() => setActiveModal(null)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      <div className="overflow-y-auto max-h-[calc(80vh-120px)]">
        {notifications.length > 0 ? (
          <div className="divide-y">
            {notifications.map((notif) => (
              <div
                key={notif._id || notif.id}
                className={`p-4 hover:bg-gray-50 transition-colors ${!notif.read ? 'bg-blue-50' : ''}`}
              >
                <div className="flex gap-3">
                  <div className={`p-2 rounded-lg ${
                    notif.type === 'reminder' ? 'bg-orange-100' :
                    notif.type === 'success' ? 'bg-green-100' :
                    notif.type === 'error' ? 'bg-red-100' :
                    'bg-blue-100'
                  }`}>
                    {notif.type === 'reminder' && <Bell className="w-4 h-4 text-orange-600" />}
                    {notif.type === 'success' && <CheckCircle className="w-4 h-4 text-green-600" />}
                    {notif.type === 'error' && <XCircle className="w-4 h-4 text-red-600" />}
                    {notif.type === 'info' && <Bell className="w-4 h-4 text-blue-600" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <h4 className="font-semibold text-gray-900">{notif.title}</h4>
                      <span className="text-xs text-gray-500">
                        {new Date(notif.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{notif.message}</p>
                    {notif.metadata?.eventTitle && (
                      <p className="text-xs text-gray-500 mt-2">
                        Event: {notif.metadata.eventTitle}
                      </p>
                    )}
                    {!notif.read && (
                      <button
                        onClick={async () => {
                          try {
                            const token = localStorage.getItem('token');
                            await fetch(`http://localhost:5000/api/student/notifications/${notif._id || notif.id}/read`, {
                              method: 'PATCH',
                              headers: {
                                'Authorization': `Bearer ${token}`
                              }
                            });
                            fetchNotifications();
                          } catch (error) {
                            console.error('Mark as read error:', error);
                          }
                        }}
                        className="mt-2 text-xs text-blue-600 hover:text-blue-800"
                      >
                        Mark as read
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h4 className="text-lg font-semibold text-gray-700 mb-2">No notifications</h4>
            <p className="text-gray-500">You're all caught up!</p>
          </div>
        )}
      </div>
    </div>
  </div>
)}

        


    </div>
  );
};

export default StudentDashboard;