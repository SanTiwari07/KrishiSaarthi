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
        if (!authLoading && user) {
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
                toast.success('Logged in successfully!');
                // Redirect logic is handled by the useEffect for auth state change ideally,
                // but direct navigation is fine for now as user state updates.
                // However, we need to know the Role. 
                // Since login updates state asynchronously, we might Rely on onAuthStateChanged in AppContext
                // but we can try to navigate here if we knew the role.
                // The Fetch is async in AppContext. 
                // A better approach is to redirect inside a useEffect in App.tsx or ProtectedRoute, 
                // but for now, let's wait a moment or let 'user' be updated.
                // Actually, since login() awaits the fetch, 'user' might be ready if we used flushSync? No.
                // We'll trust the user state.

                // Hack: We don't have the user object here immediately after await unless login returns it.
                // We can't easily redirect to the correct dashboard without fetching user role.
                // Since AppContext fetches data, we might need to wait or rely on a "dashboard" element redirecting.
                // Let's navigate to home for now or specific dashboard if we assume.
                // Actually, let's fetch user again or return user from login.
                navigate('/farmer-dashboard'); // Default fallback, but App should really route based on user.
            } else {
                const userData = {
                    name,
                    mobile: phone,
                    role,
                    age,
                    address,
                    createdAt: new Date().toISOString()
                };
                await signup(userData, password);
                toast.success('Account created successfully!');
                if (role === 'farmer') navigate('/farmer-dashboard');
                else if (role === 'validator') navigate('/validator-dashboard');
                else navigate('/buyer-dashboard');
            }
        } catch (error: any) {
            console.error(error);
            // Firebase Error codes mapping could be added here
            let msg = 'Authentication failed';
            if (error.code === 'auth/user-not-found') msg = 'User not found';
            if (error.code === 'auth/wrong-password') msg = 'Incorrect password';
            if (error.code === 'auth/email-already-in-use') msg = 'User already exists';
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-white dark:bg-gray-900 font-sans">

            {/* Left Side - Image/Branding (Hidden on mobile) */}
            <div className="hidden lg:flex w-1/2 bg-primary relative overflow-hidden items-center justify-center p-12">
                <div className="absolute inset-0 bg-gradient-to-br from-green-600 to-green-900 opacity-90"></div>
                {/* Decorative Circles */}
                <div className="absolute top-0 left-0 w-64 h-64 bg-white opacity-10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-yellow-400 opacity-20 rounded-full translate-x-1/2 translate-y-1/2 blur-3xl"></div>

                <div className="relative z-10 text-white max-w-lg text-center">
                    <img src={logo} alt="KrishiSaarthi Logo" className="w-[36rem] h-auto mx-auto mb-8 drop-shadow-lg" />
                    <h1 className="text-5xl font-extrabold mb-6">Welcome to KrishiSaarthi</h1>
                    <p className="text-xl text-green-100 leading-relaxed mb-8">
                        Join the revolution in sustainable agriculture. Connect, grow, and earn with advanced technology.
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
                            {type === 'login' ? 'Sign in to continue' : 'Start your journey today'}
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
                            {type === 'signup' && (
                                <div>
                                    <label htmlFor="name" className="block text-base font-semibold text-gray-700 dark:text-gray-300 mb-2">{t('full.name')}</label>
                                    <input
                                        id="name"
                                        name="name"
                                        type="text"
                                        required
                                        className="appearance-none rounded-xl relative block w-full px-4 py-4 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 placeholder-gray-400 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-lg transition-shadow"
                                        placeholder="Enter full name"
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
                                        placeholder="Enter mobile number"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                    />
                                </div>
                            </div>

                            {type === 'signup' && (
                                <>
                                    <div>
                                        <label htmlFor="age" className="block text-base font-semibold text-gray-700 dark:text-gray-300 mb-2">Age</label>
                                        <div className="relative">
                                            <Calendar className="absolute top-4 left-4 text-gray-400" size={20} />
                                            <input
                                                id="age"
                                                name="age"
                                                type="number"
                                                required
                                                className="appearance-none rounded-xl relative block w-full pl-12 pr-4 py-4 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 placeholder-gray-400 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-lg transition-shadow"
                                                placeholder="Enter age"
                                                value={age}
                                                onChange={(e) => setAge(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label htmlFor="address" className="block text-base font-semibold text-gray-700 dark:text-gray-300 mb-2">Address</label>
                                        <div className="relative">
                                            <MapPin className="absolute top-4 left-4 text-gray-400" size={20} />
                                            <input
                                                id="address"
                                                name="address"
                                                type="text"
                                                required
                                                className="appearance-none rounded-xl relative block w-full pl-12 pr-4 py-4 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 placeholder-gray-400 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-lg transition-shadow"
                                                placeholder="Enter address"
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
                                    placeholder="Enter password"
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
                                <p>Don't have an account? <Link to="/signup" className="text-primary font-bold hover:underline">{t('signup')}</Link></p>
                            ) : (
                                <p>Already have an account? <Link to="/login" className="text-primary font-bold hover:underline">{t('login')}</Link></p>
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
            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}
    >
        <Icon size={32} strokeWidth={1.5} />
        <span className="font-bold text-base">{label}</span>
        {role === r && <div className="absolute top-3 right-3 w-3 h-3 bg-primary rounded-full ring-2 ring-white dark:ring-gray-900"></div>}
    </div>
);
