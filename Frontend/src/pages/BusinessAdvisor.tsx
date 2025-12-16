import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { ArrowLeft, ArrowRight, MessageSquare, Phone, Download, TrendingUp, AlertTriangle, Leaf, User, Send, Briefcase, DollarSign, Ruler, Droplets, CheckCircle, Info, MapPin, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const API_BASE_URL = 'http://localhost:5000/api';

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
    const { t } = useApp();
    const navigate = useNavigate();
    const location = useLocation();
    const [view, setView] = useState<View>('intro');

    // Logic State

    const [sessionId, setSessionId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([
        { id: '1', sender: 'ai', text: 'Namaste! I am your KrishiSaarthi Advisor. Ask me about crops, prices, or schemes.', timestamp: new Date() }
    ]);
    const [chatInput, setChatInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Form State
    const [formData, setFormData] = useState({
        budget: '',
        land: '',
        waterSource: 'Rainfed',
        experience: '',
        interests: [] as string[]
    });

    const interestOptions = [
        'Dairy Farming', 'Poultry', 'Organic Vegetables', 'Goat Farming',
        'Beekeeping', 'Mushroom Cultivation', 'Fishery', 'Sericulture'
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
                    market_access: 'moderate', // Defaulting for simplicity
                    skills: formData.interests.map(s => s.toLowerCase()),
                    risk_level: 'low',
                    time_availability: 'full-time',
                    experience_years: parseFloat(formData.experience) || 0,
                    language: 'english'
                })
            });

            if (!response.ok) throw new Error('Failed to initialize advisor');
            const data = await response.json();
            setSessionId(data.session_id);
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
                body: JSON.stringify({ name: 'Farmer', language: 'english' }) // Minimal init
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

    const handleSendMessage = async () => {
        if (!chatInput.trim()) return;

        // If no session, try to init one silently (or handle error)
        if (!sessionId) {
            // Simple init if missing
            try {
                const res = await fetch(`${API_BASE_URL}/business-advisor/init`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name: 'Farmer' })
                });
                const d = await res.json();
                setSessionId(d.session_id);
            } catch (e) { console.error(e); }
        }

        const userMsg: ChatMessage = {
            id: Date.now().toString(),
            sender: 'user',
            text: chatInput,
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
                    session_id: sessionId, // Use state or the one just fetched
                    message: userMsg.text
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


    // Hardcoded Ideas (as per Frontend logic)
    const businessSuggestions = [
        {
            id: '1', title: 'Organic Vegetable Farming', description: 'High demand market with premium pricing for chemical-free produce.',
            estimatedCost: '₹50,000 - ₹1L', profitPotential: '₹2L - ₹3L/yr', suitability: 95, requirements: ['Land > 1 acre', 'Water']
        },
        {
            id: '2', title: 'Mushroom Cultivation', description: 'Low land requirement, year-round production possible.',
            estimatedCost: '₹30,000', profitPotential: '₹1.5L/yr', suitability: 85, requirements: ['Shed', 'Cool Temp']
        },
        {
            id: '3', title: 'Vermicompost Unit', description: 'Turn farm waste into gold. High demand for organic fertilizer.',
            estimatedCost: '₹20,000', profitPotential: '₹1L/yr', suitability: 90, requirements: ['Org Waste', 'Shade']
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
                        Get personalized business plans, connect with experts, and grow your farming income with AI-driven insights.
                    </p>
                    <button
                        onClick={() => setView('form')}
                        className="px-10 py-5 bg-primary text-white text-xl font-bold rounded-2xl shadow-xl hover:bg-primary-dark transition-all flex items-center justify-center gap-3 mx-auto transform hover:-translate-y-1"
                    >
                        Start Assessment <ArrowRight size={28} />
                    </button>
                </div>
            </Wrapper>
        );
    }

    if (view === 'form') {
        return (
            <Wrapper>
                <div className="bg-white dark:bg-gray-800 p-10 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <h2 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">Tell us about your resources</h2>
                    <form onSubmit={handleAssessmentSubmit} className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-base font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                                    <DollarSign size={18} className="text-green-500" /> Budget (₹)
                                </label>
                                <input type="number" required className="w-full p-4 border border-gray-300 rounded-xl dark:bg-gray-700 dark:border-gray-600 bg-white dark:text-white"
                                    placeholder="e.g. 100000" value={formData.budget} onChange={e => setFormData({ ...formData, budget: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-base font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                                    <Ruler size={18} className="text-blue-500" /> Land (Acres)
                                </label>
                                <input type="number" required className="w-full p-4 border border-gray-300 rounded-xl dark:bg-gray-700 dark:border-gray-600 bg-white dark:text-white"
                                    placeholder="e.g. 5" value={formData.land} onChange={e => setFormData({ ...formData, land: e.target.value })} />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-base font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                                    <Droplets size={18} className="text-cyan-500" /> Water Source
                                </label>
                                <select className="w-full p-4 border border-gray-300 rounded-xl dark:bg-gray-700 dark:border-gray-600 bg-white dark:text-white"
                                    value={formData.waterSource} onChange={e => setFormData({ ...formData, waterSource: e.target.value })}>
                                    {waterOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-base font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                                    <User size={18} className="text-purple-500" /> Experience (Years)
                                </label>
                                <input type="number" required className="w-full p-4 border border-gray-300 rounded-xl dark:bg-gray-700 dark:border-gray-600 bg-white dark:text-white"
                                    placeholder="e.g. 5" value={formData.experience} onChange={e => setFormData({ ...formData, experience: e.target.value })} />
                            </div>
                        </div>

                        <div>
                            <label className="block text-base font-bold text-gray-700 dark:text-gray-300 mb-4">Interests</label>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {interestOptions.map(option => (
                                    <div key={option} onClick={() => handleInterestToggle(option)}
                                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col items-center justify-center text-center gap-2 h-28 ${formData.interests.includes(option) ? 'bg-blue-50 border-blue-500 text-blue-700 dark:bg-blue-900/30 dark:text-blue-200' : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                                            }`}
                                    >
                                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${formData.interests.includes(option) ? 'bg-blue-500 border-blue-500 text-white' : 'border-gray-300'}`}>
                                            {formData.interests.includes(option) && <CheckCircle size={16} />}
                                        </div>
                                        <span className="text-sm font-bold leading-tight">{option}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <button type="submit" disabled={isLoading} className="w-full py-5 bg-primary text-white font-bold text-xl rounded-xl hover:bg-primary-dark transition-all shadow-lg mt-6">
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
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Recommended Businesses</h2>
                    <button onClick={() => setView('form')} className="text-base text-primary font-bold hover:underline">Retake Assessment</button>
                </div>

                <div className="grid gap-8">
                    {businessSuggestions.map(biz => (
                        <div key={biz.id} className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-md border border-gray-100 dark:border-gray-700 transition-all hover:shadow-xl">
                            <div className="flex flex-col md:flex-row justify-between items-start mb-6 gap-4">
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{biz.title}</h3>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm bg-green-100 text-green-800 px-3 py-1 rounded-full font-bold">{biz.suitability}% Match</span>
                                    </div>
                                </div>
                                <div className="text-left md:text-right bg-green-50 dark:bg-green-900/20 p-4 rounded-xl">
                                    <p className="text-sm text-gray-500 uppercase tracking-wide font-semibold">Est. Profit</p>
                                    <p className="text-2xl font-extrabold text-green-600 dark:text-green-400">{biz.profitPotential}</p>
                                </div>
                            </div>
                            <p className="text-lg text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">{biz.description}</p>
                            <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-2xl mb-8 grid grid-cols-1 md:grid-cols-2 gap-6 text-base">
                                <div className="flex items-start gap-3">
                                    <div className="mt-1"><DollarSign size={20} className="text-gray-400" /></div>
                                    <div><span className="block text-gray-500 font-medium">Investment</span><span className="font-bold text-gray-900 dark:text-white text-lg">{biz.estimatedCost}</span></div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="mt-1"><CheckCircle size={20} className="text-gray-400" /></div>
                                    <div><span className="block text-gray-500 font-medium">Requirements</span><span className="font-bold text-gray-900 dark:text-white">{biz.requirements.join(', ')}</span></div>
                                </div>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <button onClick={() => setView('chat')} className="flex-1 py-4 bg-blue-50 text-blue-700 rounded-xl font-bold text-lg hover:bg-blue-100 transition-colors flex items-center justify-center gap-2 border border-blue-200">
                                    <MessageSquare size={22} /> Ask Chatbot
                                </button>
                                <button onClick={() => setView('experts')} className="flex-1 py-4 bg-white border-2 border-gray-200 text-gray-800 rounded-xl font-bold text-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                                    <Phone size={22} /> Contact Expert
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </Wrapper>
        );
    }

    if (view === 'chat') {
        return (
            <Wrapper>
                <div className="flex items-center justify-between mb-4">
                    <button onClick={() => setView('results')} className="text-gray-500 hover:text-primary flex items-center gap-2 font-bold text-lg transition-colors">
                        <ArrowRight className="rotate-180" size={24} /> Back to Results
                    </button>
                    <div className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-full font-bold text-sm">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        Live Advisor
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
                            <p className="text-sm text-gray-500 font-medium">Expert Business Advisor</p>
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
                                placeholder="Type your question here about farming, prices..."
                                value={chatInput}
                                onChange={(e) => setChatInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                            />
                            <button
                                onClick={handleSendMessage}
                                disabled={!chatInput.trim() || isLoading}
                                className="p-3 bg-primary text-white rounded-full hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg hover:scale-105 active:scale-95 flex-shrink-0"
                            >
                                <Send size={20} className={isLoading ? 'opacity-0' : 'opacity-100'} />
                                {isLoading && <Loader2 size={20} className="absolute animate-spin" />}
                            </button>
                        </div>
                        <p className="text-center text-xs text-gray-400 mt-3 font-medium">
                            AI advice may vary. Always consult with local experts.
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
                    <ArrowRight className="rotate-180" size={24} /> Back to Results
                </button>
                <h2 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">Connect with Experts</h2>
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
                                <Phone size={20} /> Call Now
                            </a>
                        </div>
                    ))}
                </div>
            </Wrapper>
        );
    }

    return <div>Error</div>;
}
