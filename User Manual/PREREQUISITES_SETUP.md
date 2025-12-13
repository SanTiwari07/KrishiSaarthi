# Step-by-Step: Prerequisites Setup Guide

## Step 1: Install MetaMask Browser Extension

### For Chrome/Edge/Brave:
1. **Open your browser** (Chrome, Edge, or Brave)
2. **Go to MetaMask website**: 
   - Visit: https://metamask.io/
   - Or search "MetaMask" in your browser's extension store
3. **Click "Download"** button
4. **Select your browser** (Chrome, Firefox, Edge, or Brave)
5. **Click "Install MetaMask"** - This will take you to Chrome Web Store (or your browser's extension store)
6. **Click "Add to Chrome"** (or "Add to [Your Browser]")
7. **Click "Add Extension"** in the popup
8. **Wait for installation** - MetaMask icon will appear in your browser toolbar

### For Firefox:
1. Visit: https://addons.mozilla.org/en-US/firefox/addon/ether-metamask/
2. Click "Add to Firefox"
3. Click "Add" in the popup
4. Wait for installation

### After Installation:
1. **Click the MetaMask icon** in your browser toolbar (fox icon)
2. **Click "Get Started"**
3. **Choose one**:
   - **"Create a Wallet"** - For new users (recommended for testing)
   - **"Import Wallet"** - If you have an existing wallet

### Create New Wallet:
1. Click **"Create a Wallet"**
2. Click **"I agree"** to terms
3. **Create a password**:
   - Enter a strong password (remember this!)
   - Confirm password
   - Check the box
   - Click **"Create"**
4. **Backup Secret Recovery Phrase**:
   - Click **"Click here to reveal secret words"**
   - **WRITE DOWN** the 12 words in order (very important!)
   - Store them safely - you'll need this to recover your wallet
   - Click each word to confirm you wrote them down
   - Click **"Confirm"**
5. **Wallet Created!** - You'll see your wallet dashboard

---

## Step 2: Connect to Sepolia Testnet

### Method 1: Enable Test Networks (Easiest)

1. **Open MetaMask** (click the fox icon)
2. **Click the network dropdown** at the top (usually shows "Ethereum Mainnet")
3. **Scroll down** and look for **"Show test networks"** toggle
4. **Turn ON** "Show test networks"
5. **Click the network dropdown again**
6. **Select "Sepolia"** from the list
7. **Done!** - You should now see "Sepolia" in the network dropdown

### Method 2: Add Sepolia Manually

If Sepolia doesn't appear in the list:

1. **Open MetaMask**
2. **Click the network dropdown**
3. **Click "Add Network"** or **"Add a network manually"**
4. **Fill in these details**:
   - **Network Name**: `Sepolia`
   - **New RPC URL**: `https://rpc.sepolia.org` or `https://sepolia.infura.io/v3/YOUR_INFURA_KEY`
   - **Chain ID**: `11155111`
   - **Currency Symbol**: `ETH`
   - **Block Explorer URL**: `https://sepolia.etherscan.io`
5. **Click "Save"**
6. **Sepolia is now added!** - Switch to it from the network dropdown

### Verify You're on Sepolia:
- Network dropdown should show **"Sepolia"**
- Your ETH balance will be **0** (or show test ETH if you already have some)
- The network icon might look different from Mainnet

---

## Step 3: Get Test ETH from Sepolia Faucet

You need test ETH to pay for gas fees on Sepolia testnet. Here are several faucet options:

### Option 1: Alchemy Sepolia Faucet (Recommended)

1. **Visit**: https://sepoliafaucet.com/
2. **Connect your wallet**:
   - Click "Connect Wallet" or "Sign in with Alchemy"
   - Select "MetaMask"
   - Approve the connection in MetaMask popup
3. **Enter your wallet address**:
   - Copy your address from MetaMask (click account name to copy)
   - Paste it in the faucet
4. **Complete CAPTCHA** (if required)
5. **Click "Send Me ETH"** or "Request ETH"
6. **Wait 1-2 minutes** for the transaction
7. **Check MetaMask** - Your balance should update

**Note**: Alchemy faucet gives 0.5 ETH per request, once per 24 hours per address.

### Option 2: Infura Sepolia Faucet

1. **Visit**: https://www.infura.io/faucet/sepolia
2. **Sign in** with Infura account (or create one - it's free)
3. **Enter your wallet address**
4. **Click "Request Funds"**
5. **Wait for transaction**

### Option 3: PoW Faucet (No Account Needed)

1. **Visit**: https://sepolia-faucet.pk910.de/
2. **Enter your wallet address**
3. **Complete mining challenge** (let it run for a few minutes)
4. **Receive test ETH** automatically

### Option 4: QuickNode Faucet

1. **Visit**: https://faucet.quicknode.com/ethereum/sepolia
2. **Enter your wallet address**
3. **Complete verification** (Twitter/Discord)
4. **Request test ETH**

### How to Copy Your Wallet Address:

1. **Open MetaMask**
2. **Click on your account name** at the top (shows "Account 1" or similar)
3. **Click the copy icon** next to your address
   - Or click on the address itself to copy
4. **Address copied!** - Paste it into the faucet

Your address looks like: `0x1234567890abcdef1234567890abcdef12345678`

### Verify You Received Test ETH:

1. **Open MetaMask**
2. **Check your balance** - Should show something like "0.5 ETH" or "1 ETH"
3. **If balance is 0**, wait a few more minutes and refresh
4. **Check transaction**:
   - Click the three dots (⋮) next to your account
   - Click "View on Etherscan"
   - You should see incoming transactions

---

## Troubleshooting

### MetaMask Installation Issues:

**Problem**: "Extension not installing"
- **Solution**: 
  - Make sure you're using a supported browser
  - Check if extensions are enabled in browser settings
  - Try restarting your browser

**Problem**: "Can't find MetaMask icon"
- **Solution**:
  - Click the puzzle icon (extensions) in Chrome/Edge
  - Pin MetaMask to toolbar
  - Or go to `chrome://extensions/` and enable it

### Network Connection Issues:

**Problem**: "Can't add Sepolia network"
- **Solution**:
  - Double-check the Chain ID is `11155111`
  - Try a different RPC URL:
    - `https://rpc.sepolia.org`
    - `https://sepolia.infura.io/v3/YOUR_KEY`
    - `https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY`

**Problem**: "Transaction fails on Sepolia"
- **Solution**:
  - Make sure you're on Sepolia network (not Mainnet)
  - Check you have test ETH (not real ETH)
  - Verify network in MetaMask dropdown

### Faucet Issues:

**Problem**: "Faucet says 'Already claimed'"
- **Solution**:
  - Most faucets have a 24-hour cooldown
  - Try a different faucet
  - Use a different wallet address

**Problem**: "No ETH received after 10 minutes"
- **Solution**:
  - Check your address is correct
  - Verify you're on Sepolia network
  - Check Etherscan for pending transactions
  - Try a different faucet

**Problem**: "Faucet requires login/signup"
- **Solution**:
  - Create a free account (takes 2 minutes)
  - Or use PoW faucet which doesn't require account

---

## Quick Checklist

Before proceeding to test Green Credit, verify:

- [ ] MetaMask installed and visible in browser toolbar
- [ ] MetaMask wallet created (or imported)
- [ ] Secret recovery phrase saved safely
- [ ] Connected to Sepolia testnet (not Mainnet!)
- [ ] Have test ETH in wallet (at least 0.1 ETH recommended)
- [ ] Can see balance in MetaMask
- [ ] Network dropdown shows "Sepolia"

---

## Next Steps

Once you have:
✅ MetaMask installed
✅ Connected to Sepolia
✅ Test ETH in wallet

You're ready to:
1. Start the application (`npm run dev`)
2. Test Green Credit feature
3. Connect wallet in the app
4. Submit activities as farmer
5. Verify projects as validator
6. Purchase credits as buyer

---

## Security Reminders

⚠️ **Important**:
- **Never share** your secret recovery phrase with anyone
- **Never enter** your recovery phrase on any website
- **Test ETH has no real value** - it's only for testing
- **Don't send real ETH** to Sepolia testnet addresses
- **Always verify** you're on testnet before testing

---

## Visual Guide Locations

If you need visual help:
- **MetaMask Setup**: https://metamask.io/faqs/
- **Sepolia Network Info**: https://sepolia.dev/
- **Etherscan Sepolia**: https://sepolia.etherscan.io/

---

## Common Questions

**Q: Do I need real money?**
A: No! Test ETH is free and has no real value. It's only for testing.

**Q: How much test ETH do I need?**
A: 0.1-0.5 ETH is usually enough for many transactions. Each transaction costs a small amount of gas.

**Q: Can I use the same wallet for Mainnet and Testnet?**
A: Yes! The same wallet works on all networks. Just switch networks in MetaMask.

**Q: What if I lose my recovery phrase?**
A: You'll lose access to your wallet. Always write it down and store it safely!

**Q: Is Sepolia the same as Ethereum?**
A: Sepolia is a test network that mimics Ethereum but uses free test tokens. Real Ethereum uses real money.

---

## Ready to Test!

Once you complete all three steps above, you're ready to test the Green Credit feature! 

Proceed to the testing guide: `TESTING_GREEN_CREDIT.md`

