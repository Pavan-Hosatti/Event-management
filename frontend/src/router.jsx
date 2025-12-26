import { createBrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import Home from './pages/EventHome.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import StudentDashboard from './pages/StudentDashboard.jsx';
import StudentNotifications from './pages/StudentNotifications.jsx'; // ✅ ADDED
import AIGrader from './pages/AISuggestions.jsx';
import ProduceDetails from './pages/ProduceDetails.jsx';
import EventCatalog from './pages/EventCatalog.jsx';
import Login from './pages/Login.jsx';
import Profile from './pages/Profile.jsx';
import Signup from './pages/Signup.jsx';
import CropPrediction from './pages/CropPrediction.jsx';
import CreateEventMinimal from './pages/CreateEventMinimal.jsx';
import Settings from './pages/Settings.jsx';
import AdminEvents from './pages/AdminEvents'; 
import AdminReports from './pages/AdminReports';
import AdminQRCodes from './pages/AdminQRCodes';
import AdminAttendance from './pages/AdminAttendance';
import StudentSettings from './pages/StudentSettings';
import EventDetails from './pages/EventDetail';

// Simple placeholder component for missing pages
const PlaceholderPage = ({ title }) => (
  <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 pt-20 flex items-center justify-center">
    <div className="text-center glass rounded-2xl p-12 max-w-md">
      <h1 className="text-3xl font-bold text-white mb-4">{title}</h1>
      <p className="text-gray-400 mb-6">This page is coming soon!</p>
      <a href="/" className="bg-gradient-primary text-white px-6 py-3 rounded-lg inline-block">
        Back to Home
      </a>
    </div>
  </div>
);

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { path: '/', element: <Home /> },
      
      // 🎯 DASHBOARD ROUTES - Event Platform
      { path: '/admin-dashboard', element: <AdminDashboard /> },
      { path: '/student-dashboard', element: <StudentDashboard /> },
      { path: '/notifications', element: <StudentNotifications /> }, // ✅ ADDED
      
      // 📊 ADMIN ROUTES
      { path: '/admin/attendance', element: <AdminAttendance /> },
      { path: '/admin/reports', element: <AdminReports /> },
      { path: '/admin/qr-codes', element: <AdminQRCodes /> },
      { path: '/admin/events', element: <AdminEvents /> },
      
      // 👤 USER ROUTES
      { path: '/student/settings', element: <StudentSettings /> },
      { path: '/profile', element: <Profile /> },
      { path: '/settings', element: <Settings /> },
      { path: '/login', element: <Login /> },
      { path: '/signup', element: <Signup /> },
      
      // 🎪 EVENT ROUTES
      { path: '/events', element: <EventCatalog /> },
      { path: '/events/:id', element: <EventDetails /> },
      { path: '/create-event', element: <CreateEventMinimal /> },
      
      // 🤖 AI ROUTES
      { path: '/ai-suggestions', element: <AIGrader /> },
      { path: '/crop-prediction', element: <CropPrediction /> },
      
      // 📄 DETAILS ROUTES
      { path: '/produce-details/:id', element: <ProduceDetails /> },
      
      // 🔄 LEGACY/ALTERNATE ROUTES (backward compatibility)
      { path: '/farmer-dashboard', element: <AdminDashboard /> },
      { path: '/aigrader', element: <AIGrader /> },
      { path: '/marketplace', element: <EventCatalog /> },
      { path: '/FarmerDashboard', element: <AdminDashboard /> },
      { path: '/ai-grader', element: <AIGrader /> },
      { path: '/ProduceDetails/:id', element: <ProduceDetails /> },
      { path: '/Marketplace', element: <EventCatalog /> },
      { path: '/register', element: <Signup /> },
      
      // 📱 PLACEHOLDER PAGES
      { path: '/how-it-works', element: <PlaceholderPage title="How It Works" /> },
      { path: '/organizers', element: <PlaceholderPage title="For Organizers" /> },
      { path: '/students', element: <PlaceholderPage title="For Students" /> },
      { path: '/success-stories', element: <PlaceholderPage title="Success Stories" /> },
      { path: '/pricing', element: <PlaceholderPage title="Pricing" /> },
      { path: '/docs', element: <PlaceholderPage title="Documentation" /> },
      { path: '/help', element: <PlaceholderPage title="Help Center" /> },
      { path: '/blog', element: <PlaceholderPage title="Blog" /> },
      { path: '/api', element: <PlaceholderPage title="API Reference" /> },
      { path: '/about', element: <PlaceholderPage title="About Us" /> },
      { path: '/careers', element: <PlaceholderPage title="Careers" /> },
      { path: '/press', element: <PlaceholderPage title="Press" /> },
      { path: '/contact', element: <PlaceholderPage title="Contact" /> },
      { path: '/partners', element: <PlaceholderPage title="Partners" /> },
      { path: '/privacy', element: <PlaceholderPage title="Privacy Policy" /> },
      { path: '/terms', element: <PlaceholderPage title="Terms of Service" /> },
      { path: '/cookies', element: <PlaceholderPage title="Cookie Policy" /> },
      { path: '/conduct', element: <PlaceholderPage title="Code of Conduct" /> },
      
      // 🚨 CATCH ALL ROUTE FOR 404s
      {
        path: '*',
        element: (
          <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 pt-20 flex items-center justify-center">
            <div className="text-center glass rounded-2xl p-12 max-w-md">
              <h1 className="text-6xl font-bold text-gradient mb-4">404</h1>
              <h2 className="text-2xl font-bold text-white mb-4">Page Not Found</h2>
              <p className="text-gray-400 mb-6">The page you're looking for doesn't exist.</p>
              <a href="/" className="bg-gradient-primary text-white px-6 py-3 rounded-lg inline-block">
                Back to Home
              </a>
            </div>
          </div>
        ),
      },
    ],
  },
]);

export default router;