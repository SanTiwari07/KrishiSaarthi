import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import LanguageToggle from './LanguageToggle';
import { ArrowLeft, User, Mail, Phone, MapPin, LogOut, Languages } from 'lucide-react';

export default function Profile() {
  const navigate = useNavigate();
  const { t, user, logout, language, setLanguage } = useApp();
  
  const handleLogout = () => {
    logout();
    navigate('/');
  };
  
  const languageOptions = [
    { code: 'en' as const, label: 'English', native: 'English' },
    { code: 'hi' as const, label: 'Hindi', native: 'हिंदी' },
    { code: 'mr' as const, label: 'Marathi', native: 'मराठी' },
  ];
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <LanguageToggle />
      
      {/* Header */}
      <div className="bg-green-600 text-white py-6 shadow-lg">
        <div className="container mx-auto px-4 flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h2>{t('profile')}</h2>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          {/* Profile Card */}
          <div className="bg-white rounded-3xl shadow-2xl p-8 mb-6">
            {/* Avatar */}
            <div className="flex flex-col items-center mb-8">
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <User className="w-12 h-12 text-green-600" />
              </div>
              <h3 className="text-gray-900 mb-1">{user?.name}</h3>
              <div className="bg-green-100 text-green-700 px-4 py-1 rounded-full capitalize">
                {t(`role.${user?.role}`)}
              </div>
            </div>
            
            {/* User Info */}
            <div className="space-y-4">
              {user?.email && (
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                  <Mail className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="text-gray-500">{t('email')}</p>
                    <p className="text-gray-900">{user.email}</p>
                  </div>
                </div>
              )}
              
              {user?.mobile && (
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                  <Phone className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="text-gray-500">{t('mobile.number')}</p>
                    <p className="text-gray-900">{user.mobile}</p>
                  </div>
                </div>
              )}
              
              {user?.farmLand && (
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                  <MapPin className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="text-gray-500">{t('farm.land')}</p>
                    <p className="text-gray-900">{user.farmLand} Acres</p>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Language Preference */}
          <div className="bg-white rounded-3xl shadow-lg p-8 mb-6">
            <div className="flex items-center gap-3 mb-6">
              <Languages className="w-6 h-6 text-green-600" />
              <h4 className="text-gray-900">{t('language.preference')}</h4>
            </div>
            
            <div className="space-y-3">
              {languageOptions.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setLanguage(lang.code)}
                  className={`w-full p-4 rounded-xl border-2 transition-all flex items-center justify-between ${
                    language === lang.code
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-green-300'
                  }`}
                >
                  <div className="text-left">
                    <p className="text-gray-900">{lang.label}</p>
                    <p className="text-gray-600">{lang.native}</p>
                  </div>
                  {language === lang.code && (
                    <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
          
          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full bg-red-600 text-white py-5 rounded-2xl hover:bg-red-700 transition-colors shadow-lg flex items-center justify-center gap-3"
          >
            <LogOut className="w-5 h-5" />
            {t('logout')}
          </button>
        </div>
      </div>
    </div>
  );
}
