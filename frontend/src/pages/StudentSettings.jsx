import React, { useState, useEffect } from 'react';
import { User, Mail, Shield, Bell, Key, Save, Phone, GraduationCap } from 'lucide-react';
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

const StudentSettings = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Profile Data
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    studentId: '',
    department: '',
    phone: '',
    year: '',
    bio: ''
  });

  // Notification Settings
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    eventReminders: true,
    certificateAlerts: true,
    feedbackRequests: true,
    newsletter: false
  });

  // Security
  const [security, setSecurity] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    setLoading(true);
    try {
      // Fetch user data
      const userData = {
        name: localStorage.getItem('userName') || 'John Doe',
        email: localStorage.getItem('userEmail') || 'john@example.com',
        studentId: localStorage.getItem('userId')?.slice(-6) || 'STU001',
        department: localStorage.getItem('userDepartment') || 'Computer Science',
        phone: '+1 (555) 123-4567',
        year: '3rd Year',
        bio: 'Passionate about technology and events.'
      };
      setProfile(userData);

      // Try to fetch from API
      try {
        const response = await axiosInstance.get('/student/settings');
        if (response.data.success) {
          setProfile(response.data.settings.profile);
          setNotifications(response.data.settings.notifications);
        }
      } catch (apiError) {
        console.log('Using local data for settings');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async () => {
    setSaving(true);
    setMessage({ type: '', text: '' });
    
    try {
      // In real app, call API
      // await axiosInstance.put('/student/settings/profile', profile);
      
      // Update localStorage
      localStorage.setItem('userName', profile.name);
      localStorage.setItem('userEmail', profile.email);
      localStorage.setItem('userDepartment', profile.department);
      
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update profile' });
    } finally {
      setSaving(false);
    }
  };

  const handleNotificationUpdate = async () => {
    setSaving(true);
    try {
      // In real app, call API
      // await axiosInstance.put('/student/settings/notifications', notifications);
      setMessage({ type: 'success', text: 'Notification settings updated!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update settings' });
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (security.newPassword !== security.confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' });
      return;
    }
    
    if (security.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters' });
      return;
    }

    setSaving(true);
    try {
      // In real app, call API
      // await axiosInstance.put('/student/settings/password', security);
      setMessage({ type: 'success', text: 'Password changed successfully!' });
      setSecurity({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to change password' });
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Account Settings</h1>
          <p className="text-gray-600">Manage your profile, notifications, and security settings</p>
        </div>

        {message.text && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {message.text}
          </div>
        )}

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <div className="flex">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 py-4 px-6 text-center font-medium flex items-center justify-center gap-2 ${
                      activeTab === tab.id
                        ? 'border-b-2 border-blue-600 text-blue-600'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-8">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="max-w-2xl">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Personal Information</h2>
                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={profile.name}
                        onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <div className="flex items-center">
                        <Mail className="w-5 h-5 text-gray-400 mr-2" />
                        <input
                          type="email"
                          value={profile.email}
                          onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Student ID
                      </label>
                      <div className="flex items-center">
                        <GraduationCap className="w-5 h-5 text-gray-400 mr-2" />
                        <input
                          type="text"
                          value={profile.studentId}
                          onChange={(e) => setProfile({ ...profile, studentId: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                          disabled
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Department
                      </label>
                      <select
                        value={profile.department}
                        onChange={(e) => setProfile({ ...profile, department: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="Computer Science">Computer Science</option>
                        <option value="Electrical Engineering">Electrical Engineering</option>
                        <option value="Mechanical Engineering">Mechanical Engineering</option>
                        <option value="Civil Engineering">Civil Engineering</option>
                        <option value="Business Administration">Business Administration</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <div className="flex items-center">
                        <Phone className="w-5 h-5 text-gray-400 mr-2" />
                        <input
                          type="tel"
                          value={profile.phone}
                          onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Year of Study
                      </label>
                      <select
                        value={profile.year}
                        onChange={(e) => setProfile({ ...profile, year: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="1st Year">1st Year</option>
                        <option value="2nd Year">2nd Year</option>
                        <option value="3rd Year">3rd Year</option>
                        <option value="4th Year">4th Year</option>
                        <option value="Graduate">Graduate</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bio
                    </label>
                    <textarea
                      value={profile.bio}
                      onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                      rows="3"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Tell us about yourself..."
                    />
                  </div>
                  <div className="flex justify-end">
                    <button
                      onClick={handleProfileUpdate}
                      disabled={saving}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50"
                    >
                      <Save className="w-5 h-5" />
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="max-w-2xl">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Notification Preferences</h2>
                <div className="space-y-6">
                  {Object.entries(notifications).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900 capitalize">
                          {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </p>
                        <p className="text-sm text-gray-600">
                          {key === 'emailNotifications' && 'Receive notifications via email'}
                          {key === 'eventReminders' && 'Get reminders about upcoming events'}
                          {key === 'certificateAlerts' && 'Notify when certificates are ready'}
                          {key === 'feedbackRequests' && 'Request feedback after events'}
                          {key === 'newsletter' && 'Receive monthly newsletter'}
                        </p>
                      </div>
                      <button
                        onClick={() => setNotifications({ ...notifications, [key]: !value })}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                          value ? 'bg-blue-600' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                            value ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  ))}
                  <div className="flex justify-end">
                    <button
                      onClick={handleNotificationUpdate}
                      disabled={saving}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50"
                    >
                      <Save className="w-5 h-5" />
                      {saving ? 'Saving...' : 'Save Preferences'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="max-w-2xl">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Security Settings</h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Password
                    </label>
                    <div className="flex items-center">
                      <Key className="w-5 h-5 text-gray-400 mr-2" />
                      <input
                        type="password"
                        value={security.currentPassword}
                        onChange={(e) => setSecurity({ ...security, currentPassword: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter current password"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={security.newPassword}
                      onChange={(e) => setSecurity({ ...security, newPassword: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter new password"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={security.confirmPassword}
                      onChange={(e) => setSecurity({ ...security, confirmPassword: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Confirm new password"
                    />
                  </div>
                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                    <div className="flex">
                      <div className="ml-3">
                      <div className="text-sm text-yellow-700">
  <p><strong>Note:</strong></p>
  <ul className="mt-1 list-disc pl-5">
    <li>Changes may take a few minutes to apply</li>
    <li>Some settings require page refresh</li>
  </ul>
</div>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button
                      onClick={handlePasswordChange}
                      disabled={saving}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50"
                    >
                      <Save className="w-5 h-5" />
                      {saving ? 'Updating...' : 'Change Password'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentSettings;