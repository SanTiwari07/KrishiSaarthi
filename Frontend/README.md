# 🌾 KrishiSaarthi - Agricultural Platform

A comprehensive multi-role, multi-language agricultural platform designed for farmers, validators, and buyers in India.

## 🎯 Overview

KrishiSaarthi (Your Digital Farming Partner) is a modern, farmer-friendly platform that supports three user roles:

1. **Farmer** - Access farming tools and earn green credits
2. **Validator** - Verify farmer activities and approve credits
3. **Buyer** - Purchase verified green credits

## 🌐 Multi-Language Support

The platform supports three languages with Devanagari font support:
- **English (EN)**
- **Hindi (HI) - हिंदी**
- **Marathi (MR) - मराठी**

Language can be switched anytime using the top-right toggle.

## 🎨 Design System

### Colors
- **Primary Green**: #4CAF50
- **Light Green**: #C8E6C9
- **Yellow**: #FFEB3B
- **Earth Brown**: #6D4C41
- **White**: #FFFFFF

### Typography
- Fonts: Inter + Noto Sans Devanagari
- Simple, large text suitable for rural users
- Icon-based navigation

### UI Principles
- Mobile-first, responsive design
- Rounded card components
- Large, touch-friendly buttons
- High contrast for readability

## 📱 Platform Features

### 🌱 For Farmers

#### 1. Crop Disease Detector
- Upload or capture leaf images
- AI-powered disease identification
- Get crop type, disease name, and severity
- Receive treatment recommendations
- Access to advisor chatbot

#### 2. Business Advisor
- 6-step questionnaire for personalized recommendations:
  - Total land area
  - Available capital
  - Market connectivity
  - Skills and comfort areas
  - Risk preference
  - Time availability
- AI-powered business recommendations with:
  - Investment requirements
  - ROI estimates
  - Risk levels
  - Sustainability scores
- Live chat with AI advisor
- Contact agriculture experts
- Download business reports

#### 3. Green Credit System
- Submit sustainable activities:
  - Tree plantation
  - Solar panel installation
  - Organic composting
  - Chemical reduction
  - Water conservation
- Upload proof images
- Track submission status (Pending/Approved/Rejected)
- View earned credits

### 🛡️ For Validators

- Review pending farmer submissions
- View activity details and uploaded images
- Approve or reject activities
- Auto-assign credits on approval
- Track verification history
- Clean, professional dashboard

### 🛒 For Buyers

#### Credit Purchase
- Quick select: 10, 20, 50, 100 credits
- Custom amount option
- Real-time price calculation
- Instant purchase confirmation

#### Marketplace
- Browse verified green credits
- Filter by activity type and location
- View farmer details and verification status
- Direct purchase from marketplace
- Receipt generation

## 🔐 Authentication

### Role Selection
- Interactive role selection with animated cards
- Farmer: Login + Sign Up available
- Validator & Buyer: Login only

### Farmer Sign Up
Required fields:
- Full Name
- Farm Land (in acres)
- Mobile Number
- Email
- Password

## 🗂️ Project Structure

```
/
├── App.tsx                          # Main app with routing
├── contexts/
│   └── AppContext.tsx              # Global state & translations
├── components/
│   ├── LandingPage.tsx             # Landing page
│   ├── RoleSelectionLogin.tsx      # Role selection & login
│   ├── FarmerSignup.tsx            # Farmer registration
│   ├── FarmerDashboard.tsx         # Farmer home
│   ├── CropDiseaseDetector.tsx     # Disease detection tool
│   ├── BusinessAdvisor.tsx         # Business advisor tool
│   ├── GreenCredit.tsx             # Green credit system
│   ├── ValidatorDashboard.tsx      # Validator interface
│   ├── BuyerDashboard.tsx          # Buyer marketplace
│   ├── Profile.tsx                 # User profile & settings
│   └── LanguageToggle.tsx          # Language switcher
└── styles/
    └── globals.css                 # Global styles & fonts
```

## 🚀 Navigation Flow

### Farmer Flow
1. Landing Page → Role Selection → Login/Sign Up
2. Farmer Dashboard → Choose Module:
   - Crop Disease Detector → Upload → Results → Treatment
   - Business Advisor → Questionnaire → Recommendations → Chat/Experts
   - Green Credit → Submit Activity → Track Status

### Validator Flow
1. Landing Page → Role Selection → Login
2. Validator Dashboard → Pending/Verified tabs
3. Review submissions → Approve/Reject

### Buyer Flow
1. Landing Page → Role Selection → Login
2. Buyer Dashboard → Purchase/Marketplace tabs
3. Select credits → Purchase → Receipt

## 🎭 Mock Data

The platform includes realistic mock data for demonstration:
- Sample farmer submissions
- Mock disease detection results
- Business recommendations
- Marketplace listings
- Expert contacts

## 🔑 Demo Login

Use the role selection page to quickly login as:
- **Farmer**: राज पाटिल (Raj Patil)
- **Validator**: Dr. Sharma
- **Buyer**: Green Corp

## 📱 Responsive Design

- Mobile-first approach
- Tablet-optimized layouts
- Desktop-enhanced experience
- Touch-friendly interactions
- Optimized for rural connectivity

## ♿ Accessibility

- Large, readable fonts
- High contrast colors
- Icon-based navigation
- Multi-language support
- Simple, intuitive UI

## 🌍 Target Users

- **Primary**: Small to medium farmers in rural India
- **Secondary**: Agricultural validators and green credit buyers
- **Language**: Hindi, Marathi, and English speakers
- **Device**: Mobile and tablet users with basic literacy

## 🎯 Key Differentiators

1. **Multi-language with Devanagari support**
2. **Icon-heavy, text-light interface**
3. **Offline-first considerations**
4. **Rural-friendly design patterns**
5. **Integrated farming tools**
6. **Green credit marketplace**
7. **AI-powered recommendations**

## 🔮 Future Enhancements

- Voice input support
- Offline mode with sync
- SMS notifications
- Regional language expansion
- Weather integration
- Soil testing recommendations
- Market price updates
- Government scheme integration

---

**Built with React, TypeScript, Tailwind CSS, and Lucide Icons**

**KrishiSaarthi - कृषि साथी - कृषी साथी**
