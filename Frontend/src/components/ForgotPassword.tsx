import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from './Header';
import { Mail, Phone, ArrowRight, CheckCircle } from 'lucide-react';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState<'request' | 'sent'>('request');
  const [identifier, setIdentifier] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('sent');
    
    // Auto redirect after 3 seconds
    setTimeout(() => {
      navigate('/login');
    }, 3000);
  };
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
      <Header />
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl p-8 border border-gray-100 dark:border-gray-800 transition-colors">
            {step === 'request' ? (
              <>
                {/* Header */}
                <div className="text-center mb-8">
                  <h2 className="text-gray-900 dark:text-white mb-2">Forgot Password?</h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Enter your phone or email to reset your password
                  </p>
                </div>
                
                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="text-gray-700 dark:text-gray-300 mb-2 block">
                      Phone Number / Email
                    </label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                        {identifier.includes('@') ? (
                          <Mail className="w-5 h-5" />
                        ) : (
                          <Phone className="w-5 h-5" />
                        )}
                      </div>
                      <input
                        type="text"
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        placeholder="Enter phone or email"
                        className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl pl-12 pr-4 py-3.5 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-600 dark:focus:ring-green-500 transition-all"
                        required
                      />
                    </div>
                  </div>
                  
                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-4 rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02] flex items-center justify-center gap-2"
                  >
                    Send Reset Link
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </form>
                
                {/* Back to Login */}
                <div className="mt-6 text-center">
                  <Link
                    to="/login"
                    className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 transition-colors"
                  >
                    ← Back to Login
                  </Link>
                </div>
              </>
            ) : (
              <>
                {/* Success State */}
                <div className="text-center animate-fadeIn">
                  <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
                  </div>
                  
                  <h2 className="text-gray-900 dark:text-white mb-3">Reset Link Sent!</h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    We&apos;ve sent a password reset link to:
                  </p>
                  
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl px-4 py-3 mb-6">
                    <p className="text-green-700 dark:text-green-400">{identifier}</p>
                  </div>
                  
                  <p className="text-gray-500 dark:text-gray-500 mb-6">
                    Please check your inbox and follow the instructions.
                  </p>
                  
                  <Link
                    to="/login"
                    className="inline-block bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-8 py-3 rounded-xl transition-all shadow-lg hover:shadow-xl"
                  >
                    Back to Login
                  </Link>
                  
                  <p className="text-gray-400 dark:text-gray-600 mt-6">
                    Redirecting in 3 seconds...
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
