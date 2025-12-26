import { motion } from 'framer-motion';
import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next'; 

// --- Local Icon Definitions (Event Management Themed) ---

const IconWrapper = ({ children, className, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    {children}
  </svg>
);

const Edit = (props) => (
  <IconWrapper {...props}>
    <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
  </IconWrapper>
);

const MapPin = (props) => (
  <IconWrapper {...props}>
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
    <circle cx="12" cy="10" r="3" />
  </IconWrapper>
);

const Calendar = (props) => (
  <IconWrapper {...props}>
    <path d="M8 2v4" />
    <path d="M16 2v4" />
    <rect width="18" height="18" x="3" y="4" rx="2" />
    <path d="M3 10h18" />
  </IconWrapper>
);

const Award = (props) => (
  <IconWrapper {...props}>
    <circle cx="12" cy="8" r="7" />
    <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
  </IconWrapper>
);

const DollarSign = (props) => (
  <IconWrapper {...props}>
    <line x1="12" x2="12" y1="2" y2="22" />
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </IconWrapper>
);

const Ticket = (props) => (
  <IconWrapper {...props}>
    <path d="M2 9V5.2a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2V9a2 2 0 0 0 0 6v3.8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V15a2 2 0 0 0 0-6z" />
    <path d="M15 3v18" />
  </IconWrapper>
);

const Users = (props) => (
  <IconWrapper {...props}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </IconWrapper>
);

const Mail = (props) => (
  <IconWrapper {...props}>
    <rect width="20" height="16" x="2" y="4" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </IconWrapper>
);

const CheckCircle = (props) => (
  <IconWrapper {...props}>
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <path d="m9 11 3 3L22 4" />
  </IconWrapper>
);


// --- Default Data and Components ---

const INITIAL_PROFILE_DATA = {
  orgName: 'Elite Events Group',
  location: 'Chicago, IL',
  description: 'Elite Events Group specializes in high-end corporate networking, tech summits, and local community workshops. We focus on providing seamless registration experiences and high-quality production for every attendee.',
  expertiseString: 'Corporate Networking, Tech Summits, Hybrid Events',
  joinedDate: 'Oct 2023',
  contactEmail: 'admin@eliteevents.com',
  taxId: 'EV-90123456'
};

const mockAchievements = [
    { title: 'Top Rated Organizer', description: 'Consistently 4.9/5 attendee satisfaction', icon: Award },
    { title: 'Sold Out Status', description: 'Over 10 events sold out in 2024', icon: Ticket },
    { title: 'Verified Host', description: 'Background and security check cleared', icon: CheckCircle },
];

const mockCurrentEvents = [
    { id: 1, name: 'Global Tech Summit 2025', status: 'In Registration', category: 'Technology' },
    { id: 2, name: 'Startup Pitch Night', status: 'Upcoming', category: 'Business' },
    { id: 3, name: 'Local Art & Wine Festival', status: 'Live Now', category: 'Community' },
];

const ProfileSetupForm = ({ profile, setProfile, setIsEditing }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    orgName: profile.orgName === 'Elite Events Group' ? '' : profile.orgName,
    location: profile.location === 'Chicago, IL' ? '' : profile.location,
    description: profile.description.includes('Elite Events Group') ? '' : profile.description,
    expertiseString: profile.expertiseString.includes('Networking') ? '' : profile.expertiseString,
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newProfile = {
      ...INITIAL_PROFILE_DATA,
      ...formData,
      joinedDate: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      taxId: t('PENDING_SETUP'),
      expertiseString: formData.expertiseString || t('General Events')
    };
    
    setProfile(newProfile);
    setIsEditing(false);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/90 border-gray-200 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl p-8 shadow-xl"
    >
      <h2 className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-4 flex items-center gap-2">
        <Ticket className="w-8 h-8"/> {t('Complete Your Organizer Profile')}
      </h2>
      <p className="text-gray-600 dark:text-gray-300 mb-8">
        {t('Let attendees and sponsors know what kind of events you host.')}
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="orgName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('Organization Name')}</label>
          <input
            type="text"
            id="orgName"
            name="orgName"
            value={formData.orgName}
            onChange={handleChange}
            placeholder={t('e.g., Elite Events Group')}
            required
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>

        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('Headquarters (City, State)')}</label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder={t('e.g., Chicago, IL')}
            required
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('Bio / Mission Statement')}</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder={t('What makes your events special?')}
            rows="3"
            required
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          ></textarea>
        </div>

        <div>
          <label htmlFor="expertiseString" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('Event Specializations (Comma separated)')}</label>
          <input
            type="text"
            id="expertiseString"
            name="expertiseString"
            value={formData.expertiseString}
            onChange={handleChange}
            placeholder={t('e.g., Tech Summits, Music Festivals, Workshops')}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>

        <motion.button 
          type="submit"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-xl transition-colors shadow-lg shadow-purple-500/50"
        >
          <CheckCircle className="w-5 h-5"/> {t('Launch Organizer Dashboard')}
        </motion.button>
      </form>
    </motion.div>
  );
};


const OrganizerProfile = () => {
  const { t } = useTranslation();
  const [profile, setProfile] = useState(INITIAL_PROFILE_DATA);
  const [isEditing, setIsEditing] = useState(true);

  const expertiseArray = useMemo(() => 
    profile.expertiseString.split(',').map(s => s.trim()).filter(s => s)
  , [profile.expertiseString]);

  if (isEditing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-200 dark:from-slate-900 dark:to-slate-800 pt-20 flex justify-center items-start p-4">
        <div className="max-w-xl w-full mx-auto">
          <ProfileSetupForm 
            profile={profile} 
            setProfile={setProfile} 
            setIsEditing={setIsEditing} 
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 pt-20 transition-colors duration-500">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Profile Sidebar */}
          <div className="lg:col-span-1">
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white/80 border-gray-200 dark:bg-gray-800/50 dark:border-gray-700/50 backdrop-blur-xl rounded-2xl p-8 sticky top-8"
            >
              <div className="text-center mb-8">
                <div className="relative inline-block">
                  <div className="w-32 h-32 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full flex items-center justify-center text-4xl text-white font-bold mx-auto mb-4">
                    {profile.orgName.match(/\b(\w)/g)?.join('').toUpperCase() || 'EH'}
                  </div>
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="absolute bottom-2 right-2 bg-purple-600 hover:bg-purple-700 text-white p-2 rounded-full transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{t(profile.orgName)}</h1>
                <p className="text-gray-500 dark:text-gray-400 mb-4">{t('Professional Event Organizer')}</p>
                <div className="flex items-center justify-center gap-2 text-gray-500 dark:text-gray-400 mb-2">
                  <MapPin className="w-4 h-4" />
                  <span>{t(profile.location)}</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-gray-500 dark:text-gray-400">
                  <Calendar className="w-4 h-4" />
                  <span>{t('Member Since')} {profile.joinedDate}</span>
                </div>
              </div>

              <div className="space-y-3 mb-8">
                <a href={`mailto:${profile.contactEmail}`} className="flex items-center gap-3 text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-white transition-colors p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50">
                  <Mail className="w-5 h-5" />
                  <span>{profile.contactEmail}</span>
                </a>
                <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400 p-3 rounded-lg">
                  <DollarSign className="w-5 h-5" />
                  <span>{t('Tax ID:')} {profile.taxId}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">12</div>
                  <div className="text-gray-500 dark:text-gray-400 text-sm">{t('Active Events')}</div>
                </div>
                <div className="text-center p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">8.5k</div>
                  <div className="text-gray-500 dark:text-gray-400 text-sm">{t('Attendees')}</div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/80 border-gray-200 dark:bg-gray-800/50 dark:border-gray-700/50 backdrop-blur-xl rounded-2xl p-8"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('About the Organization')}</h2>
                <button 
                  onClick={() => setIsEditing(true)}
                  className="text-gray-500 dark:text-gray-400 hover:text-purple-600 transition-colors"
                >
                  <Edit className="w-5 h-5" />
                </button>
              </div>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                {t(profile.description)}
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white/80 border-gray-200 dark:bg-gray-800/50 dark:border-gray-700/50 backdrop-blur-xl rounded-2xl p-8"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('Event Specializations')}</h2>
                <button 
                  onClick={() => setIsEditing(true)}
                  className="text-gray-500 dark:text-gray-400 hover:text-purple-600 transition-colors"
                >
                  <Edit className="w-5 h-5" />
                </button>
              </div>
              <div className="flex flex-wrap gap-3">
                {expertiseArray.map((skill, index) => (
                  <span
                    key={index}
                    className="bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-2 rounded-full text-white font-medium hover:scale-105 transition-transform cursor-pointer shadow-md"
                  >
                    {t(skill)}
                  </span>
                ))}
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white/80 border-gray-200 dark:bg-gray-800/50 dark:border-gray-700/50 backdrop-blur-xl rounded-2xl p-8"
            >
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">{t('Managed Events')}</h2>
              <div className="space-y-4">
                {mockCurrentEvents.map((event) => (
                  <div key={event.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg hover:bg-purple-50 dark:bg-gray-800 dark:hover:bg-purple-900/10 border border-transparent hover:border-purple-200 dark:hover:border-purple-800 transition-all">
                    <div>
                      <h3 className="text-gray-900 dark:text-white font-semibold">{t(event.name)}</h3>
                      <p className="text-gray-500 dark:text-gray-400 text-sm">{t(event.category)}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      event.status === t('Live Now') 
                        ? 'bg-purple-200/50 text-purple-700 dark:bg-purple-600/20 dark:text-purple-400' 
                        : event.status === t('In Registration') 
                        ? 'bg-indigo-200/50 text-indigo-700 dark:bg-indigo-600/20 dark:text-indigo-400' 
                        : 'bg-gray-200/50 text-gray-700 dark:bg-gray-600/20 dark:text-gray-400'
                    }`}>
                      {t(event.status)}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white/80 border-gray-200 dark:bg-gray-800/50 dark:border-gray-700/50 backdrop-blur-xl rounded-2xl p-8"
            >
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">{t('Organizer Recognition')}</h2>
              <div className="grid md:grid-cols-3 gap-6">
                {mockAchievements.map((achievement, index) => (
                  <div key={index} className="text-center p-6 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl border border-purple-100 dark:from-purple-900/10 dark:to-indigo-900/10 dark:border-purple-900/20">
                    <achievement.icon className="w-12 h-12 text-purple-600 dark:text-purple-400 mx-auto mb-4" />
                    <h3 className="text-gray-900 dark:text-white font-bold mb-2">{t(achievement.title)}</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">{t(achievement.description)}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrganizerProfile;