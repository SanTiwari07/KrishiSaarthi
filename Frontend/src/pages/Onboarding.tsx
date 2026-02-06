import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { useNavigate } from 'react-router-dom';
import { Loader2, MapPin, Sprout, CheckCircle, ArrowRight, ArrowLeft, Mountain, User as UserIcon, Phone, Calendar, Mail, Home } from 'lucide-react';
import { toast } from 'sonner';
import { useOnboardingStateMachine, Step1Data, Step2Data, Step3Data } from '../hooks/useOnboardingStateMachine';

export default function Onboarding() {
    const { user } = useApp();
    const navigate = useNavigate();

    // Redirect if not logged in or not a farmer
    if (!user) {
        navigate('/login');
        return null;
    }

    if (user.role !== 'farmer') {
        navigate('/');
        return null;
    }

    const { state, handleNextClicked, handleBackClicked } = useOnboardingStateMachine(user.id, user.role);

    // Step 1: Personal Information
    const [fullName, setFullName] = useState('');
    const [age, setAge] = useState('');
    const [email, setEmail] = useState('');
    const [residentialAddress, setResidentialAddress] = useState('');

    // Step 2: Location Data
    const [stateField, setStateField] = useState('');
    const [district, setDistrict] = useState('');
    const [village, setVillage] = useState('');

    // Step 3: Farm Data
    const [landSize, setLandSize] = useState('');
    const [soilType, setSoilType] = useState('Alluvial');
    const [waterSource, setWaterSource] = useState('Rainfed');
    const [crops, setCrops] = useState<string[]>([]);
    const [otherCrop, setOtherCrop] = useState('');

    const handleStep1Submit = async (e: React.FormEvent) => {
        e.preventDefault();

        const step1Data: Step1Data = {
            fullName,
            mobileNumber: user?.mobile || '', // Use mobile from signup
            age: parseInt(age),
            password: 'already-set', // Password already set during signup
            email: email || undefined,
            residentialAddress: residentialAddress || undefined,
        };

        const success = await handleNextClicked(step1Data);
        if (success) {
            toast.success('Personal information saved!');
        } else if (state.validationErrors.length > 0) {
            state.validationErrors.forEach(error => toast.error(error));
        }
    };

    const handleStep2Submit = async (e: React.FormEvent) => {
        e.preventDefault();

        const step2Data: Step2Data = {
            state: stateField,
            district,
            village,
        };

        const success = await handleNextClicked(step2Data);
        if (success) {
            toast.success('Location details saved!');
        } else if (state.validationErrors.length > 0) {
            state.validationErrors.forEach(error => toast.error(error));
        }
    };

    const handleStep3Submit = async (e: React.FormEvent) => {
        e.preventDefault();

        const step3Data: Step3Data = {
            landSizeValue: parseFloat(landSize),
            landSizeUnit: 'acres',
            soilType: soilType as Step3Data['soilType'],
            waterAvailability: waterSource as Step3Data['waterAvailability'],
            mainCropsGrown: crops,
            otherCrop: otherCrop || undefined,
        };

        const success = await handleNextClicked(step3Data);
        if (success) {
            toast.success('Welcome to the family! Profile completed.');
            // Refresh user context to get updated name and data
            window.location.reload(); // Force reload to refresh user context
            navigate('/farmer-dashboard');
        } else if (state.validationErrors.length > 0) {
            state.validationErrors.forEach(error => toast.error(error));
        }
    };

    const toggleCrop = (crop: string) => {
        if (crops.includes(crop)) {
            setCrops(crops.filter(c => c !== crop));
        } else {
            setCrops([...crops, crop]);
        }
    };

    const soilTypes = ['Alluvial', 'Black', 'Red', 'Laterite', 'Mixed'];
    const waterSources = ['Borewell', 'Canal', 'Rainfed', 'Mixed'];
    const commonCrops = ['Wheat', 'Rice', 'Maize', 'Cotton', 'Sugarcane', 'Soybean', 'Pulses'];

    if (state.loading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                    <p className="animate-pulse text-lg font-bold text-primary">Loading...</p>
                </div>
            </div>
        );
    }

    if (state.status === 'completed') {
        navigate('/farmer-dashboard');
        return null;
    }

    return (
        <div className="min-h-screen relative flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-gray-50 dark:bg-gray-900 overflow-hidden">

            {/* Background Decoration */}
            <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800 opacity-50 pointer-events-none" />
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-green-200 dark:bg-green-500/10 rounded-full blur-[100px] opacity-30 -translate-y-1/2 translate-x-1/4 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-yellow-200 dark:bg-yellow-500/10 rounded-full blur-[100px] opacity-30 translate-y-1/2 -translate-x-1/4 pointer-events-none" />

            {/* Main Card */}
            <div className="relative w-full max-w-4xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/20 dark:border-gray-700/50 flex flex-col md:flex-row min-h-[600px] transition-all duration-300">

                {/* Left Sidebar (Progress) */}
                <div className="w-full md:w-1/3 bg-gradient-to-br from-primary/90 to-primary-dark/90 p-8 text-white flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1625246333195-78d9c38ad449?q=80&w=1000&auto=format&fit=crop')] bg-cover bg-center opacity-10 mix-blend-overlay" />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20" />

                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                                <Sprout size={24} />
                            </div>
                            <h2 className="text-xl font-bold tracking-tight">KrishiSaarthi</h2>
                        </div>
                        <h1 className="text-3xl font-bold mb-4 leading-tight">
                            {state.step === 1 ? "Tell us about yourself" : state.step === 2 ? "Where are you located?" : "Tell us about your farm"}
                        </h1>
                        <p className="text-white/80 leading-relaxed">
                            {state.step === 1
                                ? "We need your basic information to create your farmer profile."
                                : state.step === 2
                                    ? "We need your location to provide weather updates and local market prices."
                                    : "Knowing your land and crops helps us recommend the best fertilizers and schemes."}
                        </p>
                    </div>

                    {/* Progress Steps */}
                    <div className="relative z-10 space-y-6 mt-12 md:mt-0">
                        <div className="flex items-center gap-4 group">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all duration-300 ${state.step === 1 ? 'bg-white text-primary border-white scale-110 shadow-lg' : state.step > 1 ? 'bg-white text-primary border-white' : 'bg-transparent text-white/50 border-white/30'
                                }`}>
                                {state.step > 1 ? <CheckCircle size={16} /> : "1"}
                            </div>
                            <span className={`${state.step === 1 ? 'text-white font-bold' : 'text-white/70'} transition-all`}>Personal Details</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all duration-300 ${state.step === 2 ? 'bg-white text-primary border-white scale-110 shadow-lg' : state.step > 2 ? 'bg-white text-primary border-white' : 'bg-transparent text-white/50 border-white/30'
                                }`}>
                                {state.step > 2 ? <CheckCircle size={16} /> : "2"}
                            </div>
                            <span className={`${state.step === 2 ? 'text-white font-bold' : 'text-white/70'} transition-all`}>Location</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all duration-300 ${state.step === 3 ? 'bg-white text-primary border-white scale-110 shadow-lg' : 'bg-transparent text-white/50 border-white/30'
                                }`}>
                                3
                            </div>
                            <span className={`${state.step === 3 ? 'text-white font-bold' : 'text-white/70'} transition-all`}>Farm Details</span>
                        </div>
                    </div>
                </div>

                {/* Right Side (Form) */}
                <div className="w-full md:w-2/3 p-8 sm:p-12 overflow-y-auto">
                    {state.step === 1 && (
                        <form onSubmit={handleStep1Submit} className="space-y-6 animate-in slide-in-from-right-8 fade-in duration-500">
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                                <UserIcon className="text-primary" /> Personal Information
                            </h3>
                            <div className="space-y-5">
                                <div className="group">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 ml-1">Full Name *</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full p-4 rounded-xl border-2 border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 focus:bg-white dark:focus:bg-gray-800 transition-all outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary text-lg"
                                        placeholder="e.g. Ramesh Kumar"
                                        value={fullName}
                                        onChange={e => setFullName(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 ml-1">Age *</label>
                                    <div className="relative">
                                        <Calendar className="absolute top-4 left-4 text-gray-400" size={20} />
                                        <input
                                            type="number"
                                            required
                                            min="18"
                                            max="100"
                                            className="w-full pl-12 p-4 rounded-xl border-2 border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 focus:bg-white dark:focus:bg-gray-800 transition-all outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary"
                                            placeholder="35"
                                            value={age}
                                            onChange={e => setAge(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 ml-1">Email (Optional)</label>
                                    <div className="relative">
                                        <Mail className="absolute top-4 left-4 text-gray-400" size={20} />
                                        <input
                                            type="email"
                                            className="w-full pl-12 p-4 rounded-xl border-2 border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 focus:bg-white dark:focus:bg-gray-800 transition-all outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary"
                                            placeholder="farmer@example.com"
                                            value={email}
                                            onChange={e => setEmail(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 ml-1">Residential Address (Optional)</label>
                                    <div className="relative">
                                        <Home className="absolute top-4 left-4 text-gray-400" size={20} />
                                        <input
                                            type="text"
                                            className="w-full pl-12 p-4 rounded-xl border-2 border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 focus:bg-white dark:focus:bg-gray-800 transition-all outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary"
                                            placeholder="Village, District, State"
                                            value={residentialAddress}
                                            onChange={e => setResidentialAddress(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-8 flex justify-end">
                                <button type="submit" disabled={state.loading} className="group flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-primary/30 transform hover:-translate-y-1 disabled:opacity-70">
                                    {state.loading ? <Loader2 className="animate-spin" /> : <>Continue <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" /></>}
                                </button>
                            </div>
                        </form>
                    )}

                    {state.step === 2 && (
                        <form onSubmit={handleStep2Submit} className="space-y-6 animate-in slide-in-from-right-8 fade-in duration-500">
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                                <MapPin className="text-primary" /> Location Details
                            </h3>
                            <div className="space-y-5">
                                <div className="group">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 ml-1">State</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full p-4 rounded-xl border-2 border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 focus:bg-white dark:focus:bg-gray-800 transition-all outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary text-lg"
                                        placeholder="e.g. Maharashtra"
                                        value={stateField}
                                        onChange={e => setStateField(e.target.value)}
                                    />
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 ml-1">District</label>
                                        <input
                                            type="text"
                                            required
                                            className="w-full p-4 rounded-xl border-2 border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 focus:bg-white dark:focus:bg-gray-800 transition-all outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary"
                                            placeholder="e.g. Pune"
                                            value={district}
                                            onChange={e => setDistrict(e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 ml-1">Village/Town</label>
                                        <input
                                            type="text"
                                            required
                                            className="w-full p-4 rounded-xl border-2 border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 focus:bg-white dark:focus:bg-gray-800 transition-all outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary"
                                            placeholder="e.g. Manchar"
                                            value={village}
                                            onChange={e => setVillage(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-8 border-t border-gray-100 dark:border-gray-800 mt-8">
                                <button
                                    type="button"
                                    onClick={handleBackClicked}
                                    className="flex items-center gap-2 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 font-medium transition-colors px-4 py-2"
                                >
                                    <ArrowLeft size={18} /> Back
                                </button>
                                <button type="submit" disabled={state.loading} className="group flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-primary/30 transform hover:-translate-y-1 disabled:opacity-70">
                                    {state.loading ? <Loader2 className="animate-spin" /> : <>Continue <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" /></>}
                                </button>
                            </div>
                        </form>
                    )}

                    {state.step === 3 && (
                        <form onSubmit={handleStep3Submit} className="space-y-6 animate-in slide-in-from-right-8 fade-in duration-500">
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                                <Mountain className="text-primary" /> Farm Details
                            </h3>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 ml-1">Land Size (Acres)</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            step="0.1"
                                            required
                                            className="w-full p-4 rounded-xl border-2 border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 focus:bg-white dark:focus:bg-gray-800 transition-all outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary text-lg font-mono"
                                            placeholder="2.5"
                                            value={landSize}
                                            onChange={e => setLandSize(e.target.value)}
                                        />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">Acres</span>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 ml-1">Soil Type</label>
                                    <div className="relative">
                                        <select
                                            className="w-full p-4 rounded-xl border-2 border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 focus:bg-white dark:focus:bg-gray-800 transition-all outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary appearance-none cursor-pointer"
                                            value={soilType}
                                            onChange={e => setSoilType(e.target.value)}
                                        >
                                            {soilTypes.map(t => <option key={t} value={t}>{t}</option>)}
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 ml-1">Water Source</label>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    {waterSources.map(s => (
                                        <div
                                            key={s}
                                            onClick={() => setWaterSource(s)}
                                            className={`cursor-pointer p-3 rounded-lg border-2 text-center transition-all ${waterSource === s
                                                ? 'border-primary bg-primary/5 text-primary font-bold shadow-sm'
                                                : 'border-gray-100 dark:border-gray-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800'
                                                }`}
                                        >
                                            <span className="text-sm">{s}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 ml-1">Main Crops Grown (Optional)</label>
                                <div className="flex flex-wrap gap-2">
                                    {commonCrops.map(crop => (
                                        <button
                                            key={crop}
                                            type="button"
                                            onClick={() => toggleCrop(crop)}
                                            className={`px-4 py-2 rounded-full border-2 text-sm font-medium transition-all transform hover:scale-105 ${crops.includes(crop)
                                                ? 'bg-gradient-to-r from-green-500 to-emerald-600 border-transparent text-white shadow-md'
                                                : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-green-300'
                                                }`}
                                        >
                                            {crop}
                                        </button>
                                    ))}
                                </div>
                                <input
                                    type="text"
                                    className="mt-4 w-full p-4 rounded-xl border-2 border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 focus:bg-white dark:focus:bg-gray-800 transition-all outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary"
                                    placeholder="Add other crop..."
                                    value={otherCrop}
                                    onChange={e => setOtherCrop(e.target.value)}
                                />
                            </div>

                            <div className="flex items-center justify-between pt-8 border-t border-gray-100 dark:border-gray-800 mt-8">
                                <button
                                    type="button"
                                    onClick={handleBackClicked}
                                    className="flex items-center gap-2 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 font-medium transition-colors px-4 py-2"
                                >
                                    <ArrowLeft size={18} /> Back
                                </button>
                                <button
                                    type="submit"
                                    disabled={state.loading}
                                    className="flex items-center gap-2 bg-gradient-to-r from-primary to-emerald-600 hover:from-primary-dark hover:to-emerald-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-green-500/30 transform hover:-translate-y-1 disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {state.loading ? <Loader2 className="animate-spin" /> : <>Complete Profile <CheckCircle size={20} /></>}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
