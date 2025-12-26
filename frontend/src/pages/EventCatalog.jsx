import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext'; // ADD THIS
import { eventAPI } from '../utilis/api'; // ADD THIS
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast'; // ADD THIS
import {
    Sun, Moon, Bell, Calendar, Users, MapPin, Clock, Filter,
    CheckCircle, XCircle, Award, Info, Grid, List, Search,
    Building2, Tag, Wifi, WifiOff, DollarSign, User
} from 'lucide-react';

// REMOVE: const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// ========== MOCK DATA (fallback) ==========
const MOCK_EVENTS = [
    {
        _id: 'evt_001',
        title: 'Tech Talk: AI in Healthcare',
        description: 'Explore how AI is transforming healthcare with industry experts',
        date: '2025-03-15',
        time: '14:00',
        venue: 'Auditorium A',
        club: { _id: 'club1', name: 'Tech Club' },
        category: 'tech_talk',
        capacity: 200,
        registeredCount: 145,
        isOnline: false,
        isFree: true,
        certificateEnabled: true,
        registrationDeadline: '2025-03-14',
        status: 'published',
        poster: null
    },
    {
        _id: 'evt_002',
        title: 'Hackathon 2025',
        description: '24-hour coding marathon with exciting prizes',
        date: '2025-03-20',
        time: '09:00',
        venue: 'Innovation Lab',
        club: { _id: 'club1', name: 'Tech Club' },
        category: 'hackathon',
        capacity: 150,
        registeredCount: 98,
        isOnline: false,
        isFree: false,
        certificateEnabled: true,
        registrationDeadline: '2025-03-18',
        status: 'published',
        poster: null
    }
];

// ========== COMPONENT ==========
const EventCatalog = () => {
    const navigate = useNavigate();
    // Get authenticated user
    const { user: authUser } = useAuth(); // ADD THIS
    
    // Theme & UI State
    const [isDarkMode, setIsDarkMode] = useState(true);
    const [viewMode, setViewMode] = useState('grid');
    const [isLoading, setIsLoading] = useState(true);
    
    // Data State
    const [events, setEvents] = useState([]);
    const [myRegistrations, setMyRegistrations] = useState([]);
    const [clubs, setClubs] = useState([]);
    const [forceRefresh, setForceRefresh] = useState(0);
    
    // Filter State
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedClub, setSelectedClub] = useState('all');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedDate, setSelectedDate] = useState('all');
    const [selectedType, setSelectedType] = useState('all');
    const [selectedPrice, setSelectedPrice] = useState('all');
    
    // Modal State
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [showRegisterModal, setShowRegisterModal] = useState(false);
    const [notifications, setNotifications] = useState([]);

    // Get user ID
    const USER_ID = authUser?.id || JSON.parse(localStorage.getItem('user') || '{}').id || 'student123';

    // Theme Classes (keep your existing theme code)
    const theme = {
        bg: isDarkMode ? 'bg-gradient-to-br from-slate-950 to-slate-900 text-white' : 'bg-gray-50 text-gray-900',
        cardBg: isDarkMode ? 'bg-gray-900/50 border border-gray-700/50' : 'bg-white border border-gray-200 shadow-sm',
        headerText: isDarkMode ? 'text-green-400' : 'text-indigo-700',
        textColor: isDarkMode ? 'text-white' : 'text-gray-900',
        subTextColor: isDarkMode ? 'text-gray-400' : 'text-gray-600',
        border: isDarkMode ? 'border-gray-700' : 'border-gray-300',
        inputBg: isDarkMode ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900',
        buttonPrimary: isDarkMode ? 'bg-green-600 hover:bg-green-700' : 'bg-green-500 hover:bg-green-600',
        buttonSecondary: isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'
    };

    // ========== FETCH DATA ==========
useEffect(() => {
  const fetchData = async () => {
    setIsLoading(true);
    try {
      console.log('🔄 Fetching events from API...');
      
      // ✅ FIX: Use correct endpoint
      const eventsResponse = await fetch('http://localhost:5000/api/events', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!eventsResponse.ok) {
        throw new Error(`HTTP error! status: ${eventsResponse.status}`);
      }
      
      const eventsData = await eventsResponse.json();
      console.log('✅ Events received:', eventsData);
      
      const fetchedEvents = eventsData.events || eventsData.data || eventsData || [];
      
      // ✅ Only use mock data if NO events at all
      if (fetchedEvents.length === 0) {
        console.warn('⚠️ No events in database, using mock data');
        setEvents(MOCK_EVENTS);
      } else {
        console.log(`✅ Loaded ${fetchedEvents.length} events from database`);
        setEvents(fetchedEvents);
      }

      // Fetch clubs (optional)
      try {
        const clubsResponse = await fetch('http://localhost:5000/api/events/clubs');
        const clubsData = await clubsResponse.json();
        setClubs(clubsData.clubs || clubsData.data || []);
      } catch (err) {
        console.warn('Clubs endpoint not available');
        const uniqueClubs = [...new Set(fetchedEvents.map(e => e.club?.name).filter(Boolean))];
        setClubs(uniqueClubs.map((name, i) => ({ _id: `club_${i}`, name })));
      }

      // ✅ Fetch user registrations if logged in
      if (USER_ID && USER_ID !== 'student123') {
        try {
          const regResponse = await fetch(`http://localhost:5000/api/events/registrations/user/${USER_ID}`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
          
          if (regResponse.ok) {
            const regData = await regResponse.json();
            setMyRegistrations(regData.registrations || regData.data || []);
            console.log('✅ User registrations loaded:', regData.registrations?.length || 0);
          }
        } catch (err) {
          console.warn('Could not fetch registrations:', err);
        }
      }

    } catch (error) {
      console.error('❌ Error fetching events:', error);
      addNotification('Could not load events. Using offline data.', 'error');
      setEvents(MOCK_EVENTS);
    } finally {
      setIsLoading(false);
    }
  };

  fetchData();
}, [USER_ID, forceRefresh]); // ✅ Refetch when forceRefresh changes


// ✅ ADD THIS - Auto-refresh every 30 seconds
useEffect(() => {
  const interval = setInterval(() => {
    console.log('🔄 Auto-refreshing events...');
    setForceRefresh(prev => prev + 1);
  }, 30000); // Refresh every 30 seconds

  return () => clearInterval(interval);
}, []);


    // Add this NEW useEffect in EventCatalog.jsx:
useEffect(() => {
  // Listen for refresh events
  const handleStorageChange = () => {
    const refreshFlag = localStorage.getItem('refreshEventCatalog');
    if (refreshFlag) {
      setForceRefresh(prev => prev + 1);
      localStorage.removeItem('refreshEventCatalog');
      console.log('Refreshing events...');
    }
  };

  // Check every 2 seconds
  const interval = setInterval(handleStorageChange, 2000);
  
  return () => clearInterval(interval);
}, []);

    // ========== HELPER FUNCTIONS ==========
    const addNotification = (message, type = 'success') => {
        const id = Date.now();
        setNotifications(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setNotifications(prev => prev.filter(n => n.id !== id));
        }, 4000);
    };

    const isRegistered = (eventId) => {
        return myRegistrations.some(reg => reg.eventId === eventId || reg.event?._id === eventId);
    };

    const getSeatsLeft = (event) => {
        return event.capacity - (event.registeredCount || 0);
    };

    const isDeadlinePassed = (deadline) => {
        return new Date(deadline) < new Date();
    };

    const canRegister = (event) => {
        return !isRegistered(event._id) && 
               getSeatsLeft(event) > 0 && 
               !isDeadlinePassed(event.registrationDeadline) &&
               event.status === 'published';
    };

    // ========== REGISTER HANDLER ==========
  // REPLACE handleRegister in EventCatalog.jsx with this:

const handleRegister = async (event) => {
  try {
    // Get user from localStorage
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    const userRole = userData?.role || '';
    const userId = userData?._id || userData?.id;
    
    console.log('👤 Current user:', { userId, role: userRole });
    
    // ✅ BLOCK ADMIN/ORGANIZER REGISTRATION
    if (userRole === 'admin' || userRole === 'organizer') {
      toast.error('Please login as a student to register for events');
      addNotification('Only students can register for events. Please switch to a student account.', 'error');
      return;
    }
    
    // ✅ CHECK IF USER IS LOGGED IN
    if (!userId || userId === 'student123') {
      toast.error('Please login first to register for events');
      addNotification('Please login as a student to register', 'error');
      return;
    }
    
    // ✅ CHECK IF ALREADY REGISTERED
    if (isRegistered(event._id)) {
      toast.warning('You have already registered for this event');
      return;
    }
    
    // ✅ PROCEED WITH REGISTRATION
    const registrationData = {
      userId: userId,
      studentName: userData.name || userData.username || 'Student',
      email: userData.email || `${userId}@student.com`,
      phone: userData.phone || '',
      college: userData.college || '',
      department: userData.department || '',
      year: userData.year || ''
    };
    
    console.log('📝 Registration data:', registrationData);
    
    const response = await fetch(`http://localhost:5000/api/events/${event._id}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(registrationData),
      credentials: 'include'
    });
    
    const result = await response.json();
    
    if (result.success) {
      toast.success('Registration successful!');
      addNotification(`Successfully registered for ${event.title}!`, 'success');
      
      // ✅ IMMEDIATELY UPDATE UI
      setMyRegistrations(prev => [...prev, {
        eventId: event._id,
        event: event,
        registrationId: result.registration?._id,
        status: 'registered',
        registeredAt: new Date().toISOString()
      }]);
      
      // ✅ UPDATE TOTAL REGISTRATIONS COUNT
      setEvents(prev => prev.map(e => 
        e._id === event._id 
          ? { ...e, registeredCount: (e.registeredCount || 0) + 1 }
          : e
      ));
      
      setShowRegisterModal(false);
      
      // Refresh registrations
      setTimeout(() => {
        setForceRefresh(prev => prev + 1);
      }, 1000);
      
    } else {
      throw new Error(result.message || 'Registration failed');
    }
  } catch (error) {
    console.error('❌ Registration failed:', error);
    toast.error(error.message || 'Registration failed. Please try again.');
    addNotification('Registration failed. Please try again.', 'error');
  }
};

    // ========== FILTERING ==========
    const filteredEvents = useMemo(() => {
        return events.filter(event => {
            // Search
            if (searchQuery && !event.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
                !event.description.toLowerCase().includes(searchQuery.toLowerCase())) {
                return false;
            }

            // Club filter
            if (selectedClub !== 'all' && event.club?._id !== selectedClub && event.club?.name !== selectedClub) {
                return false;
            }

            // Category filter
            if (selectedCategory !== 'all' && event.category !== selectedCategory) {
                return false;
            }

            // Date filter
            if (selectedDate !== 'all') {
                const eventDate = new Date(event.date);
                const today = new Date();
                today.setHours(0, 0, 0, 0);

                if (selectedDate === 'today' && eventDate.toDateString() !== today.toDateString()) {
                    return false;
                }
                if (selectedDate === 'week') {
                    const weekFromNow = new Date(today);
                    weekFromNow.setDate(weekFromNow.getDate() + 7);
                    if (eventDate < today || eventDate > weekFromNow) return false;
                }
                if (selectedDate === 'month') {
                    const monthFromNow = new Date(today);
                    monthFromNow.setMonth(monthFromNow.getMonth() + 1);
                    if (eventDate < today || eventDate > monthFromNow) return false;
                }
            }

            // Type filter (online/offline)
            if (selectedType !== 'all') {
                if (selectedType === 'online' && !event.isOnline) return false;
                if (selectedType === 'offline' && event.isOnline) return false;
            }

            // Price filter
            if (selectedPrice !== 'all') {
                if (selectedPrice === 'free' && !event.isFree) return false;
                if (selectedPrice === 'paid' && event.isFree) return false;
            }

            return true;
        });
    }, [events, searchQuery, selectedClub, selectedCategory, selectedDate, selectedType, selectedPrice]);

    // ========== STATS ==========
    const stats = useMemo(() => ({
        total: events.length,
        registered: myRegistrations.length,
        available: events.filter(e => canRegister(e)).length,
        upcoming: events.filter(e => new Date(e.date) > new Date()).length
    }), [events, myRegistrations]);

    // ========== RENDER ==========
    return (
        <div className={`min-h-screen pt-20 font-sans ${theme.bg}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                
                {/* Header */}
                <motion.div 
                    initial={{ opacity: 0, y: -20 }} 
                    animate={{ opacity: 1, y: 0 }}
                    className={`mb-8 flex justify-between items-center border-b ${theme.border} pb-4`}
                >
                    <div>
                        <h1 className={`text-4xl font-extrabold ${theme.headerText}`}>Event Catalog</h1>
                        <p className={theme.subTextColor}>Browse & Register for Campus Events</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setIsDarkMode(!isDarkMode)}
                            className={`p-2 rounded-full ${theme.buttonSecondary}`}
                        >
                            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                        </button>
                        <Bell className={`w-6 h-6 ${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'}`} />
                    </div>
                </motion.div>

                {/* Stats Cards */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }} 
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
                >
                    {[
                        { label: 'Total Events', value: stats.total, icon: Calendar, color: 'text-blue-500' },
                        { label: 'My Registrations', value: stats.registered, icon: CheckCircle, color: 'text-green-500' },
                        { label: 'Available', value: stats.available, icon: Users, color: 'text-purple-500' },
                        { label: 'Upcoming', value: stats.upcoming, icon: Clock, color: 'text-orange-500' }
                    ].map((stat, i) => (
                        <motion.div
                            key={i}
                            whileHover={{ scale: 1.02 }}
                            className={`${theme.cardBg} rounded-lg p-4`}
                        >
                            <div className="flex items-center gap-3">
                                <stat.icon className={`w-8 h-8 ${stat.color}`} />
                                <div>
                                    <p className={`text-2xl font-bold ${theme.textColor}`}>{stat.value}</p>
                                    <p className={`text-xs ${theme.subTextColor}`}>{stat.label}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Filters */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`${theme.cardBg} rounded-lg p-6 mb-8`}
                >
                    <div className="flex items-center gap-2 mb-4">
                        <Filter className={`w-5 h-5 ${theme.headerText}`} />
                        <h3 className={`text-lg font-bold ${theme.textColor}`}>Filters</h3>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* Search */}
                        <div className="lg:col-span-3">
                            <div className="relative">
                                <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${theme.subTextColor}`} />
                                <input
                                    type="text"
                                    placeholder="Search events..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className={`w-full pl-10 pr-4 py-2 rounded-lg border ${theme.inputBg}`}
                                />
                            </div>
                        </div>

                        {/* Club Filter */}
                        <select
                            value={selectedClub}
                            onChange={(e) => setSelectedClub(e.target.value)}
                            className={`px-4 py-2 rounded-lg border ${theme.inputBg}`}
                        >
                            <option value="all">All Clubs</option>
                            {clubs.map(club => (
                                <option key={club._id} value={club._id}>{club.name}</option>
                            ))}
                        </select>

                        {/* Category Filter */}
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className={`px-4 py-2 rounded-lg border ${theme.inputBg}`}
                        >
                            <option value="all">All Categories</option>
                            <option value="tech_talk">Tech Talk</option>
                            <option value="workshop">Workshop</option>
                            <option value="hackathon">Hackathon</option>
                            <option value="competition">Competition</option>
                            <option value="seminar">Seminar</option>
                            <option value="cultural">Cultural</option>
                        </select>

                        {/* Date Filter */}
                        <select
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className={`px-4 py-2 rounded-lg border ${theme.inputBg}`}
                        >
                            <option value="all">All Dates</option>
                            <option value="today">Today</option>
                            <option value="week">This Week</option>
                            <option value="month">This Month</option>
                        </select>

                        {/* Type Filter */}
                        <select
                            value={selectedType}
                            onChange={(e) => setSelectedType(e.target.value)}
                            className={`px-4 py-2 rounded-lg border ${theme.inputBg}`}
                        >
                            <option value="all">Online & Offline</option>
                            <option value="online">Online Only</option>
                            <option value="offline">Offline Only</option>
                        </select>

                        {/* Price Filter */}
                        <select
                            value={selectedPrice}
                            onChange={(e) => setSelectedPrice(e.target.value)}
                            className={`px-4 py-2 rounded-lg border ${theme.inputBg}`}
                        >
                            <option value="all">All Events</option>
                            <option value="free">Free Events</option>
                            <option value="paid">Paid Events</option>
                        </select>
                    </div>

                    {/* View Toggle */}
                    <div className="flex justify-end gap-2 mt-4">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded ${viewMode === 'grid' ? theme.buttonPrimary : theme.buttonSecondary}`}
                        >
                            <Grid className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded ${viewMode === 'list' ? theme.buttonPrimary : theme.buttonSecondary}`}
                        >
                            <List className="w-5 h-5" />
                        </button>
                    </div>
                </motion.div>

                {/* Events Grid/List */}
                {isLoading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent mx-auto" />
                        <p className={`mt-4 ${theme.subTextColor}`}>Loading events...</p>
                    </div>
                ) : filteredEvents.length === 0 ? (
                    <div className={`text-center py-12 ${theme.cardBg} rounded-lg`}>
                        <Calendar className={`w-16 h-16 mx-auto mb-4 ${theme.subTextColor}`} />
                        <p className={`text-lg ${theme.textColor}`}>No events found</p>
                        <p className={theme.subTextColor}>Try adjusting your filters</p>
                    </div>
                ) : (
                    <div className={viewMode === 'grid' ? 'grid md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
                        {filteredEvents.map(event => (
                            <motion.div
                                key={event._id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                whileHover={{ scale: 1.02 }}
                                className={`${theme.cardBg} rounded-lg p-6 cursor-pointer ${
                                    isRegistered(event._id) ? 'ring-2 ring-green-500' : ''
                                }`}
                               onClick={() => navigate(`/events/${event._id}`)} // CHANGE THIS LIN
                            >
                                {/* Event Header */}
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex-1">
                                        <h3 className={`text-lg font-bold ${theme.textColor} mb-1`}>
                                            {event.title}
                                        </h3>
                                        <p className={`text-sm flex items-center gap-1 ${theme.subTextColor}`}>
                                            <Building2 className="w-4 h-4" />
                                            {event.club?.name || 'Event Club'}
                                        </p>
                                    </div>
                                    {isRegistered(event._id) && (
                                        <CheckCircle className="w-6 h-6 text-green-500" />
                                    )}
                                </div>

                                {/* Event Details */}
                                <div className={`space-y-2 text-sm ${theme.subTextColor} mb-4`}>
                                    <p className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4" />
                                        {new Date(event.date).toLocaleDateString('en-US', { 
                                            weekday: 'short', 
                                            month: 'short', 
                                            day: 'numeric' 
                                        })} at {event.time}
                                    </p>
                                    <p className="flex items-center gap-2">
                                        {event.isOnline ? <Wifi className="w-4 h-4" /> : <MapPin className="w-4 h-4" />}
                                        {event.venue}
                                    </p>
                                    <p className="flex items-center gap-2">
                                        <Users className="w-4 h-4" />
                                        {getSeatsLeft(event)} / {event.capacity} seats left
                                    </p>
                                </div>

                                {/* Tags */}
                                <div className="flex flex-wrap gap-2 mb-4">
                                    <span className={`px-2 py-1 rounded text-xs ${
                                        isDarkMode ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-700'
                                    }`}>
                                        <Tag className="w-3 h-3 inline mr-1" />
                                        {event.category.replace('_', ' ')}
                                    </span>
                                    {event.isFree && (
                                        <span className={`px-2 py-1 rounded text-xs ${
                                            isDarkMode ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-700'
                                        }`}>
                                            Free
                                        </span>
                                    )}
                                    {event.certificateEnabled && (
                                        <span className={`px-2 py-1 rounded text-xs ${
                                            isDarkMode ? 'bg-purple-900 text-purple-300' : 'bg-purple-100 text-purple-700'
                                        }`}>
                                            <Award className="w-3 h-3 inline mr-1" />
                                            Certificate
                                        </span>
                                    )}
                                </div>

                                {/* Action Button */}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (canRegister(event)) {
                                            setSelectedEvent(event);
                                            setShowRegisterModal(true);
                                        }
                                    }}
                                    disabled={!canRegister(event)}
                                    className={`w-full py-2 rounded-lg font-semibold ${
                                        isRegistered(event._id)
                                            ? `${isDarkMode ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-700'} cursor-default`
                                            : canRegister(event)
                                            ? `${theme.buttonPrimary} text-white`
                                            : `${theme.buttonSecondary} ${theme.subTextColor} cursor-not-allowed`
                                    }`}
                                >
                                    {isRegistered(event._id) ? 'Registered' : 
                                     getSeatsLeft(event) === 0 ? 'Full' :
                                     isDeadlinePassed(event.registrationDeadline) ? 'Closed' :
                                     'Register'}
                                </button>
                            </motion.div>
                        ))}
                    </div>
                )}

                {/* Event Detail Modal */}
                <AnimatePresence>
                    {selectedEvent && !showRegisterModal && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
                            onClick={() => setSelectedEvent(null)}
                        >
                            <motion.div
                                initial={{ scale: 0.9, y: 20 }}
                                animate={{ scale: 1, y: 0 }}
                                exit={{ scale: 0.9, y: 20 }}
                                className={`${theme.cardBg} rounded-xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto`}
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <h2 className={`text-2xl font-bold ${theme.textColor} mb-2`}>
                                            {selectedEvent.title}
                                        </h2>
                                        <p className={`flex items-center gap-2 ${theme.subTextColor}`}>
                                            <Building2 className="w-5 h-5" />
                                            {selectedEvent.club?.name}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => setSelectedEvent(null)}
                                        className={`p-2 rounded ${theme.buttonSecondary}`}
                                    >
                                        <XCircle className="w-6 h-6" />
                                    </button>
                                </div>

                                <p className={`${theme.textColor} mb-6`}>{selectedEvent.description}</p>

                                <div className={`grid md:grid-cols-2 gap-4 mb-6 ${theme.subTextColor}`}>
                                    <div className="flex items-center gap-3">
                                        <Calendar className="w-5 h-5" />
                                        <div>
                                            <p className="text-xs">Date</p>
                                            <p className={`font-semibold ${theme.textColor}`}>
                                                {new Date(selectedEvent.date).toLocaleDateString('en-US', {
                                                    weekday: 'long',
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Clock className="w-5 h-5" />
                                        <div>
                                            <p className="text-xs">Time</p>
                                            <p className={`font-semibold ${theme.textColor}`}>{selectedEvent.time}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {selectedEvent.isOnline ? <Wifi className="w-5 h-5" /> : <MapPin className="w-5 h-5" />}
                                        <div>
                                            <p className="text-xs">Venue</p>
                                            <p className={`font-semibold ${theme.textColor}`}>{selectedEvent.venue}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Users className="w-5 h-5" />
                                        <div>
                                            <p className="text-xs">Capacity</p>
                                            <p className={`font-semibold ${theme.textColor}`}>
                                                {selectedEvent.registeredCount || 0} / {selectedEvent.capacity}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {canRegister(selectedEvent) && (
                                    <button
                                        onClick={() => setShowRegisterModal(true)}
                                        className={`w-full py-3 rounded-lg font-semibold ${theme.buttonPrimary} text-white`}
                                    >
                                        Register for this Event
                                    </button>
                                )}

                                {isRegistered(selectedEvent._id) && (
                                    <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-green-900/30 border border-green-700' : 'bg-green-100 border border-green-300'}`}>
                                        <p className={`font-semibold flex items-center gap-2 ${isDarkMode ? 'text-green-400' : 'text-green-700'}`}>
                                            <CheckCircle className="w-5 h-5" />
                                            You're registered for this event!
                                        </p>
                                    </div>
                                )}

                                {!canRegister(selectedEvent) && !isRegistered(selectedEvent._id) && (
                                    <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-red-900/30 border border-red-700' : 'bg-red-100 border border-red-300'}`}>
                                        <p className={`font-semibold ${isDarkMode ? 'text-red-400' : 'text-red-700'}`}>
                                            {getSeatsLeft(selectedEvent) === 0 ? 'Event is full' : 
                                             isDeadlinePassed(selectedEvent.registrationDeadline) ? 'Registration closed' :
                                             'Registration unavailable'}
                                        </p>
                                    </div>
                                )}
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Registration Confirmation Modal */}
                <AnimatePresence>
                    {showRegisterModal && selectedEvent && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
                            onClick={() => setShowRegisterModal(false)}
                        >
                            <motion.div
                                initial={{ scale: 0.9, y: 20 }}
                                animate={{ scale: 1, y: 0 }}
                                exit={{ scale: 0.9, y: 20 }}
                                className={`${theme.cardBg} rounded-xl p-8 max-w-md w-full`}
                                onClick={(e) => e.stopPropagation()}
                            >
                                <h3 className={`text-2xl font-bold ${theme.textColor} mb-4`}>
                                    Confirm Registration
                                </h3>

                                <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'} rounded-lg p-4 mb-6`}>
                                    <h4 className={`font-semibold ${theme.textColor} mb-2`}>
                                        {selectedEvent.title}
                                    </h4>
                                    <div className={`space-y-2 text-sm ${theme.subTextColor}`}>
                                        <p className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4" />
                                            {new Date(selectedEvent.date).toLocaleDateString('en-US', {
                                                weekday: 'short',
                                                month: 'short',
                                                day: 'numeric'
                                            })} at {selectedEvent.time}
                                        </p>
                                        <p className="flex items-center gap-2">
                                            {selectedEvent.isOnline ? <Wifi className="w-4 h-4" /> : <MapPin className="w-4 h-4" />}
                                            {selectedEvent.venue}
                                        </p>
                                        <p className="flex items-center gap-2">
                                            <Building2 className="w-4 h-4" />
                                            {selectedEvent.club?.name}
                                        </p>
                                    </div>
                                </div>

                                <div className={`${isDarkMode ? 'bg-blue-900/30 border border-blue-700' : 'bg-blue-100 border border-blue-300'} rounded-lg p-4 mb-6`}>
                                    <p className={`text-sm ${isDarkMode ? 'text-blue-300' : 'text-blue-700'}`}>
                                        <Info className="w-4 h-4 inline mr-2" />
                                        You'll receive a confirmation email with your QR code for event check-in.
                                    </p>
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setShowRegisterModal(false)}
                                        className={`flex-1 py-3 rounded-lg font-semibold ${theme.buttonSecondary} ${theme.textColor}`}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={() => handleRegister(selectedEvent)}
                                        className={`flex-1 py-3 rounded-lg font-semibold ${theme.buttonPrimary} text-white`}
                                    >
                                        Confirm
                                    </button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Notifications */}
                <div className="fixed bottom-4 right-4 z-50 space-y-2">
                    <AnimatePresence>
                        {notifications.map((notif) => (
                            <motion.div
                                key={notif.id}
                                initial={{ opacity: 0, x: 100 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 100 }}
                                className={`p-4 rounded-lg shadow-xl text-white font-semibold flex items-center gap-3 min-w-[300px] ${
                                    notif.type === 'success' ? 'bg-green-600' :
                                    notif.type === 'error' ? 'bg-red-600' :
                                    'bg-blue-600'
                                }`}
                            >
                                {notif.type === 'success' && <CheckCircle className="w-5 h-5" />}
                                {notif.type === 'error' && <XCircle className="w-5 h-5" />}
                                {notif.type === 'info' && <Info className="w-5 h-5" />}
                                {notif.message}
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default EventCatalog;