import { Sun, Moon, Languages, Sprout } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useApp } from '../contexts/AppContext';
import { useNavigate } from 'react-router-dom';

export default function Header() {
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, user } = useApp();
  const navigate = useNavigate();
  
  const languages = [
    { code: 'en' as const, label: 'EN' },
    { code: 'hi' as const, label: 'HI' },
    { code: 'mr' as const, label: 'MR' },
  ];
  
  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm transition-colors">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 gap-6">
          {/* Logo */}
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
              <Sprout className="w-6 h-6 text-white" />
            </div>
            <span className="text-gray-900 dark:text-white hidden sm:block">
              KrishiSaarthi
            </span>
          </button>
          
          {/* Spacer */}
          <div className="flex-1"></div>
          
          {/* Right Section */}
          <div className="flex items-center gap-4">
            {/* User Status */}
            {user && (
              <div className="hidden md:flex items-center gap-2 bg-green-50 dark:bg-green-900/20 px-4 py-2 rounded-full">
                <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></div>
                <span className="text-gray-700 dark:text-gray-300">
                  Logged in as <span className="capitalize">{user.role}</span>
                </span>
              </div>
            )}
            
            {/* Language Toggle */}
            <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-full p-1 transition-colors">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setLanguage(lang.code)}
                  className={`px-3 py-1.5 rounded-full transition-all text-sm ${
                    language === lang.code
                      ? 'bg-green-600 text-white shadow-md'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
            
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-all hover:scale-110"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? (
                <Moon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              ) : (
                <Sun className="w-5 h-5 text-yellow-500" />
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
