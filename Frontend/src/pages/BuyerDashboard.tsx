import React, { useState } from 'react';
import { useBlockchain } from '../contexts/BlockchainContext';
import { useApp } from '../contexts/AppContext';
import {
    BlockchainState,
    getAllListings,
    buyFromMarketplace,
    Listing
} from '../services/blockchain';
import { ShoppingCart, Leaf, Droplets, Wind, Filter, Wallet, Loader2, Coins, RefreshCw } from 'lucide-react';

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
    const { t } = useApp();
    const { state: blockchainState, connect: connectWallet, isConnecting } = useBlockchain();

    const [marketplaceCredits, setMarketplaceCredits] = useState<Credit[]>([]);
    const [loading, setLoading] = useState(false);
    const [buyingId, setBuyingId] = useState<number | null>(null);

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

        } catch (err) {
            console.error("Failed to load listings", err);
            // Fallback to stored listings on error + mocks
            const storedListings = JSON.parse(localStorage.getItem('demoListings') || '[]');
            setMarketplaceCredits([...storedListings, ...mockListings]);
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
            alert(t('success.purchase'));
            loadListings(); // Refresh
        } catch (err: any) {
            console.error("Buy failed", err);
            alert("Purchase failed: " + (err.message || err.toString()));
        } finally {
            setBuyingId(null);
        }
    };

    if (!blockchainState?.address) { // Check for account connection
        return (
            <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-[60vh] space-y-6">
                <div className="p-6 bg-blue-50 dark:bg-blue-900/20 rounded-full">
                    <ShoppingCart size={64} className="text-blue-600 dark:text-blue-400" />
                </div>
                <div className="text-center max-w-lg">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">{t('marketplace.title')}</h1>
                    <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
                        {t('marketplace.desc')}
                    </p>
                    <button
                        onClick={connectWallet}
                        disabled={isConnecting}
                        className="bg-primary text-white px-8 py-4 rounded-xl font-bold text-xl hover:bg-primary-dark transition-all shadow-lg hover:shadow-green-500/30 flex items-center gap-3 transform hover:-translate-y-1"
                    >
                        {isConnecting ? <Loader2 className="animate-spin" /> : <Wallet />}
                        {isConnecting ? t('connecting') : t('connect.wallet')}
                    </button>
                </div>
            </div>
        );
    }

    const ActivityIcon = ({ type }: { type: string }) => {
        // ... existing logic ...
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('marketplace.title')}</h1>
                    <p className="text-gray-500">{t('investFuture')}</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={loadListings}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 border border-blue-100 dark:border-blue-800 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
                    >
                        <RefreshCw size={18} className={loading && marketplaceCredits.length > 0 ? "animate-spin" : ""} />
                        {t('refresh')}
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <Filter size={18} /> {t('filter')}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {marketplaceCredits.map(credit => (
                    <div key={credit.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow">
                        <div className="h-40 bg-gray-200 dark:bg-gray-700 relative flex items-center justify-center">
                            <Leaf size={48} className="text-gray-400" />
                            <div className="absolute top-4 right-4 bg-white dark:bg-gray-800 px-3 py-1 rounded-full text-xs font-bold shadow-sm uppercase tracking-wide">
                                {t(`act.${credit.activityType.toLowerCase()}` as any) || credit.activityType}
                            </div>
                        </div>

                        <div className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="font-bold text-lg text-gray-900 dark:text-white capitalize">{t(`act.${credit.activityType.toLowerCase()}` as any) || credit.activityType} {t('credit.suffix')}</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{credit.farmerName} • {credit.location}</p>
                                </div>
                            </div>

                            <div className="space-y-3 mb-6">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500 dark:text-gray-400">{t('quantity')}</span>
                                    <span className="font-semibold dark:text-gray-200">{credit.creditAmount} {t('amount')}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500 dark:text-gray-400">{t('impact')}</span>
                                    <span className="font-semibold dark:text-gray-200 text-green-600">50kg CO2e</span>
                                </div>
                                <div className="flex justify-between text-sm items-center pt-2 border-t border-gray-100 dark:border-gray-700">
                                    <span className="text-gray-500 dark:text-gray-400">{t('price')}</span>
                                    <span className="text-2xl font-bold text-gray-900 dark:text-white">₹{credit.price || 100}</span>
                                </div>
                            </div>

                            <button
                                onClick={() => handleBuy(credit.id, credit.creditAmount)}
                                disabled={!!buyingId}
                                className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${buyingId === credit.id
                                    ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                                    : 'bg-primary text-white hover:bg-primary-dark shadow-md hover:shadow-lg transform hover:-translate-y-0.5'
                                    }`}
                            >
                                {buyingId === credit.id ? (
                                    <Loader2 className="animate-spin" />
                                ) : (
                                    <><ShoppingCart size={18} /> {t('buy')}</>
                                )}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
