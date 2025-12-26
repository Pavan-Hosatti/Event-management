import React, { useState, useEffect } from 'react';
import { Calendar, Users, CheckCircle, XCircle, Search, Download, Filter } from 'lucide-react';
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

const AdminAttendance = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterEvent, setFilterEvent] = useState('all');

  useEffect(() => {
    fetchAttendanceData();
  }, []);

  const fetchAttendanceData = async () => {
    try {
      // Get all events first
      const eventsRes = await axiosInstance.get('/admin/events');
      const events = eventsRes.data.events || [];
      
      // Get attendance for each event
      const attendancePromises = events.map(async (event) => {
        try {
          const res = await axiosInstance.get(`/admin/events/${event._id}/registrations`);
          return {
            eventId: event._id,
            eventTitle: event.title,
            eventDate: event.date,
            totalRegistrations: res.data.registrations?.length || 0,
            attended: res.data.registrations?.filter(r => r.attended).length || 0,
            attendanceRate: res.data.registrations?.length > 0 
              ? Math.round((res.data.registrations.filter(r => r.attended).length / res.data.registrations.length) * 100)
              : 0
          };
        } catch (err) {
          return {
            eventId: event._id,
            eventTitle: event.title,
            eventDate: event.date,
            totalRegistrations: 0,
            attended: 0,
            attendanceRate: 0
          };
        }
      });

      const data = await Promise.all(attendancePromises);
      setAttendanceData(data);
    } catch (error) {
      console.error('Error fetching attendance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredData = attendanceData.filter(item => 
    item.eventTitle.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Attendance Management</h1>
          <p className="text-gray-600">Track and manage event attendance records</p>
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
            <button
              onClick={fetchAttendanceData}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Events</p>
                <p className="text-2xl font-bold text-gray-900">{attendanceData.length}</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Registrations</p>
                <p className="text-2xl font-bold text-gray-900">
                  {attendanceData.reduce((sum, item) => sum + item.totalRegistrations, 0)}
                </p>
              </div>
              <Users className="w-8 h-8 text-green-500" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Average Attendance</p>
                <p className="text-2xl font-bold text-gray-900">
                  {attendanceData.length > 0 
                    ? Math.round(attendanceData.reduce((sum, item) => sum + item.attendanceRate, 0) / attendanceData.length)
                    : 0}%
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Attendance Table */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading attendance data...</p>
            </div>
          ) : filteredData.length === 0 ? (
            <div className="p-8 text-center">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No attendance records found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Event</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Registered</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Attended</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Attendance Rate</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredData.map((item) => (
                    <tr key={item.eventId} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-900">{item.eventTitle}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span>{new Date(item.eventDate).toLocaleDateString()}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-gray-400" />
                          <span>{item.totalRegistrations}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span>{item.attended}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-blue-500"
                              style={{ width: `${item.attendanceRate}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium">{item.attendanceRate}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => window.location.href = `/admin-dashboard?event=${item.eventId}&modal=attendance`}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                        >
                          Manage
                        </button>
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

export default AdminAttendance;