import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import LanguageToggle from './LanguageToggle';
import { Sprout, User, MapPin, Phone, Mail, Lock } from 'lucide-react';

export default function FarmerSignup() {
  const navigate = useNavigate();
  const { t, setUser } = useApp();
  
  const [formData, setFormData] = useState({
    name: '',
    farmLand: '',
    mobile: '',
    email: '',
    password: '',
  });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mock signup
    setUser({
      id: Date.now().toString(),
      name: formData.name,
      role: 'farmer',
      email: formData.email,
      mobile: formData.mobile,
      farmLand: parseFloat(formData.farmLand),
    });
    
    navigate('/farmer-dashboard');
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <LanguageToggle />
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto bg-white rounded-3xl shadow-2xl p-8">
          <div className="flex items-center justify-center gap-3 mb-8">
            <Sprout className="w-12 h-12 text-green-600" />
            <h2 className="text-green-700">{t('create.account')}</h2>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name */}
            <div>
              <label className="block text-gray-700 mb-2">
                <User className="w-5 h-5 inline mr-2" />
                {t('full.name')}
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-4 rounded-xl border-2 border-gray-200 focus:border-green-500 outline-none transition-colors"
                placeholder={t('full.name')}
              />
            </div>
            
            {/* Farm Land */}
            <div>
              <label className="block text-gray-700 mb-2">
                <MapPin className="w-5 h-5 inline mr-2" />
                {t('farm.land')}
              </label>
              <input
                type="number"
                required
                step="0.1"
                value={formData.farmLand}
                onChange={(e) => setFormData({ ...formData, farmLand: e.target.value })}
                className="w-full px-4 py-4 rounded-xl border-2 border-gray-200 focus:border-green-500 outline-none transition-colors"
                placeholder="5.0"
              />
            </div>
            
            {/* Mobile Number */}
            <div>
              <label className="block text-gray-700 mb-2">
                <Phone className="w-5 h-5 inline mr-2" />
                {t('mobile.number')}
              </label>
              <input
                type="tel"
                required
                value={formData.mobile}
                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                className="w-full px-4 py-4 rounded-xl border-2 border-gray-200 focus:border-green-500 outline-none transition-colors"
                placeholder="+91 98765 43210"
              />
            </div>
            
            {/* Email */}
            <div>
              <label className="block text-gray-700 mb-2">
                <Mail className="w-5 h-5 inline mr-2" />
                {t('email')}
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-4 rounded-xl border-2 border-gray-200 focus:border-green-500 outline-none transition-colors"
                placeholder="farmer@example.com"
              />
            </div>
            
            {/* Password */}
            <div>
              <label className="block text-gray-700 mb-2">
                <Lock className="w-5 h-5 inline mr-2" />
                {t('password')}
              </label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-4 rounded-xl border-2 border-gray-200 focus:border-green-500 outline-none transition-colors"
                placeholder="••••••••"
              />
            </div>
            
            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-green-600 text-white py-5 rounded-2xl hover:bg-green-700 transition-colors shadow-lg"
            >
              {t('create.account')}
            </button>
            
            {/* Back to Login */}
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="w-full text-green-600 py-3 rounded-xl hover:bg-green-50 transition-colors"
            >
              {t('login')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
