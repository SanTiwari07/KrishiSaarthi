import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import LanguageToggle from './LanguageToggle';
import { ArrowLeft, Upload, Clock, CheckCircle, XCircle, Coins, Wallet, Loader2, AlertCircle } from 'lucide-react';
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
  type Project,
} from '../services/blockchain';

type View = 'submit' | 'status';

interface Activity {
  id: number;
  type: string;
  description: string;
  images: string[];
  status: 'pending' | 'approved' | 'rejected';
  credits?: number;
  date: string;
  txHash?: string;
}

export default function GreenCredit() {
  const navigate = useNavigate();
  const { t } = useApp();
  const [view, setView] = useState<View>('submit');
  const [activityType, setActivityType] = useState('');
  const [customActivity, setCustomActivity] = useState('');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<string[]>([]);
  
  // Blockchain state
  const [blockchainState, setBlockchainState] = useState<BlockchainState | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [tokenBalance, setTokenBalance] = useState('0');
  
  const activityTypes = [
    'Planted Trees',
    'Solar Panel Installed',
    'Organic Compost',
    'Reduced Chemicals',
    'Water Conservation',
    'Other',
  ];
  
  // Connect wallet
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
      
      // Register as farmer if not already registered
      if (!state.isFarmer && state.registryContract) {
        try {
          await registerFarmer(state.registryContract);
          // Refresh state
          const newState = await connectWallet();
          setBlockchainState(newState);
        } catch (err: any) {
          console.error('Registration error:', err);
          // Continue anyway, might already be registered
        }
      }
      
      // Load farmer's projects and balance
      await loadFarmerData(state);
    } catch (err: any) {
      setError(err.message || 'Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  };

  // Load farmer's projects and balance
  const loadFarmerData = async (state: BlockchainState) => {
    if (!state.registryContract || !state.tokenContract || !state.address) return;

    setIsLoading(true);
    try {
      const [projects, balance] = await Promise.all([
        getFarmerProjects(state.registryContract, state.address),
        getTokenBalance(state.tokenContract, state.address),
      ]);

      // Convert blockchain projects to activities
      const activitiesData: Activity[] = projects.map((project) => ({
        id: project.id,
        type: project.projectType,
        description: project.offChainHash || 'No description',
        images: [], // Images would be stored off-chain (IPFS/backend)
        status: project.status === 'Verified' ? 'approved' : 'pending',
        date: new Date().toISOString(), // Blockchain doesn't store date, using current
        txHash: undefined,
      }));

      setActivities(activitiesData);
      setTokenBalance(parseFloat(balance).toFixed(2));
    } catch (err: any) {
      setError(`Failed to load data: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Load data when wallet is connected
  useEffect(() => {
    if (blockchainState) {
      loadFarmerData(blockchainState);
    }
  }, [blockchainState?.address]);

  // Setup account and chain listeners
  useEffect(() => {
    if (!isMetaMaskInstalled()) return;

    const removeAccountListener = setupAccountListener(async (accounts) => {
      if (accounts.length === 0) {
        setBlockchainState(null);
        setActivities([]);
        setTokenBalance('0');
      } else if (blockchainState) {
        // Account changed, reconnect
        handleConnectWallet();
      }
    });

    const removeChainListener = setupChainListener(() => {
      // Chain changed, reconnect
      if (blockchainState) {
        handleConnectWallet();
      }
    });

    return () => {
      removeAccountListener();
      removeChainListener();
    };
  }, [blockchainState]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const readers = files.map(file => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
    });
    
    Promise.all(readers).then(results => {
      setImages([...images, ...results]);
    });
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!blockchainState || !blockchainState.registryContract) {
      setError('Please connect your wallet first');
      return;
    }

    if (!activityType || !description || images.length === 0) {
      setError('Please fill all required fields');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const projectType = activityType === 'Other' ? customActivity : activityType;
      
      // Create off-chain hash (in production, upload images to IPFS and store hash)
      // For now, we'll use a simple hash of description + images
      const offChainHash = `${description}|${images.length} images`;
      
      const { txHash, projectId } = await createProject(
        blockchainState.registryContract,
        projectType,
        offChainHash
      );

      setSuccess(`Activity submitted! Transaction: ${txHash.substring(0, 10)}...`);
      
      // Reset form
      setActivityType('');
      setCustomActivity('');
      setDescription('');
      setImages([]);
      
      // Reload data
      await loadFarmerData(blockchainState);
      
      // Switch to status view
      setTimeout(() => {
        setView('status');
        setSuccess(null);
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to submit activity');
    } finally {
      setIsLoading(false);
    }
  };
  
  const totalCredits = parseFloat(tokenBalance);
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <LanguageToggle />
      
      {/* Header */}
      <div className="bg-green-600 text-white py-6 shadow-lg">
        <div className="container mx-auto px-4 flex items-center gap-4">
          <button
            onClick={() => navigate('/farmer-dashboard')}
            className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex-1">
            <h2>{t('green.credit')}</h2>
          </div>
          
          {/* Wallet Connection */}
          {!blockchainState ? (
            <button
              onClick={handleConnectWallet}
              disabled={isConnecting}
              className="bg-white/20 hover:bg-white/30 rounded-full px-4 py-2 flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              {isConnecting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Connecting...</span>
                </>
              ) : (
                <>
                  <Wallet className="w-4 h-4" />
                  <span>Connect Wallet</span>
                </>
              )}
            </button>
          ) : (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-white/20 rounded-full px-4 py-2">
                <Coins className="w-5 h-5" />
                <span>{totalCredits} Credits</span>
              </div>
              <div className="bg-white/20 rounded-full px-3 py-1 text-sm">
                {blockchainState.address?.substring(0, 6)}...{blockchainState.address?.substring(38)}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Error/Success Messages */}
      {(error || success) && (
        <div className="container mx-auto px-4 pt-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
              <button
                onClick={() => setError(null)}
                className="ml-auto text-red-500 hover:text-red-700"
              >
                ×
              </button>
            </div>
          )}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              <span>{success}</span>
              <button
                onClick={() => setSuccess(null)}
                className="ml-auto text-green-500 hover:text-green-700"
              >
                ×
              </button>
            </div>
          )}
        </div>
      )}
      
      {/* View Toggle */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4">
          <div className="flex">
            <button
              onClick={() => setView('submit')}
              className={`flex-1 py-4 transition-colors ${
                view === 'submit'
                  ? 'text-green-600 border-b-4 border-green-600'
                  : 'text-gray-600 hover:text-green-600'
              }`}
            >
              {t('submit.activity')}
            </button>
            <button
              onClick={() => setView('status')}
              className={`flex-1 py-4 transition-colors ${
                view === 'status'
                  ? 'text-green-600 border-b-4 border-green-600'
                  : 'text-gray-600 hover:text-green-600'
              }`}
            >
              {t('activity.status')}
            </button>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-12">
        {/* Wallet Not Connected Message */}
        {!blockchainState && view === 'submit' && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-3xl shadow-2xl p-12 text-center">
              <Wallet className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-gray-900 mb-2">Connect Your Wallet</h3>
              <p className="text-gray-600 mb-6">
                Please connect your MetaMask wallet to submit green credit activities
              </p>
              <button
                onClick={handleConnectWallet}
                disabled={isConnecting || !isMetaMaskInstalled()}
                className="bg-green-600 text-white px-8 py-4 rounded-xl hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {isConnecting ? 'Connecting...' : 'Connect Wallet'}
              </button>
              {!isMetaMaskInstalled() && (
                <p className="text-red-600 mt-4">MetaMask is not installed. Please install it first.</p>
              )}
            </div>
          </div>
        )}

        {/* Submit Activity View */}
        {view === 'submit' && blockchainState && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-3xl shadow-2xl p-8">
              <h3 className="text-gray-900 mb-6">{t('submit.activity')}</h3>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Activity Type */}
                <div>
                  <label className="block text-gray-700 mb-3">{t('activity.type')}</label>
                  <div className="grid grid-cols-2 gap-3">
                    {activityTypes.map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => {
                          setActivityType(type);
                          if (type !== 'Other') setCustomActivity('');
                        }}
                        className={`px-4 py-4 rounded-xl border-2 transition-all ${
                          activityType === type
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-200 hover:border-green-300'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Custom Activity (if Other is selected) */}
                {activityType === 'Other' && (
                  <div>
                    <input
                      type="text"
                      value={customActivity}
                      onChange={(e) => setCustomActivity(e.target.value)}
                      placeholder="Describe your activity type..."
                      className="w-full px-4 py-4 rounded-xl border-2 border-gray-200 focus:border-green-500 outline-none transition-colors"
                      required
                    />
                  </div>
                )}
                
                {/* Description */}
                <div>
                  <label className="block text-gray-700 mb-3">{t('description')}</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    required
                    placeholder="Provide details about your sustainable activity..."
                    className="w-full px-4 py-4 rounded-xl border-2 border-gray-200 focus:border-green-500 outline-none transition-colors"
                  ></textarea>
                </div>
                
                {/* Upload Images */}
                <div>
                  <label className="block text-gray-700 mb-3">{t('upload.images')}</label>
                  
                  {images.length > 0 && (
                    <div className="grid grid-cols-3 gap-3 mb-4">
                      {images.map((img, index) => (
                        <div key={index} className="relative aspect-square">
                          <img
                            src={img}
                            alt={`Upload ${index + 1}`}
                            className="w-full h-full object-cover rounded-xl"
                          />
                          <button
                            type="button"
                            onClick={() => setImages(images.filter((_, i) => i !== index))}
                            className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <label className="block">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-green-500 transition-colors">
                      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-600">Click to upload images</p>
                      <p className="text-gray-400">Multiple images allowed</p>
                    </div>
                  </label>
                </div>
                
                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={!activityType || !description || images.length === 0 || isLoading}
                  className="w-full bg-green-600 text-white py-5 rounded-2xl hover:bg-green-700 transition-colors shadow-lg disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    t('submit')
                  )}
                </button>
              </form>
            </div>
          </div>
        )}
        
        {/* Activity Status View */}
        {view === 'status' && (
          <div className="max-w-4xl mx-auto">
            {!blockchainState ? (
              <div className="bg-white rounded-3xl shadow-2xl p-12 text-center">
                <Wallet className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-gray-900 mb-2">Connect Your Wallet</h3>
                <p className="text-gray-600 mb-6">
                  Please connect your wallet to view your activities
                </p>
                <button
                  onClick={handleConnectWallet}
                  disabled={isConnecting}
                  className="bg-green-600 text-white px-8 py-4 rounded-xl hover:bg-green-700 transition-colors disabled:bg-gray-300"
                >
                  {isConnecting ? 'Connecting...' : 'Connect Wallet'}
                </button>
              </div>
            ) : isLoading ? (
              <div className="bg-white rounded-3xl shadow-2xl p-12 text-center">
                <Loader2 className="w-16 h-16 text-green-600 mx-auto mb-4 animate-spin" />
                <p className="text-gray-600">Loading activities...</p>
              </div>
            ) : (
              <>
                <div className="mb-6 bg-green-50 rounded-2xl p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 mb-1">{t('credits.earned')}</p>
                      <p className="text-green-700 text-2xl font-bold">{totalCredits} Credits</p>
                    </div>
                    <Coins className="w-12 h-12 text-green-600" />
                  </div>
                </div>
                
                {activities.length === 0 ? (
                  <div className="bg-white rounded-3xl shadow-lg p-12 text-center">
                    <p className="text-gray-600">No activities submitted yet.</p>
                    <button
                      onClick={() => setView('submit')}
                      className="mt-4 text-green-600 hover:text-green-700"
                    >
                      Submit your first activity →
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {activities.map((activity) => (
                      <div key={activity.id} className="bg-white rounded-3xl shadow-lg p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h4 className="text-gray-900 mb-2">{activity.type}</h4>
                            <p className="text-gray-600 mb-2">{activity.description}</p>
                            <p className="text-gray-400 text-sm">{new Date(activity.date).toLocaleDateString()}</p>
                            {activity.txHash && (
                              <p className="text-gray-400 text-xs mt-1">
                                TX: {activity.txHash.substring(0, 10)}...
                              </p>
                            )}
                          </div>
                          
                          <div className={`px-4 py-2 rounded-full flex items-center gap-2 ${
                            activity.status === 'approved' ? 'bg-green-100 text-green-700' :
                            activity.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {activity.status === 'approved' && <CheckCircle className="w-5 h-5" />}
                            {activity.status === 'pending' && <Clock className="w-5 h-5" />}
                            {activity.status === 'rejected' && <XCircle className="w-5 h-5" />}
                            <span className="capitalize">{activity.status}</span>
                          </div>
                        </div>
                        
                        {/* Images */}
                        {activity.images.length > 0 && (
                          <div className="grid grid-cols-3 gap-3 mb-4">
                            {activity.images.map((img, index) => (
                              <img
                                key={index}
                                src={img}
                                alt={`Activity ${index + 1}`}
                                className="w-full aspect-square object-cover rounded-xl"
                              />
                            ))}
                          </div>
                        )}
                        
                        {/* Credits Earned */}
                        {activity.status === 'approved' && activity.credits && (
                          <div className="bg-green-50 rounded-xl p-4 flex items-center justify-between">
                            <span className="text-gray-700">{t('credits.earned')}</span>
                            <div className="flex items-center gap-2 text-green-700">
                              <Coins className="w-5 h-5" />
                              <span>{activity.credits} Credits</span>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
