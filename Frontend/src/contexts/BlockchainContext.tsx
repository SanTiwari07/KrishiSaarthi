import React, { createContext, useContext, useState, useEffect } from 'react';
import {
    connectWallet,
    isMetaMaskInstalled,
    setupAccountListener,
    setupChainListener,
    BlockchainState
} from '../services/blockchain';

// Declare window.ethereum
declare global {
    interface Window {
        ethereum?: any;
    }
}

interface BlockchainContextType {
    state: BlockchainState | null;
    isConnecting: boolean;
    error: string | null;
    connect: () => Promise<void>;
}

const BlockchainContext = createContext<BlockchainContextType | undefined>(undefined);

export function BlockchainProvider({ children }: { children: React.ReactNode }) {
    const [state, setState] = useState<BlockchainState | null>(null);
    const [isConnecting, setIsConnecting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const connect = async () => {
        if (!isMetaMaskInstalled()) {
            setError("MetaMask is not installed.");
            return;
        }

        setIsConnecting(true);
        setError(null);
        try {
            const newState = await connectWallet();
            setState(newState);
        } catch (err: any) {
            console.error("Wallet connection failed:", err);
            setError(err.message || "Failed to connect wallet");
        } finally {
            setIsConnecting(false);
        }
    };

    // Auto-connect if already connected
    useEffect(() => {
        const checkConnection = async () => {
            if (isMetaMaskInstalled() && window.ethereum?.selectedAddress) {
                connect();
            }
        };
        checkConnection();
    }, []);

    // Listeners
    useEffect(() => {
        if (state) {
            const removeAccountListener = setupAccountListener((accounts) => {
                if (accounts.length === 0) setState(null);
                else connect();
            });
            const removeChainListener = setupChainListener(() => {
                connect();
            });
            return () => {
                removeAccountListener();
                removeChainListener();
            };
        }
    }, [state]);

    return (
        <BlockchainContext.Provider value={{ state, isConnecting, error, connect }}>
            {children}
        </BlockchainContext.Provider>
    );
}

export function useBlockchain() {
    const context = useContext(BlockchainContext);
    if (context === undefined) {
        throw new Error('useBlockchain must be used within a BlockchainProvider');
    }
    return context;
}
