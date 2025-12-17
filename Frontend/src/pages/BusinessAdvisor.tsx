import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { ArrowLeft, ArrowRight, MessageSquare, Phone, Download, TrendingUp, AlertTriangle, Leaf, User, Send, Briefcase, DollarSign, Ruler, Droplets, CheckCircle, Info, MapPin, Loader2, X } from 'lucide-react';
import { BUSINESS_DETAILS } from '../data/businessData';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import { config } from '../config';

const API_BASE_URL = config.API_BASE_URL;

type View = 'intro' | 'form' | 'results' | 'chat' | 'experts';

interface ChatMessage {
    id: string;
    sender: 'user' | 'ai';
    text: string;
    timestamp: Date;
}

const Wrapper = ({ children }: { children: React.ReactNode }) => {
    const { t } = useApp();
    const navigate = useNavigate();
    return (
        <div className="max-w-5xl mx-auto space-y-6 pt-8 pb-16 px-4">
            <button onClick={() => navigate('/farmer-dashboard')} className="mb-4 text-gray-500 hover:text-primary flex items-center gap-2 font-bold text-lg">
                <ArrowLeft size={24} /> {t('back') || 'Back'}
            </button>
            {children}
        </div>
    );
};


export default function BusinessAdvisor() {
    const { t, language } = useApp();
    const navigate = useNavigate();
    const location = useLocation();
    const [view, setView] = useState<View>('intro');

    // Logic State

    const [sessionId, setSessionId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);

    // Initialize greeting effect
    useEffect(() => {
        setMessages([
            { id: '1', sender: 'ai', text: t('chat.greeting'), timestamp: new Date() }
        ]);
    }, [t]);

    const [chatInput, setChatInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Form State
    const [formData, setFormData] = useState({
        budget: '',
        land: '',
        waterSource: 'Rainfed',
        experience: '',
        interests: [] as string[],
        marketAccess: '',
        sellingPreference: '',
        riskComfort: '',
        investmentTimeline: '',
        lossTolerance: '',
        riskPreference: ''
    });

    // Dynamic Recommendations State
    const [recommendations, setRecommendations] = useState<any[]>([]);

    const [isAcknowledged, setIsAcknowledged] = useState(false);
    const [selectedBusinessId, setSelectedBusinessId] = useState<string | null>(null);
    const [pendingContext, setPendingContext] = useState<{ title: string; data: string } | null>(null);

    const interestOptions = [
        'Dairy Farming', 'Poultry', 'Greenhouse Farming', 'Goat Farming',
        'Shop Handling', 'Factory Business', 'Fishery', 'Mushroom Cultivation'
    ];

    const waterOptions = ['Rainfed', 'Canal Irrigation', 'Borewell', 'Drip Irrigation', 'River Nearby'];

    // Check if coming from disease detector
    useEffect(() => {
        const diseaseResult = location.state?.diseaseResult;
        const fromDiseaseDetector = location.state?.fromDiseaseDetector;

        if (fromDiseaseDetector && diseaseResult) {
            setView('chat'); // Go directly to chat
            initializeAdvisorWithDisease(diseaseResult);
        }
    }, [location.state]);

    const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    useEffect(scrollToBottom, [messages]);

    // Handle Pending Context Trigger
    useEffect(() => {
        if (view === 'chat' && pendingContext) {
            const initContextChat = async () => {
                // UI Message (Short)
                const uiText = `I am interested in ${pendingContext.title}. Can you help me understand the risks and profits?`;

                // API Message (Long with Context)
                const apiText = `User is interested in ${pendingContext.title}. 
                
                HERE IS THE STRICT DATA SOURCE YOU MUST USE:
                ${pendingContext.data}
                
                User Question: ${uiText}
                
                Instructions:
                1. Answer detailed questions based ONLY on the provided data.
                2. If the user asks about ROI, Investment, or Risks, quote the data exactly.
                3. Be helpful and encouraging.`;

                await handleSendMessage(uiText, apiText);
                setPendingContext(null); // Clear context after sending
            };
            initContextChat();
        }
    }, [view, pendingContext]);

    // --- API Logic ---

    const initializeAdvisor = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_BASE_URL}/business-advisor/init`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: 'Farmer',
                    land_size: parseFloat(formData.land) || 5.0,
                    capital: parseFloat(formData.budget) || 100000,
                    market_access: formData.marketAccess || 'moderate',
                    skills: formData.interests.map(s => s.toLowerCase()),
                    risk_level: formData.riskComfort || 'low',
                    time_availability: 'full-time',
                    experience_years: parseFloat(formData.experience) || 0,
                    language: language === 'hi' ? 'hindi' : language === 'mr' ? 'marathi' : 'english',
                    selling_preference: formData.sellingPreference,
                    recovery_timeline: formData.investmentTimeline,
                    loss_tolerance: formData.lossTolerance,
                    risk_preference: formData.riskPreference
                })
            });

            if (!response.ok) throw new Error('Failed to initialize advisor');
            const data = await response.json();
            setSessionId(data.session_id);

            if (data.recommendations && data.recommendations.length > 0) {
                setRecommendations(data.recommendations);
            }

            setView('results');
        } catch (err) {
            console.error('Error initializing:', err);
            // Fallback to results anyway for demo if API fails
            setView('results');
        } finally {
            setIsLoading(false);
        }
    };

    const initializeAdvisorWithDisease = async (diseaseResult: any) => {
        setIsLoading(true);
        try {
            // Init session first
            const initResponse = await fetch(`${API_BASE_URL}/business-advisor/init`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: 'Farmer',
                    language: language === 'hi' ? 'hindi' : language === 'mr' ? 'marathi' : 'english'
                })
            });
            if (!initResponse.ok) throw new Error('Failed to init');
            const initData = await initResponse.json();
            setSessionId(initData.session_id);

            // Get advice
            const adviceResponse = await fetch(`${API_BASE_URL}/business-advisor/integrated-advice`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    session_id: initData.session_id,
                    disease_result: diseaseResult
                })
            });
            if (!adviceResponse.ok) throw new Error('Failed to get advice');
            const adviceData = await adviceResponse.json();

            setMessages(prev => [
                ...prev,
                { id: Date.now().toString(), sender: 'ai', text: `I see you have detected ${diseaseResult.disease}. Here is my advice: ${adviceData.response}`, timestamp: new Date() }
            ]);
        } catch (err) {
            console.error(err);
            setMessages(prev => [...prev, { id: 'err', sender: 'ai', text: 'I noticed the disease report but could not fetch specific advice right now. How can I help?', timestamp: new Date() }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSendMessage = async (textOverride?: string, apiMessageOverride?: string) => {
        const textToSend = textOverride || chatInput;
        if (!textToSend.trim()) return;

        // If no session, try to init one silently (or handle error)
        if (!sessionId) {
            // Simple init if missing
            try {
                const res = await fetch(`${API_BASE_URL}/business-advisor/init`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: 'Farmer',
                        language: language === 'hi' ? 'hindi' : language === 'mr' ? 'marathi' : 'english'
                    })
                });
                const d = await res.json();
                setSessionId(d.session_id);
            } catch (e) { console.error(e); }
        }

        const userMsg: ChatMessage = {
            id: Date.now().toString(),
            sender: 'user',
            text: textToSend,
            timestamp: new Date()
        };
        setMessages(prev => [...prev, userMsg]);
        setChatInput('');
        setIsLoading(true);

        try {
            const response = await fetch(`${API_BASE_URL}/business-advisor/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    session_id: sessionId,
                    message: apiMessageOverride || textToSend
                })
            });

            if (!response.ok) throw new Error('Failed to get response');
            const data = await response.json();

            const aiMsg: ChatMessage = {
                id: (Date.now() + 1).toString(),
                sender: 'ai',
                text: data.response,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, aiMsg]);
        } catch (err) {
            setMessages(prev => [...prev, { id: 'err', sender: 'ai', text: 'Sorry, I am having trouble connecting. Please try again.', timestamp: new Date() }]);
        } finally {
            setIsLoading(false);
        }
    };

    // --- Handlers ---

    const startBusinessChat = (businessId: string) => {
        const business = BUSINESS_DETAILS[businessId];
        if (business) {
            // Construct a data string from the sections
            const dataString = business.sections.map(s => `${s.title}:\n${s.content.join('\n')}`).join('\n\n');

            setPendingContext({
                title: business.title,
                data: `BASIC IDEA: ${business.basicIdea.join(' ')}\n\n${dataString}`
            });
            setView('chat');
        } else {
            // Fallback if no data (e.g. for unmapped businesses)
            setView('chat');
        }
    };

    // --- Handlers ---

    const handleInterestToggle = (interest: string) => {
        setFormData(prev => ({
            ...prev,
            interests: prev.interests.includes(interest)
                ? prev.interests.filter(i => i !== interest)
                : [...prev.interests, interest]
        }));
    };

    const handleAssessmentSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        initializeAdvisor(); // Call API then switch view
    };


    // Use dynamic recommendations if available, otherwise default fallback (which shouldn't look like this, but kept for type safety)
    const displaySuggestions = recommendations.length > 0 ? recommendations : [
        {
            id: '1', title: 'Greenhouse Farming (Fallback)', description: 'Please check your connection for personalized results.',
            estimated_cost: 'N/A', profit_potential: 'N/A', suitability: 0, requirements: []
        }
    ];

    const experts = [
        { id: '1', name: 'Dr. Ramesh Kumar', specialization: 'Organic Expert', phone: '+919876543210', email: 'ramesh@agri.com', location: 'Pune' },
        { id: '2', name: 'Dr. Priya Sharma', specialization: 'Business Dev', phone: '+919876543211', email: 'priya@agri.com', location: 'Nashik' }
    ];

    if (view === 'intro') {
        return (
            <Wrapper>
                <div className="text-center py-16 px-6 bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="bg-blue-100 dark:bg-blue-900/30 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8">
                        <Briefcase className="w-12 h-12 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-6">{t('business.advisor') || 'Business Advisor'}</h2>
                    <p className="text-gray-600 dark:text-gray-300 mb-10 text-xl max-w-xl mx-auto leading-relaxed">
                        {t('business.advisor.desc')}
                    </p>
                    <button
                        onClick={() => setView('form')}
                        className="px-10 py-5 bg-primary text-white text-xl font-bold rounded-2xl shadow-xl hover:bg-primary-dark transition-all flex items-center justify-center gap-3 mx-auto transform hover:-translate-y-1"
                    >
                        {t('start.assessment')} <ArrowRight size={28} />
                    </button>
                </div>
            </Wrapper>
        );
    }

    if (view === 'form') {
        return (
            <Wrapper>
                <div className="bg-white dark:bg-gray-800 p-10 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <h2 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">{t('tell.us.resources')}</h2>
                    <form onSubmit={handleAssessmentSubmit} className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-base font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                                    <DollarSign size={18} className="text-green-500" /> {t('budget')}
                                </label>
                                <input type="number" required className="w-full p-4 border border-gray-300 rounded-xl dark:bg-gray-700 dark:border-gray-600 bg-white dark:text-white"
                                    placeholder="e.g. 100000" value={formData.budget} onChange={e => setFormData({ ...formData, budget: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-base font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                                    <Ruler size={18} className="text-blue-500" /> {t('land.acres')}
                                </label>
                                <input type="number" required className="w-full p-4 border border-gray-300 rounded-xl dark:bg-gray-700 dark:border-gray-600 bg-white dark:text-white"
                                    placeholder="e.g. 5" value={formData.land} onChange={e => setFormData({ ...formData, land: e.target.value })} />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-base font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                                    <Droplets size={18} className="text-cyan-500" /> {t('water.source')}
                                </label>
                                <select className="w-full p-4 border border-gray-300 rounded-xl dark:bg-gray-700 dark:border-gray-600 bg-white dark:text-white"
                                    value={formData.waterSource} onChange={e => setFormData({ ...formData, waterSource: e.target.value })}>
                                    {waterOptions.map(opt => {
                                        const map: Record<string, string> = {
                                            'Rainfed': 'opt.rainfed', 'Canal Irrigation': 'opt.canal', 'Borewell': 'opt.borewell',
                                            'Drip Irrigation': 'opt.drip', 'River Nearby': 'opt.river'
                                        };
                                        return <option key={opt} value={opt}>{t(map[opt] || opt)}</option>;
                                    })}
                                </select>
                            </div>
                            <div>
                                <label className="block text-base font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                                    <User size={18} className="text-purple-500" /> {t('experience.years')}
                                </label>
                                <input type="number" required className="w-full p-4 border border-gray-300 rounded-xl dark:bg-gray-700 dark:border-gray-600 bg-white dark:text-white"
                                    placeholder="e.g. 5" value={formData.experience} onChange={e => setFormData({ ...formData, experience: e.target.value })} />
                            </div>
                        </div>

                        <div>
                            <label className="block text-base font-bold text-gray-700 dark:text-gray-300 mb-4">{t('interests')}</label>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {interestOptions.map(option => {
                                    const map: Record<string, string> = {
                                        'Dairy Farming': 'opt.dairy', 'Poultry': 'opt.poultry', 'Greenhouse Farming': 'opt.greenhouse',
                                        'Goat Farming': 'opt.goat', 'Shop Handling': 'opt.shop', 'Factory Business': 'opt.factory',
                                        'Fishery': 'opt.fishery', 'Mushroom Cultivation': 'opt.mushroom'
                                    };
                                    return (
                                        <div key={option} onClick={() => handleInterestToggle(option)}
                                            className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col items-center justify-center text-center gap-2 h-28 ${formData.interests.includes(option) ? 'bg-blue-50 border-blue-500 text-blue-700 dark:bg-blue-900/30 dark:text-blue-200' : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                                                }`}
                                        >
                                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${formData.interests.includes(option) ? 'bg-blue-500 border-blue-500 text-white' : 'border-gray-300'}`}>
                                                {formData.interests.includes(option) && <CheckCircle size={16} />}
                                            </div>
                                            <span className="text-sm font-bold leading-tight">{t(map[option] || option)}</span>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Market & Strategy Section */}
                        <div className="bg-gray-50 dark:bg-gray-900/30 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 space-y-8">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">{t('market.strategy')}</h3>

                            {/* 1. Market Access */}
                            <div>
                                <label className="block text-base font-bold text-gray-700 dark:text-gray-300 mb-3">
                                    {t('market.access.q')}
                                </label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {['Village only', 'Small town within 10 km', 'City within 30 km', 'Direct buyers already available'].map(opt => {
                                        const map: Record<string, string> = { 'Village only': 'opt.village', 'Small town within 10 km': 'opt.small_town', 'City within 30 km': 'opt.city', 'Direct buyers already available': 'opt.direct_buyers' };
                                        return (
                                            <label key={opt} className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${formData.marketAccess === opt ? 'border-primary bg-primary/5' : 'border-gray-200 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-800'}`}>
                                                <input type="radio" name="marketAccess" value={opt} checked={formData.marketAccess === opt} onChange={e => setFormData({ ...formData, marketAccess: e.target.value })} className="w-5 h-5 text-primary focus:ring-primary" />
                                                <span className="font-medium text-gray-700 dark:text-gray-300">{t(map[opt] || opt)}</span>
                                            </label>
                                        )
                                    })}
                                </div>
                            </div>

                            {/* 2. Selling Preference */}
                            <div>
                                <label className="block text-base font-bold text-gray-700 dark:text-gray-300 mb-3">
                                    {t('selling.pref.q')}
                                </label>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    {['Yes, I can handle customers', 'Maybe, with guidance', 'No, I prefer bulk buyers only'].map(opt => {
                                        const map: Record<string, string> = { 'Yes, I can handle customers': 'opt.yes_customers', 'Maybe, with guidance': 'opt.maybe_guidance', 'No, I prefer bulk buyers only': 'opt.no_bulk' };
                                        return (
                                            <label key={opt} className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${formData.sellingPreference === opt ? 'border-primary bg-primary/5' : 'border-gray-200 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-800'}`}>
                                                <input type="radio" name="sellingPreference" value={opt} checked={formData.sellingPreference === opt} onChange={e => setFormData({ ...formData, sellingPreference: e.target.value })} className="w-5 h-5 text-primary focus:ring-primary" />
                                                <span className="font-medium text-gray-700 dark:text-gray-300">{t(map[opt] || opt)}</span>
                                            </label>
                                        )
                                    })}
                                </div>
                            </div>

                            {/* 3. Risk Comfort */}
                            <div>
                                <label className="block text-base font-bold text-gray-700 dark:text-gray-300 mb-3">
                                    {t('risk.comfort.q')}
                                </label>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    {['Very comfortable', 'Somewhat okay', 'Not comfortable at all'].map(opt => {
                                        const map: Record<string, string> = { 'Very comfortable': 'opt.comfortable', 'Somewhat okay': 'opt.somewhat', 'Not comfortable at all': 'opt.not_comfortable' };
                                        return (
                                            <label key={opt} className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${formData.riskComfort === opt ? 'border-primary bg-primary/5' : 'border-gray-200 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-800'}`}>
                                                <input type="radio" name="riskComfort" value={opt} checked={formData.riskComfort === opt} onChange={e => setFormData({ ...formData, riskComfort: e.target.value })} className="w-5 h-5 text-primary focus:ring-primary" />
                                                <span className="font-medium text-gray-700 dark:text-gray-300">{t(map[opt] || opt)}</span>
                                            </label>
                                        )
                                    })}
                                </div>
                            </div>

                            {/* 4. Investment Recovery Timeline */}
                            <div>
                                <label className="block text-base font-bold text-gray-700 dark:text-gray-300 mb-3">
                                    {t('invest.timeline.q')}
                                </label>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    {['Less than 1 year', '1–2 years', '2–3 years', 'I can wait longer'].map(opt => {
                                        const map: Record<string, string> = { 'Less than 1 year': 'opt.less_1yr', '1–2 years': 'opt.1_2yrs', '2–3 years': 'opt.2_3yrs', 'I can wait longer': 'opt.wait_longer' };
                                        return (
                                            <label key={opt} className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${formData.investmentTimeline === opt ? 'border-primary bg-primary/5' : 'border-gray-200 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-800'}`}>
                                                <input type="radio" name="investmentTimeline" value={opt} checked={formData.investmentTimeline === opt} onChange={e => setFormData({ ...formData, investmentTimeline: e.target.value })} className="w-5 h-5 text-primary focus:ring-primary" />
                                                <span className="font-medium text-gray-700 dark:text-gray-300">{t(map[opt] || opt)}</span>
                                            </label>
                                        )
                                    })}
                                </div>
                            </div>

                            {/* 5. First-Year Loss Tolerance */}
                            <div>
                                <label className="block text-base font-bold text-gray-700 dark:text-gray-300 mb-3">
                                    {t('loss.tolerance.q')}
                                </label>
                                <div className="flex flex-col gap-3">
                                    {['I understand initial losses are possible', 'Small losses acceptable', 'I cannot afford losses'].map(opt => {
                                        const map: Record<string, string> = { 'I understand initial losses are possible': 'opt.understand_loss', 'Small losses acceptable': 'opt.small_loss', 'I cannot afford losses': 'opt.no_loss' };
                                        return (
                                            <label key={opt} className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${formData.lossTolerance === opt ? 'border-primary bg-primary/5' : 'border-gray-200 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-800'}`}>
                                                <input type="radio" name="lossTolerance" value={opt} checked={formData.lossTolerance === opt} onChange={e => setFormData({ ...formData, lossTolerance: e.target.value })} className="w-5 h-5 text-primary focus:ring-primary" />
                                                <span className="font-medium text-gray-700 dark:text-gray-300">{t(map[opt] || opt)}</span>
                                            </label>
                                        )
                                    })}
                                </div>
                            </div>

                            {/* 6. Behavioral Risk Preference */}
                            <div>
                                <label className="block text-base font-bold text-gray-700 dark:text-gray-300 mb-3">
                                    {t('risk.pref.q')}
                                </label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {['Safe income, lower profit', 'Higher profit, higher risk'].map(opt => {
                                        const map: Record<string, string> = { 'Safe income, lower profit': 'opt.safe_income', 'Higher profit, higher risk': 'opt.high_profit' };
                                        return (
                                            <label key={opt} className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${formData.riskPreference === opt ? 'border-primary bg-primary/5' : 'border-gray-200 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-800'}`}>
                                                <input type="radio" name="riskPreference" value={opt} checked={formData.riskPreference === opt} onChange={e => setFormData({ ...formData, riskPreference: e.target.value })} className="w-5 h-5 text-primary focus:ring-primary" />
                                                <span className="font-medium text-gray-700 dark:text-gray-300">{t(map[opt] || opt)}</span>
                                            </label>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>

                        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-2xl border border-yellow-200 dark:border-yellow-700">
                            <div className="flex items-center gap-2 mb-4">
                                <AlertTriangle className="text-yellow-600 dark:text-yellow-500" size={24} />
                                <h3 className="text-lg font-bold text-yellow-800 dark:text-yellow-400">{t('important.note')}</h3>
                            </div>
                            <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
                                <p>{t('note.content')}</p>
                            </div>
                        </div>

                        {/* Acknowledgement Checkbox */}
                        <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-700/30 rounded-xl border border-gray-100 dark:border-gray-600">
                            <input
                                type="checkbox"
                                id="acknowledgement"
                                checked={isAcknowledged}
                                onChange={(e) => setIsAcknowledged(e.target.checked)}
                                className="mt-1 w-5 h-5 text-primary rounded border-gray-300 focus:ring-primary cursor-pointer"
                            />
                            <label htmlFor="acknowledgement" className="text-sm font-medium text-gray-700 dark:text-gray-300 leading-relaxed cursor-pointer select-none">
                                {t('acknowledgement')}
                            </label>
                        </div>

                        <button type="submit" disabled={isLoading || !isAcknowledged} className="w-full py-5 bg-primary text-white font-bold text-xl rounded-xl hover:bg-primary-dark transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed">
                            {isLoading ? <Loader2 className="animate-spin mx-auto" /> : t('analyze') || 'Analyze'}
                        </button>
                    </form>
                </div>
            </Wrapper>
        );
    }

    if (view === 'results') {
        return (
            <Wrapper>
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{t('recommended.businesses')}</h2>
                    <button onClick={() => setView('form')} className="text-base text-primary font-bold hover:underline">{t('retake.assessment')}</button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {displaySuggestions.map((biz) => {
                        const translatedTitle = t(`biz.${biz.id}.title`);
                        const displayTitle = translatedTitle !== `biz.${biz.id}.title` ? translatedTitle : biz.title;

                        return (
                            <div key={biz.id} className="bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 flex flex-col h-full transform hover:-translate-y-2">
                                {/* Card Header & Badge */}
                                <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl transform translate-x-10 -translate-y-10"></div>
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-white text-sm font-medium border border-white/30">
                                            {biz.match_score || biz.suitability}% {t('match')}
                                        </div>
                                        <Leaf className="text-white opacity-80" size={24} />
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-1 leading-tight min-h-[3.5rem] flex items-center">
                                        {displayTitle}
                                    </h3>
                                </div>

                                {/* Card Body */}
                                <div className="p-6 flex-grow flex flex-col gap-4">
                                    <p className="text-gray-600 text-sm leading-relaxed border-b border-gray-100 pb-4 min-h-[4rem]">
                                        {biz.reason || biz.description}
                                    </p>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                                            <div className="flex items-center gap-2 text-gray-500 mb-1 text-xs uppercase tracking-wide font-semibold">
                                                <DollarSign size={14} /> {t('investment')}
                                            </div>
                                            <div className="font-bold text-gray-800 text-sm truncate" title={BUSINESS_DETAILS[biz.id]?.shortStats?.investment || biz.estimated_cost || biz.estimatedCost}>
                                                {BUSINESS_DETAILS[biz.id]?.shortStats?.investment || biz.estimated_cost || biz.estimatedCost}
                                            </div>
                                        </div>
                                        <div className="bg-green-50 p-3 rounded-xl border border-green-100">
                                            <div className="flex items-center gap-2 text-green-600 mb-1 text-xs uppercase tracking-wide font-semibold">
                                                <TrendingUp size={14} /> {t('profit')}
                                            </div>
                                            <div className="font-bold text-green-800 text-sm truncate" title={BUSINESS_DETAILS[biz.id]?.shortStats?.profit || biz.profit_potential || biz.profitPotential}>
                                                {BUSINESS_DETAILS[biz.id]?.shortStats?.profit || biz.profit_potential || biz.profitPotential}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-2">
                                        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">{t('requirements')}</div>
                                        <div className="flex flex-wrap gap-2">
                                            {biz.requirements && biz.requirements.length > 0 ? (
                                                biz.requirements.slice(0, 3).map((req: string, i: number) => (
                                                    <span key={i} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md border border-gray-200 truncate max-w-full">
                                                        {req}
                                                    </span>
                                                ))
                                            ) : (
                                                <span className="text-gray-400 text-xs italic">{t('know.more')}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="p-6 pt-0 flex gap-3 mt-auto">
                                    <button onClick={() => startBusinessChat(biz.id)} className="flex-1 py-3 bg-blue-50 text-blue-700 rounded-xl font-bold text-sm hover:bg-blue-100 transition-colors flex items-center justify-center gap-1.5 border border-blue-200">
                                        <MessageSquare size={18} /> <span className="whitespace-nowrap">{t('ask.chatbot')}</span>
                                    </button>
                                    <button onClick={() => setSelectedBusinessId(biz.id)} className="flex-1 py-3 bg-white border-2 border-gray-200 text-gray-800 rounded-xl font-bold text-sm hover:bg-gray-50 transition-colors flex items-center justify-center gap-1.5">
                                        <Info size={18} /> <span className="whitespace-nowrap">{t('know.more')}</span>
                                    </button>
                                </div>
                            </div>
                        )
                    })}
                </div>
                {selectedBusinessId && BUSINESS_DETAILS[selectedBusinessId] && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                        <div className="bg-white dark:bg-gray-800 w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
                            {/* Header */}
                            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-start bg-gray-50 dark:bg-gray-900/50">
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white leading-tight">
                                        {BUSINESS_DETAILS[selectedBusinessId].title}
                                    </h3>
                                </div>
                                <button
                                    onClick={() => setSelectedBusinessId(null)}
                                    className="p-2 bg-gray-200 dark:bg-gray-700 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                                >
                                    <X size={24} className="text-gray-700 dark:text-gray-300" />
                                </button>
                            </div>

                            {/* Scrollable Content */}
                            <div className="p-8 overflow-y-auto space-y-8">
                                {/* Basic Idea */}
                                <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-2xl border border-blue-100 dark:border-blue-800">
                                    <h4 className="text-lg font-bold text-blue-800 dark:text-blue-300 mb-3 flex items-center gap-2">
                                        <Info size={20} /> BASIC IDEA
                                    </h4>
                                    <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 text-lg">
                                        {BUSINESS_DETAILS[selectedBusinessId].basicIdea.map((line, idx) => (
                                            <li key={idx}>{line}</li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Key Details Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {BUSINESS_DETAILS[selectedBusinessId].sections.map((section, idx) => (
                                        <div key={idx} className="bg-gray-50 dark:bg-gray-700/30 p-5 rounded-2xl border border-gray-100 dark:border-gray-700">
                                            <h5 className="font-bold text-gray-900 dark:text-white mb-3 uppercase text-sm tracking-wider border-b border-gray-200 dark:border-gray-600 pb-2">
                                                {section.title}
                                            </h5>
                                            <ul className="space-y-2">
                                                {section.content.map((item, i) => (
                                                    <li key={i} className="text-gray-600 dark:text-gray-300 text-base leading-relaxed flex items-start gap-2">
                                                        <span className="mt-1.5 w-1.5 h-1.5 bg-green-500 rounded-full flex-shrink-0"></span>
                                                        <span>{item}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </Wrapper>
        );
    }

    if (view === 'chat') {
        return (
            <Wrapper>
                <div className="flex items-center justify-between mb-4">
                    <button onClick={() => setView('results')} className="text-gray-500 hover:text-primary flex items-center gap-2 font-bold text-lg transition-colors">
                        <ArrowRight className="rotate-180" size={24} /> {t('back.to.results')}
                    </button>
                    <div className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-full font-bold text-sm">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        {t('live.advisor')}
                    </div>
                </div>

                <div className="flex flex-col h-[700px] bg-white dark:bg-gray-800 rounded-[2rem] shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden relative">
                    {/* Chat Header */}
                    <div className="bg-white/80 dark:bg-gray-800/90 backdrop-blur-md p-6 border-b border-gray-100 dark:border-gray-700 absolute top-0 left-0 right-0 z-10 flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                            <MessageSquare className="text-primary" size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-xl text-gray-900 dark:text-white">KrishiSaarthi AI</h3>
                            <p className="text-sm text-gray-500 font-medium">{t('expert.advisor')}</p>
                        </div>
                    </div>

                    {/* Chat Area */}
                    <div className="flex-grow p-6 pt-24 overflow-y-auto space-y-6 bg-gray-50/50 dark:bg-gray-900/50 scroll-smooth">
                        {messages.map((msg) => (
                            <div key={msg.id} className={`flex w-full ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`flex max-w-[85%] md:max-w-[75%] gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                    {/* Avatar */}
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm ${msg.sender === 'user' ? 'bg-primary text-white' : 'bg-white dark:bg-gray-700 text-primary border border-gray-100 dark:border-gray-600'
                                        }`}>
                                        {msg.sender === 'user' ? <User size={20} /> : <Leaf size={20} />}
                                    </div>

                                    {/* Bubble */}
                                    <div className={`p-5 rounded-2xl shadow-sm leading-relaxed text-[15px] ${msg.sender === 'user'
                                        ? 'bg-primary text-white rounded-tr-none'
                                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-tl-none border border-gray-100 dark:border-gray-700'
                                        }`}>
                                        {msg.sender === 'ai' ? (
                                            <div className="prose prose-sm dark:prose-invert max-w-none prose-p:leading-relaxed prose-headings:font-bold prose-a:text-blue-600 prose-ul:list-disc prose-ul:pl-4">
                                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                    {msg.text}
                                                </ReactMarkdown>
                                            </div>
                                        ) : (
                                            msg.text
                                        )}
                                        <div className={`text-[10px] uppercase font-bold tracking-wider mt-2 opacity-50 ${msg.sender === 'user' ? 'text-right text-white' : 'text-left text-gray-400'}`}>
                                            {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {isLoading && (
                            <div className="flex justify-start w-full">
                                <div className="flex max-w-[85%] gap-3">
                                    <div className="w-10 h-10 bg-white dark:bg-gray-700 rounded-full flex items-center justify-center shadow-sm border border-gray-100 dark:border-gray-600">
                                        <Loader2 className="animate-spin text-primary" size={20} />
                                    </div>
                                    <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl rounded-tl-none border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-1">
                                        <span className="w-2 h-2 bg-primary/40 rounded-full animate-bounce"></span>
                                        <span className="w-2 h-2 bg-primary/40 rounded-full animate-bounce delay-75"></span>
                                        <span className="w-2 h-2 bg-primary/40 rounded-full animate-bounce delay-150"></span>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 z-10">
                        <div className="flex gap-2 items-center bg-gray-50 dark:bg-gray-900/50 p-2 rounded-full border border-gray-200 dark:border-gray-700 focus-within:ring-2 focus-within:ring-primary/20 transition-all shadow-inner">
                            <input
                                type="text"
                                className="flex-grow bg-transparent px-6 py-3 focus:outline-none text-gray-800 dark:text-gray-200 placeholder-gray-400 font-medium"
                                placeholder={t('ask.chatbot')}
                                value={chatInput}
                                onChange={(e) => setChatInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                            />
                            <button
                                onClick={() => handleSendMessage()}
                                disabled={!chatInput.trim() || isLoading}
                                className="p-3 bg-primary text-white rounded-full hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg hover:scale-105 active:scale-95 flex-shrink-0"
                            >
                                <Send size={20} className={isLoading ? 'opacity-0' : 'opacity-100'} />
                                {isLoading && <Loader2 size={20} className="absolute animate-spin" />}
                            </button>
                        </div>
                        <p className="text-center text-xs text-gray-400 mt-3 font-medium">
                            {t('ai.disclaimer')}
                        </p>
                    </div>
                </div>
            </Wrapper>
        );
    }

    if (view === 'experts') {
        return (
            <Wrapper>
                <button onClick={() => setView('results')} className="mb-6 text-gray-500 hover:text-primary flex items-center gap-2 font-bold text-lg">
                    <ArrowRight className="rotate-180" size={24} /> {t('back.to.results')}
                </button>
                <h2 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">{t('connect.experts')}</h2>
                <div className="grid gap-6">
                    {experts.map(expert => (
                        <div key={expert.id} className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
                            <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center flex-shrink-0">
                                <User size={40} className="text-gray-400" />
                            </div>
                            <div className="flex-grow">
                                <h3 className="font-bold text-xl text-gray-900 dark:text-white">{expert.name}</h3>
                                <p className="text-primary font-bold">{expert.specialization}</p>
                                <p className="text-gray-500 mt-2 flex items-center justify-center md:justify-start gap-1"><MapPin size={16} /> {expert.location}</p>
                            </div>
                            <a href={`tel:${expert.phone}`} className="px-6 py-3 bg-green-100 text-green-700 font-bold rounded-xl hover:bg-green-200 transition-colors flex items-center gap-2">
                                <Phone size={20} /> {t('call.now')}
                            </a>
                        </div>
                    ))}
                </div>
            </Wrapper>
        );
    }

    return <div>Error</div>;
}
