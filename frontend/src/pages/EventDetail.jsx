import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Calendar, MapPin, Users, Clock, Award, ChevronLeft,
  Share2, Heart, CheckCircle, XCircle, ExternalLink,
  Mail, Phone, Globe, Tag, FileText, QrCode,
  Download, User, BookOpen, Star, TrendingUp,
  AlertCircle, ChevronRight, Loader2, ArrowLeft
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { eventAPI, studentAPI } from '../utilis/api';

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [event, setEvent] = useState(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [hasAttended, setHasAttended] = useState(false);
  const [certificateAvailable, setCertificateAvailable] = useState(false);
  const [user, setUser] = useState(null);
  const [registrationsCount, setRegistrationsCount] = useState(0);
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrCode, setQRCode] = useState(null);

  // Fetch event details
  useEffect(() => {
    const fetchEventDetails = async () => {
      setLoading(true);
      try {
        // Get current user
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        setUser(userData);

        // Fetch event details
        const eventResponse = await eventAPI.getOne(id);
        const eventData = eventResponse.data.event || eventResponse.data;
        setEvent(eventData);

        // Check if user is registered
        if (userData.id) {
          try {
            const regResponse = await eventAPI.getUserRegistrations(userData.id);
            const registrations = regResponse.data.registrations || regResponse.data || [];
            const userRegistration = registrations.find(reg => 
              reg.eventId === id || 
              reg.event?._id === id ||
              reg.eventId?._id === id
            );
            
            if (userRegistration) {
              setIsRegistered(true);
              setHasAttended(userRegistration.attended || userRegistration.status === 'attended');
              setCertificateAvailable(userRegistration.certificateIssued || false);
            }
          } catch (error) {
            console.error('Error checking registration:', error);
          }
        }

        // Get registration count
        try {
          const regCountResponse = await eventAPI.getEventRegistrations(id);
          const registrations = regCountResponse.data.registrations || regCountResponse.data || [];
          setRegistrationsCount(registrations.length);
        } catch (error) {
          console.error('Error fetching registrations count:', error);
        }

      } catch (error) {
        console.error('Error fetching event details:', error);
        toast.error('Failed to load event details');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchEventDetails();
    }
  }, [id]);

  const handleRegister = async () => {
    if (!user || !user.id) {
      toast.error('Please login to register');
      navigate('/login');
      return;
    }

    try {
      const response = await eventAPI.register(id, {
        userId: user.id,
        studentName: user.name || user.username,
        email: user.email,
        department: user.department || 'General'
      });

      if (response.data.success) {
        setIsRegistered(true);
        setRegistrationsCount(prev => prev + 1);
        toast.success('Successfully registered for this event!');
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error(error.response?.data?.message || 'Registration failed');
    }
  };

  const handleDownloadCertificate = async () => {
    try {
      // Get user's registration for this event
      const regResponse = await eventAPI.getUserRegistrations(user.id);
      const registrations = regResponse.data.registrations || regResponse.data || [];
      const registration = registrations.find(reg => 
        reg.eventId === id || 
        reg.event?._id === id
      );

      if (!registration) {
        toast.error('No registration found');
        return;
      }

      const response = await eventAPI.downloadCertificate(id, registration._id);
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = `certificate-${event.title}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success('Certificate downloaded successfully!');
    } catch (error) {
      console.error('Certificate download error:', error);
      toast.error('Certificate not available yet');
    }
  };

  const handleGenerateQRCode = async () => {
    try {
      const response = await studentAPI.getEventQRCode(id);
      setQRCode(response.data.qrCode);
      setShowQRModal(true);
    } catch (error) {
      console.error('QR code error:', error);
      toast.error('Failed to generate QR code');
    }
  };

  const handleShareEvent = () => {
    if (navigator.share) {
      navigator.share({
        title: event.title,
        text: `Check out this event: ${event.title}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Event link copied to clipboard!');
    }
  };

  const handleContactOrganizer = () => {
    if (event.organizerContact) {
      window.location.href = `mailto:${event.organizerContact}`;
    } else {
      toast.error('Organizer contact not available');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-16 h-16 mb-4">
            <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <h3 className="text-lg font-semibold text-gray-700">Loading Event Details</h3>
          <p className="text-gray-500 text-sm mt-2">Fetching the latest information...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <div className="text-center max-w-md p-8">
          <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Event Not Found</h2>
          <p className="text-gray-600 mb-6">The event you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => navigate('/events')}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 font-semibold transition-colors flex items-center gap-2 mx-auto"
          >
            <ChevronLeft className="w-5 h-5" />
            Back to Events
          </button>
        </div>
      </div>
    );
  }

  // Calculate remaining spots
  const remainingSpots = event.capacity - registrationsCount;
  const isFull = remainingSpots <= 0;
  const isPastEvent = new Date(event.date) < new Date();
  const registrationPercentage = Math.round((registrationsCount / event.capacity) * 100);
  const canRegister = !isRegistered && !isFull && !isPastEvent;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Back Button */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="px-6 py-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-700"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
        <div className="relative max-w-7xl mx-auto px-6 py-12 sm:py-16">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white text-sm font-medium mb-4">
                <Tag className="w-3 h-3 mr-1.5" />
                {event.category || 'Event'}
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
                {event.title}
              </h1>
              <p className="text-lg text-white/90 mb-6 max-w-2xl">
                {event.description || 'No description available'}
              </p>
              
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center text-white">
                  <Calendar className="w-5 h-5 mr-2" />
                  <div>
                    <p className="font-semibold">
                      {new Date(event.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                    <p className="text-sm text-white/80">{event.time || 'Time TBA'}</p>
                  </div>
                </div>
                
                <div className="flex items-center text-white">
                  <MapPin className="w-5 h-5 mr-2" />
                  <div>
                    <p className="font-semibold">{event.venue || 'Venue TBA'}</p>
                    <p className="text-sm text-white/80">
                      {event.isOnline ? 'Online Event' : 'In-person'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl p-6 shadow-2xl">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Registration Status</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Registered</span>
                      <span className="font-semibold">{registrationPercentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className={`h-3 rounded-full transition-all duration-500 ${
                          isFull ? 'bg-red-500' : 'bg-gradient-to-r from-blue-500 to-indigo-600'
                        }`}
                        style={{ width: `${Math.min(registrationPercentage, 100)}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                      {registrationsCount} of {event.capacity} spots filled • {remainingSpots} spots remaining
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">{registrationsCount}</p>
                      <p className="text-sm text-gray-600">Registered</p>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">{remainingSpots}</p>
                      <p className="text-sm text-gray-600">Available</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Status Badge */}
              <div className="mb-6">
                {isRegistered ? (
                  <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                      <div>
                        <p className="font-semibold text-green-800">You're Registered</p>
                        <p className="text-sm text-green-600">
                          {hasAttended ? 'Attended' : 'Check-in at event'}
                        </p>
                      </div>
                    </div>
                    {certificateAvailable && hasAttended && (
                      <button
                        onClick={handleDownloadCertificate}
                        className="px-3 py-1.5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors flex items-center gap-1"
                      >
                        <Download className="w-4 h-4" />
                        Certificate
                      </button>
                    )}
                  </div>
                ) : isFull ? (
                  <div className="flex items-center p-3 bg-red-50 border border-red-200 rounded-lg">
                    <XCircle className="w-5 h-5 text-red-600 mr-2" />
                    <div>
                      <p className="font-semibold text-red-800">Event Full</p>
                      <p className="text-sm text-red-600">No spots available</p>
                    </div>
                  </div>
                ) : isPastEvent ? (
                  <div className="flex items-center p-3 bg-gray-100 border border-gray-300 rounded-lg">
                    <Calendar className="w-5 h-5 text-gray-600 mr-2" />
                    <p className="font-semibold text-gray-800">Event Ended</p>
                  </div>
                ) : null}
              </div>
              
              {/* Action Buttons */}
              <div className="space-y-3">
                {canRegister ? (
                  <button
                    onClick={handleRegister}
                    className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 font-semibold transition-colors flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-5 h-5" />
                    Register Now
                  </button>
                ) : isRegistered && !isPastEvent && (
                  <button
                    onClick={handleGenerateQRCode}
                    className="w-full py-3 bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-lg hover:from-orange-700 hover:to-amber-700 font-semibold transition-colors flex items-center justify-center gap-2"
                  >
                    <QrCode className="w-5 h-5" />
                    Get Check-in QR Code
                  </button>
                )}
                
                <div className="flex gap-3">
                  <button
                    onClick={handleShareEvent}
                    className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <Share2 className="w-5 h-5" />
                    Share
                  </button>
                  <button
                    onClick={handleContactOrganizer}
                    className="flex-1 py-3 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <Mail className="w-5 h-5" />
                    Contact
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Event Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* About Section */}
            <div className="bg-white rounded-2xl border border-gray-200 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <FileText className="w-6 h-6 text-blue-600" />
                About This Event
              </h2>
              
              <div className="prose prose-lg max-w-none">
                <p className="text-gray-700 leading-relaxed">
                  {event.description || 'No detailed description available for this event.'}
                </p>
                
                {event.detailedDescription && (
                  <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-lg">
                    <h3 className="font-semibold text-blue-900 mb-2">Additional Information</h3>
                    <p className="text-blue-800">{event.detailedDescription}</p>
                  </div>
                )}
              </div>
              
              {/* Key Details */}
              <div className="grid md:grid-cols-2 gap-6 mt-8">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Calendar className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Date & Time</p>
                      <p className="font-semibold text-gray-900">
                        {new Date(event.date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </p>
                      <p className="text-gray-700">{event.time || 'Time TBA'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <MapPin className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Venue</p>
                      <p className="font-semibold text-gray-900">{event.venue || 'Venue TBA'}</p>
                      {event.venueDetails && (
                        <p className="text-gray-700 text-sm mt-1">{event.venueDetails}</p>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Users className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Capacity</p>
                      <p className="font-semibold text-gray-900">{event.capacity} participants</p>
                      <p className="text-gray-700">
                        {remainingSpots > 0 ? `${remainingSpots} spots available` : 'Fully booked'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <Award className="w-5 h-5 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Certificate</p>
                      <p className="font-semibold text-gray-900">
                        {event.certificateEnabled ? 'Available' : 'Not Available'}
                      </p>
                      <p className="text-gray-700">
                        {event.certificateEnabled 
                          ? 'Digital certificate upon completion' 
                          : 'No certificate for this event'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Organizer Info */}
            {event.organizer && (
              <div className="bg-white rounded-2xl border border-gray-200 p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <User className="w-6 h-6 text-blue-600" />
                  Organized By
                </h2>
                
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white text-xl font-bold shadow">
                    {event.organizer.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{event.organizer}</h3>
                    <p className="text-gray-600 mt-1">{event.organizerTitle || 'Event Organizer'}</p>
                    
                    {event.organizerBio && (
                      <p className="text-gray-700 mt-3">{event.organizerBio}</p>
                    )}
                    
                    <div className="flex gap-4 mt-4">
                      {event.organizerContact && (
                        <a 
                          href={`mailto:${event.organizerContact}`}
                          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
                        >
                          <Mail className="w-4 h-4" />
                          Contact
                        </a>
                      )}
                      {event.organizerWebsite && (
                        <a 
                          href={event.organizerWebsite}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
                        >
                          <Globe className="w-4 h-4" />
                          Website
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-8">
            {/* Quick Info */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Info</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Event Type</p>
                  <p className="font-semibold text-gray-900">
                    {event.isOnline ? 'Online' : 'In-person'} • {event.category || 'General'}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600 mb-1">Registration Deadline</p>
                  <p className="font-semibold text-gray-900">
                    {event.registrationDeadline 
                      ? new Date(event.registrationDeadline).toLocaleDateString()
                      : 'Until full'
                    }
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600 mb-1">Cost</p>
                  <p className="font-semibold text-gray-900">
                    {event.isFree ? 'Free' : 'Paid - Check registration'}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600 mb-1">Duration</p>
                  <p className="font-semibold text-gray-900">
                    {event.duration || '2-3 hours'}
                  </p>
                </div>
              </div>
            </div>

            {/* Tags */}
            {event.tags && event.tags.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {event.tags.map((tag, index) => (
                    <span 
                      key={index}
                      className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Requirements */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Requirements</h3>
              <ul className="space-y-2">
                {event.requirements?.map((req, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{req}</span>
                  </li>
                )) || (
                  <li className="text-gray-500">No special requirements</li>
                )}
              </ul>
            </div>

            {/* Share Event */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 text-white">
              <h3 className="text-lg font-bold mb-4">Share this Event</h3>
              <p className="text-blue-100 mb-4">
                Know someone who might be interested? Share this event with them!
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleShareEvent}
                  className="flex-1 py-2.5 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-colors font-medium"
                >
                  Share Link
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2.5 bg-white/10 backdrop-blur-sm rounded-lg hover:bg-white/20 transition-colors"
                >
                  <ExternalLink className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* QR Code Modal */}
      {showQRModal && qrCode && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Check-in QR Code</h3>
                <p className="text-gray-600 text-sm">{event.title}</p>
              </div>
              <button 
                onClick={() => setShowQRModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            
            <div className="text-center">
              <div className="bg-white p-4 rounded-lg border border-gray-200 inline-block mb-4">
                <img src={qrCode} alt="QR Code" className="w-48 h-48" />
              </div>
              <p className="text-sm text-gray-600 mb-6">
                Show this QR code at the event entrance for check-in
              </p>
              
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = qrCode;
                    link.download = `qr-code-${event.title}.png`;
                    link.click();
                  }}
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 font-medium"
                >
                  Download
                </button>
                <button
                  onClick={() => window.print()}
                  className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
                >
                  Print
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-12 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded">
                  <Calendar className="w-4 h-4 text-white" />
                </div>
                <span className="font-semibold text-gray-900">EventHub</span>
              </div>
              <p className="text-gray-500 text-sm mt-1">University Event Management Platform</p>
            </div>
            <div className="text-sm text-gray-500">
              Need help? <a href="mailto:support@eventhub.edu" className="text-blue-600 hover:text-blue-800">Contact Support</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default EventDetails;