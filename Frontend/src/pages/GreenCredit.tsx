import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { Award, ArrowLeft, Upload, MapPin, Calendar, CheckCircle, ChevronRight, Loader2, Wallet, Coins, Clock, XCircle, AlertCircle } from 'lucide-react';
import {
    connectWallet,
    registerFarmer,
    createProject,
    getFarmerProjects,
    getTokenBalance,
    isMetaMaskInstalled,
    setupAccountListener,
    setupChainListener,
    type BlockchainState,
} from '../services/blockchain';

type View = 'apply' | 'list';
type ActivityType = 'organic' | 'water' | 'tree' | 'renewable' | 'chemical-free' | 'soil' | 'Other';

interface Activity {
    id: number;
    type: string;
    description: string;
    images: string[];
    status: 'pending' | 'approved' | 'rejected';
    credits?: number;
    date: string;
    txHash?: string;
    location?: string;
}

export default function GreenCredit() {
    const { t } = useApp();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<View>('apply');

    // Blockchain State
    const [blockchainState, setBlockchainState] = useState<BlockchainState | null>(null);
    const [isConnecting, setIsConnecting] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Data State
    const [activities, setActivities] = useState<Activity[]>([]);
    const [tokenBalance, setTokenBalance] = useState('0');

    // Form State
    const [activity, setActivity] = useState<ActivityType>('organic');
    const [customActivity, setCustomActivity] = useState('');
    const [desc, setDesc] = useState('');
    const [location, setLocation] = useState('');
    const [images, setImages] = useState<string[]>([]);

    // --- Blockchain Logic ---

    const handleConnectWallet = async () => {
        if (!isMetaMaskInstalled()) {
            setError('MetaMask is not installed. Please install MetaMask to continue.');
            return;
        }

        setIsConnecting(true);
        setError(null);
        try {
            const state = await connectWallet();
            setBlockchainState(state);

            if (!state.isFarmer && state.registryContract) {
                try {
                    await registerFarmer(state.registryContract);
                    const newState = await connectWallet();
                    setBlockchainState(newState);
                } catch (err: any) {
                    console.error('Registration error:', err);
                }
            }

            await loadFarmerData(state);
        } catch (err: any) {
            setError(err.message || 'Failed to connect wallet');
        } finally {
            setIsConnecting(false);
        }
    };

    const loadFarmerData = async (state: BlockchainState) => {
        if (!state.registryContract || !state.tokenContract || !state.address) return;

        setIsLoading(true);
        try {
            const [projects, balance] = await Promise.all([
                getFarmerProjects(state.registryContract, state.address),
                getTokenBalance(state.tokenContract, state.address),
            ]);

            const activitiesData: Activity[] = projects.map((project) => ({
                id: project.id,
                type: project.projectType,
                description: project.offChainHash.split('|')[0] || 'No description', // Simple parse
                images: [], // Images would be fetched from IPFS/Backend in real app
                status: project.status === 'Verified' ? 'approved' : 'pending',
                credits: project.status === 'Verified' ? 10 : 0, // Mock credits if not in contract
                date: new Date().toISOString(),
                txHash: undefined,
                location: 'On-Chain'
            }));

            setActivities(activitiesData);
            setTokenBalance(parseFloat(balance).toFixed(2));
        } catch (err: any) {
            setError(`Failed to load data: ${err.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (blockchainState) {
            loadFarmerData(blockchainState);
        }
    }, [blockchainState?.address]);

    // Listeners
    useEffect(() => {
        if (!isMetaMaskInstalled()) return;
        const removeAccountListener = setupAccountListener(async (accounts) => {
            if (accounts.length === 0) setBlockchainState(null);
            else if (blockchainState) handleConnectWallet();
        });
        const removeChainListener = setupChainListener(() => {
            if (blockchainState) handleConnectWallet();
        });
        return () => { removeAccountListener(); removeChainListener(); };
    }, [blockchainState]);

    // Form Handlers
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        const readers = files.map(file => new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.readAsDataURL(file);
        }));
        Promise.all(readers).then(results => setImages([...images, ...results]));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!blockchainState || !blockchainState.registryContract) {
            setError('Please connect your wallet first');
            return;
        }
        if (!activity || !desc || images.length === 0) {
            setError('Please fill all required fields');
            return;
        }

        setIsLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const projectType = activity === 'Other' ? customActivity : activity;
            const offChainHash = `${desc}|${location}|${images.length} images`; // Mock hash

            const { txHash } = await createProject(
                blockchainState.registryContract,
                projectType,
                offChainHash
            );

            setSuccess(`Activity submitted! TX: ${txHash.substring(0, 10)}...`);
            setActivity('organic');
            setDesc('');
            setLocation('');
            setImages([]);

            await loadFarmerData(blockchainState);
            setTimeout(() => {
                setActiveTab('list');
                setSuccess(null);
            }, 2000);
        } catch (err: any) {
            setError(err.message || 'Failed to submit activity');
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'approved': return 'text-green-700 bg-green-100 border-green-200';
            case 'pending': return 'text-yellow-700 bg-yellow-100 border-yellow-200';
            case 'rejected': return 'text-red-700 bg-red-100 border-red-200';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 pt-8 pb-16 px-4">
            <button onClick={() => navigate('/farmer-dashboard')} className="text-gray-500 hover:text-primary flex items-center gap-2 font-bold text-lg">
                <ArrowLeft size={24} /> {t('back') || 'Back'}
            </button>

            {/* Header & Wallet */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="mb-0">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg"><Award className="text-yellow-600" size={32} /></div>
                        {t('green.credit')}
                    </h2>
                    <p className="text-xl text-gray-500 mt-2">{t('green.credit.desc')}</p>
                </div>

                {!blockchainState ? (
                    <button onClick={handleConnectWallet} disabled={isConnecting} className="bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-primary-dark transition-colors flex items-center gap-2 shadow-lg">
                        {isConnecting ? <Loader2 className="animate-spin" /> : <Wallet size={20} />}
                        {isConnecting ? 'Connecting...' : 'Connect Wallet'}
                    </button>
                ) : (
                    <div className="bg-white dark:bg-gray-800 p-3 rounded-xl border border-yellow-200 dark:border-yellow-800/30 shadow-sm flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <Coins className="text-yellow-500" size={20} />
                            <span className="font-bold text-gray-900 dark:text-white text-lg">{tokenBalance}</span>
                        </div>
                        <div className="h-8 w-px bg-gray-200 dark:bg-gray-700"></div>
                        <span className="text-xs text-gray-400 font-mono">{blockchainState.address?.substring(0, 6)}...</span>
                    </div>
                )}
            </div>

            {/* Notifications */}
            {(error || success) && (
                <div className={`p-4 rounded-xl border flex items-center gap-3 ${error ? 'bg-red-50 border-red-200 text-red-700' : 'bg-green-50 border-green-200 text-green-700'}`}>
                    {error ? <AlertCircle size={20} /> : <CheckCircle size={20} />}
                    <span className="font-medium">{error || success}</span>
                </div>
            )}

            {/* Tabs */}
            <div className="flex p-1 bg-gray-100 dark:bg-gray-700 rounded-xl">
                <button
                    onClick={() => setActiveTab('apply')}
                    className={`flex-1 py-3 text-lg font-bold rounded-lg transition-all ${activeTab === 'apply'
                            ? 'bg-white dark:bg-gray-600 text-primary shadow-md'
                            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
                        }`}
                >
                    {t('apply.credit') || 'Apply for Credit'}
                </button>
                <button
                    onClick={() => setActiveTab('list')}
                    className={`flex-1 py-3 text-lg font-bold rounded-lg transition-all ${activeTab === 'list'
                            ? 'bg-white dark:bg-gray-600 text-primary shadow-md'
                            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
                        }`}
                >
                    {t('my.credits') || 'My Credits'}
                </button>
            </div>

            {/* Apply Form */}
            {activeTab === 'apply' && (
                <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-md border border-gray-100 dark:border-gray-700 space-y-6 animate-fade-in">
                    <div>
                        <label className="block text-lg font-bold text-gray-700 dark:text-gray-300 mb-2">Activity Type</label>
                        <select
                            value={activity}
                            onChange={(e) => setActivity(e.target.value as ActivityType)}
                            className="w-full p-4 border border-gray-300 rounded-xl dark:bg-gray-700 dark:border-gray-600 bg-white dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent text-lg"
                        >
                            <option value="organic">Organic Farming</option>
                            <option value="water">Water Conservation</option>
                            <option value="tree">Tree Plantation</option>
                            <option value="soil">Soil Conservation</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                    {activity === 'Other' && (
                        <input
                            type="text"
                            placeholder="Specify activity"
                            value={customActivity}
                            onChange={e => setCustomActivity(e.target.value)}
                            className="w-full p-4 border border-gray-300 rounded-xl dark:bg-gray-700 dark:border-gray-600 bg-white dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent text-lg"
                        />
                    )}

                    <div>
                        <label className="block text-lg font-bold text-gray-700 dark:text-gray-300 mb-2">{t('description')}</label>
                        <textarea
                            value={desc}
                            onChange={(e) => setDesc(e.target.value)}
                            className="w-full p-4 border border-gray-300 rounded-xl dark:bg-gray-700 dark:border-gray-600 bg-white dark:text-white h-32 text-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                            placeholder="Describe your activity..."
                            required
                        ></textarea>
                    </div>
                    <div>
                        <label className="block text-lg font-bold text-gray-700 dark:text-gray-300 mb-2">Location</label>
                        <div className="relative">
                            <MapPin className="absolute left-4 top-4 text-gray-400" size={24} />
                            <input
                                type="text"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                className="w-full pl-12 p-4 border border-gray-300 rounded-xl dark:bg-gray-700 dark:border-gray-600 bg-white dark:text-white text-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                placeholder="Enter farm location"
                                required
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-lg font-bold text-gray-700 dark:text-gray-300 mb-2">Evidence</label>

                        {images.length > 0 && (
                            <div className="grid grid-cols-3 gap-3 mb-4">
                                {images.map((img, index) => (
                                    <div key={index} className="relative aspect-square">
                                        <img src={img} className="w-full h-full object-cover rounded-xl" alt="proof" />
                                    </div>
                                ))}
                            </div>
                        )}

                        <div
                            className="border-3 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl p-10 text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors relative"
                        >
                            <Upload className="mx-auto mb-4 text-gray-400" size={40} />
                            <span className="text-lg font-medium text-gray-500">Tap to upload proof</span>
                            <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                        </div>
                    </div>
                    <button type="submit" disabled={isLoading} className="w-full bg-primary text-white py-4 rounded-xl font-bold text-xl hover:bg-primary-dark transition-all shadow-lg transform hover:-translate-y-0.5 disabled:opacity-50">
                        {isLoading ? 'Submitting...' : t('submit') || 'Submit Application'}
                    </button>
                </form>
            )}

            {/* List View */}
            {activeTab === 'list' && (
                <div className="space-y-4 animate-fade-in">
                    {!blockchainState ? (
                        <div className="text-center p-16 bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700">
                            <Wallet className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500 text-xl font-bold">Connect wallet to view credits</p>
                        </div>
                    ) : activities.length === 0 ? (
                        <div className="text-center p-10 bg-white dark:bg-gray-800 rounded-3xl">
                            <p className="text-gray-500 text-lg">No credits found.</p>
                        </div>
                    ) : (
                        activities.map((credit) => (
                            <div key={credit.id} className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col md:flex-row justify-between md:items-center gap-6 hover:shadow-md transition-shadow">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className={`px-3 py-1 rounded-lg text-sm font-bold uppercase ${getStatusColor(credit.status)}`}>
                                            {credit.status}
                                        </span>
                                        <span className="text-sm text-gray-500 flex items-center gap-1"><Calendar size={14} /> {new Date(credit.date).toLocaleDateString()}</span>
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white capitalize mb-1">{credit.type}</h3>
                                    <p className="text-gray-600 dark:text-gray-300">{credit.description}</p>
                                </div>
                                <div className="flex items-center justify-between md:justify-end gap-6 md:w-auto w-full border-t md:border-0 border-gray-100 dark:border-gray-700 pt-4 md:pt-0">
                                    <div className="text-right">
                                        <div className="text-2xl font-bold text-primary">{credit.credits} Cr</div>
                                        {credit.txHash && <div className="text-xs text-gray-400 font-mono">TX: {credit.txHash.substring(0, 6)}...</div>}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};
