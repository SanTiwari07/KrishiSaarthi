import React, { useState, useEffect } from 'react';
import { useBlockchain } from '../contexts/BlockchainContext';
import { useApp } from '../contexts/AppContext';
import {
    getAllListings,
    buyFromMarketplace
} from '../services/blockchain';
import { useNavigate, Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import logo from '../assets/logo.png';
import {
    ShoppingCart,
    Leaf,
    Droplets,
    Wind,
    Filter,
    Wallet,
    Loader2,
    Coins,
    RefreshCw,
    Sun,
    Moon,
    User,
    LogOut,
    Phone,
    Calendar,
    MapPin,
    Search,
    ChevronRight,
    ArrowUpRight
} from 'lucide-react';

interface Credit {
    id: number;
    farmerName: string;
    submissionDate: string;
    activityType: string;
    location: string;
    description: string;
    evidence: string[];
    creditAmount: number;
    price: number; // In Wei or Tokens? Usually tokens.
    status: 'pending' | 'verified' | 'rejected' | 'sold';
    sellerAddress: string;
}

// ... (existing interface and mock data)

export default function BuyerDashboard() {
    const { t, user, language, setLanguage, logout } = useApp();
    const { state: blockchainState, connect: connectWallet, isConnecting: isWalletConnecting } = useBlockchain();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();

    const [marketplaceCredits, setMarketplaceCredits] = useState<Credit[]>([]);
    const [myCredits, setMyCredits] = useState<Credit[]>([]);
    const [loading, setLoading] = useState(false);
    const [buyingId, setBuyingId] = useState<number | null>(null);
    const [activeTab, setActiveTab] = useState<'market' | 'portfolio'>('market');
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    const isDark = theme === 'dark';

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

    // Mock Data for Demo
    const mockListings: Credit[] = [
        {
            id: 991,
            farmerName: 'Ramesh Garden',
            submissionDate: '2025-01-10',
            activityType: 'organic',
            location: 'Pune, MH',
            description: 'Demo Listing: Organic farming credits available.',
            evidence: [],
            creditAmount: 50,
            price: 1500,
            status: 'verified',
            sellerAddress: '0xDEMO...1234'
        },
        {
            id: 992,
            farmerName: 'Green Valley',
            submissionDate: '2025-01-12',
            activityType: 'tree',
            location: 'Nashik, MH',
            description: 'Demo Listing: 200 trees planted.',
            evidence: [],
            creditAmount: 200,
            price: 5000,
            status: 'verified',
            sellerAddress: '0xDEMO...5678'
        },
        {
            id: 993,
            farmerName: 'Blue River',
            submissionDate: '2025-01-14',
            activityType: 'water',
            location: 'Satara, MH',
            description: 'Demo Listing: Water conservation project.',
            evidence: [],
            creditAmount: 120,
            price: 3600,
            status: 'verified',
            sellerAddress: '0xDEMO...9012'
        }
    ];

    // Load Listings
    const loadListings = async () => {
        setLoading(true);
        try {
            let mappedCredits: Credit[] = [];

            if (blockchainState?.marketplaceContract) {
                const listings = await getAllListings(blockchainState.marketplaceContract);
                mappedCredits = listings
                    .filter(l => l.active && parseFloat(l.remainingAmount) > 0)
                    .map(l => ({
                        id: Number(l.id),
                        farmerName: `Seller: ${l.seller.substring(0, 6)}...`,
                        sellerAddress: l.seller,
                        submissionDate: new Date().toISOString().split('T')[0],
                        activityType: 'Other',
                        location: 'On Chain',
                        description: `Available Amount: ${l.remainingAmount}`,
                        evidence: [],
                        creditAmount: parseFloat(l.remainingAmount),
                        price: 0,
                        status: 'verified'
                    }));
            }

            // Combine real listings with bridged "Demo/Verified" listings and default mocks
            const storedListings = JSON.parse(localStorage.getItem('demoListings') || '[]');
            setMarketplaceCredits([...mappedCredits, ...storedListings, ...mockListings]);

            // Load My Portfolio
            const myPortfolio = JSON.parse(localStorage.getItem('myPortfolio') || '[]');
            setMyCredits(myPortfolio);

        } catch (err) {
            console.error("Failed to load listings", err);
            // Fallback to stored listings on error + mocks
            const storedListings = JSON.parse(localStorage.getItem('demoListings') || '[]');
            setMarketplaceCredits([...storedListings, ...mockListings]);

            const myPortfolio = JSON.parse(localStorage.getItem('myPortfolio') || '[]');
            setMyCredits(myPortfolio);
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        if (blockchainState?.marketplaceContract) {
            loadListings();
        }

        // Listen for local storage updates (Cross-tab)
        const handleStorageChange = () => {
            loadListings();
        };

        // Listen for internal app updates (SPA navigation/actions)
        const handleInternalUpdate = () => {
            loadListings();
        };

        window.addEventListener('storage', handleStorageChange);
        window.addEventListener('marketplace-updated', handleInternalUpdate);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('marketplace-updated', handleInternalUpdate);
        };
    }, [blockchainState?.marketplaceContract]);

    const handleBuy = async (id: number, amountAvailable: number) => {
        // Mock Buy for Demo items (ID > 900)
        if (id > 900) {
            alert(`${t('demo.purchase')} #${id}.`);

            // Remove from stored listings if it exists there
            const storedListings = JSON.parse(localStorage.getItem('demoListings') || '[]');
            const updatedListings = storedListings.filter((l: any) => l.id !== id);
            localStorage.setItem('demoListings', JSON.stringify(updatedListings));

            // Helper to check if it was a static mock or dynamic bridged item
            // If it was bridged, removing from localStorage is enough for next reload
            // But we need to update UI immediately
            setMarketplaceCredits(prev => prev.filter(c => c.id !== id));

            // Notify other tabs
            window.dispatchEvent(new Event('storage'));
            window.dispatchEvent(new Event('marketplace-updated'));

            // Create Receipt for Demo
            const purchasedItem = marketplaceCredits.find(c => c.id === id);
            if (purchasedItem) {
                const receipt: Credit = {
                    ...purchasedItem,
                    id: Date.now(), // Unique ID for the receipt
                    creditAmount: purchasedItem.creditAmount, // Buy full amount for demo
                    status: 'sold',
                    submissionDate: new Date().toISOString() // Purchase Date
                };
                const currentPortfolio = JSON.parse(localStorage.getItem('myPortfolio') || '[]');
                const newPortfolio = [receipt, ...currentPortfolio];
                localStorage.setItem('myPortfolio', JSON.stringify(newPortfolio));
                setMyCredits(newPortfolio); // Update local state immediately
            }
            return;
        }

        if (!blockchainState?.marketplaceContract) return;

        const amountToBuyStr = prompt(`${t('prompt.buy')} ${amountAvailable})`, amountAvailable.toString());
        if (!amountToBuyStr) return;

        const amountToBuy = parseFloat(amountToBuyStr);
        if (isNaN(amountToBuy) || amountToBuy <= 0 || amountToBuy > amountAvailable) {
            alert(`${t('error.invalid_amount')} ${amountAvailable}.`);
            return;
        }

        setBuyingId(id);
        try {
            await buyFromMarketplace(
                blockchainState.marketplaceContract,
                id,
                amountToBuy
            );

            // Create Receipt
            const purchasedItem = marketplaceCredits.find(c => c.id === id);
            if (purchasedItem) {
                const receipt: Credit = {
                    ...purchasedItem,
                    id: Date.now(), // Unique ID for the receipt
                    creditAmount: amountToBuy,
                    status: 'sold',
                    submissionDate: new Date().toISOString() // Purchase Date
                };
                const currentPortfolio = JSON.parse(localStorage.getItem('myPortfolio') || '[]');
                const newPortfolio = [receipt, ...currentPortfolio];
                localStorage.setItem('myPortfolio', JSON.stringify(newPortfolio));
                setMyCredits(newPortfolio);
            }

            alert(t('success.purchase'));
            loadListings(); // Refresh
        } catch (err: any) {
            console.error("Buy failed", err);
            alert("Purchase failed: " + (err.message || err.toString()));
        } finally {
            setBuyingId(null);
        }
    };


    return (
        <div className="h-screen overflow-hidden bg-gray-50 dark:bg-gray-900 flex flex-col">
            {/* Top Navbar - Matching Layout.tsx & FarmerDashboard */}
            <nav className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl border-b border-white/20 dark:border-gray-800 sticky top-0 z-50 transition-all duration-300 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-20">
                        <div className="flex items-center">
                            <Link to="/buyer-dashboard" className="flex items-center space-x-3 group">
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
                            {!blockchainState?.address ? (
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
                                            <p className="text-sm text-primary font-bold uppercase tracking-wider mt-1">{t('role.buyer')}</p>
                                        </div>

                                        <div className="space-y-4 mb-6">
                                            {user?.mobile && (
                                                <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                                                    <Phone size={16} className="mr-3 text-gray-400" />
                                                    <span>{user.mobile}</span>
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

            <div className="flex-grow max-w-7xl mx-auto px-4 py-6 w-full flex flex-col overflow-hidden relative">
                {!blockchainState?.address ? (
                    <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-8 animate-fade-in relative overflow-hidden">
                        {/* Background Decoration */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-3xl -z-10 animate-pulse"></div>

                        <div className="p-10 bg-white/50 dark:bg-gray-800/50 backdrop-blur-2xl rounded-[40px] border border-white/20 dark:border-gray-700/50 shadow-2xl flex flex-col items-center text-center max-w-2xl mx-auto">
                            <div className="p-8 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-[32px] shadow-2xl shadow-blue-500/30 mb-8 transform -rotate-12 hover:rotate-0 transition-transform duration-500">
                                <ShoppingCart size={64} className="text-white" />
                            </div>
                            <h1 className="text-5xl font-black text-gray-900 dark:text-white mb-6 tracking-tight leading-tight">
                                {t('marketplace.title')}
                            </h1>
                            <p className="text-xl text-gray-600 dark:text-gray-400 mb-12 leading-relaxed font-medium">
                                {t('marketplace.desc')}
                            </p>
                            <button
                                onClick={connectWallet}
                                disabled={isWalletConnecting}
                                className="group relative bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-12 py-5 rounded-2xl font-black text-2xl hover:shadow-2xl hover:shadow-blue-500/40 transition-all transform hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-4 border-b-8 border-blue-800 active:border-b-0 shadow-2xl"
                            >
                                {isWalletConnecting ? <Loader2 className="animate-spin" /> : <Wallet size={28} className="group-hover:scale-110 transition-transform" />}
                                {isWalletConnecting ? 'Connecting...' : t('connect.wallet')}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col h-full overflow-hidden">
                        {/* Header Area */}
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6 animate-fade-in-down">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2.5 bg-blue-50 dark:bg-blue-900/40 rounded-xl text-blue-600 dark:text-blue-400 shadow-lg border border-blue-100 dark:border-blue-800">
                                        <ShoppingCart size={20} />
                                    </div>
                                    <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight leading-none uppercase">
                                        {t('marketplace.title')}
                                    </h1>
                                </div>
                                <p className="text-lg text-gray-500 font-medium ml-1">{t('investFuture')}</p>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="flex bg-gray-100 dark:bg-gray-800 p-1.5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-inner">
                                    <button
                                        onClick={() => setActiveTab('market')}
                                        className={`px-8 py-2.5 rounded-xl font-black text-sm uppercase tracking-wider transition-all duration-300 ${activeTab === 'market'
                                            ? 'bg-white dark:bg-gray-700 shadow-xl text-primary scale-105 border border-gray-100 dark:border-gray-600'
                                            : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                                            }`}
                                    >
                                        {t('market') || 'Market'}
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('portfolio')}
                                        className={`px-8 py-2.5 rounded-xl font-black text-sm uppercase tracking-wider transition-all duration-300 ${activeTab === 'portfolio'
                                            ? 'bg-white dark:bg-gray-700 shadow-xl text-primary scale-105 border border-gray-100 dark:border-gray-600'
                                            : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                                            }`}
                                    >
                                        {t('portfolio') || 'Portfolio'}
                                    </button>
                                </div>

                                <button
                                    onClick={loadListings}
                                    className="p-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all shadow-sm hover:shadow-md active:scale-95"
                                >
                                    <RefreshCw size={22} className={loading ? "animate-spin text-primary" : ""} />
                                </button>
                            </div>
                        </div>

                        {/* Content Area */}
                        <div className="flex-grow overflow-y-auto scrollbar-hide pb-8">
                            {activeTab === 'market' ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-12">
                                    {marketplaceCredits.map(credit => (
                                        <div
                                            key={credit.id}
                                            className="group bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-[40px] shadow-xl hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-white/20 dark:border-gray-700 overflow-hidden transition-all duration-500 transform hover:-translate-y-3"
                                        >
                                            <div className="h-52 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 relative flex items-center justify-center overflow-hidden">
                                                <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                                <div className="p-8 bg-white dark:bg-gray-800 rounded-[32px] shadow-2xl transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-700">
                                                    <Leaf size={56} className="text-primary" />
                                                </div>
                                                <div className="absolute top-6 right-6 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md px-5 py-2.5 rounded-2xl text-[10px] font-black shadow-lg uppercase tracking-[0.2em] border border-white/20 dark:border-gray-700 animate-pulse">
                                                    {t(`act.${credit.activityType.toLowerCase()}` as any) || credit.activityType}
                                                </div>
                                            </div>

                                            <div className="p-8">
                                                <div className="mb-6">
                                                    <h3 className="font-black text-2xl text-gray-900 dark:text-white capitalize leading-tight mb-2 tracking-tighter">
                                                        {t(`act.${credit.activityType.toLowerCase()}` as any) || credit.activityType} {t('credit.suffix')}
                                                    </h3>
                                                    <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 font-bold text-sm uppercase tracking-widest leading-none">
                                                        <MapPin size={14} className="text-red-500" />
                                                        {credit.location}
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-4 mb-8">
                                                    <div className="bg-gray-50/50 dark:bg-gray-900/50 p-4 rounded-3xl border border-gray-100 dark:border-gray-700">
                                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{t('quantity')}</p>
                                                        <p className="text-xl font-black text-gray-900 dark:text-gray-100">{credit.creditAmount} Cr</p>
                                                    </div>
                                                    <div className="bg-gray-50/50 dark:bg-gray-900/50 p-4 rounded-3xl border border-gray-100 dark:border-gray-700">
                                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{t('impact')}</p>
                                                        <p className="text-xl font-black text-green-600">50kg CO2e</p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between pt-6 border-t border-gray-100 dark:border-gray-700">
                                                    <div>
                                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">{t('price')}</p>
                                                        <div className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter">₹{credit.price || 100}</div>
                                                    </div>
                                                    <button
                                                        onClick={() => handleBuy(credit.id, credit.creditAmount)}
                                                        disabled={!!buyingId}
                                                        className={`px-8 py-4 rounded-2xl font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all duration-300 shadow-2xl ${buyingId === credit.id
                                                            ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed border border-gray-200 dark:border-gray-700'
                                                            : 'bg-gradient-to-r from-primary to-emerald-600 text-white hover:shadow-green-500/40 transform hover:-translate-y-1 active:translate-y-0 active:scale-95'
                                                            }`}
                                                    >
                                                        {buyingId === credit.id ? (
                                                            <Loader2 size={24} className="animate-spin" />
                                                        ) : (
                                                            <>
                                                                <ShoppingCart size={22} />
                                                                <span>{t('buy')}</span>
                                                            </>
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="space-y-8 animate-fade-in pb-12">
                                    {myCredits.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center py-32 bg-white/50 dark:bg-gray-800/50 backdrop-blur-md rounded-[40px] border border-white/20 dark:border-gray-700 text-center">
                                            <div className="p-10 bg-gray-100 dark:bg-gray-900 rounded-[40px] mb-8 animate-pulse border border-dashed border-gray-200 dark:border-gray-700">
                                                <Leaf size={80} className="text-gray-300 dark:text-gray-700" />
                                            </div>
                                            <h3 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight leading-none mb-4 uppercase">
                                                {t('no.purchases') || 'No purchases yet'}
                                            </h3>
                                            <p className="text-lg text-gray-500 font-medium max-w-sm">Support farmers to build your green credit portfolio and combat climate change.</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                            {myCredits.map(credit => (
                                                <div key={credit.id} className="group bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-[40px] shadow-xl border-l-[12px] border-l-green-500 border border-white/20 dark:border-gray-700 p-8 transform transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl relative overflow-hidden">
                                                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-green-500/10 rounded-full blur-2xl group-hover:bg-green-500/20 transition-all duration-500"></div>

                                                    <div className="flex items-center justify-between mb-8">
                                                        <div className="flex items-center gap-4">
                                                            <div className="p-4 bg-green-50 dark:bg-green-900/40 rounded-[24px] text-green-600 dark:text-green-400 shadow-lg border border-green-100 dark:border-green-800 group-hover:scale-110 transition-transform duration-500">
                                                                <Leaf size={28} />
                                                            </div>
                                                            <div>
                                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">{new Date(credit.submissionDate).toLocaleDateString()}</p>
                                                                <h3 className="text-xl font-black text-gray-900 dark:text-white capitalize tracking-tighter">{t(`act.${credit.activityType.toLowerCase()}` as any) || credit.activityType}</h3>
                                                            </div>
                                                        </div>
                                                        <div className="bg-green-100 dark:bg-green-900/60 text-green-700 dark:text-green-300 px-4 py-2 rounded-2xl text-[10px] font-black tracking-[0.2em] shadow-sm border border-green-200 dark:border-green-800 uppercase">
                                                            OWNED
                                                        </div>
                                                    </div>

                                                    <div className="space-y-4 mb-8">
                                                        <div className="flex justify-between items-center py-4 border-b border-gray-100 dark:border-gray-700">
                                                            <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Contribution</span>
                                                            <span className="text-lg font-black text-gray-900 dark:text-white tracking-tighter">{credit.creditAmount} Credits</span>
                                                        </div>
                                                        <div className="flex justify-between items-center py-4 border-b border-gray-100 dark:border-gray-700">
                                                            <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Farmer</span>
                                                            <span className="text-sm font-bold text-gray-700 dark:text-gray-300 hidden md:block">{credit.farmerName}</span>
                                                            <span className="text-sm font-bold text-gray-700 dark:text-gray-300 md:hidden">{credit.farmerName.substring(0, 10)}...</span>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center justify-center">
                                                        <a
                                                            href={`https://sepolia.etherscan.io/address/${credit.sellerAddress}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="flex items-center gap-2 text-xs font-black text-blue-600 hover:text-blue-700 uppercase tracking-widest transition-colors group/link"
                                                        >
                                                            <span>View on Etherscan</span>
                                                            <ArrowUpRight size={14} className="group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
                                                        </a>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
