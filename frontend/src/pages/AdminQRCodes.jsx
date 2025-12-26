import React, { useState, useEffect } from 'react';
import { QrCode, Download, Printer, Search, Users, Calendar, Filter } from 'lucide-react';
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

const AdminQRCodes = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [qrCodes, setQrCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await axiosInstance.get('/admin/events');
      setEvents(response.data.events || response.data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

 const generateQRCodes = async (eventId) => {
  setGenerating(true);
  try {
    // Change this line:
    const response = await axiosInstance.get(`/qr-codes/event/${eventId}`);
    setQrCodes(response.data.qrCodes || []);
    setSelectedEvent(events.find(e => e._id === eventId));
  } catch (error) {
    console.error('Error generating QR codes:', error);
    alert('Failed to generate QR codes');
  } finally {
    setGenerating(false);
  }
};

  const downloadQRCode = (qrCode) => {
    const link = document.createElement('a');
    link.href = qrCode.qrCode;
    link.download = `qr-${qrCode.studentName.replace(/\s+/g, '-')}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const printAllQRCodes = () => {
    window.print();
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <QrCode className="w-8 h-8" />
            QR Code Management
          </h1>
          <p className="text-gray-600">Generate and manage QR codes for event check-in</p>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Events List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Event</h3>
              
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Loading events...</p>
                </div>
              ) : events.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">No events available</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {events.map((event) => (
                    <div
                      key={event._id}
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${
                        selectedEvent?._id === event._id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                      onClick={() => generateQRCodes(event._id)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-gray-900">{event.title}</p>
                          <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(event.date).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-gray-400" />
                          <span className="text-sm">{event.registered || 0}</span>
                        </div>
                      </div>
                      <div className="mt-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            generateQRCodes(event._id);
                          }}
                          className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                        >
                          Generate QR Codes
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* QR Codes Display */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow p-6">
              {generating ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Generating QR codes...</p>
                </div>
              ) : qrCodes.length > 0 ? (
                <>
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        QR Codes for {selectedEvent?.title}
                      </h3>
                      <p className="text-gray-600">
                        {selectedEvent?.date && new Date(selectedEvent.date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={printAllQRCodes}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center gap-2"
                      >
                        <Printer className="w-4 h-4" />
                        Print All
                      </button>
                      <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
                        <Download className="w-4 h-4" />
                        Download All
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    {qrCodes.map((qrCode, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="text-center mb-4">
                          <img
                            src={qrCode.qrCode}
                            alt={`QR Code for ${qrCode.studentName}`}
                            className="w-32 h-32 mx-auto"
                          />
                        </div>
                        <div className="text-center">
                          <p className="font-medium text-gray-900">{qrCode.studentName}</p>
                          <p className="text-sm text-gray-600 truncate">{qrCode.email}</p>
                          <div className="mt-3 flex gap-2">
                            <button
                              onClick={() => downloadQRCode(qrCode)}
                              className="flex-1 py-1.5 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                            >
                              Download
                            </button>
                            <button className="flex-1 py-1.5 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200">
                              Print
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <QrCode className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-lg font-semibold text-gray-700 mb-2">No QR Codes Generated</h4>
                  <p className="text-gray-600 mb-6">
                    Select an event from the list to generate QR codes for check-in
                  </p>
                  <div className="max-w-md mx-auto text-left text-sm text-gray-500">
                    <p className="mb-2">📱 <strong>How QR codes work:</strong></p>
                    <ul className="space-y-1 pl-5 list-disc">
                      <li>Each student gets a unique QR code</li>
                      <li>QR codes contain registration and event information</li>
                      <li>Scan at event entrance for quick check-in</li>
                      <li>Download and print for offline use</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminQRCodes;