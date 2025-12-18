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
import { CheckCircle, XCircle, MapPin, FileText, Wallet, Loader2, RefreshCw, Shield, UserPlus } from 'lucide-react';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

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
    const { t } = useApp();
    const { state: blockchainState, connect: connectWallet, isConnecting } = useBlockchain();

    const [credits, setCredits] = useState<Credit[]>([]);
    const [loading, setLoading] = useState(false);
    const [processingId, setProcessingId] = useState<number | null>(null);
    const [selectedCredit, setSelectedCredit] = useState<Credit | null>(null);
    const [mintAmount, setMintAmount] = useState<number>(10); // Default mint amount

    // Admin Tab State
    const [activeTab, setActiveTab] = useState<'pending' | 'admin'>('pending');
    const [newValidatorAddress, setNewValidatorAddress] = useState('');
    const [isAdminProcessing, setIsAdminProcessing] = useState(false);

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

    if (!blockchainState) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-[60vh] space-y-6">
                <div className="p-6 bg-yellow-50 dark:bg-yellow-900/20 rounded-full">
                    <Wallet size={64} className="text-yellow-600 dark:text-yellow-400" />
                </div>
                <div className="text-center max-w-lg">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">{t('validator.title')}</h1>
                    <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
                        {t('validator.connect.desc')}
                    </p>
                    <button
                        onClick={connectWallet}
                        disabled={isConnecting}
                        className="bg-primary text-white px-8 py-4 rounded-xl font-bold text-xl hover:bg-primary-dark transition-all shadow-lg hover:shadow-green-500/30 flex items-center justify-center gap-3 transform hover:-translate-y-1 mx-auto"
                    >
                        {isConnecting ? <Loader2 className="animate-spin" /> : <Wallet />}
                        {isConnecting ? 'Connecting...' : 'Connect Wallet'}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('dashboard')}</h1>
                    <p className="text-gray-500">{t('validator.desc')}</p>
                </div>

                {blockchainState.isAdmin && (
                    <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
                        <button
                            onClick={() => setActiveTab('pending')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'pending'
                                ? 'bg-white dark:bg-gray-700 text-primary shadow-sm'
                                : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'
                                }`}
                        >
                            <div className="flex items-center gap-2">
                                <FileText size={16} />
                                {t('pendingRequests')}
                            </div>
                        </button>
                        <button
                            onClick={() => setActiveTab('admin')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'admin'
                                ? 'bg-white dark:bg-gray-700 text-primary shadow-sm'
                                : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'
                                }`}
                        >
                            <div className="flex items-center gap-2">
                                <Shield size={16} />
                                {t('admin.panel')}
                            </div>
                        </button>
                    </div>
                )}
            </div>

            {activeTab === 'admin' ? (
                <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-8">
                    <div className="text-center mb-8">
                        <div className="bg-blue-50 dark:bg-blue-900/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Shield className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('admin.panel')}</h2>
                        <p className="text-gray-500 mt-2">{t('admin.desc')}</p>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                {t('new.validator.address')}
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={newValidatorAddress}
                                    onChange={(e) => setNewValidatorAddress(e.target.value)}
                                    placeholder="0x..."
                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all font-mono text-sm"
                                />
                                <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            </div>
                            <p className="text-xs text-gray-400 mt-2 ml-1">
                                {t('enter.wallet.desc')}
                            </p>
                        </div>

                        <button
                            onClick={handleAddValidator}
                            disabled={isAdminProcessing || !newValidatorAddress}
                            className="w-full flex items-center justify-center gap-2 py-4 bg-primary text-white rounded-xl hover:bg-primary-dark transition-all shadow-lg hover:shadow-green-500/30 font-bold disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5 active:translate-y-0"
                        >
                            {isAdminProcessing ? <Loader2 className="animate-spin" /> : <UserPlus size={20} />}
                            {isAdminProcessing ? t('adding') : t('add.validator')}
                        </button>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* List */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                        <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-white flex items-center gap-2">
                            <FileText className="text-blue-500" /> {t('pendingRequests') || 'Pending Requests'}
                            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">{credits.length}</span>
                        </h2>

                        <div className="space-y-4">
                            {credits.length === 0 ? (
                                <div className="text-center py-10 text-gray-500">{t('noPending') || 'No pending requests'}</div>
                            ) : (
                                credits.map(credit => (
                                    <div
                                        key={credit.id}
                                        onClick={() => setSelectedCredit(credit)}
                                        className={`p-4 rounded-xl border cursor-pointer transition-all hover:shadow-md ${selectedCredit?.id === credit.id
                                            ? 'border-primary bg-green-50 dark:bg-green-900/10 dark:border-primary'
                                            : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900'
                                            }`}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="font-bold text-gray-800 dark:text-gray-200">{credit.farmerName}</span>
                                            <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">{credit.submissionDate}</span>
                                        </div>
                                        <div className="text-sm text-gray-600 dark:text-gray-400 capitalize mb-1">{credit.activityType} Farming</div>
                                        <div className="text-xs text-gray-400 flex items-center gap-1"><MapPin size={10} /> {credit.location}</div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Detail View */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                        {selectedCredit ? (
                            <div className="animate-fade-in">
                                <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">{t('verifyTitle') || 'Verify Application'}</h2>

                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">{t('farmerDetails') || 'Farmer Details'}</h3>
                                        <p className="text-lg font-medium">{selectedCredit.farmerName}</p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                                            <MapPin size={14} /> {selectedCredit.location}
                                        </p>
                                    </div>

                                    <div>
                                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">{t('activity') || 'Activity'}</h3>
                                        <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                                            <p className="font-semibold capitalize text-primary mb-1">{selectedCredit.activityType}</p>
                                            <p className="text-sm text-gray-600 dark:text-gray-300">{selectedCredit.description}</p>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">{t('evidence') || 'Evidence'}</h3>
                                        <div className="grid grid-cols-2 gap-2">
                                            {selectedCredit.evidence.map((img, i) => (
                                                <img key={i} src={img} alt="Evidence" className="rounded-lg h-32 w-full object-cover" />
                                            ))}
                                        </div>
                                    </div>

                                    <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-xl border border-yellow-100 dark:border-yellow-800">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-yellow-800 dark:text-yellow-200 font-medium">{t('estCredits') || 'Credits to Mint'}</span>
                                            <span className="text-xs text-yellow-600">(Editable)</span>
                                        </div>
                                        <input
                                            type="number"
                                            value={mintAmount}
                                            onChange={(e) => setMintAmount(Number(e.target.value))}
                                            className="w-full bg-white dark:bg-gray-800 border border-yellow-300 dark:border-yellow-700 rounded-lg px-3 py-2 font-bold text-yellow-600 dark:text-yellow-400 focus:ring-2 focus:ring-yellow-500"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 pt-4">
                                        <button
                                            onClick={() => handleVerify(false)}
                                            disabled={processingId === selectedCredit.id}
                                            className="flex items-center justify-center gap-2 py-3 border border-red-500 text-red-500 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors font-medium disabled:opacity-50"
                                        >
                                            <XCircle size={20} /> {t('reject') || 'Reject'}
                                        </button>
                                        <button
                                            onClick={() => handleVerify(true)}
                                            disabled={processingId === selectedCredit.id}
                                            className="flex items-center justify-center gap-2 py-3 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors font-bold shadow-md hover:shadow-lg disabled:opacity-50"
                                        >
                                            {processingId === selectedCredit.id ? <Loader2 className="animate-spin" /> : <CheckCircle size={20} />}
                                            {processingId === selectedCredit.id ? 'Minting...' : (t('approve') || 'Approve & Mint')}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4 min-h-[400px]">
                                <FileText size={48} className="opacity-20" />
                                <p>{t('selectRequest') || 'Select a request to verify'}</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
