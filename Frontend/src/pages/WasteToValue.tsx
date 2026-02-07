import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { ArrowLeft, MessageSquare, Info, X, Leaf, Recycle, ChevronRight, Loader2, Search } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { config } from '../config';
import { auth } from '../firebase';

const API_BASE_URL = config.API_BASE_URL;

// --- CHAT INTERFACE TYPES ---
interface ChatMessage {
    id: string;
    sender: 'user' | 'ai';
    text: string;
    timestamp: Date;
}

type ViewState = 'input' | 'processing' | 'results';

export default function WasteToValue() {
    const { t, language, user } = useApp();
    const navigate = useNavigate();

    // View State
    const [view, setView] = useState<ViewState>('input');

    // Input Form State
    const [cropInput, setCropInput] = useState('');

    // Result Data State
    const [resultData, setResultData] = useState<any>(null);

    // Results State
    const [selectedOption, setSelectedOption] = useState<any | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [chatInput, setChatInput] = useState('');
    const [isChatLoading, setIsChatLoading] = useState(false);

    // Auto-scroll ref
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Initial Greeting (Re-trigger when view changes to results)
    useEffect(() => {
        if (view === 'results' && messages.length === 0 && resultData) {
            setMessages([
                {
                    id: '1',
                    sender: 'ai',
                    text: `Hello **${user?.name || 'Farmer'}**! 👋\n\nI have analyzed your **${resultData?.crop}** waste.\n\nAbove are the top 3 profitable ways to use it. Ask me anything about these options!`,
                    timestamp: new Date()
                }
            ]);
        }
    }, [view, user, resultData]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // Only scroll to bottom when NEW messages are added, not on every update
    const prevMessageCountRef = useRef(messages.length);
    useEffect(() => {
        // Only scroll if message count increased (new message added)
        if (messages.length > prevMessageCountRef.current) {
            scrollToBottom();
        }
        prevMessageCountRef.current = messages.length;
    }, [messages]);

    // Handle Form Submit
    const handleAnalyze = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!cropInput.trim()) return;

        setView('processing');

        try {
            const token = await auth.currentUser?.getIdToken();
            const response = await fetch(`${API_BASE_URL}/waste-to-value/analyze`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ crop: cropInput }),
            });

            if (!response.ok) {
                throw new Error('Analysis failed');
            }

            const data = await response.json();

            if (data.success && data.result) {
                setResultData(data.result);
                setView('results');
            } else {
                throw new Error('Invalid data format');
            }

        } catch (error) {
            console.error("Error analyzing waste:", error);
            // In a real app, show error toast/message here
            setView('input'); // Go back to input on error
        }
    };

    // Chat Handler
    const handleSendMessage = async () => {
        if (!chatInput.trim()) return;

        const userMsg: ChatMessage = {
            id: Date.now().toString(),
            sender: 'user',
            text: chatInput,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMsg]);
        setChatInput('');
        setIsChatLoading(true);

        try {
            const token = await auth.currentUser?.getIdToken();
            const response = await fetch(`${API_BASE_URL}/waste-to-value/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    context: resultData,
                    question: chatInput
                }),
            });

            const data = await response.json();
            let aiText = "I apologize, I couldn't connect to the server.";

            if (data.success) {
                aiText = data.response;
            }

            const aiMsg: ChatMessage = {
                id: (Date.now() + 1).toString(),
                sender: 'ai',
                text: aiText,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, aiMsg]);

        } catch (error) {
            console.error("Chat Error:", error);
            const errorMsg: ChatMessage = {
                id: (Date.now() + 1).toString(),
                sender: 'ai',
                text: "⚠️ Connection error. Please ensure the backend is running.",
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsChatLoading(false);
        }
    };

    // --- RENDER VIEW: INPUT FORM ---
    if (view === 'input') {
        return (
            <div className="max-w-3xl mx-auto py-12 px-4">
                <button onClick={() => navigate('/farmer-dashboard')} className="mb-6 text-gray-500 hover:text-primary flex items-center gap-2 font-bold text-lg">
                    <ArrowLeft size={24} /> {t('back') || 'Back'}
                </button>

                <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                    <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-8 text-white">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl">
                                <Recycle size={32} className="text-white" />
                            </div>
                        </div>
                        <h1 className="text-3xl font-extrabold mb-2">Waste to Value Analysis</h1>
                        <p className="opacity-90 text-lg">Turn your crop residues into a profitable business.</p>
                    </div>

                    <div className="p-8 md:p-12">
                        <form onSubmit={handleAnalyze} className="space-y-8">
                            {/* Simple Text Input */}
                            <div>
                                <label className="block text-xl font-bold text-gray-700 dark:text-gray-200 mb-4 flex items-center gap-2">
                                    <Leaf className="text-green-500" /> What waste do you have?
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. Banana stem, Sugarcane bagasse, Wheat straw..."
                                        className="w-full p-6 pl-14 text-xl bg-gray-50 dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-4 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all placeholder-gray-400"
                                        value={cropInput}
                                        onChange={(e) => setCropInput(e.target.value)}
                                    />
                                    <Search className="absolute top-1/2 left-5 -translate-y-1/2 text-gray-400" size={24} />
                                </div>
                                <p className="mt-3 text-gray-500 text-sm ml-2">Our AI will analyze the best profitable uses for your specific crop waste.</p>
                            </div>

                            <button
                                type="submit"
                                disabled={!cropInput.trim()}
                                className="w-full py-5 bg-green-600 hover:bg-green-700 text-white text-xl font-bold rounded-2xl shadow-lg hover:shadow-green-500/30 hover:-translate-y-1 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Analyze with AI <ChevronRight size={24} />
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        );
    }

    // --- RENDER VIEW: PROCESSING ---
    if (view === 'processing') {
        return (
            <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 text-center">
                <div className="relative">
                    <div className="w-24 h-24 rounded-full border-4 border-green-100 border-t-green-600 animate-spin"></div>
                    <Recycle className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-green-600" size={32} />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mt-8 mb-4 flex items-center gap-2 justify-center">
                    Analyzing <span className="text-green-600">{cropInput}</span>...
                </h2>
                <div className="max-w-md space-y-4">
                    <div className="h-2 w-64 bg-gray-200 rounded-full mx-auto overflow-hidden">
                        <div className="h-full bg-green-600 rounded-full animate-progress-indeterminate"></div>
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 animate-pulse text-sm">Identifying chemical composition...</p>
                </div>
            </div>
        );
    }

    // --- RENDER VIEW: RESULTS ---
    if (!resultData) return null; // Should not happen in flow

    return (
        <div className="max-w-5xl mx-auto space-y-8 pt-8 pb-16 px-4">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button onClick={() => setView('input')} className="text-gray-500 hover:text-primary transition-colors p-2 rounded-full hover:bg-gray-100">
                    <ArrowLeft size={24} />
                </button>
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
                        <Recycle className="text-green-600" /> Waste → Value
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400">Transforming <strong>{resultData.crop}</strong> waste into profit</p>
                </div>
            </div>

            {/* SECTION A: Suggestion Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {resultData.options?.map((opt: any) => (
                    <div key={opt.id} className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col hover:shadow-xl transition-all hover:-translate-y-1 group">
                        <div className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 p-6">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 leading-tight">
                                {opt.title}
                            </h3>
                            <div className="w-10 h-1 bg-green-500 rounded-full mb-2"></div>
                        </div>
                        <div className="p-6 flex-grow flex flex-col justify-between">
                            <p className="text-gray-600 dark:text-gray-300 text-sm mb-6 leading-relaxed">
                                {opt.subtitle}
                            </p>
                            <button
                                onClick={() => setSelectedOption(opt)}
                                className="w-full py-3 bg-white border-2 border-green-500 text-green-600 rounded-xl font-bold text-sm hover:bg-green-500 hover:text-white transition-all flex items-center justify-center gap-2 group-hover:shadow-md"
                            >
                                <Info size={18} /> {t('know.more') || 'Know More'}
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* SECTION B: Conclusion */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-3xl p-8 border border-green-100 dark:border-green-800 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-green-200/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
                <h2 className="text-2xl font-bold text-green-900 dark:text-green-100 mb-4 flex items-center gap-2 relative z-10">
                    <Leaf className="text-green-600 dark:text-green-400" /> Conclusion
                </h2>
                <div className="bg-white/60 dark:bg-black/20 backdrop-blur-sm rounded-2xl p-6 border border-green-100 dark:border-green-800/50 relative z-10">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                        {resultData.conclusion?.title}
                    </h3>
                    <div className="space-y-3">
                        <p className="text-lg font-bold text-green-700 dark:text-green-400">
                            {resultData.conclusion?.highlight}
                        </p>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                            {resultData.conclusion?.explanation || resultData.conclusion?.rationale}
                        </p>
                    </div>
                </div>
            </div>

            {/* SECTION C: Ask Chatbot */}
            <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col h-[600px]">
                {/* Chat Header */}
                <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md p-6 border-b border-gray-100 dark:border-gray-700 flex items-center gap-4 sticky top-0 z-10">
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                        <MessageSquare className="text-green-600 dark:text-green-400" size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-xl text-gray-900 dark:text-white">Waste-to-Value Assistant</h3>
                        <p className="text-sm text-gray-500 font-medium">Ask anything about the above recommendations</p>
                    </div>
                </div>

                {/* Chat Messages */}
                <div className="flex-grow p-6 overflow-y-auto space-y-6 bg-gray-50/50 dark:bg-gray-900/50 scroll-smooth">
                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex w-full ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`flex max-w-[85%] md:max-w-[75%] gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm ${msg.sender === 'user' ? 'bg-green-600 text-white' : 'bg-white dark:bg-gray-700 text-green-600 border border-gray-100 dark:border-gray-600'
                                    }`}>
                                    {msg.sender === 'user' ? <Leaf size={20} /> : <Recycle size={20} />}
                                </div>
                                <div className={`p-5 rounded-2xl shadow-sm leading-relaxed text-[15px] ${msg.sender === 'user'
                                    ? 'bg-green-600 text-white rounded-tr-none'
                                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-tl-none border border-gray-100 dark:border-gray-700'
                                    }`}>
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.text}</ReactMarkdown>
                                    <div className={`text-[10px] uppercase font-bold tracking-wider mt-2 opacity-50 ${msg.sender === 'user' ? 'text-right text-white' : 'text-left text-gray-400'}`}>
                                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                    {isChatLoading && (
                        <div className="flex justify-start w-full">
                            <div className="flex max-w-[85%] gap-3">
                                <div className="w-10 h-10 bg-white dark:bg-gray-700 rounded-full flex items-center justify-center shadow-sm border border-gray-100 dark:border-gray-600">
                                    <Recycle className="animate-spin text-green-600" size={20} />
                                </div>
                                <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl rounded-tl-none border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-1">
                                    <span className="w-2 h-2 bg-green-400 rounded-full animate-bounce"></span>
                                    <span className="w-2 h-2 bg-green-400 rounded-full animate-bounce delay-100"></span>
                                    <span className="w-2 h-2 bg-green-400 rounded-full animate-bounce delay-200"></span>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                            placeholder="Type your question here..."
                            className="flex-grow p-4 bg-gray-100 dark:bg-gray-900 rounded-xl border-none focus:ring-2 focus:ring-green-500 outline-none transition-all"
                            disabled={isChatLoading}
                        />
                        <button
                            onClick={handleSendMessage}
                            disabled={!chatInput.trim() || isChatLoading}
                            className="p-4 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-green-500/30"
                        >
                            <ChevronRight size={24} />
                        </button>
                    </div>
                    <p className="text-center text-xs text-gray-400 mt-3 pt-3 font-medium border-t border-gray-200 dark:border-gray-700">
                        {t('ai.disclaimer') || 'AI advice may vary. Always consult with local experts.'}
                    </p>
                </div>
            </div>

            {/* Know More Modal */}
            {selectedOption && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-gray-800 w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
                        {/* Header */}
                        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-start bg-gray-50 dark:bg-gray-900/50">
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white leading-tight">
                                    {selectedOption.fullDetails?.title || selectedOption.title}
                                </h3>
                            </div>
                            <button
                                onClick={() => setSelectedOption(null)}
                                className="p-2 bg-gray-200 dark:bg-gray-700 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                            >
                                <X size={24} className="text-gray-700 dark:text-gray-300" />
                            </button>
                        </div>

                        {/* Scrollable Content */}
                        <div className="p-8 overflow-y-auto space-y-8">
                            {/* Basic Idea - Only show if available */}
                            {selectedOption.fullDetails?.basicIdea?.length > 0 && (
                                <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-2xl border border-green-100 dark:border-green-800">
                                    <h4 className="text-lg font-bold text-green-800 dark:text-green-300 mb-3 flex items-center gap-2">
                                        <Info size={20} /> BASIC IDEA
                                    </h4>
                                    <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 text-lg">
                                        {selectedOption.fullDetails.basicIdea.map((line: string, idx: number) => (
                                            <li key={idx}>{line}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Key Details Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {selectedOption.fullDetails?.sections?.map((section: any, idx: number) => (
                                    <div key={idx} className="bg-gray-50 dark:bg-gray-700/30 p-5 rounded-2xl border border-gray-100 dark:border-gray-700">
                                        <h5 className="font-bold text-gray-900 dark:text-white mb-3 uppercase text-sm tracking-wider border-b border-gray-200 dark:border-gray-600 pb-2">
                                            {section.title}
                                        </h5>
                                        <ul className="space-y-2">
                                            {section.content.map((item: string, i: number) => (
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
        </div>
    );
}
