import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import Header from './Header';
import { ShoppingCart, Leaf, TrendingUp, HelpCircle, CheckCircle, MapPin, Filter, Wallet, Loader2, AlertCircle } from 'lucide-react';
import {
  connectWallet,
  getAllListings,
  buyFromMarketplace,
  getTokenBalance,
  isMetaMaskInstalled,
  setupAccountListener,
  setupChainListener,
  type BlockchainState,
  type Listing,
} from '../services/blockchain';

type View = 'purchase' | 'marketplace';

interface CreditListing {
  id: number;
  seller: string;
  totalAmount: string;
  remainingAmount: string;
  active: boolean;
  pricePerCredit?: number; // This would come from off-chain data
}

export default function BuyerDashboard() {
  const navigate = useNavigate();
  const { t, user } = useApp();
  const [view, setView] = useState<View>('purchase');
  const [selectedQuantity, setSelectedQuantity] = useState<number>(0);
  const [customQuantity, setCustomQuantity] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('all');
  const [showReceipt, setShowReceipt] = useState(false);
  const [purchasedCredits, setPurchasedCredits] = useState(0);
  
  // Blockchain state
  const [blockchainState, setBlockchainState] = useState<BlockchainState | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [listings, setListings] = useState<CreditListing[]>([]);
  const [tokenBalance, setTokenBalance] = useState('0');
  const [buyAmounts, setBuyAmounts] = useState<Record<number, string>>({});
  
  const quickQuantities = [10, 20, 50, 100];
  
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
      await loadMarketplaceData(state);
    } catch (err: any) {
      setError(err.message || 'Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  };

  // Load marketplace data
  const loadMarketplaceData = async (state: BlockchainState) => {
    if (!state.marketplaceContract || !state.tokenContract || !state.address) return;

    setIsLoading(true);
    try {
      const [marketplaceListings, balance] = await Promise.all([
        getAllListings(state.marketplaceContract),
        getTokenBalance(state.tokenContract, state.address),
      ]);

      // Convert blockchain listings to CreditListing format
      const listingsData: CreditListing[] = marketplaceListings
        .filter(listing => listing.active && parseFloat(listing.remainingAmount) > 0)
        .map((listing) => ({
          id: listing.id,
          seller: listing.seller,
          totalAmount: listing.totalAmount,
          remainingAmount: listing.remainingAmount,
          active: listing.active,
          pricePerCredit: 60, // Default price, in production this would come from off-chain data
        }));

      setListings(listingsData);
      setTokenBalance(parseFloat(balance).toFixed(2));
    } catch (err: any) {
      setError(`Failed to load marketplace: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Load data when wallet is connected
  useEffect(() => {
    if (blockchainState) {
      loadMarketplaceData(blockchainState);
    }
  }, [blockchainState?.address]);

  // Setup account and chain listeners
  useEffect(() => {
    if (!isMetaMaskInstalled()) return;

    const removeAccountListener = setupAccountListener(async (accounts) => {
      if (accounts.length === 0) {
        setBlockchainState(null);
        setListings([]);
        setTokenBalance('0');
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
  
  const handlePurchase = async (listing: CreditListing) => {
    if (!blockchainState || !blockchainState.marketplaceContract) {
      setError('Please connect your wallet first');
      return;
    }

    const amountStr = buyAmounts[listing.id] || listing.remainingAmount;
    const amount = parseFloat(amountStr);
    
    if (amount <= 0 || amount > parseFloat(listing.remainingAmount)) {
      setError('Invalid purchase amount');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const txHash = await buyFromMarketplace(
        blockchainState.marketplaceContract,
        listing.id,
        amount
      );

      setPurchasedCredits(amount);
      setShowReceipt(true);
      setSuccess(`Purchase successful! Transaction: ${txHash.substring(0, 10)}...`);
      
      // Clear buy amount
      setBuyAmounts({ ...buyAmounts, [listing.id]: '' });
      
      // Reload marketplace data
      await loadMarketplaceData(blockchainState);
      
      setTimeout(() => setSuccess(null), 5000);
    } catch (err: any) {
      setError(err.message || 'Failed to purchase credits');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleBulkPurchase = () => {
    // For bulk purchase, we would need to implement a different flow
    // This could involve creating a new listing or using a different contract method
    setError('Bulk purchase feature coming soon. Please use the marketplace to purchase from existing listings.');
  };
  
  const filteredListings = filterType === 'all' 
    ? listings 
    : listings; // In production, filter by activity type from off-chain data
  
  const activityTypes = ['all']; // In production, get from off-chain data
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <Header />
      
      {/* Wallet Connection Banner */}
      {!blockchainState && (
        <div className="bg-yellow-50 border-b border-yellow-200">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
              <p className="text-yellow-800">Please connect your wallet to purchase credits</p>
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
      
      {/* View Toggle */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4">
          <div className="flex">
            <button
              onClick={() => setView('purchase')}
              className={`flex-1 py-4 transition-colors ${
                view === 'purchase'
                  ? 'text-green-600 border-b-4 border-green-600'
                  : 'text-gray-600 hover:text-green-600'
              }`}
            >
              {t('purchase.credits')}
            </button>
            <button
              onClick={() => setView('marketplace')}
              className={`flex-1 py-4 transition-colors ${
                view === 'marketplace'
                  ? 'text-green-600 border-b-4 border-green-600'
                  : 'text-gray-600 hover:text-green-600'
              }`}
            >
              {t('marketplace')} {listings.length > 0 && `(${listings.length})`}
            </button>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-12">
        {/* Purchase Credits View */}
        {view === 'purchase' && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-3xl shadow-2xl p-8">
              <div className="text-center mb-8">
                <ShoppingCart className="w-16 h-16 text-green-600 mx-auto mb-4" />
                <h3 className="text-gray-900 mb-2">{t('purchase.credits')}</h3>
                <p className="text-gray-600">Select how many credits you'd like to purchase</p>
                {blockchainState && (
                  <p className="text-green-600 mt-2">Your Balance: {tokenBalance} Credits</p>
                )}
              </div>
              
              {!blockchainState ? (
                <div className="text-center py-8">
                  <Wallet className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">Connect your wallet to purchase credits</p>
                  <button
                    onClick={handleConnectWallet}
                    disabled={isConnecting || !isMetaMaskInstalled()}
                    className="bg-green-600 text-white px-8 py-4 rounded-xl hover:bg-green-700 transition-colors disabled:bg-gray-300"
                  >
                    {isConnecting ? 'Connecting...' : 'Connect Wallet'}
                  </button>
                </div>
              ) : (
                <>
                  {/* Quick Select */}
                  <div className="mb-6">
                    <p className="text-gray-700 mb-4">Quick Select</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {quickQuantities.map((qty) => (
                        <button
                          key={qty}
                          onClick={() => {
                            setSelectedQuantity(qty);
                            setCustomQuantity('');
                          }}
                          className={`py-6 rounded-xl border-2 transition-all ${
                            selectedQuantity === qty
                              ? 'border-green-500 bg-green-50'
                              : 'border-gray-200 hover:border-green-300'
                          }`}
                        >
                          <div className="text-green-600 mb-1">{qty}</div>
                          <div className="text-gray-500">Credits</div>
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Custom Amount */}
                  <div className="mb-6">
                    <p className="text-gray-700 mb-4">Or enter custom amount</p>
                    <input
                      type="number"
                      value={customQuantity}
                      onChange={(e) => {
                        setCustomQuantity(e.target.value);
                        setSelectedQuantity(0);
                      }}
                      placeholder="Enter number of credits..."
                      className="w-full px-4 py-5 rounded-xl border-2 border-gray-200 focus:border-green-500 outline-none transition-colors"
                    />
                  </div>
                  
                  {/* Price Estimate */}
                  {(selectedQuantity > 0 || customQuantity) && (
                    <div className="bg-green-50 rounded-2xl p-6 mb-6">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-700">Credits</span>
                        <span className="text-gray-900">{customQuantity || selectedQuantity}</span>
                      </div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-700">Price per credit</span>
                        <span className="text-gray-900">₹60</span>
                      </div>
                      <div className="border-t border-green-200 my-3"></div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-900">Total Amount</span>
                        <span className="text-green-700">₹{(customQuantity ? parseInt(customQuantity) : selectedQuantity) * 60}</span>
                      </div>
                    </div>
                  )}
                  
                  {/* Purchase Button */}
                  <button
                    onClick={handleBulkPurchase}
                    disabled={!selectedQuantity && !customQuantity}
                    className="w-full bg-green-600 text-white py-5 rounded-2xl hover:bg-green-700 transition-colors shadow-lg disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    Purchase Credits
                  </button>
                  
                  <p className="text-center text-gray-500 text-sm mt-4">
                    Or browse the marketplace below to purchase from farmers
                  </p>
                </>
              )}
            </div>
          </div>
        )}
        
        {/* Marketplace View */}
        {view === 'marketplace' && (
          <div className="max-w-6xl mx-auto">
            {!blockchainState ? (
              <div className="bg-white rounded-3xl shadow-2xl p-12 text-center">
                <Wallet className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-gray-900 mb-2">Connect Your Wallet</h3>
                <p className="text-gray-600 mb-6">
                  Please connect your wallet to browse the marketplace
                </p>
                <button
                  onClick={handleConnectWallet}
                  disabled={isConnecting || !isMetaMaskInstalled()}
                  className="bg-green-600 text-white px-8 py-4 rounded-xl hover:bg-green-700 transition-colors disabled:bg-gray-300"
                >
                  {isConnecting ? 'Connecting...' : 'Connect Wallet'}
                </button>
              </div>
            ) : isLoading ? (
              <div className="bg-white rounded-3xl shadow-2xl p-12 text-center">
                <Loader2 className="w-16 h-16 text-green-600 mx-auto mb-4 animate-spin" />
                <p className="text-gray-600">Loading marketplace...</p>
              </div>
            ) : listings.length === 0 ? (
              <div className="bg-white rounded-3xl shadow-lg p-12 text-center">
                <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-gray-600">No listings available</h3>
                <p className="text-gray-400">Check back later for new credit listings</p>
              </div>
            ) : (
              <>
                {/* Filters */}
                <div className="mb-8 bg-white rounded-2xl shadow-md p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Filter className="w-5 h-5 text-gray-600" />
                    <h4 className="text-gray-900">Filter by Activity Type</h4>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {activityTypes.map((type) => (
                      <button
                        key={type}
                        onClick={() => setFilterType(type)}
                        className={`px-4 py-2 rounded-full transition-all ${
                          filterType === type
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {type === 'all' ? 'All' : type}
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Listings */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredListings.map((listing) => (
                    <div key={listing.id} className="bg-white rounded-3xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow">
                      {/* Content */}
                      <div className="p-6">
                        <div className="flex items-center gap-2 mb-3">
                          <Leaf className="w-5 h-5 text-green-600" />
                          <h4 className="text-gray-900">Green Credits</h4>
                        </div>
                        
                        <p className="text-gray-700 mb-2 font-mono text-sm">
                          Seller: {listing.seller.substring(0, 6)}...{listing.seller.substring(38)}
                        </p>
                        
                        <div className="bg-green-50 rounded-xl p-4 mb-4">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-gray-600">Available Credits</span>
                            <span className="text-green-700 font-semibold">{parseFloat(listing.remainingAmount).toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Total Listed</span>
                            <span className="text-gray-900">{parseFloat(listing.totalAmount).toFixed(2)}</span>
                          </div>
                        </div>
                        
                        {/* Purchase Amount Input */}
                        <div className="mb-4">
                          <label className="block text-gray-700 mb-2 text-sm">Amount to Purchase</label>
                          <input
                            type="number"
                            value={buyAmounts[listing.id] || ''}
                            onChange={(e) => setBuyAmounts({ ...buyAmounts, [listing.id]: e.target.value })}
                            placeholder={`Max: ${listing.remainingAmount}`}
                            min="0"
                            max={listing.remainingAmount}
                            step="0.01"
                            className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-green-500 outline-none"
                          />
                        </div>
                        
                        <button
                          onClick={() => handlePurchase(listing)}
                          disabled={isLoading || !buyAmounts[listing.id] || parseFloat(buyAmounts[listing.id] || '0') <= 0 || parseFloat(buyAmounts[listing.id] || '0') > parseFloat(listing.remainingAmount)}
                          className="w-full bg-green-600 text-white py-4 rounded-xl hover:bg-green-700 transition-colors flex items-center justify-center gap-2 disabled:bg-gray-300 disabled:cursor-not-allowed"
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="w-5 h-5 animate-spin" />
                              <span>Processing...</span>
                            </>
                          ) : (
                            <>
                              <ShoppingCart className="w-5 h-5" />
                              <span>{t('buy')}</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>
      
      {/* Receipt Modal */}
      {showReceipt && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setShowReceipt(false)}
        >
          <div className="max-w-md w-full bg-white rounded-3xl p-8" onClick={(e) => e.stopPropagation()}>
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
              <h3 className="text-green-700 mb-2">Purchase Successful!</h3>
              <p className="text-gray-600">Your green credits have been added to your wallet</p>
            </div>
            
            <div className="bg-green-50 rounded-2xl p-6 mb-6">
              <div className="flex justify-between items-center mb-3">
                <span className="text-gray-700">Credits Purchased</span>
                <span className="text-green-700 font-semibold">{purchasedCredits.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-gray-700">Your New Balance</span>
                <span className="text-green-700 font-semibold">{tokenBalance} Credits</span>
              </div>
            </div>
            
            <div className="space-y-3">
              <button
                onClick={() => {
                  setShowReceipt(false);
                  if (blockchainState) {
                    loadMarketplaceData(blockchainState);
                  }
                }}
                className="w-full bg-green-600 text-white py-4 rounded-xl hover:bg-green-700 transition-colors"
              >
                Continue Shopping
              </button>
              <button
                onClick={() => setShowReceipt(false)}
                className="w-full bg-gray-200 text-gray-700 py-4 rounded-xl hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
