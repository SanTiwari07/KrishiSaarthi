import React, { useState } from 'react';
import {
    BlockchainState,
    getAllProjects,
    verifyAndMint,
    addVerifier,
    Project
} from '../services/blockchain';
import { useBlockchain } from '../contexts/BlockchainContext';
import { useApp } from '../contexts/AppContext';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import logo from '../assets/logo.png';
import {
    CheckCircle,
    XCircle,
    MapPin,
    FileText,
    Wallet,
    Loader2,
    RefreshCw,
    Shield,
    UserPlus,
    LogOut,
    User,
    Sun,
    Moon,
    Phone,
    Calendar,
    ArrowRight,
    Search,
    Coins,
    Award
} from 'lucide-react';

// ... (existing simplified mock data)

// Extended Credit interface to match UI needs + Blockchain data
interface Credit {
    id: number; // changed to number
    farmerName: string;
    submissionDate: string;
    activityType: string;
    location: string;
    description: string;
    evidence: string[];
    creditAmount: number; // This will be the amount to mint
    status: 'pending' | 'verified' | 'rejected' | 'sold';
    farmerAddress: string;
}

export default function ValidatorDashboard() {
    const { t, user, language, setLanguage, logout } = useApp();
    const { state: blockchainState, connect: connectWallet, isConnecting: isWalletConnecting } = useBlockchain();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const location = useLocation();

    const [credits, setCredits] = useState<Credit[]>([]);
    const [loading, setLoading] = useState(false);
    const [processingId, setProcessingId] = useState<number | null>(null);
    const [selectedCredit, setSelectedCredit] = useState<Credit | null>(null);
    const [mintAmount, setMintAmount] = useState<number>(10);
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    const isDark = theme === 'dark';

    // Admin Tab State
    const [activeTab, setActiveTab] = useState<'pending' | 'admin'>('pending');
    const [newValidatorAddress, setNewValidatorAddress] = useState('');
    const [isAdminProcessing, setIsAdminProcessing] = useState(false);

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

    // Load Projects
    const loadProjects = async () => {
        if (!blockchainState?.registryContract) return;

        setLoading(true);
        try {
            const projects = await getAllProjects(blockchainState.registryContract);

            const dismissedIds = JSON.parse(localStorage.getItem('dismissed_projects') || '[]');

            const mappedCredits = await Promise.all(projects
                .filter(p => p.status === 'Pending' && !dismissedIds.includes(p.id))
                .map(async p => {
                    const parts = p.offChainHash.split('|');
                    const description = parts[0] || 'No description';
                    const location = parts[1] || 'Unknown Location';
                    const uniqueId = parts[3];

                    let realDate = new Date().toLocaleDateString('en-CA');
                    let evidenceImages: string[] = [];

                    if (uniqueId) {
                        // 1. Recover Date
                        const timestamp = parseInt(uniqueId);
                        if (!isNaN(timestamp)) {
                            realDate = new Date(timestamp).toLocaleDateString('en-CA');
                        }

                        // 2. Recover Evidence from Firestore
                        try {
                            const docRef = doc(db, 'projects_evidence', uniqueId);
                            const docSnap = await getDoc(docRef);
                            if (docSnap.exists()) {
                                evidenceImages = docSnap.data().images || [];
                            }
                        } catch (e) {
                            console.error("Error fetching evidence", e);
                        }
                    } else {
                        // Fallback for legacy (no uniqueId): Randomize date based on ID to avoid "all today"
                        const daysAgo = (p.id % 5) + 1;
                        const d = new Date();
                        d.setDate(d.getDate() - daysAgo);
                        realDate = d.toLocaleDateString('en-CA');
                    }

                    return {
                        id: p.id,
                        farmerName: `${p.farmer.substring(0, 6)}...${p.farmer.substring(38)}`,
                        farmerAddress: p.farmer,
                        submissionDate: realDate,
                        activityType: p.projectType,
                        location: location,
                        description: description,
                        evidence: evidenceImages,
                        creditAmount: 0,
                        status: 'pending' as const
                    };
                }));
            setCredits(mappedCredits);
        } catch (err) {
            console.error("Failed to load projects", err);
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        if (blockchainState?.registryContract) {
            loadProjects();
        }
    }, [blockchainState]);

    const handleVerify = async (approved: boolean) => {
        if (!selectedCredit || !blockchainState?.registryContract) return;

        if (!approved) {
            // Local rejection + Persist to localStorage
            try {
                const dismissed = JSON.parse(localStorage.getItem('dismissed_projects') || '[]');
                dismissed.push(selectedCredit.id);
                localStorage.setItem('dismissed_projects', JSON.stringify(dismissed));
            } catch (e) {
                console.error("Failed to persist rejection", e);
            }

            setCredits(prev => prev.filter(c => c.id !== selectedCredit.id));
            setSelectedCredit(null);
            return;
        }

        setProcessingId(selectedCredit.id);
        try {
            await verifyAndMint(
                blockchainState.registryContract,
                selectedCredit.id,
                mintAmount
            );
            alert(`${t('success.verified')} ${mintAmount} credits minted!`);

            // Auto-list for Buyer Dashboard (Demo Bridge for Real Projects)
            // This ensures immediate visibility as requested by user
            const newListing = {
                id: Date.now(), // Generate a temp ID for localStorage display
                farmerName: `Seller: ${selectedCredit.farmerName}`,
                sellerAddress: selectedCredit.farmerAddress,
                submissionDate: new Date().toISOString().split('T')[0],
                activityType: selectedCredit.activityType,
                location: selectedCredit.location,
                description: `Verified Credits: ${selectedCredit.description}`,
                evidence: [],
                creditAmount: mintAmount,
                price: mintAmount * 10, // Estimate price
                status: 'verified' as const
            };

            const existingListings = JSON.parse(localStorage.getItem('demoListings') || '[]');
            localStorage.setItem('demoListings', JSON.stringify([...existingListings, newListing]));

            // Dispatch storage event to notify Buyer Dashboard
            window.dispatchEvent(new Event('storage'));
            window.dispatchEvent(new Event('marketplace-updated'));

            // Remove from list
            setCredits(prev => prev.filter(c => c.id !== selectedCredit.id));
            setSelectedCredit(null);
        } catch (err: any) {
            console.error("Verify failed", err);
            alert("Verification failed: " + err.message);
        } finally {
            setProcessingId(null);
        }
    };

    const handleAddValidator = async () => {
        if (!newValidatorAddress || !blockchainState?.registryContract) return;

        setIsAdminProcessing(true);
        try {
            await addVerifier(blockchainState.registryContract, newValidatorAddress);
            alert(`${t('success.validator.added')} (${newValidatorAddress})`);
            setNewValidatorAddress('');
        } catch (err: any) {
            console.error("Add validator failed", err);
            alert("Failed to add validator: " + err.message);
        } finally {
            setIsAdminProcessing(false);
        }
    };

    return (
        <div className="h-screen overflow-hidden bg-gray-50 dark:bg-gray-900 flex flex-col">
            {/* Top Navbar - Matching Layout.tsx & FarmerDashboard */}
            <nav className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl border-b border-white/20 dark:border-gray-800 sticky top-0 z-50 transition-all duration-300 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-20">
                        <div className="flex items-center">
                            <Link to="/validator-dashboard" className="flex items-center space-x-3 group">
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
                                            <p className="text-sm text-primary font-bold uppercase tracking-wider mt-1">{t('role.validator')}</p>
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
                {!blockchainState ? (
                    <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-8 animate-fade-in relative overflow-hidden">
                        {/* Background Decoration */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl -z-10 animate-pulse"></div>

                        <div className="p-10 bg-white/50 dark:bg-gray-800/50 backdrop-blur-2xl rounded-[40px] border border-white/20 dark:border-gray-700/50 shadow-2xl flex flex-col items-center text-center max-w-2xl mx-auto">
                            <div className="p-8 bg-gradient-to-br from-orange-400 to-orange-600 rounded-[32px] shadow-2xl shadow-orange-500/30 mb-8 transform -rotate-12 hover:rotate-0 transition-transform duration-500">
                                <Wallet size={64} className="text-white" />
                            </div>
                            <h1 className="text-5xl font-black text-gray-900 dark:text-white mb-6 tracking-tight leading-tight">
                                {t('validator.title')}
                            </h1>
                            <p className="text-xl text-gray-600 dark:text-gray-400 mb-12 leading-relaxed font-medium">
                                {t('validator.connect.desc')}
                            </p>
                            <button
                                onClick={connectWallet}
                                disabled={isWalletConnecting}
                                className="group relative bg-gradient-to-r from-primary to-emerald-600 text-white px-12 py-5 rounded-2xl font-black text-2xl hover:shadow-2xl hover:shadow-green-500/40 transition-all transform hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-4 border-b-8 border-green-700 active:border-b-0 shadow-2xl"
                            >
                                {isWalletConnecting ? <Loader2 className="animate-spin" /> : <Wallet size={28} className="group-hover:scale-110 transition-transform" />}
                                {isWalletConnecting ? 'Connecting...' : t('connect.wallet')}
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="mb-12 flex flex-col lg:flex-row lg:items-end justify-between gap-8">
                            <div className="space-y-4">
                                <div className="flex items-center gap-6 flex-wrap">
                                    <h1 className="text-5xl font-black text-gray-900 dark:text-white tracking-tighter leading-none">
                                        {t('dashboard')}
                                    </h1>
                                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-sm font-black uppercase tracking-widest border border-green-200 dark:border-green-800 shadow-sm">
                                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                        {t('validation.phase') || 'Active Validator'}
                                    </div>
                                </div>
                                <p className="text-xl text-gray-500 dark:text-gray-400 font-medium max-w-2xl">{t('validator.desc')}</p>
                            </div>

                            {blockchainState.isAdmin && (
                                <div className="flex bg-gray-200/50 dark:bg-gray-800/50 backdrop-blur-md p-2 rounded-[24px] border border-gray-100 dark:border-gray-700 shadow-inner min-w-fit">
                                    <button
                                        onClick={() => setActiveTab('pending')}
                                        className={`px-8 py-3.5 rounded-[18px] text-base font-black transition-all duration-500 flex items-center gap-3 ${activeTab === 'pending'
                                            ? 'bg-white dark:bg-gray-700 text-primary shadow-2xl scale-105 border border-gray-100 dark:border-gray-600'
                                            : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'
                                            }`}
                                    >
                                        <FileText size={20} className={activeTab === 'pending' ? 'animate-bounce' : ''} />
                                        {t('pendingRequests')}
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('admin')}
                                        className={`px-8 py-3.5 rounded-[18px] text-base font-black transition-all duration-500 flex items-center gap-3 ${activeTab === 'admin'
                                            ? 'bg-white dark:bg-gray-700 text-primary shadow-2xl scale-105 border border-gray-100 dark:border-gray-600'
                                            : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'
                                            }`}
                                    >
                                        <Shield size={20} className={activeTab === 'admin' ? 'animate-pulse' : ''} />
                                        {t('admin.panel')}
                                    </button>
                                </div>
                            )}
                        </div>

                        {activeTab === 'admin' ? (
                            <div className="max-w-3xl mx-auto bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-[40px] shadow-2xl border border-white/20 dark:border-gray-700 p-12 transform transition-all hover:scale-[1.01]">
                                <div className="text-center mb-12">
                                    <div className="bg-gradient-to-br from-blue-500 to-indigo-600 w-24 h-24 rounded-3xl rotate-12 flex items-center justify-center mx-auto mb-8 border-2 border-white dark:border-gray-700 shadow-2xl shadow-blue-500/40">
                                        <Shield className="w-12 h-12 text-white -rotate-12" />
                                    </div>
                                    <h2 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">{t('admin.panel')}</h2>
                                    <p className="text-xl text-gray-500 dark:text-gray-400 mt-4 font-medium">{t('admin.desc')}</p>
                                </div>

                                <div className="space-y-10">
                                    <div>
                                        <label className="block text-sm font-black text-gray-700 dark:text-gray-300 mb-4 ml-2 uppercase tracking-[0.2em]">
                                            {t('new.validator.address')}
                                        </label>
                                        <div className="relative group">
                                            <input
                                                type="text"
                                                value={newValidatorAddress}
                                                onChange={(e) => setNewValidatorAddress(e.target.value)}
                                                placeholder="0x..."
                                                className="w-full pl-14 pr-6 py-5 bg-gray-50 dark:bg-gray-900/50 border-2 border-gray-100 dark:border-gray-700 rounded-[28px] focus:ring-8 focus:ring-primary/10 focus:border-primary outline-none transition-all font-mono text-lg shadow-inner group-hover:border-gray-200 dark:group-hover:border-gray-600"
                                            />
                                            <Wallet className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors group-hover:scale-110" size={24} />
                                        </div>
                                        <div className="flex items-center gap-2 mt-4 ml-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                                            <p className="text-sm text-gray-400 font-bold italic tracking-wide">
                                                {t('enter.wallet.desc')}
                                            </p>
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleAddValidator}
                                        disabled={isAdminProcessing || !newValidatorAddress}
                                        className="w-full flex items-center justify-center gap-4 py-5 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-[28px] hover:shadow-[0_20px_50px_rgba(37,99,235,0.4)] transition-all font-black text-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-1.5 border-b-8 border-blue-900 active:border-b-0 shadow-2xl active:translate-y-1"
                                    >
                                        {isAdminProcessing ? <Loader2 className="animate-spin" /> : <UserPlus size={26} />}
                                        {isAdminProcessing ? t('adding') : t('add.validator')}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex-grow grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch overflow-hidden">
                                {/* List */}
                                <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-[40px] shadow-2xl border border-white/20 dark:border-gray-700 p-8 overflow-hidden flex flex-col h-full">
                                    <h2 className="text-3xl font-black mb-10 text-gray-900 dark:text-white flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3.5 bg-blue-50 dark:bg-blue-900/40 rounded-2xl text-blue-600 dark:text-blue-400 shadow-xl border border-blue-100 dark:border-blue-800">
                                                <FileText size={26} />
                                            </div>
                                            <span className="tracking-tight">{t('pendingRequests') || 'Pending Requests'}</span>
                                        </div>
                                        <span className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white text-base font-black px-6 py-2 rounded-2xl shadow-2xl shadow-blue-500/50 min-w-[50px] text-center">
                                            {credits.length}
                                        </span>
                                    </h2>

                                    <div className="space-y-6 flex-grow overflow-y-auto pr-3 scrollbar-hide">
                                        {credits.length === 0 ? (
                                            <div className="h-full flex flex-col items-center justify-center py-24 text-gray-400 animate-pulse">
                                                <div className="w-24 h-24 bg-gray-50/50 dark:bg-gray-900/50 rounded-[40px] flex items-center justify-center mb-8 border border-dashed border-gray-200 dark:border-gray-700">
                                                    <RefreshCw size={48} className="opacity-10" />
                                                </div>
                                                <p className="text-2xl font-black tracking-tight">{t('noPending') || 'No pending requests'}</p>
                                                <p className="text-gray-500 mt-2 font-medium">Everything is up to date!</p>
                                            </div>
                                        ) : (
                                            credits.map(credit => (
                                                <div
                                                    key={credit.id}
                                                    onClick={() => setSelectedCredit(credit)}
                                                    className={`p-6 rounded-[32px] border-4 cursor-pointer transition-all duration-500 transform hover:-translate-y-2 hover:shadow-2xl ${selectedCredit?.id === credit.id
                                                        ? 'border-primary bg-green-50/70 dark:bg-green-900/10 shadow-3xl'
                                                        : 'border-transparent bg-gray-50/50 dark:bg-gray-900/50 hover:bg-white dark:hover:bg-gray-800 hover:border-gray-100 dark:hover:border-gray-700'
                                                        }`}
                                                >
                                                    <div className="flex justify-between items-start mb-4">
                                                        <span className="font-black text-gray-900 dark:text-gray-100 text-2xl tracking-tighter uppercase">{credit.farmerName}</span>
                                                        <span className="text-xs font-black bg-white dark:bg-gray-700 px-4 py-2 rounded-xl border border-gray-100 dark:border-gray-600 shadow-sm text-gray-400 uppercase tracking-widest leading-none flex items-center gap-2">
                                                            <Calendar size={12} /> {credit.submissionDate}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-3 text-base text-primary font-black uppercase tracking-[0.1em] mb-4">
                                                        <div className="w-3 h-3 rounded-full bg-primary shadow-lg shadow-green-500/50"></div>
                                                        {credit.activityType} Farming
                                                    </div>
                                                    <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400 font-bold bg-white/50 dark:bg-gray-800/50 p-3 rounded-2xl border border-white/50 dark:border-gray-700/50">
                                                        <MapPin size={16} className="text-red-500" /> {credit.location}
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>

                                {/* Detail View */}
                                <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-[40px] shadow-2xl border border-white/20 dark:border-gray-700 p-8 overflow-y-auto h-full scrollbar-hide">
                                    {selectedCredit ? (
                                        <div className="animate-fade-in flex flex-col h-full">
                                            <h2 className="text-3xl font-black mb-10 text-gray-900 dark:text-white flex items-center gap-4">
                                                <div className="p-3 bg-green-50 dark:bg-green-900/40 rounded-2xl text-primary shadow-xl border border-green-100 dark:border-green-800">
                                                    <CheckCircle size={26} />
                                                </div>
                                                {t('verifyTitle') || 'Verify Application'}
                                            </h2>

                                            <div className="space-y-10 flex-grow">
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                                    <div className="bg-gray-50/50 dark:bg-gray-900/50 p-6 rounded-[32px] border border-gray-100 dark:border-gray-700">
                                                        <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-4">{t('farmerDetails') || 'Farmer Details'}</h3>
                                                        <p className="text-2xl font-black text-gray-900 dark:text-white tracking-tight leading-none mb-3">{selectedCredit.farmerName}</p>
                                                        <p className="text-base text-gray-600 dark:text-gray-400 flex items-center gap-2 font-bold">
                                                            <MapPin size={18} className="text-red-400" /> {selectedCredit.location}
                                                        </p>
                                                    </div>
                                                    <div className="bg-gray-50/50 dark:bg-gray-900/50 p-6 rounded-[32px] border border-gray-100 dark:border-gray-700">
                                                        <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-4">{t('activity') || 'Activity'}</h3>
                                                        <p className="text-2xl font-black text-primary tracking-tight leading-none mb-3 capitalize">{selectedCredit.activityType}</p>
                                                        <p className="text-base text-gray-600 dark:text-gray-400 font-bold uppercase tracking-widest">{t('verified.status') || 'UNVERIFIED'}</p>
                                                    </div>
                                                </div>

                                                <div className="bg-white dark:bg-gray-900 p-8 rounded-[32px] border-2 border-primary/10 shadow-inner">
                                                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-4">{t('description')}</h3>
                                                    <p className="text-lg text-gray-800 dark:text-gray-200 font-medium leading-relaxed">{selectedCredit.description}</p>
                                                </div>

                                                <div>
                                                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-6 flex justify-between items-center">
                                                        {t('evidence') || 'Evidence'}
                                                        <span className="text-[10px] bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">{selectedCredit.evidence.length} {t('files') || 'Files'}</span>
                                                    </h3>
                                                    <div className="grid grid-cols-2 gap-6">
                                                        {selectedCredit.evidence.length > 0 ? selectedCredit.evidence.map((img, i) => (
                                                            <div key={i} className="group relative overflow-hidden rounded-[32px] shadow-xl border-4 border-white dark:border-gray-700 aspect-[4/3]">
                                                                <img src={img} alt="Evidence" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                                    <button className="p-3 bg-white rounded-full shadow-2xl text-primary transform scale-0 group-hover:scale-100 transition-transform duration-500">
                                                                        <Search size={24} />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        )) : (
                                                            <div className="col-span-2 py-10 bg-gray-50 dark:bg-gray-900 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-[32px] flex flex-col items-center justify-center text-gray-400 gap-3">
                                                                <FileText size={48} className="opacity-10" />
                                                                <p className="font-black italic uppercase tracking-widest text-xs">{t('no.evidence') || 'Supporting documentation only'}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 p-8 rounded-[40px] border-2 border-yellow-200/50 dark:border-yellow-700/50 shadow-xl">
                                                    <div className="flex justify-between items-center mb-6">
                                                        <div className="flex items-center gap-3">
                                                            <div className="p-2 bg-yellow-400 rounded-xl text-white shadow-lg">
                                                                <Coins size={20} />
                                                            </div>
                                                            <span className="text-yellow-900 dark:text-yellow-100 font-black text-lg tracking-tight">{t('estCredits') || 'Credits to Mint'}</span>
                                                        </div>
                                                        <span className="text-xs font-black text-yellow-600 bg-white dark:bg-yellow-900/40 px-3 py-1 rounded-full border border-yellow-200 dark:border-yellow-800 uppercase tracking-widest">{t('editable') || 'Manual Entry'}</span>
                                                    </div>
                                                    <div className="relative group">
                                                        <input
                                                            type="number"
                                                            value={mintAmount}
                                                            onChange={(e) => setMintAmount(Number(e.target.value))}
                                                            className="w-full bg-white dark:bg-gray-800 border-4 border-yellow-200 dark:border-yellow-700 rounded-3xl px-8 py-5 font-black text-4xl text-yellow-600 dark:text-yellow-400 focus:ring-8 focus:ring-yellow-500/10 focus:border-yellow-500 transition-all outline-none shadow-inner"
                                                        />
                                                        <div className="absolute right-6 top-1/2 -translate-y-1/2 text-yellow-200 dark:text-yellow-900/30 group-focus-within:text-yellow-500 transition-colors">
                                                            <Award size={40} />
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-6 pt-6">
                                                    <button
                                                        onClick={() => handleVerify(false)}
                                                        disabled={processingId === selectedCredit.id}
                                                        className="group flex flex-col items-center justify-center gap-1 py-4 border-2 border-red-100 dark:border-red-900/30 text-red-500 rounded-[28px] hover:bg-red-50 dark:hover:bg-red-900/20 transition-all font-black text-lg disabled:opacity-50 transform hover:-translate-y-1"
                                                    >
                                                        <XCircle size={28} className="group-hover:scale-110 transition-transform" />
                                                        <span className="text-xs uppercase tracking-[0.2em]">{t('reject') || 'Reject'}</span>
                                                    </button>
                                                    <button
                                                        onClick={() => handleVerify(true)}
                                                        disabled={processingId === selectedCredit.id}
                                                        className="group flex flex-col items-center justify-center gap-1 py-4 bg-gradient-to-br from-primary to-green-600 text-white rounded-[28px] hover:shadow-[0_20px_50px_rgba(34,197,94,0.4)] transition-all font-black text-lg disabled:opacity-50 transform hover:-translate-y-1.5 border-b-8 border-green-800 active:border-b-0 active:translate-y-1"
                                                    >
                                                        {processingId === selectedCredit.id ? (
                                                            <Loader2 className="animate-spin" size={28} />
                                                        ) : (
                                                            <CheckCircle size={28} className="group-hover:scale-110 transition-transform" />
                                                        )}
                                                        <span className="text-xs uppercase tracking-[0.2em]">{processingId === selectedCredit.id ? 'Minting...' : (t('approve') || 'Approve')}</span>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="h-full flex flex-col items-center justify-center text-gray-300 space-y-8 min-h-[500px] animate-pulse">
                                            <div className="relative">
                                                <div className="absolute -inset-8 bg-primary/5 rounded-full blur-2xl"></div>
                                                <FileText size={120} className="opacity-10" />
                                            </div>
                                            <div className="text-center">
                                                <p className="text-3xl font-black text-gray-400 tracking-tight">{t('selectRequest') || 'Select a request'}</p>
                                                <p className="text-gray-400 mt-2 font-medium tracking-wide">Choose an application from the left to begin verification</p>
                                            </div>
                                            <ArrowRight size={48} className="opacity-5 animate-bounce-horizontal" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
