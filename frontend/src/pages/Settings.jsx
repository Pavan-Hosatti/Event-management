import { motion } from 'framer-motion';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next'; 

// --- Local Icon Definitions (Refactored for Event Management) ---

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

const SettingsIcon = (props) => (
  <IconWrapper {...props}>
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.47a2 2 0 0 1-1.44 1.83l-.71.3c-1.21.64-2 1.94-2 3.3v.8c0 1.36.79 2.66 2 3.3l.71.3a2 2 0 0 1 1.44 1.83v.47a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.47a2 2 0 0 1 1.44-1.83l.71-.3c1.21-.64 2-1.94 2-3.3v-.8c0-1.36-.79-2.66-2-3.3l-.71-.3a2 2 0 0 1-1.44-1.83V4a2 2 0 0 0-2-2z" />
    <circle cx="12" cy="12" r="3" />
  </IconWrapper>
);

const TicketIcon = (props) => (
  <IconWrapper {...props}>
    <path d="M2 9V5.2a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2V9a2 2 0 0 0 0 6v3.8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V15a2 2 0 0 0 0-6z" />
    <path d="M15 3v18" />
  </IconWrapper>
);

const Shield = (props) => (
  <IconWrapper {...props}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </IconWrapper>
);

const CalendarIcon = (props) => (
  <IconWrapper {...props}>
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </IconWrapper>
);

// --- MOCK PROFILE DATA ---
const mockProfile = {
    role: 'organizer',
    legalName: 'Elite Events Management Group',
    taxId: 'EV-9876543',
    contactEmail: 'admin@eventhub.com',
    eventStrategy: 'Early Bird & General Admission',
    region: 'North America',
    navigate: (route) => console.log(`Navigating to: ${route}`), 
};

const Settings = ({ profile = mockProfile, navigate = mockProfile.navigate }) => {
  const [activeTab, setActiveTab] = useState('account');
  const { t } = useTranslation(); 

  const TabButton = ({ id, label, Icon }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`px-6 py-3 text-sm font-medium rounded-t-lg transition-all flex items-center gap-2 ${
        activeTab === id
          ? 'bg-gray-100 dark:bg-gray-800 text-purple-600 dark:text-purple-400 border-b-2 border-purple-600 dark:border-purple-400'
          : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100/50 dark:hover:bg-gray-800/50'
      }`}
    >
      <Icon className="w-5 h-5" />
      {label}
    </button>
  );

  const SectionCard = ({ title, children }) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 space-y-4">
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white border-b pb-2 border-gray-100 dark:border-gray-700">{t(title)}</h3>
      {children}
    </div>
  );
  
  const DisplayField = ({ label, value }) => (
    <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
      <span className="text-gray-600 dark:text-gray-400 text-sm font-medium">{t(label)}</span>
      <span className="text-gray-900 dark:text-white font-medium">{value}</span>
    </div>
  );

  const TabContent = () => {
    const p = profile || mockProfile; 
    
    switch (activeTab) {
      case 'account':
        return (
          <div className="space-y-6">
            <SectionCard title="Organization Details">
              <DisplayField label="Legal Entity Name" value={p.legalName || t('N/A')} />
              <DisplayField label="Organizer ID" value={p.taxId || t('N/A')} />
              <DisplayField label="Primary Contact Email" value={p.contactEmail} />
              <button className="text-purple-600 dark:text-purple-400 text-sm font-semibold hover:text-purple-700 transition-colors">
                {t('Update Organization Info')}
              </button>
            </SectionCard>
            <SectionCard title="Security Credentials">
              <p className="text-gray-500 dark:text-gray-400 text-sm">{t('Last password change: 3 months ago')}</p>
              <button className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                {t('Change Password')}
              </button>
            </SectionCard>
          </div>
        );
      case 'market':
        if (p.role !== 'organizer') {
            return <p className="pt-8 text-center text-gray-500 dark:text-gray-400">{t('Event configuration is only available for **Organizer** accounts.')}</p>;
        }
        
        return (
          <div className="space-y-6">
            <SectionCard title="Ticketing & Sales Strategy">
              <DisplayField label="Default Pricing Model" value={p.eventStrategy} />
              <DisplayField label="Primary Operating Region" value={p.region} />
              <div className="mt-4">
                <span className="text-gray-600 dark:text-gray-400 text-sm font-medium block mb-2">{t('Target Audience Segments')}</span>
                <div className="flex flex-wrap gap-2">
                  {['Corporate', 'Tech Enthusiasts', 'Student Groups'].map(segment => (
                    <span key={segment} className="bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-300 text-xs px-3 py-1 rounded-full">{t(segment)}</span>
                  ))}
                </div>
              </div>
              <button className="text-purple-600 dark:text-purple-400 text-sm font-semibold hover:text-purple-700 transition-colors">
                {t('Define Ticket Tiers')}
              </button>
            </SectionCard>
            <SectionCard title="Platform Branding">
                <DisplayField label="Primary Theme" value={t('Modern Dark')} />
                <button className="text-purple-600 dark:text-purple-400 text-sm font-semibold hover:text-purple-700 transition-colors">
                    {t('Customize Brand Colors')}
                </button>
            </SectionCard>
          </div>
        );
      case 'security':
        return (
          <div className="space-y-6">
            <SectionCard title="External Integrations">
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">{t('Connect your CRM or Marketing tools with EventHub using API keys.')}</p>
              <DisplayField label="Websocket API Key" value="********-****-42c2-b7e1-********" />
              <button className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                {t('Revoke Key')}
              </button>
            </SectionCard>
            <SectionCard title="Privacy Settings">
              <DisplayField label="Two-Factor Authentication" value={t('Enabled')} />
              <p className="text-gray-500 dark:text-gray-400 text-sm">{t('Last login from: New York, USA')}</p>
            </SectionCard>
          </div>
        );
      default:
        return null;
    }
  };


  return (
    <motion.div 
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900 min-h-screen"
    >
      <div className="mb-8 pt-10">
        <button 
          onClick={() => navigate('/profile')}
          className="flex items-center gap-2 text-purple-600 dark:text-purple-400 hover:text-purple-700 transition-colors font-medium mb-4"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          {t('Back to Profile')}
        </button>

        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
          <SettingsIcon className="w-8 h-8 text-purple-600 dark:text-purple-400"/>
          {t('Event Operations Control Center')}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {t('Manage your organization compliance, event strategy, and system integrations.')}
        </p>
      </div>

      <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
        <div className="flex -mb-px space-x-4 overflow-x-auto">
          <TabButton id="account" label={t('Account & Compliance')} Icon={CalendarIcon} />
          <TabButton id="market" label={t('Event Configuration')} Icon={TicketIcon} />
          <TabButton id="security" label={t('Data & Security')} Icon={Shield} />
        </div>
      </div>

      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mt-6"
      >
        {TabContent()}
      </motion.div>
    </motion.div>
  );
};

export default Settings;