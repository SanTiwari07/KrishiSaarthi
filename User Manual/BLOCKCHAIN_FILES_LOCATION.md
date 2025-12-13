# Blockchain Files Location Guide

## 📁 Project Structure

```
KrishiSaarthi_Blockchain_withmarketplace/
│
├── blockchain/                          ← Main blockchain folder
│   ├── README.md                       
│   │
│   ├── remix_ide_data/                  ← Smart Contracts (Solidity)
│   │   ├── contracts/                  ← Smart contract source files
│   │   │   ├── SaarthiCoin.sol         ← ERC20 Token Contract
│   │   │   ├── ProjectRegistry.sol     ← Project Management Contract
│   │   │   └── SaarthiMarketplace.sol  ← Marketplace Contract
│   │   │
│   │   ├── artifacts/                  ← Compiled contracts
│   │   │   ├── SaarthiCoin.json
│   │   │   ├── ProjectRegistry.json
│   │   │   └── SaarthiMarketplace.json
│   │   │
│   │   ├── scripts/                    ← Deployment scripts
│   │   │   ├── deploy_with_ethers.ts
│   │   │   └── ethers-lib.ts
│   │   │
│   │   └── tests/                      ← Test files
│   │       ├── Ballot_test.sol
│   │       └── storage.test.js
│   │
│   └── vsc_data/                       ← Blockchain test frontend
│       ├── src/
│       │   ├── App.jsx                 ← Test UI for contracts
│       │   └── contracts.js            ← Contract addresses & ABIs
│       └── package.json
│
└── UI_AND_Other_Stuff/
    └── Frontend/
        └── src/
            ├── services/                ← Frontend blockchain integration
            │   ├── blockchain.ts        ← Blockchain service functions
            │   └── contracts.ts         ← Contract addresses & ABIs
            │
            ├── types/
            │   └── ethereum.d.ts        ← TypeScript declarations
            │
            └── components/
                ├── GreenCredit.tsx      ← Farmer component (blockchain integrated)
                ├── ValidatorDashboard.tsx ← Validator component (blockchain integrated)
                └── BuyerDashboard.tsx   ← Buyer component (blockchain integrated)
```

---

## 🔍 Detailed File Locations

### 1. Smart Contracts (Solidity Source Files)

**Location**: `blockchain/remix_ide_data/contracts/`

- **`SaarthiCoin.sol`**
  - Path: `blockchain/remix_ide_data/contracts/SaarthiCoin.sol`
  - Purpose: ERC20 token representing green credits
  - Functions: Mint tokens to farmers

- **`ProjectRegistry.sol`**
  - Path: `blockchain/remix_ide_data/contracts/ProjectRegistry.sol`
  - Purpose: Manages farmers, validators, and projects
  - Functions: Register farmers, create projects, verify and mint

- **`SaarthiMarketplace.sol`**
  - Path: `blockchain/remix_ide_data/contracts/SaarthiMarketplace.sol`
  - Purpose: Marketplace for buying/selling green credits
  - Functions: Create listings, buy credits, cancel listings

### 2. Compiled Contracts (ABIs & Metadata)

**Location**: `blockchain/remix_ide_data/artifacts/`

- `SaarthiCoin.json` - Compiled token contract
- `ProjectRegistry.json` - Compiled registry contract
- `SaarthiMarketplace.json` - Compiled marketplace contract

### 3. Frontend Blockchain Integration

**Location**: `UI_AND_Other_Stuff/Frontend/src/services/`

- **`blockchain.ts`**
  - Path: `UI_AND_Other_Stuff/Frontend/src/services/blockchain.ts`
  - Purpose: All blockchain interaction functions
  - Contains: Wallet connection, project creation, verification, marketplace operations

- **`contracts.ts`**
  - Path: `UI_AND_Other_Stuff/Frontend/src/services/contracts.ts`
  - Purpose: Contract addresses and ABIs
  - Contains: 
    - Contract addresses (Token, Registry, Marketplace)
    - Contract ABIs (Application Binary Interfaces)

### 4. TypeScript Declarations

**Location**: `UI_AND_Other_Stuff/Frontend/src/types/`

- **`ethereum.d.ts`**
  - Path: `UI_AND_Other_Stuff/Frontend/src/types/ethereum.d.ts`
  - Purpose: TypeScript type definitions for MetaMask

### 5. Integrated Components

**Location**: `UI_AND_Other_Stuff/Frontend/src/components/`

- **`GreenCredit.tsx`**
  - Path: `UI_AND_Other_Stuff/Frontend/src/components/GreenCredit.tsx`
  - Purpose: Farmer interface for submitting activities
  - Blockchain: Creates projects, shows balance

- **`ValidatorDashboard.tsx`**
  - Path: `UI_AND_Other_Stuff/Frontend/src/components/ValidatorDashboard.tsx`
  - Purpose: Validator interface for verifying projects
  - Blockchain: Verifies projects, mints tokens

- **`BuyerDashboard.tsx`**
  - Path: `UI_AND_Other_Stuff/Frontend/src/components/BuyerDashboard.tsx`
  - Purpose: Buyer interface for purchasing credits
  - Blockchain: Browses marketplace, purchases credits

### 6. Blockchain Test App

**Location**: `blockchain/vsc_data/`

- **`src/App.jsx`** - Test UI for interacting with contracts
- **`src/contracts.js`** - Contract configuration for test app

---

## 📝 Quick Reference

### To View Smart Contracts:
```
blockchain/remix_ide_data/contracts/
  ├── SaarthiCoin.sol
  ├── ProjectRegistry.sol
  └── SaarthiMarketplace.sol
```

### To Update Contract Addresses:
```
UI_AND_Other_Stuff/Frontend/src/services/contracts.ts
```

### To Modify Blockchain Functions:
```
UI_AND_Other_Stuff/Frontend/src/services/blockchain.ts
```

### To Edit UI Components:
```
UI_AND_Other_Stuff/Frontend/src/components/
  ├── GreenCredit.tsx
  ├── ValidatorDashboard.tsx
  └── BuyerDashboard.tsx
```

---

## 🛠️ Common Tasks

### Update Contract Addresses
1. Open: `UI_AND_Other_Stuff/Frontend/src/services/contracts.ts`
2. Update the addresses:
   ```typescript
   export const TOKEN_ADDRESS = "0x...";
   export const REGISTRY_ADDRESS = "0x...";
   export const MARKETPLACE_ADDRESS = "0x...";
   ```

### View Smart Contract Code
1. Open: `blockchain/remix_ide_data/contracts/`
2. Open any `.sol` file in a text editor

### Modify Blockchain Functions
1. Open: `UI_AND_Other_Stuff/Frontend/src/services/blockchain.ts`
2. Edit the functions as needed

### Deploy New Contracts
1. Use Remix IDE or Hardhat
2. Deploy from: `blockchain/remix_ide_data/contracts/`
3. Update addresses in: `UI_AND_Other_Stuff/Frontend/src/services/contracts.ts`

---

## 📂 File Count Summary

- **Smart Contracts**: 3 files (.sol)
- **Compiled Contracts**: 3 files (.json)
- **Frontend Services**: 2 files (.ts)
- **Type Definitions**: 1 file (.d.ts)
- **Integrated Components**: 3 files (.tsx)
- **Test App**: 2 files (.jsx, .js)

**Total Blockchain-related files**: ~14 files

---

## 🔗 Related Files

- **Package.json** (with ethers.js):
  - `UI_AND_Other_Stuff/Frontend/package.json`

- **Documentation**:
  - `UI_AND_Other_Stuff/BLOCKCHAIN_INTEGRATION.md` (if exists)

---

## 💡 Tips

1. **Smart Contracts** are in the `blockchain/` folder
2. **Frontend Integration** is in `UI_AND_Other_Stuff/Frontend/src/services/`
3. **Contract Addresses** are in `contracts.ts` - update these when deploying new contracts
4. **All blockchain functions** are centralized in `blockchain.ts`

---

## 🚀 Quick Access Commands

### View Smart Contracts:
```bash
cd blockchain/remix_ide_data/contracts
ls *.sol
```

### View Frontend Services:
```bash
cd UI_AND_Other_Stuff/Frontend/src/services
ls *.ts
```

### Edit Contract Addresses:
```bash
# Windows
notepad UI_AND_Other_Stuff\Frontend\src\services\contracts.ts

# Mac/Linux
nano UI_AND_Other_Stuff/Frontend/src/services/contracts.ts
```

