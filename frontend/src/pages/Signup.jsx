import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Eye, EyeOff, ArrowLeft, CheckCircle, Calendar, Users, BarChart3, User, GraduationCap } from 'lucide-react';
import { Toaster, toast } from 'react-hot-toast'; 
import { useAuth } from '../context/AuthContext'; 
import api from '../utilis/api';
// OR if using authAPI


const UnifiedSignup = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'organizer', // Default role (changed to organizer)
    termsAccepted: false
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // t() mock/hook integration
  const t = (text) => text;

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleRoleSelect = (selectedRole) => {
    setFormData({ ...formData, role: selectedRole });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.email || !formData.password) {
      setError(t('Please fill in all fields.'));
      return;
    }
    if (formData.password.length < 8) {
      setError(t('Password must be at least 8 characters long.'));
      return;
    }
    if (!formData.termsAccepted) {
      setError(t('Please accept the terms and conditions.'));
      return;
    }

    setIsLoading(true);

  try {
  // Using authAPI (if you added it to api.js)
  // const response = await authAPI.register(formData);
  
  // OR using the default api instance
  const response = await api.post('/auth/register', formData);
  const data = response.data;

  login(data); 
  
  // Redirect based on the chosen role
  if (formData.role === 'organizer') {
    navigate('/admin-dashboard');
  } else {
    navigate('/student-dashboard');
  }
} catch (err) {
  // Handle backend validation errors
  const errorMessage = err.response?.data?.message || t('Signup failed. Please check your credentials.');
  setError(errorMessage);
  toast.error(errorMessage);
} finally {
  setIsLoading(false);
}
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-200/50 to-indigo-50 dark:from-slate-900 dark:via-purple-900/20 dark:to-slate-900 flex items-center justify-center px-4 py-8 font-sans transition-colors duration-500">
      <Toaster position="top-center" />
      
      <div className="absolute inset-0 overflow-hidden">
        <style>{`
          .animate-fade-in { animation: fadeIn 0.3s ease-out; }
          @keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
        `}</style>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-md">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-purple-700 dark:hover:text-white transition-colors mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          {t('Back to Home')}
        </Link>

        <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl rounded-2xl p-8 border border-gray-200/50 dark:border-gray-700/50 shadow-2xl">
          
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Calendar className="w-8 h-8 text-white"/>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t('Join EventHub')}</h1>
            <p className="text-gray-600 dark:text-gray-400">{t('Create an account to get started')}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* ROLE SELECTION TOGGLE */}
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-3">
                {t('I want to join as a:')}
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => handleRoleSelect('student')}
                  className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${
                    formData.role === 'student' 
                    ? 'border-purple-500 bg-purple-500/10 text-purple-600 dark:text-purple-400' 
                    : 'border-gray-200 dark:border-gray-700 text-gray-500'
                  }`}
                >
                  <GraduationCap className="w-5 h-5" />
                  <span className="text-xs font-bold">{t('Student')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleRoleSelect('organizer')}
                  className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${
                    formData.role === 'organizer' 
                    ? 'border-purple-500 bg-purple-500/10 text-purple-600 dark:text-purple-400' 
                    : 'border-gray-200 dark:border-gray-700 text-gray-500'
                  }`}
                >
                  <User className="w-5 h-5" />
                  <span className="text-xs font-bold">{t('Organizer')}</span>
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
                {formData.role === 'organizer' ? t('Organization / Full Name') : t('Full Name')}
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder={formData.role === 'organizer' ? t("Ex: Global Tech Events") : t("Ex: John Doe")}
                className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition-all"
                required
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
                {t('Email Address')}
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder={t("Enter your email")}
                className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition-all"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
                {t('Password')}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder={t("Create a strong password")}
                  className="w-full px-4 py-3 pr-12 bg-gray-100 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="terms"
                name="termsAccepted"
                checked={formData.termsAccepted}
                onChange={handleInputChange}
                className="mt-1 rounded border-gray-400 bg-gray-200 text-purple-600 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700"
                required
              />
              <label htmlFor="terms" className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                {t('I agree to the')}{' '}
                <a href="/terms" className="text-purple-600 dark:text-purple-400 hover:text-purple-500 underline">
                  {t('Terms of Service')}
                </a>
                {' '}{t('and')}{' '}
                <a href="/privacy" className="text-purple-600 dark:text-purple-400 hover:text-purple-500 underline">
                  {t('Privacy Policy')}
                </a>.
              </label>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-700 dark:text-red-300 p-3 rounded-xl text-sm animate-fade-in">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 px-4 rounded-xl font-semibold transition-all shadow-lg ${
                isLoading ? 'opacity-50 cursor-not-allowed flex items-center justify-center' : 'hover:from-purple-700 hover:to-indigo-700 hover:scale-[1.02] active:scale-[0.98]'
              }`}
            >
              {isLoading ? t('Creating Account...') : t('Register Now')}
            </button>
          </form>

          {/* DYNAMIC BENEFITS SECTION */}
          <div className="mt-6 p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl">
            <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 mb-2">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm font-semibold">{formData.role === 'organizer' ? t('Organizer Benefits:') : t('Student Benefits:')}</span>
            </div>
            <ul className="text-xs text-gray-600 dark:text-gray-300 space-y-1 ml-6">
              {formData.role === 'organizer' ? (
                <>
                  <li className='flex items-start gap-1'><Users className="w-3 h-3 mt-1"/> {t('Manage Unlimited Attendees')}</li>
                  <li className='flex items-start gap-1'><Calendar className="w-3 h-3 mt-1"/> {t('Seamless Event Scheduling')}</li>
                  <li className='flex items-start gap-1'><BarChart3 className="w-3 h-3 mt-1"/> {t('Real-time Registration Analytics')}</li>
                </>
              ) : (
                <>
                  <li className='flex items-start gap-1'><Calendar className="w-3 h-3 mt-1"/> {t('Discover Campus Events')}</li>
                  <li className='flex items-start gap-1'><Users className="w-3 h-3 mt-1"/> {t('Network with Peers')}</li>
                  <li className='flex items-start gap-1'><CheckCircle className="w-3 h-3 mt-1"/> {t('Easy One-click Registration')}</li>
                </>
              )}
            </ul>
          </div>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-300 dark:border-gray-700"></div></div>
            <div className="relative flex justify-center text-sm"><span className="px-4 bg-white dark:bg-gray-800 text-gray-500">{t('or')}</span></div>
          </div>

          <div className="space-y-3">
            <button className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-600 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-all">
               {/* Google Icon SVG code here */}
              {t('Sign up with Google')}
            </button>
          </div>

          <div className="text-center mt-8">
            <p className="text-gray-600 dark:text-gray-400">
              {t('Already have an account?')}{' '}
              <Link to="/login" className="text-purple-600 dark:text-purple-400 font-semibold transition-colors">
                {t('Sign in')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnifiedSignup;