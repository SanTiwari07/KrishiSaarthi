import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { auth, db } from '../firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

type Language = 'en' | 'hi' | 'mr';

type UserRole = 'farmer' | 'validator' | 'buyer';

interface User {
  id: string;
  name: string;
  role: UserRole;
  email?: string;
  mobile?: string;
  farmLand?: number;
  age?: string;
  address?: string;
  scansCount?: number;
}

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;
  login: (mobile: string, password: string, expectedRole?: UserRole) => Promise<void>;
  signup: (userData: any, password: string) => Promise<void>;
  t: (key: string) => string;
  loading: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const translations: Record<string, Record<Language, string>> = {
  // Landing Page
  'app.name': { en: 'KrishiSaarthi', hi: 'कृषि साथी', mr: 'कृषी साथी' },
  'app.tagline': { en: 'Your Digital Farming Partner', hi: 'आपका डिजिटल खेती साथी', mr: 'तुमचा डिजिटल शेती साथी' },
  'get.started': { en: 'Get Started', hi: 'शुरू करें', mr: 'सुरू करा' },

  // Role Selection
  'select.role': { en: 'Select Your Role', hi: 'अपनी भूमिका चुनें', mr: 'तुमची भूमिका निवडा' },
  'role.farmer': { en: 'Farmer', hi: 'किसान', mr: 'शेतकरी' },
  'role.farmer.desc': { en: 'Access farming tools & earn green credits', hi: 'खेती के उपकरण और हरित क्रेडिट पाएं', mr: 'शेती साधने आणि हरित क्रेडिट मिळवा' },
  'role.validator': { en: 'Validator', hi: 'सत्यापनकर्ता', mr: 'सत्यापनकर्ता' },
  'role.validator.desc': { en: 'Verify farmer activities & approve credits', hi: 'किसान गतिविधियों को सत्यापित करें', mr: 'शेतकरी क्रियाकलाप सत्यापित करा' },
  'role.buyer': { en: 'Buyer', hi: 'खरीदार', mr: 'खरेदीदार' },
  'role.buyer.desc': { en: 'Purchase verified green credits', hi: 'सत्यापित हरित क्रेडिट खरीदें', mr: 'सत्यापित हरित क्रेडिट खरेदी करा' },
  'login': { en: 'Login', hi: 'लॉगिन', mr: 'लॉगिन' },
  'signup': { en: 'Sign Up', hi: 'साइन अप करें', mr: 'साइन अप करा' },

  // Farmer Signup
  'create.account': { en: 'Create Account', hi: 'खाता बनाएं', mr: 'खाते तयार करा' },
  'full.name': { en: 'Full Name', hi: 'पूरा नाम', mr: 'पूर्ण नाव' },
  'farm.land': { en: 'Farm Land (Acres)', hi: 'खेत की भूमि (एकड़)', mr: 'शेत जमीन (एकर)' },
  'mobile.number': { en: 'Mobile Number', hi: 'मोबाइल नंबर', mr: 'मोबाइल नंबर' },
  'email': { en: 'Email', hi: 'ईमेल', mr: 'ईमेल' },
  'password': { en: 'Password', hi: 'पासवर्ड', mr: 'पासवर्ड' },

  // Farmer Dashboard
  'dashboard': { en: 'Dashboard', hi: 'डैशबोर्ड', mr: 'डॅशबोर्ड' },
  'crop.disease': { en: 'Disease Detector', hi: 'फसल रोग पहचानकर्ता', mr: 'पीक रोग शोधक' },
  'crop.disease.desc': { en: 'Identify plant diseases instantly', hi: 'पौधों की बीमारियों को तुरंत पहचानें', mr: 'वनस्पती रोग त्वरित ओळखा' },
  'business.advisor': { en: 'Business Advisor', hi: 'व्यवसाय सलाहकार', mr: 'व्यवसाय सल्लागार' },
  'business.advisor.desc': { en: 'Get personalized investment guidance', hi: 'व्यक्तिगत निवेश मार्गदर्शन प्राप्त करें', mr: 'वैयक्तिक गुंतवणूक मार्गदर्शन मिळवा' },
  'green.credit': { en: 'Green Credit', hi: 'हरित क्रेडिट', mr: 'हरित क्रेडिट' },
  'green.credit.desc': { en: 'Earn credits for sustainable activities', hi: 'स्थायी गतिविधियों के लिए क्रेडिट कमाएं', mr: 'शाश्वत क्रियांसाठी क्रेडिट मिळवा' },

  // Crop Disease
  'upload.image': { en: 'Upload Leaf Image', hi: 'पत्ती की फोटो अपलोड करें', mr: 'पानाचा फोटो अपलोड करा' },
  'click.photo': { en: 'Click Photo', hi: 'फोटो खींचें', mr: 'फोटो काढा' },
  'analyzing': { en: 'Analyzing...', hi: 'विश्लेषण हो रहा है...', mr: 'विश्लेषण होत आहे...' },
  'detected.crop': { en: 'Detected Crop', hi: 'पहचानी गई फसल', mr: 'ओळखली गेलेली पीक' },
  'detected.disease': { en: 'Detected Disease', hi: 'पहचानी गई बीमारी', mr: 'ओळखला गेलेला रोग' },
  'severity': { en: 'Severity', hi: 'गंभीरता', mr: 'तीव्रता' },
  'treatment': { en: 'Recommended Treatment', hi: 'अनुशंसित उपचार', mr: 'शिफारस केलेले उपचार' },
  'ask.advisor': { en: 'Ask Advisor ChatBot', hi: 'सलाहकार चैटबॉट से पूछें', mr: 'सल्लागार चॅटबॉटला विचारा' },
  'learn.more': { en: 'Learn More', hi: 'और जानें', mr: 'अधिक जाणून घ्या' },

  // Business Advisor
  'total.land': { en: 'Total Land (Acres)', hi: 'कुल भूमि (एकड़)', mr: 'एकूण जमीन (एकर)' },
  'available.capital': { en: 'Available Capital (₹)', hi: 'उपलब्ध पूंजी (₹)', mr: 'उपलब्ध भांडवल (₹)' },
  'market.connectivity': { en: 'Market Connectivity', hi: 'बाजार संपर्क', mr: 'बाजार संपर्क' },
  'skills': { en: 'Skills & Comfort Area', hi: 'कौशल और आराम क्षेत्र', mr: 'कौशल्ये आणि आराम क्षेत्र' },
  'risk.preference': { en: 'Risk Preference', hi: 'जोखिम प्राथमिकता', mr: 'जोखीम प्राधान्य' },
  'time.availability': { en: 'Time Availability', hi: 'समय की उपलब्धता', mr: 'वेळ उपलब्धता' },
  'next': { en: 'Next', hi: 'अगला', mr: 'पुढे' },
  'back': { en: 'Back', hi: 'पीछे', mr: 'मागे' },
  'submit': { en: 'Submit', hi: 'जमा करें', mr: 'सबमिट करा' },
  'recommendations': { en: 'Business Recommendations', hi: 'व्यवसाय सिफारिशें', mr: 'व्यवसाय शिफारसी' },
  'investment.needed': { en: 'Investment Needed', hi: 'आवश्यक निवेश', mr: 'आवश्यक गुंतवणूक' },
  'roi.range': { en: 'ROI Range', hi: 'आरओआई रेंज', mr: 'आरओआय श्रेणी' },
  'risk.level': { en: 'Risk Level', hi: 'जोखिम स्तर', mr: 'जोखीम स्तर' },
  'sustainability': { en: 'Sustainability Score', hi: 'स्थिरता स्कोर', mr: 'शाश्वतता स्कोअर' },
  'chat.advisor': { en: 'Chat with AI Advisor', hi: 'एआई सलाहकार से चैट करें', mr: 'एआय सल्लागाराशी चॅट करा' },
  'contact.expert': { en: 'Contact Expert', hi: 'विशेषज्ञ से संपर्क करें', mr: 'तज्ञाशी संपर्क करा' },
  'download.report': { en: 'Download Report', hi: 'रिपोर्ट डाउनलोड करें', mr: 'अहवाल डाउनलोड करा' },

  // Green Credit
  'submit.activity': { en: 'Submit Activity', hi: 'गतिविधि जमा करें', mr: 'क्रियाकलाप सबमिट करा' },
  'activity.type': { en: 'Activity Type', hi: 'गतिविधि का प्रकार', mr: 'क्रियाकलाप प्रकार' },
  'description': { en: 'Description', hi: 'विवरण', mr: 'वर्णन' },
  'upload.images': { en: 'Upload Images', hi: 'फोटो अपलोड करें', mr: 'फोटो अपलोड करा' },
  'activity.status': { en: 'Activity Status', hi: 'गतिविधि की स्थिति', mr: 'क्रियाकलाप स्थिती' },
  'pending': { en: 'Pending', hi: 'लंबित', mr: 'प्रलंबित' },
  'approved': { en: 'Approved', hi: 'स्वीकृत', mr: 'मंजूर' },
  'rejected': { en: 'Rejected', hi: 'अस्वीकृत', mr: 'नाकारले' },
  'credits.earned': { en: 'Credits Earned', hi: 'अर्जित क्रेडिट', mr: 'कमावलेले क्रेडिट' },

  // Validator
  'pending.verifications': { en: 'Pending Verifications', hi: 'लंबित सत्यापन', mr: 'प्रलंबित सत्यापन' },
  'verified.activities': { en: 'Verified Activities', hi: 'सत्यापित गतिविधियां', mr: 'सत्यापित क्रियाकलाप' },
  'approve': { en: 'Approve', hi: 'स्वीकार करें', mr: 'मंजूर करा' },
  'reject': { en: 'Reject', hi: 'अस्वीकार करें', mr: 'नाकारा' },
  'request.proof': { en: 'Request More Proof', hi: 'अधिक प्रमाण मांगें', mr: 'अधिक पुरावे मागा' },

  // Buyer
  'purchase.credits': { en: 'Purchase Credits', hi: 'क्रेडिट खरीदें', mr: 'क्रेडिट खरेदी करा' },
  'marketplace': { en: 'Marketplace', hi: 'बाजार', mr: 'बाजारपेठ' },
  'buy': { en: 'Buy', hi: 'खरीदें', mr: 'खरेदी करा' },
  'price': { en: 'Price', hi: 'कीमत', mr: 'किंमत' },
  'location': { en: 'Location', hi: 'स्थान', mr: 'स्थान' },
  'verified': { en: 'Verified', hi: 'सत्यापित', mr: 'सत्यापित' },

  // Profile
  'profile': { en: 'Profile', hi: 'प्रोफाइल', mr: 'प्रोफाइल' },
  'name': { en: 'Name', hi: 'नाम', mr: 'नाव' },
  'role': { en: 'Role', hi: 'भूमिका', mr: 'भूमिका' },
  'language.preference': { en: 'Language Preference', hi: 'भाषा प्राथमिकता', mr: 'भाषा प्राधान्य' },
  'logout': { en: 'Logout', hi: 'लॉगआउट', mr: 'लॉगआउट' },

  // Common
  'welcome': { en: 'Welcome', hi: 'स्वागत है', mr: 'स्वागत आहे' },
  'loading': { en: 'Loading...', hi: 'लोड हो रहा है...', mr: 'लोड होत आहे...' },
  'save': { en: 'Save', hi: 'सहेजें', mr: 'जतन करा' },
  'cancel': { en: 'Cancel', hi: 'रद्द करें', mr: 'रद्द करा' },
  'date': { en: 'Date', hi: 'तारीख', mr: 'तारीख' },
  'status': { en: 'Status', hi: 'स्थिति', mr: 'स्थिती' },
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const t = (key: string): string => {
    return translations[key]?.[language] || key;
  };

  // Auth Logic
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        // Fetch user profile from Firestore
        try {
          const docRef = doc(db, 'users', currentUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setUser(docSnap.data() as User);
          } else {
            console.error('User document does not exist');
            setUser(null);
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const login = async (mobile: string, password: string, expectedRole?: UserRole) => {
    try {
      const email = mobile.includes('@') ? mobile : `${mobile}@krishisaarthi.com`;
      const result = await signInWithEmailAndPassword(auth, email, password);

      // Strict Role Enforcement
      if (expectedRole) {
        const docRef = doc(db, 'users', result.user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const userData = docSnap.data() as User;
          if (userData.role !== expectedRole) {
            await signOut(auth);
            throw new Error(`Role mismatch: Expected ${expectedRole}, found ${userData.role}`);
          }
          // Update local state immediately to avoid lag
          setUser(userData);
        } else {
          // If user exists in Auth but not in Firestore (rare edge case or corrupted data)
          // We might want to let them in or block. Safe default is block or treat as error.
          // For now, let's allow it but warn, or maybe block?
          // User requested strict auth. If no role found, they can't be verified.
          await signOut(auth);
          throw new Error('User data not found');
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const signup = async (userData: any, password: string) => {
    try {
      const email = `${userData.mobile}@krishisaarthi.com`;
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      const newUser: User = {
        id: userCredential.user.uid,
        ...userData
      };

      await setDoc(doc(db, 'users', userCredential.user.uid), newUser);
      setUser(newUser);
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <AppContext.Provider value={{ language, setLanguage, user, setUser, logout, login, signup, t, loading }}>
      {loading ? (
        <div className="flex h-screen w-full items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="flex flex-col items-center gap-4">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            <p className="animate-pulse text-lg font-bold text-primary">KrishiSaarthi...</p>
          </div>
        </div>
      ) : (
        children
      )}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
