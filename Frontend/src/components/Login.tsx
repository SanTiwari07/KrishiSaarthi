import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import Header from './Header';
import { Mail, Lock, Phone, ArrowRight, Sprout, ClipboardCheck, ShoppingBag } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

type Role = 'farmer' | 'buyer' | 'validator';
type Step = 'role-selection' | 'auth';

export default function Login() {
  const navigate = useNavigate();
  const { t, setUser } = useApp();
  const [step, setStep] = useState<Step>('role-selection');
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [formData, setFormData] = useState({
    identifier: '', // phone or email
    password: '',
  });
  
  const roles = [
    { 
      id: 'farmer' as Role, 
      label: t('role.farmer'), 
      icon: Sprout,
      color: 'from-green-500 to-green-700',
      bgColor: 'bg-green-600',
      textColor: 'text-green-600',
      description: 'Grow crops, get advice, earn credits',
      image: 'https://images.unsplash.com/photo-1623211269755-569fec0536d2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBmYXJtZXIlMjBmaWVsZHxlbnwxfHx8fDE3NjQ5MjU2ODF8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
    },
    { 
      id: 'validator' as Role, 
      label: t('role.validator'), 
      icon: ClipboardCheck,
      color: 'from-blue-500 to-blue-700',
      bgColor: 'bg-blue-600',
      textColor: 'text-blue-600',
      description: 'Verify farming activities & credits',
      image: 'https://images.unsplash.com/photo-1656250444213-6baf45417252?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZ3JpY3VsdHVyYWwlMjBpbnNwZWN0b3IlMjBjZXJ0aWZpY2F0aW9ufGVufDF8fHx8MTc2NDk5OTIyMHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
    },
    { 
      id: 'buyer' as Role, 
      label: t('role.buyer'), 
      icon: ShoppingBag,
      color: 'from-orange-500 to-orange-700',
      bgColor: 'bg-orange-600',
      textColor: 'text-orange-600',
      description: 'Purchase verified green credits',
      image: 'https://images.unsplash.com/photo-1696861273647-92dfe8bb697c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3Jwb3JhdGUlMjBidXllciUyMGhhbmRzaGFrZXxlbnwxfHx8fDE3NjQ5OTkyMjB8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
    },
  ];
  
  const handleRoleSelect = (role: Role) => {
    setSelectedRole(role);
    setStep('auth');
  };
  
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedRole) return;
    
    // Mock login
    setUser({
      id: '1',
      name: selectedRole === 'farmer' ? 'राज पाटिल' : selectedRole === 'validator' ? 'Dr. Sharma' : 'Green Corp',
      role: selectedRole,
      email: formData.identifier,
    });
    
    navigate(`/${selectedRole}-dashboard`);
  };
  
  const currentRole = roles.find(r => r.id === selectedRole);
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
      <Header />
      
      <div className="container mx-auto px-4 py-12">
        {step === 'role-selection' ? (
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
              <h2 className="text-gray-900 dark:text-white mb-3">Choose Your Role</h2>
              <p className="text-gray-600 dark:text-gray-400">Select how you want to use KrishiSaarthi</p>
            </div>
            
            {/* Role Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {roles.map((role) => {
                const Icon = role.icon;
                return (
                  <button
                    key={role.id}
                    onClick={() => handleRoleSelect(role.id)}
                    className="group bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border border-gray-100 dark:border-gray-800"
                  >
                    {/* Image */}
                    <div className="relative h-48 overflow-hidden">
                      <ImageWithFallback
                        src={role.image}
                        alt={role.label}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className={`absolute inset-0 bg-gradient-to-t ${role.color} opacity-60 group-hover:opacity-40 transition-opacity`}></div>
                      
                      {/* Icon Badge */}
                      <div className={`absolute top-4 right-4 ${role.bgColor} w-12 h-12 rounded-full flex items-center justify-center shadow-lg`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    
                    {/* Content */}
                    <div className="p-6">
                      <h3 className={`${role.textColor} dark:text-white mb-2`}>{role.label}</h3>
                      <p className="text-gray-600 dark:text-gray-400">{role.description}</p>
                      
                      <div className="mt-6 flex items-center justify-center gap-2 text-gray-700 dark:text-gray-300 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                        <span>Get Started</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="max-w-md mx-auto">
            {/* Back Button */}
            <button
              onClick={() => {
                setStep('role-selection');
                setSelectedRole(null);
              }}
              className="mb-6 text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors flex items-center gap-2"
            >
              <ArrowRight className="w-4 h-4 rotate-180" />
              Back to role selection
            </button>
            
            {/* Auth Card */}
            <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl p-8 border border-gray-100 dark:border-gray-800 transition-colors">
              {/* Header with Role Badge */}
              <div className="text-center mb-8">
                {currentRole && (
                  <div className={`inline-flex items-center gap-2 ${currentRole.bgColor} px-4 py-2 rounded-full mb-4`}>
                    {(() => {
                      const Icon = currentRole.icon;
                      return <Icon className="w-5 h-5 text-white" />;
                    })()}
                    <span className="text-white">{currentRole.label}</span>
                  </div>
                )}
                <h2 className="text-gray-900 dark:text-white mb-2">
                  {authMode === 'login' ? 'Welcome Back' : 'Create Account'}
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  {authMode === 'login' ? 'Sign in to continue' : 'Join KrishiSaarthi today'}
                </p>
              </div>
              
              {/* Auth Mode Toggle */}
              <div className="flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1 mb-6">
                <button
                  onClick={() => setAuthMode('login')}
                  className={`flex-1 py-2.5 rounded-lg transition-all ${
                    authMode === 'login'
                      ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-md'
                      : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  Login
                </button>
                <button
                  onClick={() => setAuthMode('signup')}
                  className={`flex-1 py-2.5 rounded-lg transition-all ${
                    authMode === 'signup'
                      ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-md'
                      : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  Sign Up
                </button>
              </div>
              
              {authMode === 'login' ? (
                /* Login Form */
                <form onSubmit={handleLogin} className="space-y-5">
                  {/* Phone/Email Input */}
                  <div>
                    <label className="text-gray-700 dark:text-gray-300 mb-2 block">Phone Number / Email</label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                        {formData.identifier.includes('@') ? (
                          <Mail className="w-5 h-5" />
                        ) : (
                          <Phone className="w-5 h-5" />
                        )}
                      </div>
                      <input
                        type="text"
                        value={formData.identifier}
                        onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
                        placeholder="Enter phone or email"
                        className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl pl-12 pr-4 py-3.5 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-600 dark:focus:ring-green-500 transition-all"
                        required
                      />
                    </div>
                  </div>
                  
                  {/* Password Input */}
                  <div>
                    <label className="text-gray-700 dark:text-gray-300 mb-2 block">Password</label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                        <Lock className="w-5 h-5" />
                      </div>
                      <input
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        placeholder="Enter password"
                        className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl pl-12 pr-4 py-3.5 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-600 dark:focus:ring-green-500 transition-all"
                        required
                      />
                    </div>
                  </div>
                  
                  {/* Forgot Password */}
                  <div className="text-right">
                    <Link
                      to="/forgot-password"
                      className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 transition-colors"
                    >
                      Forgot Password?
                    </Link>
                  </div>
                  
                  {/* Login Button */}
                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-4 rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02] flex items-center justify-center gap-2"
                  >
                    {t('login')}
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </form>
              ) : (
                /* Signup Redirect */
                <div className="text-center py-8">
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    To create a new account, please use our full signup form
                  </p>
                  <Link
                    to="/signup"
                    className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-8 py-4 rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                  >
                    Go to Signup
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}