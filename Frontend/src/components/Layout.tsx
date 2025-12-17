import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { useTheme } from '../contexts/ThemeContext';
import { Menu, X, Sun, Moon, LogOut, User as UserIcon, Phone, MapPin, Calendar, Loader2, Wallet } from 'lucide-react';

import { useBlockchain } from '../contexts/BlockchainContext';

import logo from '../assets/logo.png';

export default function Layout({ children }: { children?: React.ReactNode }) {
  const { user, logout, language, setLanguage, t } = useApp();
  const { theme, toggleTheme } = useTheme();
  const { state: blockchainState, connect: connectWallet, isConnecting: isWalletConnecting } = useBlockchain();

  const isDark = theme === 'dark';
  const isAuthenticated = !!user;

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Close menus on route change
  useEffect(() => {
    setIsMenuOpen(false);
    setIsProfileOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const toggleProfile = () => setIsProfileOpen(!isProfileOpen);

  const getLanguageLabel = (lang: string) => {
    switch (lang) {
      case 'hi': return 'हिंदी';
      case 'mr': return 'मराठी';
      default: return 'ENG';
    }
  };

  const getHomeLink = () => {
    if (!isAuthenticated) return '/';
    // Map roles to lowercase to match existing Frontend logic if needed
    // Frontend uses: 'farmer', 'validator', 'buyer' strings
    switch (user?.role) {
      case 'farmer': return '/farmer-dashboard';
      case 'validator': return '/validator-dashboard';
      case 'buyer': return '/buyer-dashboard';
      default: return '/';
    }
  };

  const scrollToFeatures = (e: React.MouseEvent) => {
    if (location.pathname === '/') {
      e.preventDefault();
      const element = document.getElementById('features');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col transition-colors duration-200 font-sans relative overflow-x-hidden">

      {/* Shiny Animated Background */}
      <div className="fixed inset-0 z-[-1] w-full h-full overflow-hidden bg-gray-50 dark:bg-gray-900">
        <div className="absolute inset-0 bg-gradient-to-br from-green-50/50 via-white/80 to-blue-50/50 dark:from-gray-900 dark:via-gray-800 dark:to-black transition-colors duration-500"></div>
        <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-gradient-to-r from-green-300/30 to-emerald-400/30 dark:from-green-900/20 dark:to-emerald-800/20 rounded-full blur-[80px] animate-[pulse_8s_ease-in-out_infinite]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[700px] h-[700px] bg-gradient-to-l from-blue-300/30 to-cyan-400/30 dark:from-blue-900/20 dark:to-cyan-800/20 rounded-full blur-[100px] animate-[pulse_10s_ease-in-out_infinite_reverse]"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/10 to-transparent opacity-20 animate-shine hidden dark:block"></div>
      </div>

      {/* Navbar */}
      <nav className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl border-b border-white/20 dark:border-gray-800 sticky top-0 z-50 transition-all duration-300 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20">
            <div className="flex items-center">
              <Link to={getHomeLink()} className="flex items-center space-x-3 group">
                <div className="h-16 w-auto flex items-center justify-center">
                  <img src={logo} alt="KrishiSaarthi Logo" className="h-full w-auto object-contain" />
                </div>
                <span className="font-bold text-2xl bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 tracking-tight">
                  {t('app.name')}
                </span>
              </Link>
            </div>

            {/* Desktop Controls */}
            <div className="hidden md:flex items-center space-x-6">
              {!isAuthenticated && (
                <a href="/#features" onClick={scrollToFeatures} className="text-gray-700 dark:text-gray-200 hover:text-primary text-base font-semibold transition-colors cursor-pointer">{t('features')}</a>
              )}

              {/* Language Toggle */}
              <div className="flex items-center bg-gray-100/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl p-1 border border-gray-200 dark:border-gray-700 shadow-inner">
                {['en', 'hi', 'mr'].map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setLanguage(lang as any)}
                    className={`px-3 py-1.5 text-sm font-bold rounded-lg transition-all duration-300 ${language === lang
                      ? 'bg-white dark:bg-gray-700 text-primary shadow-sm scale-105 border border-gray-100 dark:border-gray-600'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-200/50 dark:hover:bg-gray-700/50'
                      }`}
                  >
                    {getLanguageLabel(lang)}
                  </button>
                ))}
              </div>

              {/* Navigation Links */}
              <div className="flex items-center space-x-1">
                {isAuthenticated && user?.role === 'validator' && (
                  <Link to="/validator-dashboard" className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-primary transition-colors">
                    {t('role.validator')}
                  </Link>
                )}
                {isAuthenticated && user?.role === 'buyer' && (
                  <Link to="/buyer-dashboard" className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-primary transition-colors">
                    {t('role.buyer')}
                  </Link>
                )}
                {isAuthenticated && user?.role === 'farmer' && (
                  <Link to="/farmer-dashboard" className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-primary transition-colors">
                    {t('role.farmer')}
                  </Link>
                )}
              </div>

              {/* Wallet Logic */}
              {!blockchainState ? (
                <button
                  onClick={connectWallet}
                  disabled={isWalletConnecting}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 font-bold text-sm hover:bg-orange-100 dark:hover:bg-orange-900/40 transition-colors border border-orange-200 dark:border-orange-800"
                >
                  {isWalletConnecting ? <Loader2 size={16} className="animate-spin" /> : <Wallet size={16} />}
                  <span>{t('connect')}</span>
                </button>
              ) : (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                  <span className="text-sm font-mono font-bold text-green-700 dark:text-green-300">
                    {blockchainState.address?.substring(0, 6)}...
                  </span>
                </div>
              )}

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-3 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 transition-colors border border-transparent hover:border-gray-200 dark:hover:border-gray-700 shadow-sm"
                aria-label="Toggle Theme"
              >
                {isDark ? <Sun size={20} /> : <Moon size={20} />}
              </button>

              {/* Auth Buttons */}
              {isAuthenticated ? (
                <div className="flex items-center space-x-4 relative">
                  <button
                    onClick={toggleProfile}
                    className="flex items-center space-x-2 bg-green-50/80 dark:bg-gray-800/80 backdrop-blur-sm px-4 py-2 rounded-full border border-green-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all"
                  >
                    <UserIcon size={18} className="text-primary" />
                    <span className="text-sm font-bold text-gray-800 dark:text-gray-200">{user?.name}</span>
                  </button>

                  {isProfileOpen && (
                    <div className="absolute top-14 right-0 w-80 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6 z-50 animate-fade-in origin-top-right">
                      <div className="mb-6 pb-6 border-b border-gray-100 dark:border-gray-700">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">{user?.name}</h3>
                        <p className="text-sm text-primary font-bold uppercase tracking-wider mt-1">{t('role.' + user?.role)}</p>
                      </div>

                      <div className="space-y-4 mb-6">
                        <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                          <Phone size={18} className="text-gray-400" />
                          <span>{user?.mobile}</span>
                        </div>
                      </div>

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center space-x-2 text-red-500 hover:text-red-600 font-bold text-sm transition-colors bg-red-50 dark:bg-red-900/10 px-4 py-3 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/30"
                      >
                        <LogOut size={18} />
                        <span>{t('logout')}</span>
                      </button>
                    </div>
                  )}
                  {isProfileOpen && (
                    <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)}></div>
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link to="/login" className="px-5 py-2.5 text-primary font-bold text-base hover:bg-green-50 rounded-xl transition-colors border border-transparent hover:border-green-200">
                    {t('login')}
                  </Link>
                  <Link to="/signup" className="px-5 py-2.5 bg-gradient-to-r from-primary to-green-600 text-white font-bold text-base rounded-xl hover:shadow-lg hover:shadow-green-500/30 transition-all transform hover:-translate-y-0.5 border border-transparent">
                    {t('signup')}
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="flex md:hidden items-center">
              <button
                onClick={toggleMenu}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 dark:text-gray-200 hover:text-primary focus:outline-none"
              >
                {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {
          isMenuOpen && (
            <div className="md:hidden bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-t border-gray-200 dark:border-gray-700 pb-4 shadow-xl absolute w-full z-50">
              <div className="px-4 pt-4 pb-3 space-y-2">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-gray-500 dark:text-gray-400 text-base font-medium">{t('settings')}</span>
                  <div className="flex space-x-4">
                    <button onClick={toggleTheme} className="text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 p-2 rounded-lg">
                      {isDark ? <Sun size={24} /> : <Moon size={24} />}
                    </button>
                    <div className="flex space-x-1 text-sm bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                      {['en', 'hi', 'mr'].map((lang) => (
                        <button
                          key={lang}
                          onClick={() => setLanguage(lang as any)}
                          className={`px-3 py-2 rounded-md text-xs font-bold ${language === lang ? 'bg-white dark:bg-gray-600 text-primary shadow' : 'text-gray-400'}`}
                        >
                          {getLanguageLabel(lang)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {isAuthenticated ? (
                  <>
                    <div className="px-3 py-3 border-b border-gray-100 dark:border-gray-700 mb-2">
                      <p className="text-lg text-gray-800 dark:text-gray-200 font-bold">{user?.name}</p>
                      <p className="text-sm text-gray-500">{t('role.' + user?.role)}</p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left flex items-center space-x-3 px-3 py-3 text-red-500 bg-red-50 dark:bg-gray-700 rounded-xl"
                    >
                      <LogOut size={20} />
                      <span className="font-bold">{t('logout')}</span>
                    </button>
                  </>
                ) : (
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <Link to="/login" onClick={() => setIsMenuOpen(false)} className="block px-3 py-3 text-center border border-primary text-primary font-bold rounded-xl text-lg">
                      {t('login')}
                    </Link>
                    <Link to="/signup" onClick={() => setIsMenuOpen(false)} className="block px-3 py-3 text-center bg-primary text-white font-bold rounded-xl text-lg shadow-md">
                      {t('signup')}
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )
        }
      </nav >

      {/* Main Content */}
      < main className="flex-grow relative z-10" >
        {children}
      </main >

      {/* Footer */}
      < footer className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-lg border-t border-gray-200 dark:border-gray-800 mt-auto" >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0 text-center md:text-left">
              <span className="text-2xl font-bold text-primary">{t('app.name')}</span>
              <p className="text-base text-gray-500 dark:text-gray-400 mt-2">{t('app.tagline')}</p>
            </div>
          </div>
          <div className="mt-10 text-center text-sm text-gray-400">
            © {new Date().getFullYear()} KrishiSaarthi.
          </div>
        </div>
      </footer >
    </div >
  );
}
