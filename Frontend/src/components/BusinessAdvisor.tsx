import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import Header from './Header';
import { ArrowLeft, ArrowRight, MessageCircle, Phone, Download, TrendingUp, AlertTriangle, Leaf } from 'lucide-react';

type Stage = 'questionnaire' | 'recommendations' | 'chat' | 'experts' | 'loading';

const API_BASE_URL = 'http://localhost:5000/api';

interface QuestionnaireData {
  totalLand: string;
  capital: string;
  marketConnectivity: string;
  skills: string[];
  riskPreference: string;
  timeAvailability: string;
}

interface BusinessIdea {
  id: string;
  title: string;
  investment: string;
  roi: string;
  risk: 'low' | 'medium' | 'high';
  sustainability: number;
  why: string;
}

export default function BusinessAdvisor() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useApp();
  const [stage, setStage] = useState<Stage>('questionnaire');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [formData, setFormData] = useState<QuestionnaireData>({
    totalLand: '',
    capital: '',
    marketConnectivity: '',
    skills: [],
    riskPreference: '',
    timeAvailability: '',
  });
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'bot'; text: string }>>([
    { sender: 'bot', text: 'Hello! I\'m your AI Business Advisor. How can I help you today?' },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [startedFromDisease, setStartedFromDisease] = useState(false);
  const diseaseInitRef = useRef(false);
  
  // Check if coming from disease detector
  useEffect(() => {
    const diseaseResult = location.state?.diseaseResult;
    const fromDiseaseDetector = location.state?.fromDiseaseDetector;
    
    if (fromDiseaseDetector && diseaseResult && !diseaseInitRef.current) {
      diseaseInitRef.current = true;
      setStartedFromDisease(true);
      setStage('loading');
      // Skip questionnaire and go directly to chat with disease context
      initializeAdvisorWithDisease(diseaseResult);
    }
  }, [location.state]);
  
  const questions = [
    {
      id: 'totalLand',
      label: t('total.land'),
      type: 'number',
      placeholder: '5.0',
    },
    {
      id: 'capital',
      label: t('available.capital'),
      type: 'number',
      placeholder: '100000',
    },
    {
      id: 'marketConnectivity',
      label: t('market.connectivity'),
      type: 'select',
      options: ['Excellent', 'Good', 'Average', 'Poor'],
    },
    {
      id: 'skills',
      label: t('skills'),
      type: 'multiselect',
      options: ['Crop Farming', 'Animal Husbandry', 'Dairy', 'Poultry', 'Horticulture', 'Aquaculture'],
    },
    {
      id: 'riskPreference',
      label: t('risk.preference'),
      type: 'select',
      options: ['Low Risk', 'Moderate Risk', 'High Risk'],
    },
    {
      id: 'timeAvailability',
      label: t('time.availability'),
      type: 'select',
      options: ['Full Time', 'Part Time', 'Weekends Only'],
    },
  ];
  
  const businessIdeas: BusinessIdea[] = [
    {
      id: '1',
      title: 'Organic Vegetable Farming',
      investment: '₹50,000 - ₹1,00,000',
      roi: '30-40% annually',
      risk: 'low',
      sustainability: 95,
      why: 'Based on your land size and available capital, organic farming offers stable returns with low risk. Growing market demand for organic produce.',
    },
    {
      id: '2',
      title: 'Mushroom Cultivation',
      investment: '₹30,000 - ₹60,000',
      roi: '40-50% annually',
      risk: 'medium',
      sustainability: 85,
      why: 'Requires less space, year-round production possible. Your moderate risk preference aligns well with this opportunity.',
    },
    {
      id: '3',
      title: 'Vermicompost Production',
      investment: '₹20,000 - ₹40,000',
      roi: '25-35% annually',
      risk: 'low',
      sustainability: 100,
      why: 'Low investment, high sustainability score. Can be done part-time. Complements other farming activities.',
    },
  ];
  
  const experts = [
    {
      id: '1',
      name: 'Dr. Ramesh Kumar',
      specialization: 'Organic Farming Expert',
      experience: '15 years',
      phone: '+91 98765 43210',
    },
    {
      id: '2',
      name: 'Dr. Priya Sharma',
      specialization: 'Business Development',
      experience: '12 years',
      phone: '+91 98765 43211',
    },
    {
      id: '3',
      name: 'Agricultural KVK Center',
      specialization: 'General Guidance',
      experience: 'Government Initiative',
      phone: '1800-180-1551',
    },
  ];
  
  const initializeAdvisorWithDisease = async (diseaseResult: any) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Initialize advisor with default profile
      const initResponse = await fetch(`${API_BASE_URL}/business-advisor/init`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Farmer',
          land_size: 5.0,
          capital: 100000,
          market_access: 'moderate',
          skills: ['farming'],
          risk_level: 'low',
          time_availability: 'full-time',
          experience_years: 0,
          language: 'english'
        })
      });
      
      if (!initResponse.ok) {
        throw new Error('Failed to initialize advisor');
      }
      
      const initData = await initResponse.json();
      setSessionId(initData.session_id);
      
      // Get integrated advice
      const adviceResponse = await fetch(`${API_BASE_URL}/business-advisor/integrated-advice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: initData.session_id,
          disease_result: diseaseResult
        })
      });
      
      if (!adviceResponse.ok) {
        throw new Error('Failed to get integrated advice');
      }
      
      const adviceData = await adviceResponse.json();
      
      const diseaseSummary = `Detected ${diseaseResult.disease} on ${diseaseResult.crop} (severity: ${diseaseResult.severity || 'unknown'}, confidence: ${
        diseaseResult.confidence ? `${(diseaseResult.confidence * 100).toFixed(1)}%` : 'N/A'
      }). Need guidance on managing the business impact.`;

      setChatMessages([
        {
          sender: 'user',
          text: diseaseSummary
        },
        { 
          sender: 'bot', 
          text: `Thanks for sharing the disease details. Let me give you tailored business advice for the detected issue.` 
        },
        { 
          sender: 'bot', 
          text: adviceData.response 
        }
      ]);
      
      setStage('chat');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize advisor');
      console.error('Error:', err);
      setStage('questionnaire');
    } finally {
      setIsLoading(false);
    }
  };
  
  const initializeAdvisor = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Map form data to API format
      const marketAccessMap: Record<string, string> = {
        'Excellent': 'good',
        'Good': 'good',
        'Average': 'moderate',
        'Poor': 'poor'
      };
      
      const riskMap: Record<string, string> = {
        'Low Risk': 'low',
        'Moderate Risk': 'medium',
        'High Risk': 'high'
      };
      
      const timeMap: Record<string, string> = {
        'Full Time': 'full-time',
        'Part Time': 'part-time',
        'Weekends Only': 'part-time'
      };
      
      const response = await fetch(`${API_BASE_URL}/business-advisor/init`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Farmer',
          land_size: parseFloat(formData.totalLand) || 5.0,
          capital: parseFloat(formData.capital) || 100000,
          market_access: marketAccessMap[formData.marketConnectivity] || 'moderate',
          skills: formData.skills.map(s => s.toLowerCase().replace(' ', '_')),
          risk_level: riskMap[formData.riskPreference] || 'low',
          time_availability: timeMap[formData.timeAvailability] || 'full-time',
          experience_years: 0,
          language: 'english'
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to initialize advisor');
      }
      
      const data = await response.json();
      setSessionId(data.session_id);
      setStage('recommendations');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize advisor');
      console.error('Error:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      initializeAdvisor();
    }
  };
  
  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };
  
  const handleSkillToggle = (skill: string) => {
    const skills = formData.skills.includes(skill)
      ? formData.skills.filter(s => s !== skill)
      : [...formData.skills, skill];
    setFormData({ ...formData, skills });
  };
  
  const handleSendMessage = async () => {
    if (!chatInput.trim() || !sessionId) return;
    
    const userMessage = chatInput.trim();
    setChatMessages(prev => [...prev, { sender: 'user', text: userMessage }]);
    setChatInput('');
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/business-advisor/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          message: userMessage
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get response');
      }
      
      const data = await response.json();
      
      setChatMessages(prev => [...prev, {
        sender: 'bot',
        text: data.response
      }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
      setChatMessages(prev => [...prev, {
        sender: 'bot',
        text: 'Sorry, I encountered an error. Please try again.'
      }]);
      console.error('Error:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const currentQ = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-50 to-white dark:from-gray-900 dark:to-gray-950 transition-colors">
      <Header />
      
      {/* Header */}
      <div className="bg-yellow-500 dark:bg-yellow-600 text-white py-6 shadow-lg">
        <div className="container mx-auto px-4 flex items-center gap-4">
          <button
            onClick={() => {
              if (stage === 'loading') {
                navigate('/farmer-dashboard');
              } else if (stage === 'questionnaire' && currentQuestion > 0) {
                handleBack();
              } else if (stage === 'chat' || stage === 'experts') {
                setStage('recommendations');
              } else if (stage === 'recommendations') {
                setStage('questionnaire');
                setCurrentQuestion(0);
              } else {
                navigate('/farmer-dashboard');
              }
            }}
            className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h2>{t('business.advisor')}</h2>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-12">
        {/* Loading Stage for disease detector */}
        {stage === 'loading' && (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="w-16 h-16 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-gray-600 dark:text-gray-300">Preparing your personalized business advice...</p>
          </div>
        )}
        {/* Questionnaire Stage */}
        {stage === 'questionnaire' && (
          <div className="max-w-2xl mx-auto">
            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex justify-between text-gray-600 mb-2">
                <span>Step {currentQuestion + 1} / {questions.length}</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-yellow-500 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
            
            {/* Question Card */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8">
              <h3 className="text-gray-900 dark:text-white mb-6">{currentQ.label}</h3>
              
              {currentQ.type === 'number' && (
                <input
                  type="number"
                  value={(formData as any)[currentQ.id]}
                  onChange={(e) => setFormData({ ...formData, [currentQ.id]: e.target.value })}
                  placeholder={currentQ.placeholder}
                  className="w-full px-4 py-5 rounded-xl border-2 border-gray-200 dark:border-gray-700 dark:bg-gray-700 dark:text-white focus:border-yellow-500 outline-none transition-colors"
                />
              )}
              
              {currentQ.type === 'select' && (
                <div className="space-y-3">
                  {currentQ.options?.map((option) => (
                    <button
                      key={option}
                      onClick={() => setFormData({ ...formData, [currentQ.id]: option })}
                      className={`w-full px-6 py-5 rounded-xl border-2 transition-all ${
                        (formData as any)[currentQ.id] === option
                          ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/30 dark:border-yellow-500'
                          : 'border-gray-200 dark:border-gray-700 dark:bg-gray-700 dark:text-white hover:border-yellow-300'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}
              
              {currentQ.type === 'multiselect' && (
                <div className="grid grid-cols-2 gap-3">
                  {currentQ.options?.map((option) => (
                    <button
                      key={option}
                      onClick={() => handleSkillToggle(option)}
                      className={`px-4 py-4 rounded-xl border-2 transition-all ${
                        formData.skills.includes(option)
                          ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/30 dark:border-yellow-500'
                          : 'border-gray-200 dark:border-gray-700 dark:bg-gray-700 dark:text-white hover:border-yellow-300'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}
              
              {error && (
                <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 rounded-lg">
                  <p className="text-red-700 dark:text-red-400">{error}</p>
                </div>
              )}
              
              <div className="flex gap-4 mt-8">
                {currentQuestion > 0 && (
                  <button
                    onClick={handleBack}
                    disabled={isLoading}
                    className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 py-5 rounded-2xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
                  >
                    {t('back')}
                  </button>
                )}
                <button
                  onClick={handleNext}
                  disabled={isLoading}
                  className="flex-1 bg-yellow-500 text-white py-5 rounded-2xl hover:bg-yellow-600 transition-colors shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isLoading ? 'Loading...' : (currentQuestion === questions.length - 1 ? t('submit') : t('next'))}
                  {!isLoading && <ArrowRight className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Recommendations Stage */}
        {stage === 'recommendations' && (
          <div className="max-w-4xl mx-auto">
            <h2 className="text-gray-900 dark:text-white mb-8 text-center">{t('recommendations')}</h2>
            
            <div className="space-y-6 mb-8">
              {businessIdeas.map((idea) => (
                <div key={idea.id} className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg p-8">
                  <h3 className="text-gray-900 dark:text-white mb-4">{idea.title}</h3>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-green-50 rounded-xl p-4">
                      <p className="text-gray-600 mb-1">{t('investment.needed')}</p>
                      <p className="text-gray-900">{idea.investment}</p>
                    </div>
                    <div className="bg-blue-50 rounded-xl p-4">
                      <p className="text-gray-600 mb-1">{t('roi.range')}</p>
                      <p className="text-gray-900">{idea.roi}</p>
                    </div>
                    <div className={`rounded-xl p-4 ${
                      idea.risk === 'low' ? 'bg-green-50' :
                      idea.risk === 'medium' ? 'bg-yellow-50' : 'bg-red-50'
                    }`}>
                      <p className="text-gray-600 mb-1">{t('risk.level')}</p>
                      <div className="flex items-center gap-2">
                        <AlertTriangle className={`w-4 h-4 ${
                          idea.risk === 'low' ? 'text-green-600' :
                          idea.risk === 'medium' ? 'text-yellow-600' : 'text-red-600'
                        }`} />
                        <p className="text-gray-900 capitalize">{idea.risk}</p>
                      </div>
                    </div>
                    <div className="bg-green-50 rounded-xl p-4">
                      <p className="text-gray-600 mb-1">{t('sustainability')}</p>
                      <div className="flex items-center gap-2">
                        <Leaf className="w-4 h-4 text-green-600" />
                        <p className="text-gray-900">{idea.sustainability}%</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-yellow-50 rounded-xl p-4">
                    <p className="text-gray-700">{idea.why}</p>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Action Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => setStage('chat')}
                className="bg-green-600 text-white py-5 rounded-2xl hover:bg-green-700 transition-colors shadow-lg flex items-center justify-center gap-3"
              >
                <MessageCircle className="w-5 h-5" />
                {t('chat.advisor')}
              </button>
              <button
                onClick={() => setStage('experts')}
                className="bg-blue-600 text-white py-5 rounded-2xl hover:bg-blue-700 transition-colors shadow-lg flex items-center justify-center gap-3"
              >
                <Phone className="w-5 h-5" />
                {t('contact.expert')}
              </button>
              <button className="bg-yellow-500 text-white py-5 rounded-2xl hover:bg-yellow-600 transition-colors shadow-lg flex items-center justify-center gap-3">
                <Download className="w-5 h-5" />
                {t('download.report')}
              </button>
            </div>
          </div>
        )}
        
        {/* Chat Stage */}
        {stage === 'chat' && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col" style={{ height: '600px' }}>
              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {chatMessages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs md:max-w-md px-6 py-4 rounded-2xl ${
                        msg.sender === 'user'
                          ? 'bg-yellow-500 text-white'
                          : 'bg-green-100 text-gray-800'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Quick Questions */}
              {!startedFromDisease && (
                <div className="px-6 py-3 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
                  <div className="flex gap-2 overflow-x-auto">
                    {['Best crops?', 'Market access?', 'Funding options?'].map((q) => (
                      <button
                        key={q}
                        onClick={() => setChatInput(q)}
                        className="px-4 py-2 bg-white dark:bg-gray-800 rounded-full text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors whitespace-nowrap border border-gray-200 dark:border-gray-600"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Chat Input */}
              <div className="p-6 border-t border-gray-200 dark:border-gray-600">
                {error && (
                  <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 rounded-lg">
                    <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
                  </div>
                )}
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSendMessage()}
                    placeholder="Type your question..."
                    disabled={isLoading || !sessionId}
                    className="flex-1 px-4 py-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 dark:bg-gray-700 dark:text-white focus:border-yellow-500 outline-none transition-colors disabled:opacity-50"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={isLoading || !sessionId}
                    className="bg-yellow-500 text-white px-6 py-4 rounded-xl hover:bg-yellow-600 transition-colors disabled:opacity-50"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <TrendingUp className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Experts Stage */}
        {stage === 'experts' && (
          <div className="max-w-4xl mx-auto">
            <h3 className="text-gray-900 dark:text-white mb-8 text-center">{t('contact.expert')}</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {experts.map((expert) => (
                <div key={expert.id} className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg p-8">
                  <h4 className="text-gray-900 dark:text-white mb-2">{expert.name}</h4>
                  <p className="text-gray-600 dark:text-gray-300 mb-1">{expert.specialization}</p>
                  <p className="text-gray-500 dark:text-gray-400 mb-6">{expert.experience}</p>
                  
                  <div className="space-y-3">
                    <a
                      href={`tel:${expert.phone}`}
                      className="block bg-green-600 text-white py-4 rounded-xl hover:bg-green-700 transition-colors text-center"
                    >
                      <Phone className="w-5 h-5 inline mr-2" />
                      Call Now
                    </a>
                    <a
                      href={`https://wa.me/${expert.phone.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block bg-green-500 text-white py-4 rounded-xl hover:bg-green-600 transition-colors text-center"
                    >
                      WhatsApp
                    </a>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Submit Query Form */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg p-8">
              <h4 className="text-gray-900 dark:text-white mb-6">Submit Your Query</h4>
              <div className="space-y-4">
                <textarea
                  placeholder="Describe your question or concern..."
                  rows={4}
                  className="w-full px-4 py-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 dark:bg-gray-700 dark:text-white focus:border-yellow-500 outline-none transition-colors"
                ></textarea>
                <button className="w-full bg-yellow-500 text-white py-5 rounded-2xl hover:bg-yellow-600 transition-colors shadow-lg">
                  {t('submit')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
