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
  incrementScans: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const translations: Record<string, Record<Language, string>> = {
  // Landing Page
  'app.name': { en: 'KrishiSaarthi', hi: 'कृषिसारथी', mr: 'कृषिसारथी' },
  'app.tagline': { en: 'Your Digital Farming Partner', hi: 'आपका डिजिटल खेती साथी', mr: 'तुमचा डिजिटल शेती जोडीदार' },
  'get.started': { en: 'Get Started', hi: 'शुरू करें', mr: 'सुरू करा' },

  // Role Selection
  'select.role': { en: 'Select Your Role', hi: 'अपनी भूमिका चुनें', mr: 'तुमची भूमिका निवडा' },
  'role.farmer': { en: 'Farmer', hi: 'किसान', mr: 'शेतकरी' },
  'role.farmer.desc': { en: 'Access farming tools & earn green credits', hi: 'खेती के आधुनिक साधन और ग्रीन क्रेडिट्स पाएं', mr: 'शेतीची आधुनिक साधने आणि ग्रीन क्रेडिट्स मिळवा' },
  'role.validator': { en: 'Validator', hi: 'सत्यापनकर्ता', mr: 'पडताळणीकर्ता' },
  'role.validator.desc': { en: 'Verify farmer activities & approve credits', hi: 'किसानों के कार्यों का सत्यापन करें और क्रेडिट स्वीकृत करें', mr: 'शेतकऱ्यांच्या कामांची पडताळणी करा आणि क्रेडिट मंजूर करा' },
  'role.buyer': { en: 'Buyer', hi: 'खरीदार', mr: 'खरेदीदार' },
  'role.buyer.desc': { en: 'Purchase verified green credits', hi: 'सत्यापित ग्रीन क्रेडिट्स खरीदें', mr: 'सत्यापित ग्रीन क्रेडिट्स खरेदी करा' },
  'login': { en: 'Login', hi: 'लॉगिन', mr: 'लॉगिन' },
  'signup': { en: 'Sign Up', hi: 'साइन अप', mr: 'साइन अप' },

  // Farmer Signup
  'create.account': { en: 'Create Account', hi: 'खाता बनाएं', mr: 'खाते तयार करा' },
  'full.name': { en: 'Full Name', hi: 'पूरा नाम', mr: 'पूर्ण नाव' },
  'farm.land': { en: 'Farm Land (Acres)', hi: 'खेत की भूमि (एकड़)', mr: 'शेत जमीन (एकर)' },
  'mobile.number': { en: 'Mobile Number', hi: 'मोबाइल नंबर', mr: 'मोबाइल नंबर' },
  'email': { en: 'Email', hi: 'ईमेल', mr: 'ईमेल' },
  'password': { en: 'Password', hi: 'पासवर्ड', mr: 'पासवर्ड' },

  // Farmer Dashboard
  'dashboard': { en: 'Dashboard', hi: 'डैशबोर्ड', mr: 'डॅशबोर्ड' },
  'crop.disease': { en: 'Disease Detector', hi: 'रोग पहचानकर्ता', mr: 'रोग निदान' },
  'crop.disease.desc': { en: 'Identify plant diseases instantly', hi: 'पौधों की बीमारियों को तुरंत पहचानें', mr: 'वनस्पती रोग त्वरित ओळखा' },
  'business.advisor': { en: 'Business Advisor', hi: 'व्यवसाय सलाहकार', mr: 'व्यवसाय सल्लागार' },
  'business.advisor.desc': { en: 'Get personalized investment guidance', hi: 'व्यक्तिगत निवेश मार्गदर्शन प्राप्त करें', mr: 'वैयक्तिक गुंतवणूक मार्गदर्शन मिळवा' },
  'green.credit': { en: 'Green Credits', hi: 'हरित क्रेडिट', mr: 'हरित क्रेडिट' },
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
  'contact.expert': { en: 'Buy Credits', hi: 'क्रेडिट खरीदें', mr: 'क्रेडिट खरेदी करा' },
  'contact.expert.desc': { en: 'Purchase verified green credits', hi: 'सत्यापित ग्रीन क्रेडिट्स खरीदें', mr: 'सत्यापित ग्रीन क्रेडिट्स खरेदी करा' },
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

  // Landing Page New
  'features': { en: 'Features', hi: 'विशेषताएँ', mr: 'वैशिष्ट्ये' },
  'business': { en: 'Business', hi: 'व्यापार', mr: 'व्यवसाय' },
  'settings': { en: 'Settings', hi: 'सेटिंग्स', mr: 'सेटिंग्ज' },
  'connect': { en: 'Connect', hi: 'कनेक्ट', mr: 'कनेक्ट' },
  'hero.empowering': { en: 'Empowering Farmers with', hi: 'किसानों को', mr: '' },
  'hero.ai_blockchain': { en: 'AI & Blockchain', hi: 'एआई और ब्लॉकचेन', mr: 'एआय आणि ब्लॉकचेन' },
  'hero.suffix': { en: '', hi: ' के माध्यम से सशक्त बनाना', mr: 'च्या माध्यमातून शेतकऱ्यांना सक्षम बनवणे' },
  'hero.desc': { en: 'One-stop solution for early crop disease detection, smart business advice, and earning green credits.', hi: 'फसल रोग का पता लगाने, स्मार्ट व्यापार सलाह और हरित क्रेडिट अर्जित करने का एक व्यापक समाधान।', mr: 'पीक रोग निदान, स्मार्ट व्यवसाय सल्ला आणि हरित क्रेडिट मिळवण्यासाठी एकच उपाय.' },
  'overview': { en: 'Overview', hi: 'अवलोकन', mr: 'विहंगावलोकन' },
  'analysis': { en: 'Analysis', hi: 'विश्लेषण', mr: 'विश्लेषण' },
  'disease.detected': { en: 'Disease Detected', hi: 'रोग पता चला', mr: 'रोग आढळला' },
  'earnings': { en: 'Earnings', hi: 'कमाई', mr: 'कमाई' },
  'advisory': { en: 'Advisory', hi: 'सलाह', mr: 'सल्ला' },
  'price.rising': { en: 'Price Rising', hi: 'कीमतें बढ़ रही हैं', mr: 'किंमत वाढत आहे' },
  'key.features': { en: 'Key Features', hi: 'मुख्य विशेषताएं', mr: 'मुख्य वैशिष्ट्ये' },
  'features.desc': { en: 'Everything you need to succeed in modern sustainable farming.', hi: 'आधुनिक टिकाऊ खेती में सफल होने के लिए आपको जो कुछ भी चाहिए।', mr: 'आधुनिक शाश्वत शेतीत यशस्वी होण्यासाठी आपल्याला आवश्यक सर्व काही.' },
  'ready.transform': { en: 'Ready to Transform Your Farming?', hi: 'क्या आप अपनी खेती बदलने के लिए तैयार हैं?', mr: 'आपण आपली शेती बदलण्यास तयार आहात का?' },
  'join.farmers': { en: 'Join thousands of farmers using KrishiSaarthi to improve yields and earn more.', hi: 'कृषिसारथी का उपयोग करके उपज बढ़ाने और अधिक कमाने वाले हजारों किसानों से जुड़ें।', mr: 'कृषिसारथी वापरून उत्पन्न वाढवणार्‍ हजारों शेतकऱ्यांमध्ये सामील व्हा.' },

  // Auth Page New
  'welcome.to': { en: 'Welcome to KrishiSaarthi', hi: 'कृषिसारथी में आपका स्वागत है', mr: 'कृषिसारथी मध्ये आपले स्वागत आहे' },
  'join.revolution': { en: 'Join the revolution in sustainable agriculture. Connect, grow, and earn with advanced technology.', hi: 'स्थायी कृषि में क्रांति में शामिल हों। उन्नत तकनीक के साथ जुड़ें, बढ़ें और कमाएं।', mr: 'शाश्वत शेतीतील क्रांतीमध्ये सामील व्हा. प्रगत तंत्रज्ञानासह कनेक्ट करा, वाढवा आणि कमवा.' },
  'sign.in.continue': { en: 'Sign in to continue', hi: 'जारी रखने के लिए साइन इन करें', mr: 'सुरू ठेवण्यासाठी साइन इन करा' },
  'start.journey': { en: 'Start your journey today', hi: 'आज ही अपनी यात्रा शुरू करें', mr: 'आजच आपला प्रवास सुरू करा' },
  'enter.full.name': { en: 'Enter full name', hi: 'पूरा नाम दर्ज करें', mr: 'पूर्ण नाव प्रविष्ट करा' },
  'enter.mobile': { en: 'Enter mobile number', hi: 'मोबाइल नंबर दर्ज करें', mr: 'मोबाइल नंबर प्रविष्ट करा' },
  'enter.age': { en: 'Enter age', hi: 'आयु दर्ज करें', mr: 'वय प्रविष्ट करा' },
  'enter.address': { en: 'Enter address', hi: 'पता दर्ज करें', mr: 'पत्ता प्रविष्ट करा' },
  'enter.password': { en: 'Enter password', hi: 'पासवर्ड दर्ज करें', mr: 'पासवर्ड प्रविष्ट करा' },
  'age': { en: 'Age', hi: 'आयु', mr: 'वय' },
  'address': { en: 'Address', hi: 'पता', mr: 'पत्ता' },
  'dont.have.account': { en: 'Don\'t have an account?', hi: 'खाता नहीं है?', mr: 'खाते नाही?' },
  'already.have.account': { en: 'Already have an account?', hi: 'पहले से खाता है?', mr: 'आधीच खाते आहे?' },

  // Dashboard Common
  'need.help': { en: 'Need Help?', hi: 'मदद चाहिए?', mr: 'मदत हवी आहे का?' },
  'support.desc': { en: 'Our support team is available 24/7.', hi: 'हमारी सहायता टीम 24/7 उपलब्ध है।', mr: 'आमची सपोर्ट टीम 24/7 उपलब्ध आहे.' },
  'contact.support': { en: 'Contact Support', hi: 'संपर्क सहायता', mr: 'संपर्क सपोर्ट' },
  'your.impact': { en: 'Your Impact', hi: 'आपका प्रभाव', mr: 'तुमचा प्रभाव' },
  'crops.scanned': { en: 'Crops Scanned', hi: 'स्कैन की गई फसलें', mr: 'स्कॅन केलेली पिके' },
  'farm.land.label': { en: 'Farm Land', hi: 'खेत की जमीन', mr: 'शेत जमीन' },

  // Business Advisor Form
  'tell.us.resources': { en: 'Tell us about your resources', hi: 'हमें अपने संसाधनों के बारे में बताएं', mr: 'आम्हाला आपल्या संसाधनांबद्दल सांगा' },
  'budget': { en: 'Budget (₹)', hi: 'बजट (₹)', mr: 'अर्थसंकल्प (₹)' },
  'land.acres': { en: 'Land (Acres)', hi: 'भूमि (एकड़)', mr: 'जमीन (एकर)' },
  'water.source': { en: 'Water Source', hi: 'जल स्रोत', mr: 'पाण्याचे स्त्रोत' },
  'experience.years': { en: 'Experience (Years)', hi: 'अनुभव (वर्ष)', mr: 'अनुभव (वर्षे)' },
  'interests': { en: 'Interests', hi: 'रुचियां', mr: 'आवडी' },

  // Market & Strategy
  'market.strategy': { en: 'Market & Strategy', hi: 'बाजार और रणनीति', mr: 'बाजार आणि धोरण' },
  'market.access.q': { en: 'How close are you to a market or buyers?', hi: 'आप बाजार या खरीदारों के कितने करीब हैं?', mr: 'तुम्ही बाजार किंवा खरेदीदारांच्या किती जवळ आहात?' },
  'selling.pref.q': { en: 'Are you willing to sell directly to customers (B2C)?', hi: 'क्या आप सीधे ग्राहकों को बेचने के लिए तैयार हैं (B2C)?', mr: 'तुम्ही थेट ग्राहकांना विकण्यास तयार आहात का (B2C)?' },
  'risk.comfort.q': { en: 'If income fluctuates month to month, how comfortable are you?', hi: 'यदि आय महीने-दर-महीने बदलती रहती है, तो आप कितने सहज हैं?', mr: 'जर उत्पन्न महिन्या-महिन्याला बदलत असेल, तर तुम्ही किती सोयीस्कर आहात?' },
  'invest.timeline.q': { en: 'How long can you wait to recover your investment?', hi: 'आप अपना निवेश वापस पाने के लिए कितना इंतजार कर सकते हैं?', mr: 'तुमची गुंतवणूक परत मिळवण्यासाठी तुम्ही किती वेळ थांबू शकता?' },
  'loss.tolerance.q': { en: 'What is your attitude toward losses in the first year?', hi: 'पहले वर्ष में नुकसान के प्रति आपका क्या रवैया है?', mr: 'पहिल्या वर्षात तोट्याबद्दल तुमचा काय दृष्टिकोन आहे?' },
  'risk.pref.q': { en: 'If given two options, what would you choose?', hi: 'यदि दो विकल्प दिए जाएं, तो आप क्या चुनेंगे?', mr: 'दोन पर्याय दिल्यास, तुम्ही काय निवडाल?' },

  // Important Note
  'important.note': { en: 'IMPORTANT NOTE', hi: 'महत्वपूर्ण लेख', mr: 'महत्वाची टीप' },
  'note.content': {
    en: 'All business ideas and data shown here are research-based and approximate. Actual costs and profits may vary by region, city, market demand, and season.',
    hi: 'यहाँ दिखाए गए सभी व्यावसायिक विचार और डेटा अनुसंधान-आधारित और अनुमानित हैं। वास्तविक लागत और लाभ क्षेत्र, शहर, बाजार की मांग और मौसम के अनुसार भिन्न हो सकते हैं।',
    mr: 'येथे दर्शविलेले सर्व व्यवसाय कल्पना आणि डेटा संशोधनावर आधारित आणि अंदाजित आहेत. वास्तविक खर्च आणि नफा प्रदेश, शहर, बाजार मागणी आणि ऋतू नुसार बदलू शकतो.'
  },
  'acknowledgement': {
    en: 'I have read and understood the above points and acknowledge that the data shown is indicative. I will consider local conditions, market demand, and legal requirements before making any investment decision.',
    hi: 'मैंने उपरोक्त बिंदुओं को पढ़ और समझ लिया है और स्वीकार करता हूं कि दिखाया गया डेटा सांकेतिक है। मैं कोई भी निवेश निर्णय लेने से पहले स्थानीय परिस्थितियों, बाजार की मांग और कानूनी आवश्यकताओं पर विचार करूंगा।',
    mr: 'मी वरील मुद्दे वाचले आणि समजले आहेत आणि मान्य करतो की दर्शविलेला डेटा सूचक आहे. कोणताही गुंतवणूक निर्णय घेण्यापूर्वी मी स्थानिक परिस्थिती, बाजारातील मागणी आणि कायदेशीर आवश्यकतांचा विचार करेन.'
  },
  'analyze': { en: 'Analyze', hi: 'विश्लेषण करें', mr: 'विश्लेषण करा' },
  'retake.assessment': { en: 'Retake Assessment', hi: 'पुनः मूल्यांकन करें', mr: 'पुन्हा मूल्यांकन करा' },
  'start.assessment': { en: 'Start Assessment', hi: 'मूल्यांकन शुरू करें', mr: 'मूल्यांकन सुरू करा' },
  'recommended.businesses': { en: 'Recommended Businesses', hi: 'अनुशंसित व्यवसाय', mr: 'शिफारस केलेले व्यवसाय' },
  'match': { en: 'Match', hi: 'मेल', mr: 'जुळणी' },
  'ask.chatbot': { en: 'Ask Chatbot', hi: 'चैटबॉट से पूछें', mr: 'चॅटबॉटला विचारा' },
  'know.more': { en: 'Know More', hi: 'अधिक जानें', mr: 'अधिक जाणून घ्या' },
  'back.to.results': { en: 'Back to Results', hi: 'परिणामों पर वापस जाएं', mr: 'परिणामांवर परत जा' },
  'connect.experts': { en: 'Connect with Experts', hi: 'विशेषज्ञों से जुड़ें', mr: 'तज्ञांशी कनेक्ट करा' },
  'call.now': { en: 'Call Now', hi: 'अभी कॉल करें', mr: 'आता कॉल करा' },

  // Options (Display Only keys, keeping logic in English if mapped)
  'opt.village': { en: 'Village only', hi: 'केवल गाँव', mr: 'फक्त गाव' },
  'opt.small_town': { en: 'Small town within 10 km', hi: '10 किमी के भीतर छोटा शहर', mr: '10 किमी अंतरावर छोटे शहर' },
  'opt.city': { en: 'City within 30 km', hi: '30 किमी के भीतर शहर', mr: '30 किमी अंतरावर शहर' },
  'opt.direct_buyers': { en: 'Direct buyers already available', hi: 'प्रत्यक्ष खरीदार पहले से उपलब्ध हैं', mr: 'थेट खरेदीदार आधीच उपलब्ध आहेत' },

  'opt.yes_customers': { en: 'Yes, I can handle customers', hi: 'हाँ, मैं ग्राहकों को संभाल सकता हूँ', mr: 'हो, मी ग्राहकांना हाताळू शकतो' },
  'opt.maybe_guidance': { en: 'Maybe, with guidance', hi: 'शायद, मार्गदर्शन के साथ', mr: 'कदाचित, मार्गदर्शनासह' },
  'opt.no_bulk': { en: 'No, I prefer bulk buyers only', hi: 'नहीं, मैं केवल थोक खरीदारों को पसंद करता हूँ', mr: 'नाही, मी फक्त घाऊक खरेदीदारांना प्राधान्य देतो' },

  'opt.comfortable': { en: 'Very comfortable', hi: 'बहुत सहज', mr: 'खूप सोयीस्कर' },
  'opt.somewhat': { en: 'Somewhat okay', hi: 'कुछ हद तक ठीक', mr: 'काहीसे ठीक' },
  'opt.not_comfortable': { en: 'Not comfortable at all', hi: 'बिल्कुल भी सहज नहीं', mr: 'अजिबात सोयीस्कर नाही' },

  'opt.less_1yr': { en: 'Less than 1 year', hi: '1 वर्ष से कम', mr: '1 वर्षापेक्षा कमी' },
  'opt.1_2yrs': { en: '1–2 years', hi: '1–2 वर्ष', mr: '1–2 वर्षे' },
  'opt.2_3yrs': { en: '2–3 years', hi: '2–3 वर्ष', mr: '2–3 वर्षे' },
  'opt.wait_longer': { en: 'I can wait longer', hi: 'मैं अधिक इंतजार कर सकता हूँ', mr: 'मी अधिक काळ थांबू शकतो' },

  'opt.understand_loss': { en: 'I understand initial losses are possible', hi: 'मैं समझता हूं कि शुरुआती नुकसान संभव हैं', mr: 'मला समजते की सुरुवातीचे नुकसान शक्य आहे' },
  'opt.small_loss': { en: 'Small losses acceptable', hi: 'छोटे नुकसान स्वीकार्य', mr: 'लहान नुकसान स्वीकार्य' },
  'opt.no_loss': { en: 'I cannot afford losses', hi: 'मैं नुकसान वहन नहीं कर सकता', mr: 'मी नुकसान परवडू शकत नाही' },

  'opt.safe_income': { en: 'Safe income, lower profit', hi: 'सुरक्षित आय, कम लाभ', mr: 'सुरक्षित उत्पन्न, कमी नफा' },
  'opt.high_profit': { en: 'Higher profit, higher risk', hi: 'उच्च लाभ, उच्च जोखिम', mr: 'जास्त नफा, जास्त धोका' },

  'opt.rainfed': { en: 'Rainfed', hi: 'वर्षा आधारित', mr: 'पावसावर अवलंबून' },
  'opt.canal': { en: 'Canal Irrigation', hi: 'नहर सिंचाई', mr: 'कालवा सिंचन' },
  'opt.borewell': { en: 'Borewell', hi: 'बोरवेल', mr: 'बोअरवेल' },
  'opt.drip': { en: 'Drip Irrigation', hi: 'ड्रिप सिंचाई', mr: 'ठिबक सिंचन' },
  'opt.river': { en: 'River Nearby', hi: 'पास की नदी', mr: 'जवळची नदी' },

  'opt.dairy': { en: 'Dairy Farming', hi: 'डेयरी फार्मिंग', mr: 'दुग्ध व्यवसाय' },
  'opt.poultry': { en: 'Poultry', hi: 'मुर्गी पालन', mr: 'कुक्कुटपालन' },
  'opt.greenhouse': { en: 'Greenhouse Farming', hi: 'ग्रीनहाउस खेती', mr: 'हरितगृह शेती' },
  'opt.goat': { en: 'Goat Farming', hi: 'बकरी पालन', mr: 'शेळीपालन' },
  'opt.shop': { en: 'Shop Handling', hi: 'दुकान संचालन', mr: 'दुकान हाताळणी' },
  'opt.factory': { en: 'Factory Business', hi: 'फैक्ट्री व्यवसाय', mr: 'फॅक्टरी व्यवसाय' },
  'opt.fishery': { en: 'Fishery', hi: 'मत्स्य पालन', mr: 'मत्स्यपालन' },
  'opt.mushroom': { en: 'Mushroom Cultivation', hi: 'मशरूम की खेती', mr: 'मशरूम लागवड' },



  // Green Credit
  'apply.credit': { en: 'Apply for Credit', hi: 'क्रेडिट के लिए आवेदन करें', mr: 'क्रेडिटसाठी अर्ज करा' },
  'my.credits': { en: 'My Credits', hi: 'मेरे क्रेडिट', mr: 'माझे क्रेडिट्स' },


  // Validator Dashboard
  'validatorPortal': { en: 'Validate farmer activities to create green credits', hi: 'हरित क्रेडिट बनाने के लिए किसान गतिविधियों को सत्यापित करें', mr: 'हरित क्रेडिट तयार करण्यासाठी शेतकरी क्रियाकलाप सत्यापित करा' },
  'pendingRequests': { en: 'Pending Requests', hi: 'लंबित अनुरोध', mr: 'प्रलंबित विनंत्या' },
  'noPending': { en: 'No pending requests', hi: 'कोई लंबित अनुरोध नहीं', mr: 'कोणत्याही प्रलंबित विनंत्या नाहीत' },
  'verifyTitle': { en: 'Verify Application', hi: 'आवेदन सत्यापित करें', mr: 'अर्ज सत्यापित करा' },
  'farmerDetails': { en: 'Farmer Details', hi: 'किसान विवरण', mr: 'शेतकरी तपशील' },
  'activity': { en: 'Activity', hi: 'गतिविधि', mr: 'क्रियाकलाप' },
  'evidence': { en: 'Evidence', hi: 'प्रमाण', mr: 'पुरावा' },
  'estCredits': { en: 'Credits to Mint', hi: 'जारी करने के लिए क्रेडिट', mr: 'मिंट करण्यासाठी क्रेडिट' },
  'selectRequest': { en: 'Select a request to verify', hi: 'सत्यापित करने के लिए एक अनुरोध चुनें', mr: 'सत्यापित करण्यासाठी विनंती निवडा' },
  'validation.zero_mile': { en: 'Validation Phase: Zero Mile', hi: 'सत्यापन चरण: शून्य मील', mr: 'सत्यापन टप्पा: शून्य मैल' },

  // Buyer Dashboard
  'investFuture': { en: 'Invest in verified sustainable farming projects', hi: 'सत्यापित टिकाऊ खेती परियोजनाओं में निवेश करें', mr: 'सत्यापित शाश्वत शेती प्रकल्पांमध्ये गुंतवणूक करा' },
  'refresh': { en: 'Refresh', hi: 'ताज़ा करें', mr: 'रीफ्रेश करा' },
  'filter': { en: 'Filter', hi: 'फ़िल्टर', mr: 'फिल्टर' },
  'quantity': { en: 'Quantity', hi: 'मात्रा', mr: 'प्रमाण' },
  'amount': { en: 'Credits', hi: 'क्रेडिट', mr: 'क्रेडिट्स' },
  'impact': { en: 'Eco Impact', hi: 'पर्यावरण प्रभाव', mr: 'पर्यावरण प्रभाव' },
  'auth.success.login': { en: 'Logged in successfully!', hi: 'सफलतापूर्वक लॉगिन किया गया!', mr: 'यशस्वीरित्या लॉगिन केले!' },
  'auth.success.signup': { en: 'Account created successfully!', hi: 'खाता सफलतापूर्वक बनाया गया!', mr: 'खाते यशस्वीरित्या तयार केले!' },
  'auth.error.failed': { en: 'Authentication failed', hi: 'प्रमाणीकरण विफल', mr: 'प्रमाणीकरण अयशस्वी' },
  'auth.error.user_not_found': { en: 'User not found', hi: 'उपयोगकर्ता नहीं मिला', mr: 'वापरकर्ता सापडला नाही' },
  'auth.error.wrong_password': { en: 'Incorrect password', hi: 'गलत पासवर्ड', mr: 'चुकीचा पासवर्ड' },
  'auth.error.email_in_use': { en: 'User already exists', hi: 'उपयोगकर्ता पहले से मौजूद है', mr: 'वापरकर्ता आधीच अस्तित्वात आहे' },
  'unit.acres': { en: 'Ac', hi: 'एकड़', mr: 'एकर' },
  'detected.in': { en: 'Detected in', hi: 'में पता चला', mr: 'मध्ये आढळले' },

  // Business Advisor UI
  'investment': { en: 'Investment', hi: 'निवेश', mr: 'गुंतवणूक' },
  'profit': { en: 'Profit', hi: 'लाभ', mr: 'नफा' },
  'requirements': { en: 'Requirements', hi: 'आवश्यकताएं', mr: 'आवश्यकता' },

  'live.advisor': { en: 'Live Advisor', hi: 'लाइव सलाहकार', mr: 'थेट सल्लागार' },
  'expert.advisor': { en: 'Expert Business Advisor', hi: 'विशेषज्ञ व्यापार सलाहकार', mr: 'तज्ञ व्यवसाय सल्लागार' },
  'ai.disclaimer': { en: 'AI advice may vary. Always consult with local experts.', hi: 'एआई सलाह भिन्न हो सकती है। हमेशा स्थानीय विशेषज्ञों से सलाह लें।', mr: 'एआय सल्ला बदलू शकतो. नेहमी स्थानिक तज्ञांशी सल्लामसलत करा.' },
  'chat.greeting': { en: 'Namaste! I am your KrishiSaarthi Advisor. Ask me about crops, prices, or schemes.', hi: 'नमस्ते! मैं आपका कृषिसारथी सलाहकार हूँ। मुझसे फसलों, कीमतों या योजनाओं के बारे में पूछें।', mr: 'नमस्ते! मी तुमचा कृषिसारथी सल्लागार आहे. मला पिके, किमती किंवा योजनांबद्दल विचारा.' },


  // Business Titles
  'biz.1.title': { en: 'FLOWER PLANTATION (GERBERA)', hi: 'फूलों की खेती (जरबेरा)', mr: 'फुलांची लागवड (जरबेरा)' },
  'biz.2.title': { en: 'PACKAGED DRINKING WATER BUSINESS', hi: 'पैकबंद पीने का पानी व्यवसाय', mr: 'पॅकेज्ड पिण्याचे पाणी व्यवसाय' },
  'biz.3.title': { en: 'AMUL FRANCHISE BUSINESS', hi: 'अमूल फ्रैंचाइज़ी व्यवसाय', mr: 'अमूल फ्रँचायझी व्यवसाय' },
  'biz.4.title': { en: 'SPIRULINA FARMING (ALGAE)', hi: 'स्पिरुलिना खेती (शैवाल)', mr: 'स्पिरुलिना शेती (शेवाळ)' },
  'biz.5.title': { en: 'DAIRY FARMING (6–8 COW UNIT)', hi: 'डेयरी फार्मिंग (6-8 गाय इकाई)', mr: 'दुग्ध व्यवसाय (6-8 गायींचे युनिट)' },
  'biz.6.title': { en: 'GOAT MILK FARMING (20–25 MILCH GOATS UNIT)', hi: 'बकरी के दूध की खेती (20-25 दुधारू बकरियां)', mr: 'शेळी दूध व्यवसाय (20-25 दुभत्या शेळ्या)' },
  'biz.7.title': { en: 'MUSHROOM FARMING (OYSTER)', hi: 'मशरूम की खेती (ऑयस्टर)', mr: 'मशरूम शेती (ऑयस्टर)' },
  'biz.8.title': { en: 'POULTRY FARMING (BROILER – 1,000 BIRDS)', hi: 'मुर्गी पालन (बॉयलर - 1,000 पक्षी)', mr: 'कुक्कुटपालन (ब्रॉयलर - 1,000 पक्षी)' },
  'biz.9.title': { en: 'VERMICOMPOST PRODUCTION', hi: 'वर्मीकम्पोस्ट उत्पादन', mr: 'गांडूळ खत उत्पादन' },
  'biz.10.title': { en: 'PLANT NURSERY', hi: 'पौधशाला', mr: 'रोपांची नर्सरी' },
  'biz.11.title': { en: 'COW DUNG ORGANIC MANURE & BIO-INPUTS', hi: 'गाय के गोबर की जैविक खाद और जैव-इनपुट', mr: 'शेणखत सेंद्रिय खत आणि बायो-इनपुट्स' },
  'biz.12.title': { en: 'COW DUNG PRODUCTS (DHOOP, DIYAS)', hi: 'गाय के गोबर के उत्पाद (धूप, दीया)', mr: 'शेणापासून बनवलेली उत्पादने (धूप, दिवे)' },
  'biz.13.title': { en: 'LEAF PLATE (DONA–PATTAL) MANUFACTURING', hi: 'पत्ता प्लेट (दोना-पत्तल) विनिर्माण', mr: 'पत्रावळी (दोना-पत्तल) निर्मिती' },
  'biz.14.title': { en: 'AGRI-INPUT TRADING', hi: 'कृषि-इनपुट व्यापार', mr: 'कृषी-इनपुट ट्रेडिंग' },
  'biz.15.title': { en: 'INLAND FISH FARMING (POND-BASED)', hi: 'अंतर्देशीय मछली पालन (तालाब आधारित)', mr: 'गोड्या पाण्यातील मत्स्यपालन (तलावावर आधारित)' },
  'confidence': { en: 'Confidence', hi: 'विश्वास', mr: 'आत्मविश्वास' },
  'prevention': { en: 'Prevention', hi: 'रोकथाम', mr: 'प्रतिबंध' },
  'tap.to.upload': { en: 'Tap to take photo or upload', hi: 'फोटो लेने या अपलोड करने के लिए टैप करें', mr: 'फोटो काढण्यासाठी किंवा अपलोड करण्यासाठी टॅप करा' },
  'severity.low': { en: 'Low', hi: 'कम', mr: 'कमी' },
  'severity.medium': { en: 'Medium', hi: 'मध्यम', mr: 'मध्यम' },
  'severity.high': { en: 'High', hi: 'उच्च', mr: 'उच्च' },
  'connect.wallet': { en: 'Connect Wallet', hi: 'वॉलेट कनेक्ट करें', mr: 'वॉलेट कनेक्ट करा' },
  'connecting': { en: 'Connecting...', hi: 'कनेक्ट हो रहा है...', mr: 'कनेक्ट होत आहे...' },
  'activity.type.label': { en: 'Activity Type', hi: 'गतिविधि का प्रकार', mr: 'क्रियाकलाप प्रकार' },
  'specify.activity': { en: 'Specify activity', hi: 'गतिविधि निर्दिष्ट करें', mr: 'क्रियाकलाप निर्दिष्ट करा' },
  'describe.activity': { en: 'Describe your activity...', hi: 'अपनी गतिविधि का वर्णन करें...', mr: 'आपल्या क्रियाकलापाचे वर्णन करा...' },
  'enter.location': { en: 'Enter farm location', hi: 'खत का स्थान दर्ज करें', mr: 'शेताचे स्थान प्रविष्ट करा' },
  'tap.upload.proof': { en: 'Tap to upload proof', hi: 'प्रमाण अपलोड करने के लिए टैप करें', mr: 'पुरावा अपलोड करण्यासाठी टॅप करा' },
  'submit.application': { en: 'Submit Application', hi: 'आवेदन जमा करें', mr: 'अर्ज सबमिट करा' },
  'submitting': { en: 'Submitting...', hi: 'जमा कर रहा है...', mr: 'सबमिट करत आहे...' },
  'connect.view.credits': { en: 'Connect wallet to view credits', hi: 'क्रेडिट देखने के लिए वॉलेट कनेक्ट करें', mr: 'क्रेडिट पाहण्यासाठी वॉलेट कनेक्ट करा' },
  'no.credits': { en: 'No credits found.', hi: 'कोई क्रेडिट नहीं मिला।', mr: 'कोणतेही क्रेडिट सापडले नाही.' },
  'act.organic': { en: 'Organic Farming', hi: 'जैविक खेती', mr: 'सेंद्रिय शेती' },
  'act.water': { en: 'Water Conservation', hi: 'जल संरक्षण', mr: 'जल संवर्धन' },
  'act.tree': { en: 'Tree Plantation', hi: 'वृक्षारोपण', mr: 'वृक्षारोपण' },
  'act.soil': { en: 'Soil Conservation', hi: 'मिट्टी संरक्षण', mr: 'मृदा संवर्धन' },
  'act.other': { en: 'Other', hi: 'अन्य', mr: 'इतर' },
  'validator.title': { en: 'Validator Portal', hi: 'सत्यापनकर्ता पोर्टल', mr: 'पडताळणीकर्ता पोर्टल' },
  'validator.connect.desc': { en: 'Connect your wallet to access the validator dashboard', hi: 'सत्यापनकर्ता डैशबोर्ड तक पहुंचने के लिए अपना वॉलेट कनेक्ट करें', mr: 'पडताळणीकर्ता डॅशबोर्डवर प्रवेश करण्यासाठी आपले वॉलेट कनेक्ट करा' },
  'validator.desc': { en: 'Validate farmer activities to create green credits', hi: 'हरित क्रेडिट बनाने के लिए किसान गतिविधियों को सत्यापित करें', mr: 'हरित क्रेडिट तयार करण्यासाठी शेतकरी क्रियाकलाप सत्यापित करा' },
  'admin.panel': { en: 'Admin Panel', hi: 'एडमिन पैनल', mr: 'प्रशासन पॅनेल' },
  'admin.desc': { en: 'Add new validators to the network. Only the contract owner can perform this action.', hi: 'नेटवर्क में नए सत्यापनकर्ता जोड़ें। केवल अनुबंध स्वामी ही यह कार्रवाई कर सकता है।', mr: 'नेटवर्कमध्ये नवीन पडताळणीकर्ता जोडा. केवळ करार मालक ही क्रिया करू शकतो.' },
  'new.validator.address': { en: 'New Validator Address', hi: 'नया सत्यापनकर्ता पता', mr: 'नवीन पडताळणीकर्ता पत्ता' },
  'enter.wallet.desc': { en: 'Enter the wallet address of the user you want to authorize as a validator.', hi: 'उस उपयोगकर्ता का वॉलेट पता दर्ज करें जिसे आप सत्यापनकर्ता के रूप में अधिकृत करना चाहते हैं।', mr: 'आपल्याला सत्यापित म्हणून अधिकृत करू इच्छित असलेल्या वापरकर्त्याचा वॉलेट पत्ता प्रविष्ट करा.' },
  'add.validator': { en: 'Add Validator', hi: 'सत्यापनकर्ता जोड़ें', mr: 'पडताळणीकर्ता जोडा' },
  'adding': { en: 'Adding...', hi: 'जोड़ रहा है...', mr: 'जोडत आहे...' },
  'success.verified': { en: 'Project verified and credits minted successfully!', hi: 'परियोजना सत्यापित और क्रेडिट सफलतापूर्वक जारी किए गए!', mr: 'प्रकल्प सत्यापित आणि क्रेडिट यशस्वीरित्या मिंट केले!' },
  'success.validator.added': { en: 'Validator added successfully!', hi: 'सत्यापनकर्ता सफलतापूर्वक जोड़ा गया!', mr: 'पडताळणीकर्ता यशस्वीरित्या जोडला गेला!' },
  'error.verification': { en: 'Verification failed', hi: 'सत्यापन विफल', mr: 'सत्यापन अयशस्वी' },
  'error.validator.add': { en: 'Failed to add validator', hi: 'सत्यापनकर्ता जोड़ने में विफल', mr: 'पडताळणीकर्ता जोडण्यात अपयश' },
  'marketplace.title': { en: 'Green Credit Marketplace', hi: 'हरित क्रेडिट बाज़ार', mr: 'ग्रीन क्रेडिट मार्केटप्लेस' },
  'marketplace.desc': { en: 'Connect your wallet to browse and purchase verified green credits.', hi: 'सत्यापित हरित क्रेडिट ब्राउज़ करने और खरीदने के लिए अपना वॉलेट कनेक्ट करें।', mr: 'सत्यापित ग्रीन क्रेडिट ब्राउझ करण्यासाठी आणि खरेदी करण्यासाठी आपले वॉलेट कनेक्ट करा.' },

  'success.purchase': { en: 'Purchase Successful!', hi: 'खरीदारी सफल!', mr: 'खरेदी यशस्वी!' },
  'demo.purchase': { en: 'Demo Purchase Successful! You bought credits from Listing', hi: 'डेमो खरीदारी सफल! आपने लिस्टिंग से क्रेडिट खरीदे', mr: 'डेमो खरेदी यशस्वी! आपण लिस्टिंगमधून क्रेडिट खरेदी केले' },
  'prompt.buy': { en: 'How much to buy? (Max:', hi: 'कितना खरीदना है? (अधिकतम:', mr: 'किती खरेदी करायचे? (कमाल:' },
  'error.invalid_amount': { en: 'Please enter a valid amount between 1 and', hi: 'कृपया 1 और के बीच एक valid राशि दर्ज करें', mr: 'कृपया 1 आणि च्या दरम्यान वैध रक्कम प्रविष्ट करा' },
  'credit.suffix': { en: 'Credit', hi: 'क्रेडिट', mr: 'क्रेडिट' },
  // Disease Detection Specifics (Demo)
  'Corn (maize)': { en: 'Corn (maize)', hi: 'मक्का', mr: 'मका' },
  'Northern Leaf Blight': { en: 'Northern Leaf Blight', hi: 'उत्तरी पत्ती झुलसा', mr: 'उत्तरीय पानांवरील करपा' },
  'Use resistant hybrids. Practice crop rotation and tillage to bury residue.': {
    en: 'Use resistant hybrids. Practice crop rotation and tillage to bury residue.',
    hi: 'प्रतिरोधी किस्मों का उपयोग करें। फसल चक्र अपनाएं और अवशेषों को दफनाने के लिए जुताई करें।',
    mr: 'प्रतिकारक्षम जातींचा वापर करा. पीक फेरपालट करा आणि अवशेष गाडण्यासाठी मशागत करा.'
  },
  'Chemical: Foliar fungicides like Pyraclostrobin or Tebuconazole.': {
    en: 'Chemical: Foliar fungicides like Pyraclostrobin or Tebuconazole.',
    hi: 'रासायनिक: पाइराक्लोस्ट्रोबिन या टेबुकोनाज़ोल जैसे कवकनाशी का छिड़काव करें।',
    mr: 'रासायनिक: पायराक्लोस्ट्रोबिन किंवा टेबुकोनाझोल सारख्या बुरशीनाशकांचा वापर करा.'
  },
  'Keep area clean': { en: 'Keep area clean', hi: 'क्षेत्र को साफ रखें', mr: 'क्षेत्र स्वच्छ ठेवा' },
  'Use resistant varieties': { en: 'Use resistant varieties', hi: 'प्रतिरोधी किस्मों का उपयोग करें', mr: 'प्रतिकारक्षम वाण वापरा' },
  'Detected high severity Northern Leaf Blight in Corn (maize).': {
    en: 'Detected high severity Northern Leaf Blight in Corn (maize).',
    hi: 'मक्का में उच्च तीव्रता वाला उत्तरी पत्ती झुलसा रोग पाया गया।',
    mr: 'मका पिकावर तीव्र उत्तरी पानांवरील करपा रोग आढळला.'
  },
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const t = (key: string): string => {
    return translations[key]?.[language] ?? key;
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

  const incrementScans = async () => {
    if (!user) return;
    try {
      const newCount = (user.scansCount || 0) + 1;
      const userRef = doc(db, 'users', user.id);

      // Update Firestore
      await setDoc(userRef, { scansCount: newCount }, { merge: true });

      // Update local state
      setUser({ ...user, scansCount: newCount });
    } catch (error) {
      console.error('Error incrementing scan count:', error);
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
    <AppContext.Provider value={{ language, setLanguage, user, setUser, logout, login, signup, t, loading, incrementScans }}>
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
