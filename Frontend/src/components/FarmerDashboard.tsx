import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import Header from './Header';
import { Scan, Briefcase, Coins, HelpCircle, TrendingUp } from 'lucide-react';

export default function FarmerDashboard() {
  const navigate = useNavigate();
  const { t, user } = useApp();
  
  const modules = [
    {
      id: 'crop-disease',
      icon: Scan,
      title: t('crop.disease'),
      description: t('crop.disease.desc'),
      color: 'from-green-400 to-green-600',
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      path: '/crop-disease',
    },
    {
      id: 'business-advisor',
      icon: Briefcase,
      title: t('business.advisor'),
      description: t('business.advisor.desc'),
      color: 'from-yellow-400 to-yellow-600',
      iconBg: 'bg-yellow-100',
      iconColor: 'text-yellow-600',
      path: '/business-advisor',
    },
    {
      id: 'green-credit',
      icon: Coins,
      title: t('green.credit'),
      description: t('green.credit.desc'),
      color: 'from-green-500 to-green-700',
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      path: '/green-credit',
    },
  ];
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white dark:from-gray-900 dark:to-gray-950 transition-colors">
      <Header />
      
      {/* Dashboard Header Banner */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 dark:from-green-700 dark:to-green-800 text-white py-12 shadow-lg">
        <div className="container mx-auto px-4">
          <div>
            <p className="opacity-90 mb-1">{t('welcome')}</p>
            <h2 className="text-3xl mb-3">{user?.name}</h2>
            {user?.farmLand && (
              <div className="flex items-center gap-2 opacity-90">
                <TrendingUp className="w-4 h-4" />
                <span>{user.farmLand} Acres</span>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Dashboard Modules */}
      <div className="container mx-auto px-4 py-12">
        <h3 className="text-gray-800 dark:text-gray-200 mb-8 text-center">{t('dashboard')}</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {modules.map((module, index) => {
            const Icon = module.icon;
            
            return (
              <button
                key={module.id}
                onClick={() => navigate(module.path)}
                className="group relative"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:scale-105 hover:-translate-y-2">
                  {/* Icon Section */}
                  <div className={`bg-gradient-to-br ${module.color} p-10 flex items-center justify-center relative overflow-hidden`}>
                    <div className="absolute inset-0 bg-white/10 transform -skew-y-6 group-hover:skew-y-6 transition-transform duration-500"></div>
                    <div className={`relative ${module.iconBg} w-24 h-24 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className={`w-12 h-12 ${module.iconColor}`} />
                    </div>
                  </div>
                  
                  {/* Content Section */}
                  <div className="p-8 text-center">
                    <h4 className="text-gray-900 dark:text-white mb-3 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">{module.title}</h4>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{module.description}</p>
                    
                    {/* Arrow Indicator */}
                    <div className="mt-6 flex justify-center">
                      <div className="w-10 h-10 bg-green-50 dark:bg-green-900/30 rounded-full flex items-center justify-center group-hover:bg-green-100 dark:group-hover:bg-green-900/50 transition-colors">
                        <svg className="w-5 h-5 text-green-600 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
      
      {/* Help Button */}
      <button className="fixed bottom-6 right-6 w-12 h-12 bg-gray-900 dark:bg-gray-800 text-white rounded-full flex items-center justify-center hover:bg-gray-800 dark:hover:bg-gray-700 transition-colors shadow-lg z-20 hover:scale-110">
        <HelpCircle className="w-6 h-6" />
      </button>
    </div>
  );
}