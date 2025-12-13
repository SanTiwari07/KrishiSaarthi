# Blockchain Integration Summary

## Overview
Successfully integrated blockchain functionality with the Green Credit system using Ethereum smart contracts. The integration connects the frontend UI with the deployed smart contracts for managing green credits, project verification, and marketplace transactions.

## What Was Done

### 1. Dependencies Added
- **ethers.js v5.7.2**: Added to `package.json` for blockchain interactions

### 2. New Files Created

#### `src/services/contracts.ts`
- Contains contract addresses (Token, Registry, Marketplace)
- Contains contract ABIs (Application Binary Interfaces)
- **Note**: Update contract addresses if deploying to a different network

#### `src/services/blockchain.ts`
- Complete blockchain service module with functions for:
  - Wallet connection (MetaMask)
  - Farmer registration
  - Project creation
  - Project verification and token minting
  - Marketplace operations (listings, purchases)
  - Data fetching (projects, listings, balances)
  - Event listeners for account/chain changes

#### `src/types/ethereum.d.ts`
- TypeScript declarations for MetaMask `window.ethereum` object

### 3. Components Updated

#### `GreenCredit.tsx` (Farmer Component)
**New Features:**
- Wallet connection button and status display
- Real-time token balance from blockchain
- Submit activities that create projects on blockchain
- Fetch and display projects from blockchain
- Transaction status indicators
- Error handling and loading states

**User Flow:**
1. Farmer connects MetaMask wallet
2. Automatically registers as farmer (if not already)
3. Submits activity → Creates project on blockchain
4. Views activities with real blockchain status
5. Sees real token balance

#### `ValidatorDashboard.tsx` (Validator Component)
**New Features:**
- Wallet connection for validators
- Fetch all pending projects from blockchain
- Verify projects and mint tokens to farmers
- Enter credit amount when approving
- View verified projects history
- Real-time project status updates

**User Flow:**
1. Validator connects MetaMask wallet
2. Views pending projects from blockchain
3. Enters credit amount and approves → Mints tokens to farmer
4. Views verification history

#### `BuyerDashboard.tsx` (Buyer Component)
**New Features:**
- Wallet connection for buyers
- Browse active marketplace listings from blockchain
- Purchase credits from marketplace
- Real-time token balance display
- Transaction receipts

**User Flow:**
1. Buyer connects MetaMask wallet
2. Browses marketplace listings
3. Enters purchase amount
4. Purchases credits → Tokens transferred on blockchain
5. Receives transaction confirmation

## Smart Contracts Used

1. **SaarthiCoin (ERC20 Token)**
   - Represents green credits
   - Minted to farmers when projects are verified

2. **ProjectRegistry**
   - Manages farmers and validators
   - Tracks green projects
   - Handles project verification and token minting

3. **SaarthiMarketplace**
   - Allows farmers to list credits for sale
   - Enables buyers to purchase credits

## Contract Addresses

Current addresses (Sepolia testnet):
- `TOKEN_ADDRESS`: `0x6b5f2E75Ea4FbceB5A58787CB4425c821500645d`
- `REGISTRY_ADDRESS`: `0x2a1Df2663e9918E328bF8E9616345e3BA0ebcB53`
- `MARKETPLACE_ADDRESS`: `0x8FAdBaD360CAbB5d7d6edd757029292C800752D3`

**⚠️ Important**: Update these addresses in `src/services/contracts.ts` if deploying to a different network or using different contracts.

## Setup Instructions

### 1. Install Dependencies
```bash
cd UI_AND_Other_Stuff/Frontend
npm install
```

### 2. Configure Network
- Ensure MetaMask is connected to the correct network (Sepolia testnet by default)
- Update contract addresses in `src/services/contracts.ts` if needed

### 3. Run Development Server
```bash
npm run dev
```

## Usage Guide

### For Farmers
1. Navigate to Green Credit page
2. Click "Connect Wallet" and approve MetaMask connection
3. Submit activities with images and descriptions
4. Activities are created as projects on blockchain
5. View status and earned credits

### For Validators
1. Navigate to Validator Dashboard
2. Connect wallet (must be registered as validator)
3. View pending projects
4. Enter credit amount and approve projects
5. Tokens are automatically minted to farmers

### For Buyers
1. Navigate to Buyer Dashboard
2. Connect wallet
3. Browse marketplace listings
4. Enter purchase amount and buy credits
5. Credits are transferred to your wallet

## Features Implemented

✅ Wallet connection (MetaMask)
✅ Farmer registration on blockchain
✅ Project creation on blockchain
✅ Project verification and token minting
✅ Real-time balance display
✅ Marketplace integration
✅ Transaction status tracking
✅ Error handling
✅ Loading states
✅ Account/chain change listeners
✅ TypeScript type safety

## Important Notes

1. **Image Storage**: Currently, images are stored locally. In production, consider:
   - Uploading to IPFS
   - Storing IPFS hash in `offChainHash` field
   - Or using a backend service for image storage

2. **Network Configuration**: The contracts are deployed on Sepolia testnet. For production:
   - Deploy contracts to mainnet or desired network
   - Update contract addresses
   - Update RPC endpoints if needed

3. **Gas Fees**: All blockchain transactions require gas fees. Users need ETH in their wallet for:
   - Creating projects
   - Verifying projects
   - Purchasing credits

4. **Error Handling**: The integration includes comprehensive error handling for:
   - Wallet not installed
   - Transaction rejections
   - Network errors
   - Invalid inputs

## Testing

To test the integration:
1. Install MetaMask browser extension
2. Connect to Sepolia testnet
3. Get test ETH from a faucet
4. Test each user role (farmer, validator, buyer)
5. Verify transactions on Etherscan

## Future Enhancements

- IPFS integration for image storage
- Off-chain metadata storage (farmer names, locations, etc.)
- Price discovery mechanism for marketplace
- Credit history and analytics
- Batch operations for validators
- Mobile wallet support (WalletConnect)

## Troubleshooting

**"MetaMask is not installed"**
- Install MetaMask browser extension

**"Transaction failed"**
- Check if wallet has enough ETH for gas
- Verify network is correct
- Check contract addresses are correct

**"Not registered as validator"**
- Contact admin to add wallet address as validator

**"Failed to connect wallet"**
- Check MetaMask is unlocked
- Approve connection request
- Check network is correct

