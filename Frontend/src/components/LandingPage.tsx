import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { Sprout, Languages, HelpCircle } from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();
  const { t, language, setLanguage } = useApp();
  
  const features = [
    'AI-Powered Crop Disease Detection',
    'Personalized Business Advisor',
    'Green Credit Rewards',
    'Expert Consultation',
  ];
  
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1629797716077-4688ef7aa935?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxncmVlbiUyMGZhcm0lMjBmaWVsZCUyMHN1bnJpc2V8ZW58MXx8fHwxNzY0ODI5NTUxfDA&ixlib=rb-4.1.0&q=80&w=1080')`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-green-900/60 via-green-800/50 to-green-900/70"></div>
      </div>
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-12 flex flex-col items-center justify-center min-h-screen">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Sprout className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-white mb-4 text-4xl md:text-5xl">KrishiSaarthi</h1>
          <p className="text-white/90 text-xl mb-3">{t('app.tagline')}</p>
          <p className="text-white/80">Smart Farming • Circular Economy • Farmer Prosperity</p>
        </div>
        
        {/* Language Selection Card */}
        <div className="bg-white rounded-3xl p-8 shadow-2xl max-w-md w-full mb-8">
          <div className="flex items-center gap-3 mb-6 text-green-600">
            <Languages className="w-6 h-6" />
            <span className="text-gray-700">Select Language</span>
          </div>
          
          <div className="grid grid-cols-3 gap-3 mb-6">
            <button
              onClick={() => setLanguage('en')}
              className={`py-3 px-4 rounded-xl transition-all ${
                language === 'en'
                  ? 'bg-green-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              English
            </button>
            <button
              onClick={() => setLanguage('hi')}
              className={`py-3 px-4 rounded-xl transition-all ${
                language === 'hi'
                  ? 'bg-green-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              हिंदी
            </button>
            <button
              onClick={() => setLanguage('mr')}
              className={`py-3 px-4 rounded-xl transition-all ${
                language === 'mr'
                  ? 'bg-green-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              मराठी
            </button>
          </div>
          
          <button
            onClick={() => navigate('/login')}
            className="w-full bg-green-600 text-white py-4 rounded-2xl hover:bg-green-700 transition-colors shadow-lg flex items-center justify-center gap-2"
          >
            {t('get.started')}
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        
        {/* Features */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl w-full">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white/95 backdrop-blur-sm rounded-2xl px-6 py-4 text-center shadow-lg hover:shadow-xl transition-shadow"
            >
              <p className="text-gray-700">{feature}</p>
            </div>
          ))}
        </div>
      </div>
      
      {/* Help Button */}
      <button className="fixed bottom-6 right-6 w-12 h-12 bg-gray-900/80 backdrop-blur-sm text-white rounded-full flex items-center justify-center hover:bg-gray-900 transition-colors shadow-lg z-20">
        <HelpCircle className="w-6 h-6" />
      </button>
    </div>
  );
}