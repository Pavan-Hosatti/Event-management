import React, { useState, useEffect } from 'react';
import { Bell, CheckCircle, X, Calendar, Clock } from 'lucide-react';
import { toast } from 'react-hot-toast';

const StudentNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/notifications', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setNotifications(data.notifications || []);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:5000/api/notifications/${id}/read`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Update local state
      setNotifications(prev => 
        prev.map(notif => 
          notif._id === id ? { ...notif, read: true } : notif
        )
      );
      
      toast.success('Marked as read');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to mark as read');
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      await fetch('http://localhost:5000/api/notifications/read-all', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Update all to read
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, read: true }))
      );
      
      toast.success('All notifications marked as read');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to mark all as read');
    }
  };

  const deleteNotification = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:5000/api/notifications/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Remove from local state
      setNotifications(prev => prev.filter(notif => notif._id !== id));
      
      toast.success('Notification deleted');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to delete');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <Bell className="w-8 h-8 text-indigo-600" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Notifications
            </h1>
          </div>
          
          {notifications.filter(n => !n.read).length > 0 && (
            <button
              onClick={markAllAsRead}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              Mark All as Read
            </button>
          )}
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl">
            <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300">
              No notifications yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              When organizers send announcements, they'll appear here
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map(notification => (
              <div
                key={notification._id}
                className={`p-4 rounded-xl border transition-all ${
                  !notification.read
                    ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800'
                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {notification.title}
                      </h3>
                      {!notification.read && (
                        <span className="px-2 py-0.5 bg-indigo-600 text-white text-xs rounded-full">
                          New
                        </span>
                      )}
                    </div>
                    
                    <p className="text-gray-700 dark:text-gray-300 mb-3">
                      {notification.message}
                    </p>
                    
                    {notification.eventTitle && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
                        <Calendar className="w-4 h-4" />
                        <span>Event: {notification.eventTitle}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {new Date(notification.createdAt).toLocaleString()}
                      </div>
                      
                      {notification.type && (
                        <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs">
                          {notification.type}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {!notification.read && (
                      <button
                        onClick={() => markAsRead(notification._id)}
                        className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg"
                        title="Mark as read"
                      >
                        <CheckCircle className="w-5 h-5" />
                      </button>
                    )}
                    
                    <button
                      onClick={() => deleteNotification(notification._id)}
                      className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg"
                      title="Delete"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentNotifications;