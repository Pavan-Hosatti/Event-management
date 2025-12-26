import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, Bell, User, Settings, LogOut, Menu, X, Home, MessageCircle, Plus, Moon, Sun, Calendar, ShoppingCart, Tractor } from 'lucide-react';
// -----------------------------------------------------------
// 💡 NEW: Import useTranslation for internationalization
import { useTranslation } from 'react-i18next'; 
// -----------------------------------------------------------

// 💡 NEW: Import the useAuth hook to access user state globally
import { useAuth } from '../../context/AuthContext'; 


// const mockNotifications = [
//   { id: 1, text: 'Your produce "Organic Tomatoes" was approved!', read: false },
//   { id: 2, text: 'John commented on your listing.', read: true },
//   { id: 3, text: 'You have a new buyer inquiry.', read: false },
// ];
// ---------------------------------------------

// 💡 Props adjusted: We only need isDark and toggleTheme now, as auth is via context.
const Header = ({ isDark, toggleTheme }) => { 
  const location = useLocation();
  const navigate = useNavigate();
  
  // -----------------------------------------------------------
  // 💡 NEW: Get the translation function (t) and i18n instance
  const { t, i18n } = useTranslation(); 
  // -----------------------------------------------------------

  // 💡 FIX 1: Use the Context state for user and auth status
  const { user, isAuthenticated, logout } = useAuth();
  
 const [notifications, setNotifications] = useState([]);
const [unreadCount, setUnreadCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const profileDropdownRef = useRef(null);
  const notificationsDropdownRef = useRef(null);


// Update the fetchNotifications function:
const fetchNotifications = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return;
    
    // Use the real notification endpoint
    const response = await fetch('http://localhost:5000/api/notifications', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      console.log('Notifications endpoint failed:', response.status);
      return;
    }
    
    const data = await response.json();
    
    if (data.success) {
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
      console.log(`✅ Loaded ${data.notifications?.length || 0} notifications (${data.unreadCount || 0} unread)`);
    }
    
  } catch (error) {
    console.error('Failed to fetch notifications:', error);
  }
};

// Update markNotificationAsRead:




  const useClickOutsideLogic = (ref, handler) => {
    const listener = useCallback((event) => {
      if (!ref.current || ref.current.contains(event.target)) {
        return;
      }
      handler(event);
    }, [ref, handler]);
    
    useEffect(() => {
      document.addEventListener('mousedown', listener);
      document.addEventListener('touchstart', listener);
      return () => {
        document.removeEventListener('mousedown', listener);
        document.removeEventListener('touchstart', listener);
      };
    }, [listener]);
  };

  useEffect(() => {
  if (isAuthenticated) {
    fetchNotifications();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }
}, [isAuthenticated]);
  
  useClickOutsideLogic(profileDropdownRef, () => setIsProfileOpen(false));
  useClickOutsideLogic(notificationsDropdownRef, () => setIsNotificationsOpen(false));

  // Theme initialization is now handled via prop from App.jsx
  
 

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setIsMenuOpen(false);
    }
  };

  // -----------------------------------------------------------
  // 💡 NEW: Function to change language on click
  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };
  // -----------------------------------------------------------

  // 💡 FIX 2: Use the context logout function
  const handleLogout = () => {
    logout(); 
    setIsProfileOpen(false);
    navigate('/');
  };

  const handleProtectedNavigation = (e) => {
    if (!isAuthenticated) {
      e.preventDefault();
      navigate('/login');
    }
    setIsMenuOpen(false);
  };

  const markNotificationAsRead = async (id) => {
  try {
    const token = localStorage.getItem('token');
    
    await fetch(`http://localhost:5000/api/student/notifications/${id}/read`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    // Refresh notifications
    fetchNotifications();
  } catch (error) {
    console.error('Mark as read error:', error);
  }
};

  // 💡 FIX 3: Dynamic dashboard based on 'user?.role' from context
 // Update the getDashboardInfo function (around line 98):
const getDashboardInfo = () => {
  const role = (user?.role || '').toString().toLowerCase();
  
  if (role === 'student') {
    return { 
      name: t('Student Dashboard'), 
      href: '/student-dashboard', 
      icon: User // or Calendar for events
    };
  } else if (role === 'admin' || role === 'organizer') {
    return { 
      name: t('Admin Dashboard'), 
      href: '/admin-dashboard', 
      icon: Settings // or Calendar
    };
  }
  
  // Default fallback
  return { 
    name: t('Dashboard'), 
    href: '/login', 
    icon: User 
  };
};

  const dashboardInfo = isAuthenticated 
    ? getDashboardInfo() 
    // 💡 WRAPPED TEXT: Dashboard (for unauthenticated fallback)
    : { name: t('Dashboard'), href: '/login', icon: User };

  const navItems = [
    // 💡 WRAPPED TEXT: Home, Events, AI Suggestions
    { name: t('Home'), href: '/', icon: Home, isProtected: false },
    { name: t('Events'), href: '/events', icon: Calendar, isProtected: false },
    { name: t('AI Suggestions'), href: '/ai-suggestions', icon: Plus, isProtected: false },
    // Use the dynamic dashboardInfo here
    { name: dashboardInfo.name, href: dashboardInfo.href, icon: dashboardInfo.icon, isProtected: true }
  ];

 
  
  // Custom Hook to prevent body scrolling when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : 'auto';
    return () => {
        document.body.style.overflow = 'auto'; // Cleanup
    };
  }, [isMenuOpen]);



  // Inline component for the link buttons to simplify the JSX
  const DropdownItem = ({ to, onClick, icon: Icon, children, isLogout = false }) => (
      <Link 
          to={to} 
          onClick={() => {
            onClick(); // Execute passed-in click handler
            setIsProfileOpen(false); // Close dropdown on navigation
          }} 
          className={`flex items-center gap-3 px-4 py-3 transition-colors ${
              isLogout 
              ? 'text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20' 
              : 'text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-gray-800'
          }`}
      >
          <Icon className="w-4 h-4" />
          <span>{children}</span>
      </Link>
  );


  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 transition-colors duration-500`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 lg:h-20">
          
          {/* Group 1: Logo and Desktop Nav Links */}
          <div className="flex items-center space-x-6">

            {/* Left: Logo */}
            <motion.div whileHover={{ scale: 1.05 }} className="flex items-center gap-3 flex-shrink-0">
              <Link to="/" className="flex items-center gap-2">
                {/* Logo Icon */}
                <div className="w-8 h-8 lg:w-10 lg:h-10 bg-indigo-600 rounded-full flex items-center justify-center">
                  <Calendar className="w-5 h-5 lg:w-6 lg:h-6 text-white"/>
                </div>
                <div className="hidden sm:block">
                  {/* Brand Name */}
                  <span className="text-xl lg:text-2xl font-black text-gray-900 dark:text-white transition-colors duration-500">{t('EventHub')}</span>
                  <div className="text-xs text-gray-500 dark:text-gray-400 -mt-1 font-medium tracking-wide transition-colors duration-500">{t('Your Campus, Your Events')}</div>
                </div>
              </Link>
            </motion.div>

            {/* Center: Desktop Navigation (Pill-shaped, Green Active Match) */}
            <div className="hidden lg:flex items-center space-x-1">
              {navItems.map((item, index) => {
                const isActive = location.pathname === item.href;
                // Determine props based on protection status
                const linkProps = (item.isProtected && !isAuthenticated)
                  ? { to: '/login', onClick: handleProtectedNavigation }
                  : { to: item.href };

                return (
                  <Link
                    key={index}
                    {...linkProps}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 font-medium text-sm
                      ${isActive
                        ? 'text-white bg-indigo-700 shadow-md shadow-indigo-500/30'
                        : 'text-gray-600 dark:text-gray-300 hover:text-indigo-700 dark:hover:text-indigo-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                  >
                    <item.icon className="w-4 h-4" />
                    {/* The name is already translated via navItems array, so no need for t() here */}
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Group 2: Actions - Search, Notifications, Profile/Auth */}
          <div className="flex items-center gap-3">

            {/* Search Bar (Desktop) */}
            <div className="hidden md:block relative">
              <form onSubmit={handleSearchSubmit} className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  // 💡 WRAPPED TEXT: Search events...
                  placeholder={t('Search events...')}
                  className="w-64 pl-9 pr-3 py-2 text-sm bg-gray-100 dark:bg-gray-800 border border-transparent dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600 transition-all duration-200"
                />
              </form>
            </div>
            
            {/* ----------------------------------------------------------- */}
            {/* 💡 NEW UI ELEMENT: Language Switcher Buttons (Desktop View) */}
            <div className="hidden lg:flex items-center gap-2">
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => changeLanguage('en')}
                    className={`text-sm font-medium transition-colors ${i18n.language === 'en' ? 'text-indigo-700 dark:text-indigo-400 font-bold' : 'text-gray-600 dark:text-gray-400 hover:text-indigo-700 dark:hover:text-indigo-400'}`}
                >
                    EN
                </motion.button>
                <span className="text-gray-400 dark:text-gray-600">|</span>
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => changeLanguage('kn')}
                    className={`text-sm font-medium transition-colors ${i18n.language === 'kn' ? 'text-indigo-700 dark:text-indigo-400 font-bold' : 'text-gray-600 dark:text-gray-400 hover:text-indigo-700 dark:hover:text-indigo-400'}`}
                >
                    ಕನ್ನಡ
                </motion.button>
            </div>
            {/* ----------------------------------------------------------- */}

            {/* Theme Toggle (Uses prop from App.jsx) */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleTheme}
              // 💡 WRAPPED TEXT: Switch to light/dark mode
              title={t(`Switch to ${isDark ? 'light' : 'dark'} mode`)}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-indigo-700 dark:hover:text-indigo-400 transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 hidden md:block"
            >
              {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-gray-600" />}
            </motion.button>

            {/* Conditional rendering based on authentication state (using context) */}
            {isAuthenticated ? (
              <>
                {/* Notifications */}
                <div className="relative dropdown" ref={notificationsDropdownRef}>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                    className="relative p-2 text-gray-600 dark:text-gray-400 hover:text-indigo-700 dark:hover:text-indigo-400 transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold"
                      >
                        {unreadCount}
                      </motion.span>
                    )}
                  </motion.button>
                sNotificationsOpe
                </div>

                {/* Profile Avatar (Renders if isAuthenticated is true) */}
                <div className="relative dropdown" ref={profileDropdownRef}>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center gap-2 p-1 rounded-full bg-indigo-700 hover:bg-indigo-600 transition-colors focus:ring-2 focus:ring-indigo-500"
                  >
                    <div className="w-8 h-8 bg-indigo-700 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {/* Displays the first letter of the user's name or 'U' */}
                      {user?.avatar || user?.name?.charAt(0) || t('U')} 
                    </div>
                  </motion.button>
                  {isProfileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-900 rounded-xl border border-indigo-200 dark:border-gray-700 shadow-xl overflow-hidden"
                    >
                      <div className="p-4 bg-indigo-50 dark:bg-indigo-950">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-indigo-700 rounded-full flex items-center justify-center text-white font-bold">
                            {user?.avatar || user?.name?.charAt(0) || t('U')}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white">{user?.name}</p>
                            {/* 💡 WRAPPED TEXT: Role (e.g., 'farmer' or 'buyer') */}
                            <p className="text-indigo-700 dark:text-indigo-300 text-sm capitalize">{(user?.role || '').toLowerCase() === 'farmer' ? t('Organizer') : t(user?.role || '')}</p>
                          </div>
                        </div>
                      </div>
                      <div className="py-2">
                        {/* 💡 WRAPPED TEXT: My Profile */}
                        <DropdownItem to="/profile" onClick={() => {}} icon={User}>{t('My Profile')}</DropdownItem>
                        {/* 💡 WRAPPED TEXT: Settings */}
                        <DropdownItem to="/settings" onClick={() => {}} icon={Settings}>{t('Settings')}</DropdownItem>
                        <hr className="my-2 border-gray-200 dark:border-gray-700" />
                        {/* 💡 WRAPPED TEXT: Sign Out */}
                        <DropdownItem to="#" onClick={handleLogout} icon={LogOut} isLogout={true}>{t('Sign Out')}</DropdownItem>
                      </div>
                    </motion.div>
                  )}
                </div>
              </>
            ) : (
              /* Auth Buttons (Renders if isAuthenticated is false) */
              <div className="hidden lg:flex items-center gap-3">
                <button onClick={() => navigate('/login')} className="text-gray-700 dark:text-gray-300 hover:text-indigo-700 dark:hover:text-indigo-400 transition-colors px-4 py-2 rounded-lg hover:bg-indigo-50 dark:hover:bg-gray-800 font-medium">
                  {/* 💡 WRAPPED TEXT: Login */}
                  {t('Login')}
                </button>
                <button onClick={() => navigate('/signup')} className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors font-bold shadow-md shadow-indigo-500/30">
                  {/* 💡 WRAPPED TEXT: Signup */}
                  {t('Signup')}
                </button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 text-gray-600 dark:text-gray-400 hover:text-indigo-700 dark:hover:text-indigo-400 transition-colors rounded-full hover:bg-indigo-100 dark:hover:bg-gray-700"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="lg:hidden border-t border-gray-200 dark:border-gray-700 py-4 overflow-y-auto max-h-[calc(100vh-64px)]">
            {/* Mobile Search */}
            <div className="mb-4">
              <form onSubmit={handleSearchSubmit} className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  // 💡 WRAPPED TEXT: Search produce...
                  placeholder={t('Search produce...')}
                  className="w-full pl-12 pr-4 py-3 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:border-indigo-600 focus:outline-none"
                />
              </form>
            </div>
            
            {/* ----------------------------------------------------------- */}
            {/* 💡 NEW UI ELEMENT: Language Switcher Buttons (Mobile View) */}
            <div className="flex justify-center gap-4 py-4 border-b border-gray-200 dark:border-gray-700 mb-4">
                <button
                    onClick={() => changeLanguage('en')}
                    className={`text-lg font-bold transition-colors ${i18n.language === 'en' ? 'text-indigo-700 dark:text-indigo-400 underline underline-offset-4' : 'text-gray-600 dark:text-gray-400 hover:text-indigo-700'}`}
                >
                    English
                </button>
                <span className="text-gray-400 dark:text-gray-600">|</span>
                <button
                    onClick={() => changeLanguage('kn')}
                    className={`text-lg font-bold transition-colors ${i18n.language === 'kn' ? 'text-indigo-700 dark:text-indigo-400 underline underline-offset-4' : 'text-gray-600 dark:text-gray-400 hover:text-indigo-700'}`}
                >
                    ಕನ್ನಡ
                </button>
            </div>
            {/* ----------------------------------------------------------- */}

            {/* Mobile Navigation */}
            <div className="space-y-2">
              {navItems.map((item, index) => {
                const isActive = location.pathname === item.href;
                const linkProps = (item.isProtected && !isAuthenticated)
                  ? { to: '/login', onClick: handleProtectedNavigation }
                  : { to: item.href, onClick: () => setIsMenuOpen(false) };

                return (
                  <Link
                    key={index}
                    {...linkProps}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium
                      ${isActive
                        ? 'text-white bg-indigo-700'
                        : 'text-gray-700 dark:text-gray-300 hover:text-indigo-700 dark:hover:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-gray-800'
                      }`}
                  >
                    <item.icon className="w-5 h-5" />
                    {/* Name is already translated from navItems array */}
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>

            {/* Mobile Auth */}
            {!isAuthenticated && (
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700 mt-4 space-y-2">
                <button onClick={() => {navigate('/login'); setIsMenuOpen(false);}} className="w-full block text-center py-3 text-gray-700 dark:text-gray-300 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors font-medium rounded-lg">
                  {/* 💡 WRAPPED TEXT: Login */}
                  {t('Login')}
                </button>
                <button onClick={() => {navigate('/signup'); setIsMenuOpen(false);}} className="w-full block text-center bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 transition-colors">
                  {/* 💡 WRAPPED TEXT: Join EventHub */}
                  {t('Join EventHub')}
                </button>
              </div>
            )}
            
            {/* If authenticated, show mobile sign out */}
            {isAuthenticated && (
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700 mt-4">
                <button onClick={handleLogout} className="w-full flex items-center justify-center gap-3 py-3 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors font-bold">
                  <LogOut className="w-5 h-5" />
                  {/* 💡 WRAPPED TEXT: Sign Out */}
                  <span>{t('Sign Out')}</span>
                </button>
              </div>
            )}

          </motion.div>
        )}
      </div>
    </motion.header>
  );
};

export default Header;