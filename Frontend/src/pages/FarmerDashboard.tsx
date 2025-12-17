import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { useBlockchain } from '../contexts/BlockchainContext';
import { getFarmerProjects } from '../services/blockchain';
import { Scan, MessageSquare, Award, ArrowRight, TrendingUp, History, Home, User } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function FarmerDashboard() {
    const { t, user } = useApp();
    const { state: blockchainState } = useBlockchain();
    const navigate = useNavigate();
    const location = useLocation();

    const [credits, setCredits] = useState(0);
    const [pendingCount, setPendingCount] = useState(0);

    useEffect(() => {
        const fetchStats = async () => {
            if (blockchainState?.registryContract && blockchainState?.address) {
                try {
                    const projects = await getFarmerProjects(blockchainState.registryContract, blockchainState.address);
                    // Calculate credits: Mocking 10 credits per verified project for now, 
                    // or ideally fetch from token balance if available/relevant.
                    // But "Credits Earned" usually implies life-time earnings or current balance.
                    // Let's use Verified projects * 10 as a heuristic if token balance isn't directly "earned from activities".
                    // Or we can just count verified projects. The UI says "Credits Earned" (number).
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

    const menuItems = [
        { path: '/farmer-dashboard', label: t('dashboard'), icon: Home },
        { path: '/disease-detector', label: t('crop.disease'), icon: Scan },
        { path: '/business-advisor', label: t('business.advisor'), icon: MessageSquare },
        { path: '/green-credit', label: t('green.credit'), icon: Award },
        // { path: '/profile', label: t('profile'), icon: User },
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
        }
    ];

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            {/* Welcome Header */}
            <div className="mb-10">
                <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">{t('dashboard')}</h1>
                <p className="text-lg text-gray-500 mt-1">{t('welcome')}, {user?.name}</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                {/* Sidebar Nav */}
                <div className="lg:col-span-1 space-y-3 hidden lg:block">
                    {menuItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center px-5 py-4 rounded-2xl transition-all ${location.pathname === item.path
                                ? 'bg-primary text-white shadow-lg shadow-green-200 dark:shadow-none'
                                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-primary'
                                }`}
                        >
                            <item.icon size={22} className={location.pathname === item.path ? 'text-white' : ''} />
                            <span className="ml-3 font-bold">{item.label}</span>
                        </Link>
                    ))}

                    {/* Support Card */}
                    <div className="mt-8 bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 p-5 rounded-3xl border border-green-100 dark:border-green-800/30">
                        <h4 className="font-bold text-green-800 dark:text-green-200 mb-2">{t('need.help')}</h4>
                        <p className="text-sm text-green-700 dark:text-green-300 mb-4 opacity-80">{t('support.desc')}</p>
                        <button className="w-full py-2 bg-white dark:bg-green-800 text-green-700 dark:text-green-100 text-sm font-bold rounded-xl shadow-sm hover:shadow transition-all">
                            {t('contact.support')}
                        </button>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="lg:col-span-4 space-y-12 animate-fade-in">

                    {/* Big Feature Boxes */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
                                    {t('learn.more') || 'Get Started'} <ArrowRight size={20} className="ml-2" />
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Statistics Section */}
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">{t('your.impact')}</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-green-50 rounded-2xl text-green-600"><TrendingUp size={28} /></div>
                                    <span className="text-xs font-bold bg-green-100 text-green-800 px-3 py-1 rounded-full">+12%</span>
                                </div>
                                <p className="text-gray-500 text-sm mb-1 font-medium uppercase tracking-wide">{t('farm.land.label')}</p>
                                <h3 className="text-3xl font-extrabold text-gray-900 dark:text-white">{user?.farmLand || 0} {t('unit.acres')}</h3>
                            </div>
                            <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-yellow-50 rounded-2xl text-yellow-600"><Award size={28} /></div>
                                </div>
                                <p className="text-gray-500 text-sm mb-1 font-medium uppercase tracking-wide">{t('credits.earned')}</p>
                                <h3 className="text-3xl font-extrabold text-gray-900 dark:text-white">{credits}</h3>
                            </div>
                            <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-blue-50 rounded-2xl text-blue-600"><History size={28} /></div>
                                </div>
                                <p className="text-gray-500 text-sm mb-1 font-medium uppercase tracking-wide">{t('pending')}</p>
                                <h3 className="text-3xl font-extrabold text-gray-900 dark:text-white">{pendingCount}</h3>
                            </div>
                            <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-purple-50 rounded-2xl text-purple-600"><Scan size={28} /></div>
                                </div>
                                <p className="text-gray-500 text-sm mb-1 font-medium uppercase tracking-wide">{t('crops.scanned')}</p>
                                <h3 className="text-3xl font-extrabold text-gray-900 dark:text-white">{user?.scansCount || 0}</h3>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
