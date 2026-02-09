import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { useBlockchain } from '../contexts/BlockchainContext';
import { getFarmerProjects } from '../services/blockchain';
import { Scan, MessageSquare, Award, ArrowRight, TrendingUp, History, Home, User, Recycle, Moon, Sun, Wallet, Loader2, LogOut, Phone, MapPin, Calendar } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import logo from '../assets/logo.png';

export default function FarmerDashboard() {
    const { t, user, language, setLanguage, logout } = useApp();
    const { state: blockchainState, connect: connectWallet, isConnecting: isWalletConnecting } = useBlockchain();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const location = useLocation();

    const [credits, setCredits] = useState(0);
    const [pendingCount, setPendingCount] = useState(0);
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    const isDark = theme === 'dark';

    useEffect(() => {
        const fetchStats = async () => {
            if (blockchainState?.registryContract && blockchainState?.address) {
                try {
                    const projects = await getFarmerProjects(blockchainState.registryContract, blockchainState.address);
                    const verified = projects.filter(p => p.status === 'Verified').length;
                    setCredits(verified * 10);

                    const pending = projects.filter(p => p.status === 'Pending').length;
                    setPendingCount(pending);
                } catch (error) {
                    console.error("Failed to fetch dashboard stats", error);
                }
            }
        };
        fetchStats();
    }, [blockchainState]);

    const getLanguageLabel = (lang: string) => {
        switch (lang) {
            case 'hi': return 'हिंदी';
            case 'mr': return 'मराठी';
            default: return 'ENG';
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const toggleProfile = () => setIsProfileOpen(!isProfileOpen);

    const menuItems = [
        { path: '/farmer-dashboard', label: t('dashboard'), icon: Home },
        { path: '/disease-detector', label: t('crop.disease'), icon: Scan },
        { path: '/business-advisor', label: t('business.advisor'), icon: MessageSquare },
        { path: '/green-credit', label: t('green.credit'), icon: Award },
        { path: '/waste-to-value', label: 'Waste to Value', icon: Recycle },
    ];

    const features = [
        {
            title: t('crop.disease'),
            desc: t('crop.disease.desc'),
            path: '/disease-detector',
            icon: Scan,
            color: 'bg-green-100 text-green-700',
            arrowColor: 'text-green-600'
        },
        {
            title: t('business.advisor'),
            desc: t('business.advisor.desc'),
            path: '/business-advisor',
            icon: MessageSquare,
            color: 'bg-blue-100 text-blue-700',
            arrowColor: 'text-blue-600'
        },
        {
            title: t('green.credit'),
            desc: t('green.credit.desc'),
            path: '/green-credit',
            icon: Award,
            color: 'bg-yellow-100 text-yellow-700',
            arrowColor: 'text-yellow-600'
        },
        {
            title: t('waste.to.value'),
            desc: t('waste.to.value.desc'),
            path: '/waste-to-value',
            icon: Recycle,
            color: 'bg-orange-100 text-orange-700',
            arrowColor: 'text-orange-600'
        }
    ];

    return (
        <div className="fixed inset-0 overflow-hidden bg-gray-50 dark:bg-gray-900 flex flex-col">
            {/* Top Navbar - Matching Layout.tsx */}
            <nav className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl border-b border-white/20 dark:border-gray-800 flex-none h-20 transition-all duration-300 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-20">
                        <div className="flex items-center">
                            <Link to="/farmer-dashboard" className="flex items-center space-x-3 group">
                                <div className="h-16 w-auto flex items-center justify-center">
                                    <img src={logo} alt="KrishiSaarthi Logo" className="h-full w-auto object-contain" />
                                </div>
                                <span className="font-bold text-2xl bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 tracking-tight">
                                    {t('app.name')}
                                </span>
                            </Link>
                        </div>

                        {/* Desktop Controls */}
                        <div className="hidden md:flex items-center space-x-6">
                            {/* Language Toggle */}
                            <div className="flex items-center bg-gray-100/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl p-1 border border-gray-200 dark:border-gray-700 shadow-inner">
                                {['en', 'hi', 'mr'].map((lang) => (
                                    <button
                                        key={lang}
                                        onClick={() => setLanguage(lang as any)}
                                        className={`px-3 py-1.5 text-sm font-bold rounded-lg transition-all duration-300 ${language === lang
                                            ? 'bg-white dark:bg-gray-700 text-primary shadow-sm scale-105 border border-gray-100 dark:border-gray-600'
                                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-200/50 dark:hover:bg-gray-700/50'
                                            }`}
                                    >
                                        {getLanguageLabel(lang)}
                                    </button>
                                ))}
                            </div>

                            {/* Wallet Logic */}
                            {!blockchainState ? (
                                <button
                                    onClick={connectWallet}
                                    disabled={isWalletConnecting}
                                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 font-bold text-sm hover:bg-orange-100 dark:hover:bg-orange-900/40 transition-colors border border-orange-200 dark:border-orange-800"
                                >
                                    {isWalletConnecting ? <Loader2 size={16} className="animate-spin" /> : <Wallet size={16} />}
                                    <span>{t('connect')}</span>
                                </button>
                            ) : (
                                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                    <span className="text-sm font-mono font-bold text-green-700 dark:text-green-300">
                                        {blockchainState.address?.substring(0, 6)}...
                                    </span>
                                </div>
                            )}

                            {/* Theme Toggle */}
                            <button
                                onClick={toggleTheme}
                                className="p-3 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 transition-colors border border-transparent hover:border-gray-200 dark:hover:border-gray-700 shadow-sm"
                                aria-label="Toggle Theme"
                            >
                                {isDark ? <Sun size={20} /> : <Moon size={20} />}
                            </button>

                            {/* User Profile */}
                            <div className="flex items-center space-x-4 relative">
                                <button
                                    onClick={toggleProfile}
                                    className="flex items-center space-x-2 bg-green-50/80 dark:bg-gray-800/80 backdrop-blur-sm px-4 py-2 rounded-full border border-green-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all"
                                >
                                    <User size={18} className="text-primary" />
                                    <span className="text-sm font-bold text-gray-800 dark:text-gray-200">{user?.name}</span>
                                </button>

                                {isProfileOpen && (
                                    <div className="absolute top-14 right-0 w-80 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6 z-50 animate-fade-in origin-top-right">
                                        <div className="mb-6 pb-6 border-b border-gray-100 dark:border-gray-700">
                                            <h3 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">{user?.name}</h3>
                                            <p className="text-sm text-primary font-bold uppercase tracking-wider mt-1">{t('role.farmer')}</p>
                                        </div>

                                        <div className="space-y-4 mb-6">
                                            {user?.mobile && (
                                                <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                                                    <Phone size={16} className="mr-3 text-gray-400" />
                                                    <span>{user.mobile}</span>
                                                </div>
                                            )}
                                            {user?.farmerProfile?.location && (
                                                <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                                                    <MapPin size={16} className="mr-3 text-gray-400" />
                                                    <span>{user.farmerProfile.location.village}, {user.farmerProfile.location.district}</span>
                                                </div>
                                            )}
                                            {user?.createdAt && (
                                                <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                                                    <Calendar size={16} className="mr-3 text-gray-400" />
                                                    <span>{t('joined')} {new Date(user.createdAt).toLocaleDateString()}</span>
                                                </div>
                                            )}
                                        </div>

                                        <button
                                            onClick={handleLogout}
                                            className="w-full flex items-center justify-center gap-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl font-bold hover:bg-red-100 dark:hover:bg-red-900/40 transition-all border border-red-200 dark:border-red-800"
                                        >
                                            <LogOut size={18} />
                                            {t('logout')}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Dashboard Content */}
            <div className="flex-grow overflow-y-auto scrollbar-hide py-4">
                <div className="max-w-7xl mx-auto px-4 pb-20">


                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                        {/* Sidebar Nav & Impact Stats */}
                        <div className="lg:col-span-1 space-y-6 hidden lg:block">
                            {/* Impact Stats in Sidebar */}
                            <div className="space-y-4">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white px-2 cursor-default">{t('your.impact')}</h2>

                                <div className="bg-white dark:bg-gray-800 p-5 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm transition-all hover:shadow-md">
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="p-2 bg-green-50 rounded-xl text-green-600"><TrendingUp size={24} /></div>
                                        <span className="text-[10px] font-bold bg-green-100 text-green-800 px-2 py-0.5 rounded-full">+12%</span>
                                    </div>
                                    <p className="text-gray-500 text-[10px] mb-1 font-medium uppercase tracking-wide">Total Acre of Land</p>
                                    <h3 className="text-xl font-extrabold text-gray-900 dark:text-white">{user?.farmerProfile?.landSize?.value || 0} {t('unit.acres')}</h3>
                                </div>

                                <div className="bg-white dark:bg-gray-800 p-5 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm transition-all hover:shadow-md">
                                    <div className="p-2 bg-yellow-50 w-fit rounded-xl text-yellow-600 mb-3"><Award size={24} /></div>
                                    <p className="text-gray-500 text-[10px] mb-1 font-medium uppercase tracking-wide">{t('credits.earned')}</p>
                                    <h3 className="text-xl font-extrabold text-gray-900 dark:text-white">{blockchainState?.tokenBalance || '0'}</h3>
                                </div>

                                <div className="bg-white dark:bg-gray-800 p-5 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm transition-all hover:shadow-md">
                                    <div className="p-2 bg-blue-50 w-fit rounded-xl text-blue-600 mb-3"><History size={24} /></div>
                                    <p className="text-gray-500 text-[10px] mb-1 font-medium uppercase tracking-wide">{t('pending')}</p>
                                    <h3 className="text-xl font-extrabold text-gray-900 dark:text-white">{pendingCount}</h3>
                                </div>

                                <div className="bg-white dark:bg-gray-800 p-5 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm transition-all hover:shadow-md">
                                    <div className="p-2 bg-purple-50 w-fit rounded-xl text-purple-600 mb-3"><Scan size={24} /></div>
                                    <p className="text-gray-500 text-[10px] mb-1 font-medium uppercase tracking-wide">{t('crops.scanned')}</p>
                                    <h3 className="text-xl font-extrabold text-gray-900 dark:text-white">{user?.scansCount || 0}</h3>
                                </div>
                            </div>


                        </div>

                        {/* Main Content Area */}
                        <div className="lg:col-span-4 space-y-12 animate-fade-in">

                            {/* Big Feature Boxes */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {features.map((feat, idx) => (
                                    <div
                                        key={idx}
                                        onClick={() => navigate(feat.path)}
                                        className="group cursor-pointer bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-md border border-gray-100 dark:border-gray-700 hover:shadow-2xl transition-all hover:-translate-y-2"
                                    >
                                        <div className={`w-16 h-16 rounded-2xl ${feat.color} flex items-center justify-center mb-6 transition-transform group-hover:scale-110`}>
                                            <feat.icon size={32} />
                                        </div>
                                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 group-hover:text-primary transition-colors">{feat.title}</h3>
                                        <p className="text-gray-500 dark:text-gray-400 mb-8 leading-relaxed text-lg">{feat.desc}</p>
                                        <div className={`flex items-center font-bold text-lg ${feat.arrowColor} group-hover:gap-3 transition-all`}>
                                            {feat.path === '/waste-to-value' ? (t('explore.options') || 'Explore Options') : (t('learn.more') || 'Get Started')} <ArrowRight size={20} className="ml-2" />
                                        </div>
                                    </div>
                                ))}
                            </div>


                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
