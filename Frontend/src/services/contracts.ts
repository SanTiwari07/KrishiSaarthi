// Contract addresses - Update these with your deployed contract addresses
export const TOKEN_ADDRESS = "0x6b5f2E75Ea4FbceB5A58787CB4425c821500645d";
export const REGISTRY_ADDRESS = "0x2a1Df2663e9918E328bF8E9616345e3BA0ebcB53";
export const MARKETPLACE_ADDRESS = "0x8FAdBaD360CAbB5d7d6edd757029292C800752D3";

// ERC-20 token ABI (minimal)
export const TOKEN_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function balanceOf(address) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)"
];

// ProjectRegistry ABI
export const REGISTRY_ABI = [
  "function isFarmer(address) view returns (bool)",
  "function isVerifier(address) view returns (bool)",
  "function owner() view returns (address)",
  "function registerFarmer()",
  "function addVerifier(address v)",
  "function createProject(string projectType, string offChainHash)",
  "function verifyAndMint(uint256 projectId, uint256 amount)",
  "function getProjectsCount() view returns (uint256)",
  "function projects(uint256) view returns (address farmer, string projectType, string offChainHash, uint8 status)",
  "event ProjectCreated(uint indexed projectId, address farmer)",
  "event ProjectVerified(uint indexed projectId, address farmer, uint256 amount)",
  "event FarmerRegistered(address farmer)"
];

// Marketplace ABI
export const MARKETPLACE_ABI = [
  "function createListing(uint256 amount)",
  "function buy(uint256 listingId, uint256 amount)",
  "function cancelListing(uint256 listingId)",
  "function getListingsCount() view returns (uint256)",
  "function listings(uint256) view returns (address seller, uint256 totalAmount, uint256 remainingAmount, bool active)",
  "event ListingCreated(uint indexed listingId, address indexed seller, uint256 amount)",
  "event ListingPurchased(uint indexed listingId, address indexed buyer, uint256 amount)",
  "event ListingCancelled(uint indexed listingId)"
];

