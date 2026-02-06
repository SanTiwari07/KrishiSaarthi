import React, { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { useNavigate, Link } from 'react-router-dom';
import { User, CheckSquare, ShoppingCart, Loader2, ArrowLeft, Phone, MapPin, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import logo from '../assets/logo.png';

export default function AuthPage({ type }: { type: 'login' | 'signup' }) {
    const { login, signup, t, user, loading: authLoading } = useApp();
    const navigate = useNavigate();

    useEffect(() => {
        console.log('AuthPage useEffect: authLoading=', authLoading, 'user=', user);
        if (!authLoading && user) {
            console.log('Redirecting based on role:', user.role);
            if (user.role === 'farmer') navigate('/farmer-dashboard');
            else if (user.role === 'validator') navigate('/validator-dashboard');
            else navigate('/buyer-dashboard');
        }
    }, [user, authLoading, navigate]);

    const [loading, setLoading] = useState(false);
    const [role, setRole] = useState<'farmer' | 'validator' | 'buyer'>('farmer');

    // Form Fields
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [age, setAge] = useState('');
    const [address, setAddress] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (type === 'login') {
                await login(phone, password);
                toast.success(t('auth.success.login'));
            } else {
                // For farmers: only create auth account, onboarding will collect personal info
                if (role === 'farmer') {
                    const userData = {
                        name: 'Farmer', // Temporary, will be updated in onboarding
                        mobile: phone,
                        role,
                        age: '0', // Temporary
                        address: '', // Temporary
                        createdAt: new Date().toISOString()
                    };
                    await signup(userData, password);
                    toast.success(t('auth.success.signup'));
                    navigate('/onboarding');
                } else {
                    // For validators and buyers: collect full info during signup
                    const userData = {
                        name,
                        mobile: phone,
                        role,
                        age,
                        address,
                        createdAt: new Date().toISOString()
                    };
                    await signup(userData, password);
                    toast.success(t('auth.success.signup'));
                    if (role === 'validator') navigate('/validator-dashboard');
                    else navigate('/buyer-dashboard');
                }
            }
        } catch (error: any) {
            console.error('Full Login Error:', error);
            // Firebase Error codes mapping
            let msg = t('auth.error.failed');
            if (error.code === 'auth/user-not-found') msg = t('auth.error.user_not_found');
            if (error.code === 'auth/wrong-password') msg = t('auth.error.wrong_password');
            if (error.code === 'auth/email-already-in-use') msg = t('auth.error.email_in_use');
            if (error.code === 'auth/invalid-email') msg = 'Invalid mobile number format';
            if (error.message) {
                // If it's a custom error (like Role mismatch or Profile not found)
                if (error.message.includes('Role mismatch')) msg = 'Incorrect Role selected for this user';
                if (error.message.includes('User profile not found')) msg = 'User profile missing. Contact support.';
            }
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-white dark:bg-gray-900 font-sans">

            {/* Left Side - Image/Branding (Hidden on mobile) */}
            {/* Left Side - Image/Branding (Hidden on mobile) */}
            <div className="hidden lg:flex w-1/2 bg-green-50 dark:bg-gray-900 relative overflow-hidden items-center justify-center p-12 transition-colors duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800 opacity-90 transition-colors duration-300"></div>
                {/* Decorative Circles */}
                <div className="absolute top-0 left-0 w-64 h-64 bg-green-200 dark:bg-green-500/10 opacity-20 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-yellow-200 dark:bg-blue-500/10 opacity-30 rounded-full translate-x-1/2 translate-y-1/2 blur-3xl"></div>

                <div className="relative z-10 text-center max-w-lg">
                    <img src={logo} alt="KrishiSaarthi Logo" className="w-[36rem] h-auto mx-auto mb-8 drop-shadow-lg" />
                    <h1 className="text-5xl font-extrabold mb-6 text-green-900 dark:text-white transition-colors duration-300">{t('welcome.to')}</h1>
                    <p className="text-xl text-green-800 dark:text-gray-300 leading-relaxed mb-8 transition-colors duration-300">
                        {t('join.revolution')}
                    </p>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-24 overflow-y-auto">
                <div className="w-full max-w-md space-y-8">
                    <div className="flex items-center justify-between">
                        <Link to="/" className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 flex items-center gap-2 transition-colors">
                            <ArrowLeft size={20} /> {t('back')}
                        </Link>
                    </div>

                    <div className="text-left">
                        <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-2">
                            {type === 'login' ? t('login') : t('create.account')}
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400 text-lg">
                            {type === 'login' ? t('sign.in.continue') : t('start.journey')}
                        </p>
                    </div>

                    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>

                        {/* Role Selection - Only for Signup */}
                        {type === 'signup' && (
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wide">{t('select.role')}</label>
                                <div className="grid grid-cols-3 gap-4">
                                    <RoleCard r="farmer" role={role} setRole={setRole} icon={User} label={t('role.farmer')} />
                                    <RoleCard r="validator" role={role} setRole={setRole} icon={CheckSquare} label={t('role.validator')} />
                                    <RoleCard r="buyer" role={role} setRole={setRole} icon={ShoppingCart} label={t('role.buyer')} />
                                </div>
                            </div>
                        )}

                        <div className="space-y-5">
                            {type === 'signup' && role !== 'farmer' && (
                                <div>
                                    <label htmlFor="name" className="block text-base font-semibold text-gray-700 dark:text-gray-300 mb-2">{t('full.name')}</label>
                                    <input
                                        id="name"
                                        name="name"
                                        type="text"
                                        required
                                        className="appearance-none rounded-xl relative block w-full px-4 py-4 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 placeholder-gray-400 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-lg transition-shadow"
                                        placeholder={t('enter.full.name')}
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                    />
                                </div>
                            )}

                            <div>
                                <label htmlFor="phone" className="block text-base font-semibold text-gray-700 dark:text-gray-300 mb-2">{t('mobile.number')}</label>
                                <div className="relative">
                                    <Phone className="absolute top-4 left-4 text-gray-400" size={20} />
                                    <input
                                        id="phone"
                                        name="phone"
                                        type="tel"
                                        required
                                        className="appearance-none rounded-xl relative block w-full pl-12 pr-4 py-4 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 placeholder-gray-400 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-lg transition-shadow"
                                        placeholder={t('enter.mobile')}
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                    />
                                </div>
                            </div>

                            {type === 'signup' && role !== 'farmer' && (
                                <>
                                    <div>
                                        <label htmlFor="age" className="block text-base font-semibold text-gray-700 dark:text-gray-300 mb-2">{t('age')}</label>
                                        <div className="relative">
                                            <Calendar className="absolute top-4 left-4 text-gray-400" size={20} />
                                            <input
                                                id="age"
                                                name="age"
                                                type="number"
                                                required
                                                className="appearance-none rounded-xl relative block w-full pl-12 pr-4 py-4 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 placeholder-gray-400 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-lg transition-shadow"
                                                placeholder={t('enter.age')}
                                                value={age}
                                                onChange={(e) => setAge(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label htmlFor="address" className="block text-base font-semibold text-gray-700 dark:text-gray-300 mb-2">{t('address')}</label>
                                        <div className="relative">
                                            <MapPin className="absolute top-4 left-4 text-gray-400" size={20} />
                                            <input
                                                id="address"
                                                name="address"
                                                type="text"
                                                required
                                                className="appearance-none rounded-xl relative block w-full pl-12 pr-4 py-4 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 placeholder-gray-400 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-lg transition-shadow"
                                                placeholder={t('enter.address')}
                                                value={address}
                                                onChange={(e) => setAddress(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </>
                            )}

                            <div>
                                <label htmlFor="password" className="block text-base font-semibold text-gray-700 dark:text-gray-300 mb-2">{t('password')}</label>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    className="appearance-none rounded-xl relative block w-full px-4 py-4 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 placeholder-gray-400 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-lg transition-shadow"
                                    placeholder={t('enter.password')}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center py-4 px-4 border border-transparent text-lg font-bold rounded-xl text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-4 focus:ring-green-500/50 disabled:opacity-70 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                            >
                                {loading ? <Loader2 className="animate-spin" /> : (type === 'login' ? t('login') : t('create.account'))}
                            </button>
                        </div>

                        <div className="text-center text-gray-500">
                            {type === 'login' ? (
                                <p>{t('dont.have.account')} <Link to="/signup" className="text-primary font-bold hover:underline">{t('signup')}</Link></p>
                            ) : (
                                <p>{t('already.have.account')} <Link to="/login" className="text-primary font-bold hover:underline">{t('login')}</Link></p>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

const RoleCard = ({ r, role, setRole, icon: Icon, label }: any) => (
    <div
        onClick={() => setRole(r)}
        className={`cursor-pointer border-2 rounded-2xl p-4 flex flex-col items-center justify-center space-y-3 transition-all transform duration-200 ${role === r
            ? 'border-primary bg-green-50 dark:bg-green-900/30 text-primary scale-105 shadow-md'
            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-300'
            }`}
    >
        <Icon size={32} strokeWidth={1.5} />
        <span className="font-bold text-base">{label}</span>
        {role === r && <div className="absolute top-3 right-3 w-3 h-3 bg-primary rounded-full ring-2 ring-white dark:ring-gray-900"></div>}
    </div>
);
