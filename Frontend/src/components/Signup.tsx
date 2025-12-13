import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import Header from './Header';
import { User, Phone, Mail, Lock, MapPin, ChevronDown, X } from 'lucide-react';

type Role = 'farmer' | 'buyer' | 'validator';

const CROP_OPTIONS = [
  'Wheat', 'Rice', 'Cotton', 'Sugarcane', 'Maize', 'Soybean', 
  'Groundnut', 'Tomato', 'Potato', 'Onion', 'Chilli', 'Tea'
];

export default function Signup() {
  const navigate = useNavigate();
  const { t, setUser } = useApp();
  const [selectedRole, setSelectedRole] = useState<Role>('farmer');
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [selectedCrops, setSelectedCrops] = useState<string[]>([]);
  const [showCropDropdown, setShowCropDropdown] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    village: '',
    district: '',
    password: '',
    confirmPassword: '',
  });
  
  const roles = [
    { id: 'farmer' as Role, label: t('role.farmer'), color: 'text-green-600' },
    { id: 'buyer' as Role, label: t('role.buyer'), color: 'text-orange-600' },
    { id: 'validator' as Role, label: t('role.validator'), color: 'text-blue-600' },
  ];
  
  const handleCropToggle = (crop: string) => {
    if (selectedCrops.includes(crop)) {
      setSelectedCrops(selectedCrops.filter(c => c !== crop));
    } else {
      setSelectedCrops([...selectedCrops, crop]);
    }
  };
  
  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }
    
    // Mock signup
    setUser({
      id: '1',
      name: formData.fullName,
      role: selectedRole,
      email: formData.email,
    });
    
    navigate(`/${selectedRole}-dashboard`);
  };
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
      <Header />
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          {/* Signup Card */}
          <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl p-8 border border-gray-100 dark:border-gray-800 transition-colors">
            {/* Header */}
            <div className="text-center mb-8">
              <h2 className="text-gray-900 dark:text-white mb-2">Create Account</h2>
              <p className="text-gray-600 dark:text-gray-400">Join KrishiSaarthi today</p>
            </div>
            
            {/* Role Selection Dropdown */}
            <div className="mb-6">
              <label className="text-gray-700 dark:text-gray-300 mb-2 block">Select Your Role</label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3.5 text-left flex items-center justify-between hover:border-green-600 dark:hover:border-green-500 transition-colors"
                >
                  <span className={`${roles.find(r => r.id === selectedRole)?.color} dark:text-green-400`}>
                    {roles.find(r => r.id === selectedRole)?.label}
                  </span>
                  <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${showRoleDropdown ? 'rotate-180' : ''}`} />
                </button>
                
                {showRoleDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg overflow-hidden z-20 animate-fadeIn">
                    {roles.map((role) => (
                      <button
                        key={role.id}
                        onClick={() => {
                          setSelectedRole(role.id);
                          setShowRoleDropdown(false);
                        }}
                        className={`w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                          selectedRole === role.id ? 'bg-green-50 dark:bg-green-900/20' : ''
                        }`}
                      >
                        <span className={role.color}>{role.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            {/* Signup Form */}
            <form onSubmit={handleSignup} className="space-y-5">
              {/* Full Name */}
              <div>
                <label className="text-gray-700 dark:text-gray-300 mb-2 block">Full Name</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    <User className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="Enter your full name"
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl pl-12 pr-4 py-3.5 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-600 dark:focus:ring-green-500 transition-all"
                    required
                  />
                </div>
              </div>
              
              {/* Farmer-specific fields */}
              {selectedRole === 'farmer' && (
                <>
                  {/* Phone Number */}
                  <div>
                    <label className="text-gray-700 dark:text-gray-300 mb-2 block">Phone Number</label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                        <Phone className="w-5 h-5" />
                      </div>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+91 98765 43210"
                        className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl pl-12 pr-4 py-3.5 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-600 dark:focus:ring-green-500 transition-all"
                        required
                      />
                    </div>
                  </div>
                  
                  {/* Village & District - Side by side */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-gray-700 dark:text-gray-300 mb-2 block">Village</label>
                      <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                          <MapPin className="w-5 h-5" />
                        </div>
                        <input
                          type="text"
                          value={formData.village}
                          onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                          placeholder="Village name"
                          className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl pl-12 pr-4 py-3.5 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-600 dark:focus:ring-green-500 transition-all"
                          required
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-gray-700 dark:text-gray-300 mb-2 block">District</label>
                      <input
                        type="text"
                        value={formData.district}
                        onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                        placeholder="District name"
                        className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3.5 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-600 dark:focus:ring-green-500 transition-all"
                        required
                      />
                    </div>
                  </div>
                  
                  {/* Crop Selection */}
                  <div>
                    <label className="text-gray-700 dark:text-gray-300 mb-2 block">Select Crop Types</label>
                    
                    {/* Selected Crops Chips */}
                    {selectedCrops.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {selectedCrops.map((crop) => (
                          <div
                            key={crop}
                            className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-3 py-1.5 rounded-full flex items-center gap-2 border border-green-200 dark:border-green-800"
                          >
                            <span>{crop}</span>
                            <button
                              type="button"
                              onClick={() => handleCropToggle(crop)}
                              className="hover:bg-green-200 dark:hover:bg-green-800 rounded-full p-0.5 transition-colors"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setShowCropDropdown(!showCropDropdown)}
                        className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3.5 text-left flex items-center justify-between hover:border-green-600 dark:hover:border-green-500 transition-colors"
                      >
                        <span className="text-gray-500 dark:text-gray-400">
                          {selectedCrops.length === 0 ? 'Select crops...' : `${selectedCrops.length} selected`}
                        </span>
                        <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${showCropDropdown ? 'rotate-180' : ''}`} />
                      </button>
                      
                      {showCropDropdown && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg max-h-60 overflow-y-auto z-20 animate-fadeIn">
                          {CROP_OPTIONS.map((crop) => (
                            <button
                              key={crop}
                              type="button"
                              onClick={() => handleCropToggle(crop)}
                              className={`w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-3 ${
                                selectedCrops.includes(crop) ? 'bg-green-50 dark:bg-green-900/20' : ''
                              }`}
                            >
                              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                                selectedCrops.includes(crop) 
                                  ? 'bg-green-600 border-green-600' 
                                  : 'border-gray-300 dark:border-gray-600'
                              }`}>
                                {selectedCrops.includes(crop) && (
                                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                  </svg>
                                )}
                              </div>
                              <span className="text-gray-700 dark:text-gray-300">{crop}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
              
              {/* Buyer/Validator fields */}
              {(selectedRole === 'buyer' || selectedRole === 'validator') && (
                <div>
                  <label className="text-gray-700 dark:text-gray-300 mb-2 block">Email</label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                      <Mail className="w-5 h-5" />
                    </div>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="your@email.com"
                      className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl pl-12 pr-4 py-3.5 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-600 dark:focus:ring-green-500 transition-all"
                      required
                    />
                  </div>
                </div>
              )}
              
              {/* Password */}
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
                    placeholder="Create a password"
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl pl-12 pr-4 py-3.5 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-600 dark:focus:ring-green-500 transition-all"
                    required
                  />
                </div>
              </div>
              
              {/* Confirm Password */}
              <div>
                <label className="text-gray-700 dark:text-gray-300 mb-2 block">Confirm Password</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    placeholder="Confirm your password"
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl pl-12 pr-4 py-3.5 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-600 dark:focus:ring-green-500 transition-all"
                    required
                  />
                </div>
              </div>
              
              {/* Signup Button */}
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-4 rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
              >
                {t('signup')}
              </button>
            </form>
            
            {/* Login Link */}
            <div className="mt-6 text-center">
              <p className="text-gray-600 dark:text-gray-400">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 transition-colors"
                >
                  Sign in →
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
