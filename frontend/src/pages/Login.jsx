import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Eye, EyeOff, ArrowLeft, Calendar, User, GraduationCap } from 'lucide-react';
import { Toaster, toast } from 'react-hot-toast'; 
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { authAPI } from '../utilis/api';  // ✅ Named import with curly braces
// OR if you created authAPI




const UnifiedLogin = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login } = useAuth(); 

  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'organizer', // Default role for login (now defaults to organizer)
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleRoleSelect = (selectedRole) => {
    setFormData({ ...formData, role: selectedRole });
  };

 // In UnifiedLogin.jsx - Update the handleSubmit function:
// In UnifiedLogin.jsx - update the login call:
const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');

  if (!formData.email || !formData.password) {
    const msg = t('Please fill in all fields.');
    setError(msg);
    toast.error(msg);
    return;
  }

  setIsLoading(true);

  try {
    // ✅ Use authAPI instead of direct api.post
    const response = await authAPI.login(formData);
    const data = response.data;

    // Check if user's actual role matches selected role
    const actualRole = data.user.role.toLowerCase();
    const selectedRole = formData.role.toLowerCase();
    
    if (actualRole !== selectedRole) {
      const errorMessage = t(`This account is registered as ${data.user.role}. Please select the correct role.`);
      setError(errorMessage);
      toast.error(errorMessage);
      return;
    }
    
    // ✅ Login with proper data structure
    login({
      user: data.user,
      token: data.token
    }); 
    
    toast.success(t('Welcome back to EventHub!'), { duration: 3000 });
    
    // Redirect based on actual user role
    if (actualRole === 'organizer') {
      navigate('/admin-dashboard');
    } else {
      navigate('/student-dashboard');
    }
  } catch (error) {
    // Handle errors
    const errorMessage = error.response?.data?.message || error.message || t('Login failed. Please check your credentials.');
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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t('Welcome Back')}</h1>
            <p className="text-gray-600 dark:text-gray-400">
              {t('Sign in to access your dashboard')}
            </p>
          </div>

          {/* ROLE SELECTION TOGGLE */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-3 text-center">
              {t('Login as:')}
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => handleRoleSelect('student')}
                className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${
                  formData.role === 'student' 
                  ? 'border-purple-500 bg-purple-500/10 text-purple-600 dark:text-purple-400 shadow-sm' 
                  : 'border-gray-200 dark:border-gray-700 text-gray-500 hover:border-purple-300'
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
                  ? 'border-purple-500 bg-purple-500/10 text-purple-600 dark:text-purple-400 shadow-sm' 
                  : 'border-gray-200 dark:border-gray-700 text-gray-500 hover:border-purple-300'
                }`}
              >
                <User className="w-5 h-5" />
                <span className="text-xs font-bold">{t('Organizer')}</span>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
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
                placeholder={t('Enter your email')}
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
                  placeholder={t('Enter your password')}
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

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <input
                  type="checkbox"
                  name="remember"
                  className="rounded border-gray-400 bg-gray-200 text-purple-600 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700"
                />
                {t('Remember me')}
              </label>
              <Link to="/forgot-password" size="sm" className="text-purple-600 dark:text-purple-400 hover:text-purple-500 transition-colors">
                {t('Forgot password?')}
              </Link>
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
              {isLoading ? t('Signing in...') : t('Sign In')}
            </button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-300 dark:border-gray-700"></div></div>
            <div className="relative flex justify-center text-sm"><span className="px-4 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">{t('or')}</span></div>
          </div>

          <div className="text-center">
            <p className="text-gray-500 dark:text-gray-400">
              {t("New to EventHub?")}{' '}
              <Link to="/signup" className="text-purple-600 dark:text-purple-400 hover:text-purple-500 font-semibold transition-colors">
                {t('Create an Account')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnifiedLogin;