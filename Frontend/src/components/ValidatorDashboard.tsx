import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import Header from './Header';
import { CheckCircle, XCircle, AlertCircle, ImageIcon, HelpCircle, Wallet, Loader2 } from 'lucide-react';
import {
  connectWallet,
  getAllProjects,
  verifyAndMint,
  addVerifier,
  isMetaMaskInstalled,
  setupAccountListener,
  setupChainListener,
  type BlockchainState,
  type Project,
} from '../services/blockchain';

type View = 'pending' | 'verified';

interface Submission {
  id: number;
  farmer: string;
  projectType: string;
  description: string;
  images: string[];
  date: string;
  status: 'pending' | 'approved' | 'rejected';
  credits?: number;
}

export default function ValidatorDashboard() {
  const navigate = useNavigate();
  const { t, user } = useApp();
  const [view, setView] = useState<View>('pending');
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  
  // Blockchain state
  const [blockchainState, setBlockchainState] = useState<BlockchainState | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  
  // Verification inputs
  const [verifyAmounts, setVerifyAmounts] = useState<Record<number, string>>({});
  
  // Admin state
  const [adminAddress, setAdminAddress] = useState<string | null>(null);
  const [newVerifierAddress, setNewVerifierAddress] = useState('');
  const [isAddingVerifier, setIsAddingVerifier] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(true); // Show by default
  
  // Known admin address (the deployer)
  const KNOWN_ADMIN_ADDRESS = '0xB9A6485DcD4080809Cb3d00e42e111055312e23E';
  
  // Regulator address (your address with admin privileges)
  const REGULATOR_ADDRESS = '0x7b0044f0AD55AAd4cF5948776b8b23DE5b3d6288';
  
  // Check if current address is regulator
  const isRegulator = blockchainState?.address?.toLowerCase() === REGULATOR_ADDRESS.toLowerCase();
  
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
      
      // Get admin address
      if (state.registryContract) {
        try {
          const owner = await state.registryContract.owner();
          setAdminAddress(owner);
          // Debug: Log admin check
          console.log('Admin address from contract:', owner);
          console.log('Connected address:', state.address);
          console.log('Is admin?', state.isAdmin);
          console.log('Is verifier?', state.isVerifier);
        } catch (err) {
          console.error('Failed to get admin address:', err);
        }
      }
      
      // Check if current address is regulator
      const currentIsRegulator = state.address?.toLowerCase() === REGULATOR_ADDRESS.toLowerCase();
      
      if (!state.isVerifier) {
        // Don't show error if user is admin or regulator - they can add themselves
        if (!state.isAdmin && !currentIsRegulator) {
          setError('Your wallet is not registered as a validator. Please contact the administrator.');
        }
      } else {
        await loadProjects(state);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  };
  
  // Add verifier (admin/regulator function)
  const handleAddVerifier = async (address?: string) => {
    if (!blockchainState || !blockchainState.registryContract) {
      setError('Please connect your wallet first');
      return;
    }

    // Check if current address is regulator
    const currentIsRegulator = blockchainState.address?.toLowerCase() === REGULATOR_ADDRESS.toLowerCase();
    
    // Allow if admin OR regulator
    const canAddVerifier = blockchainState.isAdmin || currentIsRegulator;
    if (!canAddVerifier) {
      setError('Only the administrator or regulator can add validators');
      return;
    }

    const verifierAddr = address || newVerifierAddress || blockchainState.address;
    if (!verifierAddr) {
      setError('Please enter a validator address');
      return;
    }

    // Validate address format
    if (!/^0x[a-fA-F0-9]{40}$/.test(verifierAddr)) {
      setError('Invalid Ethereum address format');
      return;
    }

    setIsAddingVerifier(true);
    setError(null);
    setSuccess(null);

    try {
      const txHash = await addVerifier(blockchainState.registryContract, verifierAddr);
      setSuccess(`Validator added successfully! Transaction: ${txHash.substring(0, 10)}...`);
      
      // If adding self, refresh wallet connection
      if (verifierAddr.toLowerCase() === blockchainState.address?.toLowerCase()) {
        setTimeout(async () => {
          await handleConnectWallet();
        }, 2000);
      }
      
      setNewVerifierAddress('');
      setTimeout(() => setSuccess(null), 5000);
    } catch (err: any) {
      // Check for "Not owner" or permission denied errors
      const errorMessage = err.message || '';
      const errorString = JSON.stringify(err).toLowerCase();
      
      if (
        errorMessage.includes('Not owner') || 
        errorMessage.includes('execution reverted: Not owner') ||
        errorMessage.includes('Permission Denied') ||
        errorMessage.includes('UNPREDICTABLE_GAS_LIMIT') ||
        errorString.includes('not owner') ||
        errorString.includes('4e6f74206f776e6572') // "Not owner" in hex
      ) {
        setError(
          `❌ Permission Denied: Only the contract owner can add validators.\n\n` +
          `Your address: ${blockchainState.address}\n` +
          `Required admin address: ${KNOWN_ADMIN_ADDRESS}\n\n` +
          `To add validators, you need to:\n` +
          `1. Switch to the admin wallet (${KNOWN_ADMIN_ADDRESS}) in MetaMask\n` +
          `2. Refresh this page and connect with the admin wallet\n` +
          `3. Use the Administrator Panel to add validators\n\n` +
          `Alternatively, contact the administrator to add validators for you.`
        );
      } else {
        setError(err.message || 'Failed to add validator');
      }
    } finally {
      setIsAddingVerifier(false);
    }
  };

  // Load projects from blockchain
  const loadProjects = async (state: BlockchainState) => {
    if (!state.registryContract) return;

    setIsLoading(true);
    try {
      const projects = await getAllProjects(state.registryContract);
      
      // Convert blockchain projects to submissions
      const submissionsData: Submission[] = projects.map((project) => ({
        id: project.id,
        farmer: project.farmer,
        projectType: project.projectType,
        description: project.offChainHash || 'No description',
        images: [], // Images stored off-chain
        date: new Date().toISOString(),
        status: project.status === 'Verified' ? 'approved' : 'pending',
      }));

      setSubmissions(submissionsData);
    } catch (err: any) {
      setError(`Failed to load projects: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Load data when wallet is connected
  useEffect(() => {
    if (blockchainState && blockchainState.isVerifier) {
      loadProjects(blockchainState);
    }
  }, [blockchainState?.address, blockchainState?.isVerifier]);

  // Setup account and chain listeners
  useEffect(() => {
    if (!isMetaMaskInstalled()) return;

    const removeAccountListener = setupAccountListener(async (accounts) => {
      if (accounts.length === 0) {
        setBlockchainState(null);
        setSubmissions([]);
      } else if (blockchainState) {
        handleConnectWallet();
      }
    });

    const removeChainListener = setupChainListener(() => {
      if (blockchainState) {
        handleConnectWallet();
      }
    });

    return () => {
      removeAccountListener();
      removeChainListener();
    };
  }, [blockchainState]);
  
  const handleApprove = async (submissionId: number) => {
    if (!blockchainState || !blockchainState.registryContract) {
      setError('Please connect your wallet first');
      return;
    }

    const amountStr = verifyAmounts[submissionId];
    if (!amountStr || parseFloat(amountStr) <= 0) {
      setError('Please enter a valid credit amount');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const amount = parseFloat(amountStr);
      const txHash = await verifyAndMint(
        blockchainState.registryContract,
        submissionId,
        amount
      );

      setSuccess(`Project verified and ${amount} credits minted! Transaction: ${txHash.substring(0, 10)}...`);
      
      // Clear amount input
      setVerifyAmounts({ ...verifyAmounts, [submissionId]: '' });
      
      // Reload projects
      await loadProjects(blockchainState);
      
      // Close modal if open
      setSelectedSubmission(null);
      
      setTimeout(() => setSuccess(null), 5000);
    } catch (err: any) {
      setError(err.message || 'Failed to verify project');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleReject = (submissionId: number) => {
    // Note: Blockchain doesn't support rejection, only verification
    // In a real system, you might want to add a rejection mechanism
    setError('Rejection is not supported on blockchain. Projects remain pending until verified.');
  };
  
  const pendingSubmissions = submissions.filter(s => s.status === 'pending');
  const verifiedSubmissions = submissions.filter(s => s.status !== 'pending');
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <Header />
      
      {/* Wallet Connection Banner */}
      {!blockchainState && (
        <div className="bg-yellow-50 border-b border-yellow-200">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
              <p className="text-yellow-800">Please connect your wallet to verify projects</p>
            </div>
            <button
              onClick={handleConnectWallet}
              disabled={isConnecting}
              className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50 flex items-center gap-2"
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
          </div>
        </div>
      )}

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

      {/* Regulator Panel - Show if regulator address */}
      {blockchainState && blockchainState.address && isRegulator && (
        <div className="container mx-auto px-4 pt-4">
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-300 rounded-xl p-6 shadow-lg">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    REGULATOR
                  </div>
                  {!blockchainState.isVerifier && (
                    <div className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm">
                      Not Registered as Validator
                    </div>
                  )}
                </div>
                <h3 className="text-purple-900 font-bold text-lg mb-2">Regulator Panel</h3>
                <p className="text-purple-700 text-sm mb-3">
                  {blockchainState.isVerifier 
                    ? "You are a regulator and a registered validator."
                    : "You are a regulator but not registered as a validator."}
                </p>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-3">
                  <p className="text-yellow-800 text-xs font-semibold mb-1">⚠️ Important Notice:</p>
                  <p className="text-yellow-700 text-xs">
                    The smart contract only allows the contract owner to add validators. To add validators, you need to switch to the admin wallet ({KNOWN_ADMIN_ADDRESS.substring(0, 10)}...) in MetaMask.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAdminPanel(!showAdminPanel)}
                className="text-purple-600 hover:text-purple-800 font-semibold px-3 py-1 border border-purple-300 rounded-lg hover:bg-purple-50 transition-colors"
              >
                {showAdminPanel ? '▼ Hide' : '▶ Show'} Regulator Panel
              </button>
            </div>
            
            {showAdminPanel && (
              <div className="space-y-4 mt-4">
                {!blockchainState.isVerifier && (
                  <div className="bg-white rounded-lg p-5 border-2 border-purple-300 shadow-md">
                    <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-purple-600" />
                      Add Yourself as Validator
                    </h4>
                    <p className="text-sm text-gray-600 mb-3">
                      Your address: <span className="font-mono bg-gray-100 px-2 py-1 rounded">{blockchainState.address}</span>
                    </p>
                    <div className="space-y-2">
                      <button
                        onClick={() => handleAddVerifier()}
                        disabled={isAddingVerifier}
                        className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors disabled:bg-gray-300 flex items-center gap-2 font-semibold shadow-md hover:shadow-lg w-full"
                      >
                        {isAddingVerifier ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Adding...</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-5 h-5" />
                            <span>Add Myself as Validator</span>
                          </>
                        )}
                      </button>
                      <p className="text-xs text-gray-500 text-center">
                        Note: Requires admin wallet ({KNOWN_ADMIN_ADDRESS.substring(0, 10)}...)
                      </p>
                    </div>
                  </div>
                )}
                
                <div className="bg-white rounded-lg p-5 border-2 border-purple-300 shadow-md">
                  <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <Wallet className="w-5 h-5 text-purple-600" />
                    Add Another Address as Validator
                  </h4>
                  <p className="text-sm text-gray-600 mb-3">
                    Enter an Ethereum address to register as a validator
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newVerifierAddress}
                      onChange={(e) => setNewVerifierAddress(e.target.value)}
                      placeholder="0x..."
                      className="flex-1 px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-purple-500 outline-none font-mono text-sm"
                    />
                    <button
                      onClick={() => handleAddVerifier()}
                      disabled={isAddingVerifier || !newVerifierAddress}
                      className="bg-pink-600 text-white px-6 py-3 rounded-lg hover:bg-pink-700 transition-colors disabled:bg-gray-300 flex items-center gap-2 font-semibold shadow-md hover:shadow-lg"
                    >
                      {isAddingVerifier ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Adding...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-5 h-5" />
                          <span>Add Validator</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Admin Panel - Show if admin OR if connected address matches admin address */}
      {blockchainState && blockchainState.address && !isRegulator && (
        blockchainState.isAdmin || 
        (adminAddress && adminAddress.toLowerCase() === blockchainState.address.toLowerCase()) ||
        blockchainState.address.toLowerCase() === KNOWN_ADMIN_ADDRESS.toLowerCase()
      ) && (
        <div className="container mx-auto px-4 pt-4">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-xl p-6 shadow-lg">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    ADMINISTRATOR
                  </div>
                  {!blockchainState.isVerifier && (
                    <div className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm">
                      Not Registered as Validator
                    </div>
                  )}
                </div>
                <h3 className="text-blue-900 font-bold text-lg mb-2">Administrator Panel</h3>
                <p className="text-blue-700 text-sm">
                  {blockchainState.isVerifier 
                    ? "You are the administrator and a registered validator. You can add other addresses as validators."
                    : "You are the administrator but not registered as a validator. You can add yourself or others as validators."}
                </p>
              </div>
              <button
                onClick={() => setShowAdminPanel(!showAdminPanel)}
                className="text-blue-600 hover:text-blue-800 font-semibold px-3 py-1 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors"
              >
                {showAdminPanel ? '▼ Hide' : '▶ Show'} Admin Panel
              </button>
            </div>
            
            {showAdminPanel && (
              <div className="space-y-4 mt-4">
                {!blockchainState.isVerifier && (
                  <div className="bg-white rounded-lg p-5 border-2 border-blue-300 shadow-md">
                    <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-blue-600" />
                      Add Yourself as Validator
                    </h4>
                    <p className="text-sm text-gray-600 mb-3">
                      Your address: <span className="font-mono bg-gray-100 px-2 py-1 rounded">{blockchainState.address}</span>
                    </p>
                    <button
                      onClick={() => handleAddVerifier()}
                      disabled={isAddingVerifier}
                      className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 flex items-center gap-2 font-semibold shadow-md hover:shadow-lg"
                    >
                      {isAddingVerifier ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Adding...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-5 h-5" />
                          <span>Add Myself as Validator</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
                
                <div className="bg-white rounded-lg p-5 border-2 border-blue-300 shadow-md">
                  <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <Wallet className="w-5 h-5 text-blue-600" />
                    Add Another Address as Validator
                  </h4>
                  <p className="text-sm text-gray-600 mb-3">
                    Enter an Ethereum address to register as a validator
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newVerifierAddress}
                      onChange={(e) => setNewVerifierAddress(e.target.value)}
                      placeholder="0x..."
                      className="flex-1 px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-blue-500 outline-none font-mono text-sm"
                    />
                    <button
                      onClick={() => handleAddVerifier()}
                      disabled={isAddingVerifier || !newVerifierAddress}
                      className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-gray-300 flex items-center gap-2 font-semibold shadow-md hover:shadow-lg"
                    >
                      {isAddingVerifier ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Adding...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-5 h-5" />
                          <span>Add Validator</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Debug Info - Show wallet and admin status */}
      {blockchainState && (
        <div className="container mx-auto px-4 pt-4">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-xs">
            <details className="cursor-pointer">
              <summary className="text-gray-600 font-semibold mb-2">Debug Info (Click to expand)</summary>
              <div className="mt-2 space-y-1 text-gray-600">
                <p><strong>Your Address:</strong> <span className="font-mono">{blockchainState.address}</span></p>
                <p><strong>Regulator Address:</strong> <span className="font-mono">{REGULATOR_ADDRESS}</span></p>
                <p><strong>Known Admin Address:</strong> <span className="font-mono">{KNOWN_ADMIN_ADDRESS}</span></p>
                <p><strong>Admin Address (from contract):</strong> <span className="font-mono">{adminAddress || 'Loading...'}</span></p>
                <p><strong>Is Admin (detected):</strong> {blockchainState.isAdmin ? '✅ Yes' : '❌ No'}</p>
                <p><strong>Is Regulator:</strong> {isRegulator ? '✅ Yes' : '❌ No'}</p>
                <p><strong>Is Verifier:</strong> {blockchainState.isVerifier ? '✅ Yes' : '❌ No'}</p>
                <p><strong>Matches Regulator:</strong> {blockchainState.address && blockchainState.address.toLowerCase() === REGULATOR_ADDRESS.toLowerCase() ? '✅ Yes' : '❌ No'}</p>
                <p><strong>Matches Known Admin:</strong> {blockchainState.address && blockchainState.address.toLowerCase() === KNOWN_ADMIN_ADDRESS.toLowerCase() ? '✅ Yes' : '❌ No'}</p>
                <p><strong>Addresses Match (contract):</strong> {adminAddress && blockchainState.address && adminAddress.toLowerCase() === blockchainState.address.toLowerCase() ? '✅ Yes' : '❌ No'}</p>
              </div>
            </details>
          </div>
        </div>
      )}

      {/* Not Validator Info - Show if not admin and not validator */}
      {blockchainState && !blockchainState.isAdmin && !blockchainState.isVerifier && adminAddress && (
        <div className="container mx-auto px-4 pt-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h3 className="text-yellow-900 font-semibold mb-2">Not Registered as Validator</h3>
            <p className="text-yellow-700 text-sm mb-3">
              Your wallet address is not registered as a validator. Please contact the administrator to be added.
            </p>
            <div className="mt-3">
              <p className="text-yellow-800 text-sm font-semibold mb-1">Administrator Address:</p>
              <p className="text-yellow-700 font-mono text-sm break-all bg-yellow-100 p-2 rounded">
                {adminAddress}
              </p>
            </div>
            {(adminAddress && blockchainState.address && adminAddress.toLowerCase() === blockchainState.address.toLowerCase()) ||
             (blockchainState.address && blockchainState.address.toLowerCase() === KNOWN_ADMIN_ADDRESS.toLowerCase()) ? (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
                <p className="text-blue-800 text-sm font-semibold mb-2">✅ You are the administrator!</p>
                <p className="text-blue-700 text-sm mb-2">
                  Your address matches the administrator address. You can add yourself or others as validators.
                </p>
                {!blockchainState.isVerifier && (
                  <button
                    onClick={async () => {
                      if (blockchainState?.registryContract && blockchainState.address) {
                        try {
                          await handleAddVerifier(blockchainState.address);
                        } catch (err: any) {
                          setError(err.message || 'Failed to add validator');
                        }
                      }
                    }}
                    disabled={isAddingVerifier}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 flex items-center gap-2 text-sm"
                  >
                    {isAddingVerifier ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Adding...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        <span>Add Myself as Validator</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            ) : null}
          </div>
        </div>
      )}
      
      {/* View Toggle */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4">
          <div className="flex">
            <button
              onClick={() => setView('pending')}
              className={`flex-1 py-4 transition-colors ${
                view === 'pending'
                  ? 'text-blue-600 border-b-4 border-blue-600'
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              {t('pending.verifications')} ({pendingSubmissions.length})
            </button>
            <button
              onClick={() => setView('verified')}
              className={`flex-1 py-4 transition-colors ${
                view === 'verified'
                  ? 'text-blue-600 border-b-4 border-blue-600'
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              {t('verified.activities')} ({verifiedSubmissions.length})
            </button>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-12">
        {/* Pending Verifications */}
        {view === 'pending' && (
          <div className="max-w-6xl mx-auto">
            {!blockchainState ? (
              <div className="bg-white rounded-3xl shadow-2xl p-12 text-center">
                <Wallet className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-gray-900 mb-2">Connect Your Wallet</h3>
                <p className="text-gray-600 mb-6">
                  Please connect your MetaMask wallet to verify projects
                </p>
                <button
                  onClick={handleConnectWallet}
                  disabled={isConnecting || !isMetaMaskInstalled()}
                  className="bg-blue-600 text-white px-8 py-4 rounded-xl hover:bg-blue-700 transition-colors disabled:bg-gray-300"
                >
                  {isConnecting ? 'Connecting...' : 'Connect Wallet'}
                </button>
              </div>
            ) : isLoading ? (
              <div className="bg-white rounded-3xl shadow-2xl p-12 text-center">
                <Loader2 className="w-16 h-16 text-blue-600 mx-auto mb-4 animate-spin" />
                <p className="text-gray-600">Loading projects...</p>
              </div>
            ) : pendingSubmissions.length === 0 ? (
              <div className="bg-white rounded-3xl shadow-lg p-12 text-center">
                <CheckCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-gray-600">No pending verifications</h3>
                <p className="text-gray-400">All submissions have been reviewed</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {pendingSubmissions.map((submission) => (
                  <div key={submission.id} className="bg-white rounded-3xl shadow-lg p-6">
                    {/* Farmer Info */}
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="text-gray-900">Farmer</h4>
                        <p className="text-gray-500 text-sm font-mono">
                          {submission.farmer.substring(0, 6)}...{submission.farmer.substring(38)}
                        </p>
                      </div>
                      <div className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {t('pending')}
                      </div>
                    </div>
                    
                    {/* Activity Info */}
                    <div className="mb-4">
                      <p className="text-gray-600 mb-1">{t('activity.type')}</p>
                      <p className="text-gray-900 mb-3 font-semibold">{submission.projectType}</p>
                      
                      <p className="text-gray-600 mb-1">{t('description')}</p>
                      <p className="text-gray-700 mb-3">{submission.description}</p>
                      
                      <p className="text-gray-400 text-sm">Project ID: {submission.id}</p>
                    </div>
                    
                    {/* Images */}
                    {submission.images.length > 0 && (
                      <div className="mb-4">
                        <p className="text-gray-600 mb-2 flex items-center gap-2">
                          <ImageIcon className="w-4 h-4" />
                          Uploaded Images ({submission.images.length})
                        </p>
                        <div className="grid grid-cols-3 gap-2">
                          {submission.images.map((img, index) => (
                            <img
                              key={index}
                              src={img}
                              alt={`Evidence ${index + 1}`}
                              className="w-full aspect-square object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                              onClick={() => setSelectedSubmission(submission)}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Credit Amount Input */}
                    <div className="mb-4">
                      <label className="block text-gray-700 mb-2">Credit Amount</label>
                      <input
                        type="number"
                        value={verifyAmounts[submission.id] || ''}
                        onChange={(e) => setVerifyAmounts({ ...verifyAmounts, [submission.id]: e.target.value })}
                        placeholder="Enter credit amount (e.g., 25)"
                        min="0"
                        step="0.01"
                        className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-blue-500 outline-none"
                      />
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleApprove(submission.id)}
                        disabled={isLoading || !verifyAmounts[submission.id] || parseFloat(verifyAmounts[submission.id] || '0') <= 0}
                        className="bg-green-600 text-white py-3 rounded-xl hover:bg-green-700 transition-colors flex items-center justify-center gap-2 disabled:bg-gray-300 disabled:cursor-not-allowed"
                      >
                        {isLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4" />
                            {t('approve')}
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => handleReject(submission.id)}
                        className="bg-red-600 text-white py-3 rounded-xl hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                      >
                        <XCircle className="w-4 h-4" />
                        {t('reject')}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        {/* Verified Activities */}
        {view === 'verified' && (
          <div className="max-w-6xl mx-auto">
            {isLoading ? (
              <div className="bg-white rounded-3xl shadow-2xl p-12 text-center">
                <Loader2 className="w-16 h-16 text-blue-600 mx-auto mb-4 animate-spin" />
                <p className="text-gray-600">Loading verified projects...</p>
              </div>
            ) : verifiedSubmissions.length === 0 ? (
              <div className="bg-white rounded-3xl shadow-lg p-12 text-center">
                <p className="text-gray-600">No verified activities yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {verifiedSubmissions.map((submission) => (
                  <div key={submission.id} className="bg-white rounded-2xl shadow-md p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="text-gray-900">Farmer</h4>
                          <span className="text-gray-400">•</span>
                          <span className="text-gray-600 font-mono text-sm">
                            {submission.farmer.substring(0, 6)}...{submission.farmer.substring(38)}
                          </span>
                          <span className="text-gray-400">•</span>
                          <span className="text-gray-600">{submission.projectType}</span>
                        </div>
                        <p className="text-gray-600 mb-2">{submission.description}</p>
                        <p className="text-gray-400 text-sm">Project ID: {submission.id}</p>
                      </div>
                      
                      <div className="flex flex-col items-end gap-2">
                        <div className="px-4 py-2 rounded-full flex items-center gap-2 bg-green-100 text-green-700">
                          <CheckCircle className="w-4 h-4" />
                          <span className="capitalize">{submission.status}</span>
                        </div>
                        
                        {submission.credits && (
                          <div className="bg-green-50 px-4 py-2 rounded-full text-green-700">
                            {submission.credits} Credits
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Image Modal */}
      {selectedSubmission && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedSubmission(null)}
        >
          <div className="max-w-4xl w-full bg-white rounded-3xl p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-gray-900">{selectedSubmission.projectType}</h3>
              <button
                onClick={() => setSelectedSubmission(null)}
                className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300"
              >
                ×
              </button>
            </div>
            
            {selectedSubmission.images.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 mb-4">
                {selectedSubmission.images.map((img, index) => (
                  <img
                    key={index}
                    src={img}
                    alt={`Evidence ${index + 1}`}
                    className="w-full rounded-xl"
                  />
                ))}
              </div>
            ) : (
              <p className="text-gray-500 mb-4">No images available for this project.</p>
            )}
            
            <p className="text-gray-700 mb-4">{selectedSubmission.description}</p>
            
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  if (selectedSubmission) {
                    handleApprove(selectedSubmission.id);
                  }
                }}
                disabled={isLoading || !verifyAmounts[selectedSubmission.id] || parseFloat(verifyAmounts[selectedSubmission.id] || '0') <= 0}
                className="bg-green-600 text-white py-4 rounded-xl hover:bg-green-700 transition-colors flex items-center justify-center gap-2 disabled:bg-gray-300"
              >
                <CheckCircle className="w-5 h-5" />
                {t('approve')}
              </button>
              <button
                onClick={() => setSelectedSubmission(null)}
                className="bg-gray-200 text-gray-700 py-4 rounded-xl hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Help Button */}
      <button className="fixed bottom-6 right-6 w-12 h-12 bg-gray-900 text-white rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors shadow-lg z-20 hover:scale-110">
        <HelpCircle className="w-6 h-6" />
      </button>
    </div>
  );
}
