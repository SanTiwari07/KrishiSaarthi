# Testing Guide: Green Credit with Blockchain

## Prerequisites

### 1. Install MetaMask
- Download from [metamask.io](https://metamask.io/)
- Install the browser extension
- Create a new wallet or import existing one

### 2. Connect to Sepolia Testnet
1. Open MetaMask
2. Click network dropdown (top of extension)
3. Click "Add Network" or "Show Test Networks"
4. Select "Sepolia" testnet
5. If not available, add manually:
   - Network Name: Sepolia
   - RPC URL: `https://sepolia.infura.io/v3/YOUR_INFURA_KEY` or `https://rpc.sepolia.org`
   - Chain ID: 11155111
   - Currency Symbol: ETH

### 3. Get Test ETH
- Visit a Sepolia faucet:
  - [Alchemy Sepolia Faucet](https://sepoliafaucet.com/)
  - [Infura Sepolia Faucet](https://www.infura.io/faucet/sepolia)
  - [PoW Faucet](https://sepolia-faucet.pk910.de/)
- Request test ETH (usually 0.5-1 ETH)
- Wait for transaction confirmation

### 4. Start the Application
```bash
cd KrishiSaarthi_Blockchain_withmarketplace/UI_AND_Other_Stuff/Frontend
npm run dev
```
- Open browser to the URL shown (usually `http://localhost:5173`)

---

## Testing Scenarios

### Scenario 1: Test as a Farmer

#### Step 1: Login as Farmer
1. Navigate to the application
2. Select "Farmer" role
3. Login with farmer credentials (or create account)
4. You'll be redirected to Farmer Dashboard

#### Step 2: Navigate to Green Credit
1. Click on "Green Credit" card/button
2. You'll see the Green Credit page

#### Step 3: Connect Wallet
1. Click "Connect Wallet" button (top right)
2. MetaMask popup will appear
3. Click "Connect" or "Next" → "Connect"
4. **Expected Result**: 
   - Wallet address appears (shortened format)
   - Token balance shows (initially 0)
   - "Connect Wallet" button disappears

#### Step 4: Submit an Activity
1. Make sure you're on "Submit Activity" tab
2. Select an activity type (e.g., "Planted Trees")
3. Enter description: "Planted 50 neem trees along farm boundary"
4. Upload at least one image (click upload area, select image)
5. Click "Submit" button
6. **MetaMask Transaction**:
   - MetaMask popup appears
   - Review transaction details
   - Click "Confirm" (you'll pay gas fees)
   - Wait for confirmation
7. **Expected Result**:
   - Success message appears
   - Form resets
   - Automatically switches to "Activity Status" tab
   - New activity appears with "Pending" status

#### Step 5: View Activity Status
1. Click "Activity Status" tab
2. **Expected Result**:
   - See your submitted activity
   - Status shows "Pending"
   - Project ID visible
   - Description displayed

#### Step 6: Check Token Balance
1. Look at top right corner
2. **Expected Result**:
   - Balance shows "0 Credits" (until validator approves)

---

### Scenario 2: Test as a Validator

#### Step 1: Setup Validator Account
**Important**: Your wallet address must be registered as validator in the smart contract.

**Option A: If you have admin access**
1. Connect as admin wallet
2. Call `addVerifier(yourWalletAddress)` on ProjectRegistry contract
3. Or use the blockchain test app to add yourself as validator

**Option B: Use existing validator wallet**
- Use a wallet that's already registered as validator

#### Step 2: Login as Validator
1. Logout from farmer account
2. Select "Validator" role
3. Login with validator credentials
4. Navigate to Validator Dashboard

#### Step 3: Connect Wallet
1. Click "Connect Wallet" in the yellow banner
2. Approve MetaMask connection
3. **Expected Result**:
   - Wallet connected
   - If not registered as validator, error message appears

#### Step 4: View Pending Projects
1. You'll see "Pending Verifications" tab
2. **Expected Result**:
   - List of pending projects from farmers
   - Each shows:
     - Farmer wallet address
     - Project type
     - Description
     - Project ID

#### Step 5: Verify a Project
1. Find a pending project
2. Enter credit amount (e.g., "25" for 25 credits)
3. Click "Approve" button
4. **MetaMask Transaction**:
   - MetaMask popup appears
   - Shows `verifyAndMint` function call
   - Review gas fees
   - Click "Confirm"
   - Wait for confirmation
5. **Expected Result**:
   - Success message: "Project verified and X credits minted!"
   - Project moves to "Verified Activities" tab
   - Transaction hash displayed

#### Step 6: Verify on Blockchain
1. Copy transaction hash
2. Go to [Sepolia Etherscan](https://sepolia.etherscan.io/)
3. Paste transaction hash
4. **Expected Result**:
   - See transaction details
   - Verify `ProjectVerified` event
   - See token transfer to farmer

---

### Scenario 3: Test as a Buyer

#### Step 1: Login as Buyer
1. Logout from previous account
2. Select "Buyer" role
3. Login with buyer credentials
4. Navigate to Buyer Dashboard

#### Step 2: Connect Wallet
1. Click "Connect Wallet" in yellow banner
2. Approve MetaMask connection
3. **Expected Result**: Wallet connected

#### Step 3: Browse Marketplace
1. Click "Marketplace" tab
2. **Expected Result**:
   - List of active listings (if any)
   - Each listing shows:
     - Seller address
     - Available credits
     - Total listed credits

#### Step 4: Purchase Credits
1. Find a listing
2. Enter amount to purchase (must be ≤ available)
3. Click "Buy" button
4. **MetaMask Transaction**:
   - MetaMask popup appears
   - Shows token transfer
   - Review and confirm
   - Wait for confirmation
5. **Expected Result**:
   - Success message
   - Receipt modal appears
   - Your token balance increases
   - Listing remaining amount decreases

#### Step 5: Verify Purchase
1. Check your token balance (top right)
2. **Expected Result**: Balance increased by purchased amount

---

## Complete End-to-End Test Flow

### Full Workflow Test

1. **Farmer Account**:
   - Connect wallet → Submit activity → Get project ID

2. **Validator Account**:
   - Connect wallet → View pending project → Verify with 25 credits → Mint tokens

3. **Check Farmer Balance**:
   - Switch back to farmer account
   - Refresh page
   - Check balance → Should show 25 credits
   - Activity status → Should show "Approved"

4. **Farmer Lists Credits** (Optional):
   - Farmer can list credits on marketplace (requires additional contract interaction)

5. **Buyer Purchases**:
   - Buyer connects → Views listing → Purchases credits

---

## Verification Checklist

### ✅ Farmer Testing
- [ ] Wallet connects successfully
- [ ] Can submit activity with all fields
- [ ] Transaction appears in MetaMask
- [ ] Activity appears in status tab
- [ ] Balance updates after validator approval

### ✅ Validator Testing
- [ ] Wallet connects (validator role verified)
- [ ] Can see pending projects
- [ ] Can enter credit amount
- [ ] Can approve and mint tokens
- [ ] Transaction confirmed on blockchain

### ✅ Buyer Testing
- [ ] Wallet connects
- [ ] Can see marketplace listings
- [ ] Can purchase credits
- [ ] Balance increases after purchase
- [ ] Receipt shows correct information

---

## Common Issues & Solutions

### Issue: "MetaMask is not installed"
**Solution**: Install MetaMask browser extension

### Issue: "Transaction failed" or "User rejected"
**Solution**: 
- Check you have enough ETH for gas
- Approve transaction in MetaMask
- Check network is Sepolia

### Issue: "Not registered as validator"
**Solution**: 
- Contact admin to add your wallet as validator
- Or use admin wallet to add yourself

### Issue: "Failed to connect wallet"
**Solution**:
- Unlock MetaMask
- Approve connection request
- Check MetaMask is on correct network

### Issue: "No pending projects"
**Solution**:
- Make sure a farmer has submitted an activity
- Check you're connected to same network
- Verify contract addresses are correct

### Issue: "Insufficient balance"
**Solution**:
- Get more test ETH from faucet
- Check you have enough for gas fees

---

## Testing with Multiple Accounts

### Recommended Setup:
1. **Account 1**: Farmer wallet (submit activities)
2. **Account 2**: Validator wallet (verify projects)
3. **Account 3**: Buyer wallet (purchase credits)

### Quick Test with One Wallet:
You can test all roles with one wallet if:
- It's registered as both farmer and validator
- You switch roles in the UI

---

## Blockchain Verification

### Check Transactions on Etherscan

1. **Find Transaction Hash**:
   - After any transaction, copy the hash from success message
   - Or check MetaMask activity tab

2. **View on Etherscan**:
   - Go to [sepolia.etherscan.io](https://sepolia.etherscan.io/)
   - Paste transaction hash
   - View:
     - Transaction status
     - Gas used
     - Events emitted
     - Token transfers

3. **Check Contract State**:
   - Go to contract address on Etherscan
   - View "Read Contract" tab
   - Check:
     - `getProjectsCount()` - Total projects
     - `projects(id)` - Specific project details
     - `isFarmer(address)` - Farmer registration
     - `isVerifier(address)` - Validator status

---

## Expected Gas Costs (Approximate)

- **Register Farmer**: ~50,000 gas
- **Create Project**: ~100,000 gas
- **Verify & Mint**: ~150,000 gas
- **Purchase Credits**: ~80,000 gas

*Actual costs vary based on network conditions*

---

## Debugging Tips

1. **Check Browser Console**:
   - Open DevTools (F12)
   - Check Console tab for errors
   - Check Network tab for failed requests

2. **Check MetaMask**:
   - View transaction history
   - Check account balance
   - Verify network

3. **Check Contract Addresses**:
   - Verify in `src/services/contracts.ts`
   - Ensure they match deployed contracts

4. **Test Network Connection**:
   - Try connecting to contract directly
   - Use Etherscan to verify contract exists

---

## Quick Test Script

```bash
# 1. Start the app
npm run dev

# 2. Open browser to http://localhost:5173

# 3. Test flow:
#    - Login as Farmer
#    - Connect MetaMask
#    - Submit activity
#    - Note project ID
#    - Switch to Validator
#    - Connect MetaMask (validator wallet)
#    - Verify project
#    - Switch back to Farmer
#    - Check balance updated
```

---

## Success Criteria

✅ All transactions complete successfully  
✅ Token balances update correctly  
✅ Project statuses change as expected  
✅ No console errors  
✅ User-friendly error messages for failures  
✅ Loading states work properly  

---

## Next Steps After Testing

1. **Fix any bugs** found during testing
2. **Optimize gas costs** if needed
3. **Add more error handling** for edge cases
4. **Improve UI/UX** based on testing feedback
5. **Deploy to production** network when ready

---

## Support

If you encounter issues:
1. Check browser console for errors
2. Verify MetaMask is working
3. Check network connection
4. Verify contract addresses
5. Review transaction on Etherscan

