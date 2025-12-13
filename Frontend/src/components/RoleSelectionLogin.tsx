import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { UserRound, ShieldCheck, ShoppingCart, ArrowLeft, HelpCircle } from 'lucide-react';

type Role = 'farmer' | 'validator' | 'buyer';

export default function RoleSelectionLogin() {
  const [selectedRole, setSelectedRole] = useState<Role>('farmer');
  const navigate = useNavigate();
  const { t, setUser } = useApp();
  
  const roles = [
    {
      id: 'farmer' as Role,
      icon: UserRound,
      title: t('role.farmer'),
      description: 'Access disease detection, business advisor & green credits',
      color: 'bg-green-600',
      bgColor: 'bg-green-50',
      hoverColor: 'hover:bg-green-100',
    },
    {
      id: 'validator' as Role,
      icon: ShieldCheck,
      title: t('role.validator'),
      description: 'Verify farmer activities and approve green credits',
      color: 'bg-blue-600',
      bgColor: 'bg-blue-50',
      hoverColor: 'hover:bg-blue-100',
    },
    {
      id: 'buyer' as Role,
      icon: ShoppingCart,
      title: t('role.buyer'),
      description: 'Purchase verified green credits from farmers',
      color: 'bg-orange-600',
      bgColor: 'bg-orange-50',
      hoverColor: 'hover:bg-orange-100',
    },
  ];
  
  const handleLogin = () => {
    // Mock login
    setUser({
      id: '1',
      name: selectedRole === 'farmer' ? 'राज पाटिल' : selectedRole === 'validator' ? 'Dr. Sharma' : 'Green Corp',
      role: selectedRole,
      email: `${selectedRole}@example.com`,
    });
    navigate(`/${selectedRole}-dashboard`);
  };
  
  const handleSignup = () => {
    navigate('/signup');
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-green-50/30">
      {/* Back Button */}
      <div className="container mx-auto px-4 pt-6">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-green-600 hover:text-green-700 bg-white rounded-full px-6 py-3 shadow-md hover:shadow-lg transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>
      </div>
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h2 className="text-gray-800 mb-3">Select Your Role</h2>
            <p className="text-gray-600">Choose how you want to use KrishiSaarthi</p>
          </div>
          
          {/* Role Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {roles.map((role) => {
              const Icon = role.icon;
              const isSelected = selectedRole === role.id;
              
              return (
                <button
                  key={role.id}
                  onClick={() => setSelectedRole(role.id)}
                  className={`
                    bg-white rounded-3xl p-8 transition-all duration-300 text-center
                    ${isSelected ? 'shadow-2xl scale-105 ring-4 ring-offset-2 ring-green-400' : 'shadow-lg hover:shadow-xl hover:scale-102'}
                  `}
                >
                  <div className={`
                    w-24 h-24 ${role.color} rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg
                  `}>
                    <Icon className="w-12 h-12 text-white" />
                  </div>
                  
                  <h3 className="text-gray-900 mb-4">{role.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{role.description}</p>
                  
                  {isSelected && (
                    <div className="mt-6 pt-6 border-t border-gray-100">
                      <div className="w-full h-2 bg-gradient-to-r from-green-400 to-green-600 rounded-full"></div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <button
              onClick={handleLogin}
              className="flex-1 bg-green-600 text-white px-8 py-5 rounded-2xl hover:bg-green-700 transition-all shadow-lg hover:shadow-xl"
            >
              {t('login')}
            </button>
            
            {selectedRole === 'farmer' && (
              <button
                onClick={handleSignup}
                className="flex-1 bg-white text-green-600 px-8 py-5 rounded-2xl hover:bg-green-50 transition-all shadow-lg hover:shadow-xl border-2 border-green-600"
              >
                {t('signup')}
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Help Button */}
      <button className="fixed bottom-6 right-6 w-12 h-12 bg-gray-900 text-white rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors shadow-lg z-20">
        <HelpCircle className="w-6 h-6" />
      </button>
    </div>
  );
}