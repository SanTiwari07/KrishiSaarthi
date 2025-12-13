import { ethers } from 'ethers';
import {
  TOKEN_ADDRESS,
  REGISTRY_ADDRESS,
  MARKETPLACE_ADDRESS,
  TOKEN_ABI,
  REGISTRY_ABI,
  MARKETPLACE_ABI,
} from './contracts';

// Types
export interface Project {
  id: number;
  farmer: string;
  projectType: string;
  offChainHash: string;
  status: 'Pending' | 'Verified';
}

export interface Listing {
  id: number;
  seller: string;
  totalAmount: string;
  remainingAmount: string;
  active: boolean;
}

export interface BlockchainState {
  provider: ethers.providers.Web3Provider | null;
  signer: ethers.Signer | null;
  address: string | null;
  tokenContract: ethers.Contract | null;
  registryContract: ethers.Contract | null;
  marketplaceContract: ethers.Contract | null;
  isFarmer: boolean;
  isVerifier: boolean;
  isAdmin: boolean;
  tokenBalance: string;
}

// Check if MetaMask is installed
export const isMetaMaskInstalled = (): boolean => {
  return typeof window !== 'undefined' && typeof window.ethereum !== 'undefined';
};

// Helper function to check if contract exists at address
const checkContractExists = async (provider: ethers.providers.Web3Provider, address: string): Promise<boolean> => {
  try {
    const code = await provider.getCode(address);
    return code !== '0x' && code !== '0x0';
  } catch {
    return false;
  }
};

// Helper function to switch to Sepolia network
const switchToSepolia = async (): Promise<void> => {
  if (!window.ethereum) {
    throw new Error('MetaMask is not available.');
  }

  const sepoliaChainId = '0xaa36a7'; // 11155111 in hex
  const sepoliaNetwork = {
    chainId: sepoliaChainId,
    chainName: 'Sepolia',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: ['https://rpc.sepolia.org', 'https://sepolia.infura.io/v3/'],
    blockExplorerUrls: ['https://sepolia.etherscan.io'],
  };

  try {
    // Try to switch to Sepolia if it's already added
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: sepoliaChainId }],
    });
  } catch (switchError: any) {
    // This error code indicates that the chain has not been added to MetaMask
    if (switchError.code === 4902) {
      try {
        // Try to add Sepolia network
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [sepoliaNetwork],
        });
      } catch (addError) {
        throw new Error(
          `Failed to add Sepolia network. Please add it manually in MetaMask:\n` +
          `Network Name: Sepolia\n` +
          `RPC URL: https://rpc.sepolia.org\n` +
          `Chain ID: 11155111\n` +
          `Currency Symbol: ETH\n` +
          `Block Explorer: https://sepolia.etherscan.io`
        );
      }
    } else if (switchError.code === 4001) {
      // User rejected the request
      throw new Error('Please approve the network switch in MetaMask to continue.');
    } else {
      throw new Error(`Failed to switch network: ${switchError.message}`);
    }
  }
};

// Connect wallet
export const connectWallet = async (): Promise<BlockchainState> => {
  if (!isMetaMaskInstalled()) {
    throw new Error('MetaMask is not installed. Please install MetaMask to continue.');
  }

  try {
    let provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send('eth_requestAccounts', []);

    // Get network information
    const network = await provider.getNetwork();
    const networkName = network.name === 'homestead' ? 'mainnet' : network.name === 'unknown' ? `chain ${network.chainId}` : network.name;
    const expectedChainId = 11155111; // Sepolia testnet
    const isCorrectNetwork = network.chainId === expectedChainId;

    // If on wrong network, try to switch automatically
    if (!isCorrectNetwork) {
      try {
        await switchToSepolia();
        // Wait a moment for the network switch to complete
        await new Promise(resolve => setTimeout(resolve, 1000));
        // Refresh provider to get new network
        provider = new ethers.providers.Web3Provider(window.ethereum);
        const newNetwork = await provider.getNetwork();
        if (newNetwork.chainId !== expectedChainId) {
          throw new Error(
            `Please switch to Sepolia testnet (Chain ID: ${expectedChainId}) in MetaMask. ` +
            `You're currently on ${networkName} (Chain ID: ${network.chainId}).`
          );
        }
      } catch (switchError: any) {
        // If automatic switch fails, throw a helpful error
        throw new Error(
          `Wrong network detected. You're on ${networkName} (Chain ID: ${network.chainId}). ` +
          `Please switch to Sepolia testnet (Chain ID: ${expectedChainId}) in MetaMask. ` +
          `Error: ${switchError.message}`
        );
      }
    }

    const signer = provider.getSigner();
    const address = await signer.getAddress();

    // Check if contracts exist before creating contract instances
    const [tokenExists, registryExists, marketplaceExists] = await Promise.all([
      checkContractExists(provider, TOKEN_ADDRESS),
      checkContractExists(provider, REGISTRY_ADDRESS),
      checkContractExists(provider, MARKETPLACE_ADDRESS),
    ]);

    // Get updated network info after potential switch
    const currentNetwork = await provider.getNetwork();
    const currentNetworkName = currentNetwork.name === 'homestead' ? 'mainnet' : currentNetwork.name === 'unknown' ? `chain ${currentNetwork.chainId}` : currentNetwork.name;

    if (!tokenExists) {
      throw new Error(
        `Token contract not found at address ${TOKEN_ADDRESS} on ${currentNetworkName}. ` +
        `If you're on Sepolia testnet, the contract may not be deployed.`
      );
    }

    if (!registryExists) {
      throw new Error(
        `Registry contract not found at address ${REGISTRY_ADDRESS} on ${currentNetworkName}. ` +
        `If you're on Sepolia testnet, the contract may not be deployed.`
      );
    }

    if (!marketplaceExists) {
      throw new Error(
        `Marketplace contract not found at address ${MARKETPLACE_ADDRESS} on ${currentNetworkName}. ` +
        `If you're on Sepolia testnet, the contract may not be deployed.`
      );
    }

    const tokenContract = new ethers.Contract(TOKEN_ADDRESS, TOKEN_ABI, signer);
    const registryContract = new ethers.Contract(REGISTRY_ADDRESS, REGISTRY_ABI, signer);
    const marketplaceContract = new ethers.Contract(MARKETPLACE_ADDRESS, MARKETPLACE_ABI, signer);

    // Get user roles and balance with individual error handling
    let isFarmer = false;
    let isVerifier = false;
    let ownerAddr = '';
    let balance = ethers.BigNumber.from(0);

    try {
      isFarmer = await registryContract.isFarmer(address);
    } catch (error: any) {
      console.error('Error checking isFarmer:', error);
      const errorNetwork = await provider.getNetwork();
      const errorNetworkName = errorNetwork.name === 'homestead' ? 'mainnet' : errorNetwork.name === 'unknown' ? `chain ${errorNetwork.chainId}` : errorNetwork.name;
      throw new Error(
        `Failed to check farmer status. You're on ${errorNetworkName} (Chain ID: ${errorNetwork.chainId}). ` +
        `Registry contract address: ${REGISTRY_ADDRESS}. ` +
        `The contract may not be properly deployed or initialized.`
      );
    }

    try {
      isVerifier = await registryContract.isVerifier(address);
    } catch (error: any) {
      console.error('Error checking isVerifier:', error);
      // Continue with default value
      isVerifier = false;
    }

    try {
      ownerAddr = await registryContract.owner();
    } catch (error: any) {
      console.error('Error getting owner:', error);
      // Continue with empty string
      ownerAddr = '';
    }

    try {
      balance = await tokenContract.balanceOf(address);
    } catch (error: any) {
      console.error('Error getting balance:', error);
      // Continue with zero balance
      balance = ethers.BigNumber.from(0);
    }

    const isAdmin = ownerAddr.toLowerCase() === address.toLowerCase();
    const tokenBalance = ethers.utils.formatEther(balance);

    return {
      provider,
      signer,
      address,
      tokenContract,
      registryContract,
      marketplaceContract,
      isFarmer,
      isVerifier,
      isAdmin,
      tokenBalance,
    };
  } catch (error: any) {
    if (error.code === 4001) {
      throw new Error('Please connect to MetaMask.');
    }
    // If error message already contains helpful info, use it; otherwise add generic message
    if (error.message && error.message.includes('contract not found') || error.message.includes('Failed to check')) {
      throw error;
    }
    throw new Error(`Failed to connect wallet: ${error.message}`);
  }
};

// Register farmer
export const registerFarmer = async (registryContract: ethers.Contract): Promise<string> => {
  try {
    const tx = await registryContract.registerFarmer();
    await tx.wait();
    return tx.hash;
  } catch (error: any) {
    throw new Error(`Failed to register farmer: ${error.message}`);
  }
};

// Add verifier (admin only)
export const addVerifier = async (
  registryContract: ethers.Contract,
  verifierAddress: string
): Promise<string> => {
  try {
    // First, check if the caller is the owner
    const owner = await registryContract.owner();
    const signer = registryContract.signer;
    const signerAddress = await signer.getAddress();
    
    if (owner.toLowerCase() !== signerAddress.toLowerCase()) {
      throw new Error(
        `Permission Denied: Only the contract owner can add validators.\n\n` +
        `Your address: ${signerAddress}\n` +
        `Contract owner: ${owner}\n\n` +
        `Please switch to the admin wallet in MetaMask to add validators.`
      );
    }
    
    const tx = await registryContract.addVerifier(verifierAddress);
    await tx.wait();
    return tx.hash;
  } catch (error: any) {
    // Check for "Not owner" error in various formats
    const errorMessage = error.message || '';
    const errorData = error.data || error.error?.data || '';
    
    if (
      errorMessage.includes('Not owner') || 
      errorMessage.includes('execution reverted: Not owner') ||
      errorMessage.includes('Not owner') ||
      errorData.includes('4e6f74206f776e6572') || // "Not owner" in hex
      error.code === 'UNPREDICTABLE_GAS_LIMIT' && errorMessage.includes('Not owner')
    ) {
      // Get owner address for better error message
      let ownerAddress = 'unknown';
      try {
        ownerAddress = await registryContract.owner();
      } catch {}
      
      throw new Error(
        `❌ Permission Denied: Only the contract owner can add validators.\n\n` +
        `Your address: ${await registryContract.signer.getAddress()}\n` +
        `Required owner address: ${ownerAddress}\n\n` +
        `To add validators:\n` +
        `1. Switch to the admin wallet (${ownerAddress}) in MetaMask\n` +
        `2. Refresh this page and connect with the admin wallet\n` +
        `3. Use the Administrator Panel to add validators`
      );
    }
    
    throw new Error(`Failed to add verifier: ${error.message}`);
  }
};

// Create project
export const createProject = async (
  registryContract: ethers.Contract,
  projectType: string,
  offChainHash: string
): Promise<{ txHash: string; projectId: number }> => {
  try {
    const tx = await registryContract.createProject(projectType, offChainHash);
    const receipt = await tx.wait();
    
    // Get project ID from event
    const event = receipt.events?.find((e: any) => e.event === 'ProjectCreated');
    const projectId = event?.args?.projectId?.toNumber() ?? -1;
    
    return { txHash: tx.hash, projectId };
  } catch (error: any) {
    throw new Error(`Failed to create project: ${error.message}`);
  }
};

// Verify project and mint tokens
export const verifyAndMint = async (
  registryContract: ethers.Contract,
  projectId: number,
  amount: number
): Promise<string> => {
  try {
    const amountInWei = ethers.utils.parseEther(amount.toString());
    const tx = await registryContract.verifyAndMint(projectId, amountInWei);
    await tx.wait();
    return tx.hash;
  } catch (error: any) {
    throw new Error(`Failed to verify and mint: ${error.message}`);
  }
};

// Get all projects
export const getAllProjects = async (registryContract: ethers.Contract): Promise<Project[]> => {
  try {
    const count = await registryContract.getProjectsCount();
    const projects: Project[] = [];

    for (let i = 0; i < count.toNumber(); i++) {
      const project = await registryContract.projects(i);
      projects.push({
        id: i,
        farmer: project.farmer,
        projectType: project.projectType,
        offChainHash: project.offChainHash,
        status: project.status === 0 ? 'Pending' : 'Verified',
      });
    }

    return projects;
  } catch (error: any) {
    throw new Error(`Failed to fetch projects: ${error.message}`);
  }
};

// Get farmer's projects
export const getFarmerProjects = async (
  registryContract: ethers.Contract,
  farmerAddress: string
): Promise<Project[]> => {
  try {
    const allProjects = await getAllProjects(registryContract);
    return allProjects.filter((p) => p.farmer.toLowerCase() === farmerAddress.toLowerCase());
  } catch (error: any) {
    throw new Error(`Failed to fetch farmer projects: ${error.message}`);
  }
};

// Get token balance
export const getTokenBalance = async (
  tokenContract: ethers.Contract,
  address: string
): Promise<string> => {
  try {
    const balance = await tokenContract.balanceOf(address);
    return ethers.utils.formatEther(balance);
  } catch (error: any) {
    throw new Error(`Failed to fetch balance: ${error.message}`);
  }
};

// Approve tokens for marketplace
export const approveTokens = async (
  tokenContract: ethers.Contract,
  marketplaceAddress: string,
  amount: number
): Promise<string> => {
  try {
    const amountInWei = ethers.utils.parseEther(amount.toString());
    const tx = await tokenContract.approve(marketplaceAddress, amountInWei);
    await tx.wait();
    return tx.hash;
  } catch (error: any) {
    throw new Error(`Failed to approve tokens: ${error.message}`);
  }
};

// Create marketplace listing
export const createListing = async (
  marketplaceContract: ethers.Contract,
  amount: number
): Promise<string> => {
  try {
    const amountInWei = ethers.utils.parseEther(amount.toString());
    const tx = await marketplaceContract.createListing(amountInWei);
    await tx.wait();
    return tx.hash;
  } catch (error: any) {
    throw new Error(`Failed to create listing: ${error.message}`);
  }
};

// Buy from marketplace
export const buyFromMarketplace = async (
  marketplaceContract: ethers.Contract,
  listingId: number,
  amount: number
): Promise<string> => {
  try {
    const amountInWei = ethers.utils.parseEther(amount.toString());
    const tx = await marketplaceContract.buy(listingId, amountInWei);
    await tx.wait();
    return tx.hash;
  } catch (error: any) {
    throw new Error(`Failed to buy from marketplace: ${error.message}`);
  }
};

// Get all listings
export const getAllListings = async (marketplaceContract: ethers.Contract): Promise<Listing[]> => {
  try {
    const count = await marketplaceContract.getListingsCount();
    const listings: Listing[] = [];

    for (let i = 0; i < count.toNumber(); i++) {
      const listing = await marketplaceContract.listings(i);
      listings.push({
        id: i,
        seller: listing.seller,
        totalAmount: ethers.utils.formatEther(listing.totalAmount),
        remainingAmount: ethers.utils.formatEther(listing.remainingAmount),
        active: listing.active,
      });
    }

    return listings;
  } catch (error: any) {
    throw new Error(`Failed to fetch listings: ${error.message}`);
  }
};

// Listen for account changes
export const setupAccountListener = (
  callback: (accounts: string[]) => void
): (() => void) => {
  if (!isMetaMaskInstalled() || !window.ethereum) {
    return () => {};
  }

  window.ethereum.on('accountsChanged', callback);

  return () => {
    if (window.ethereum) {
      window.ethereum.removeListener('accountsChanged', callback);
    }
  };
};

// Listen for chain changes
export const setupChainListener = (callback: (chainId: string) => void): (() => void) => {
  if (!isMetaMaskInstalled() || !window.ethereum) {
    return () => {};
  }

  window.ethereum.on('chainChanged', callback);

  return () => {
    if (window.ethereum) {
      window.ethereum.removeListener('chainChanged', callback);
    }
  };
};

