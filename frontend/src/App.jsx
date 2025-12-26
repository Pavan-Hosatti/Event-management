import { Outlet } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Header from './components/layout/Header';
// 💡 Import the AuthProvider
import { AuthProvider } from './context/AuthContext'; 

function App() {
  // 💡 REMOVE: isAuthenticated, handleLogin, handleLogout are now managed by AuthContext
  // const [isAuthenticated, setIsAuthenticated] = useState(false);
  // const handleLogin = () => setIsAuthenticated(true);
  // const handleLogout = () => setIsAuthenticated(false);
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);

  // Toggle theme function
  const toggleTheme = () => setIsDark(!isDark);

  // Apply dark/light theme
  useEffect(() => {
    const html = document.documentElement;
    if (isDark) html.classList.add('dark');
    else html.classList.remove('dark');
  }, [isDark]);

  return (
    // 💡 Wrap everything in AuthProvider
    <AuthProvider> 
      <div className="min-h-screen bg-white dark:bg-slate-900 transition-colors duration-200">
        
        {/* Header no longer needs isAuthenticated/onLogout props */}
        <Header
          // isAuthenticated={isAuthenticated} // REMOVED
          // onLogout={handleLogout}       // REMOVED
          isDark={isDark}
          toggleTheme={toggleTheme}
        />

        {/* Main content: all pages render here via router */}
        <main className="pt-0">
          <Outlet />
        </main>
      </div>
    </AuthProvider>
  );
}

export default App;