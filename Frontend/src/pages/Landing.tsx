import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { Leaf, Award, TrendingUp, Users, Sprout, CheckCircle, GraduationCap, ArrowRight, Coins, AlertTriangle } from 'lucide-react';

export default function Landing() {
    const { t } = useApp();

    const features = [
        {
            icon: <Sprout className="w-10 h-10 text-green-600" />,
            title: t('crop.disease'),
            desc: t('crop.disease.desc'),
            color: 'bg-green-100',
        },
        {
            icon: <Users className="w-10 h-10 text-blue-600" />,
            title: t('business.advisor'),
            desc: t('business.advisor.desc'),
            color: 'bg-blue-100',
        },
        {
            icon: <Award className="w-10 h-10 text-yellow-600" />,
            title: t('green.credit'),
            desc: t('green.credit.desc'),
            color: 'bg-yellow-100',
        },
        {
            icon: <GraduationCap className="w-10 h-10 text-purple-600" />,
            title: t('contact.expert'),
            desc: t('business.advisor.desc'), // Reusing desc for now or add new key
            color: 'bg-purple-100',
        }
    ];

    const scrollToFeatures = () => {
        const element = document.getElementById('features');
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <div className="flex flex-col w-full font-sans scroll-smooth">
            {/* Custom Keyframes */}
            <style>{`
        @keyframes scan-vertical {
          0% { top: 0%; opacity: 0; }
          15% { opacity: 1; }
          85% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        @keyframes float-badge-left {
          0% { transform: translate(0, 0); }
          50% { transform: translate(-10px, -10px); }
          100% { transform: translate(0, 0); }
        }
        @keyframes float-badge-right {
          0% { transform: translate(0, 0); }
          50% { transform: translate(10px, -15px); }
          100% { transform: translate(0, 0); }
        }
        @keyframes pulse-soft {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.05); }
        }
      `}</style>

            {/* Hero Section - Reduced Top Padding */}
            <section className="relative pt-8 pb-20 lg:pt-16 lg:pb-32 overflow-visible">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

                        {/* Left Side: Text and Buttons */}
                        <div className="text-left animate-fade-in-up z-20">
                            <div className="inline-flex items-center px-4 py-2 bg-white/60 dark:bg-gray-800/60 backdrop-blur-md text-primary font-bold rounded-full text-sm mb-6 border border-green-200 dark:border-green-900 shadow-sm ring-1 ring-green-100 dark:ring-green-900">
                                <span className="flex h-2 w-2 relative mr-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                </span>
                                {t('app.tagline')}
                            </div>
                            <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 dark:text-white mb-8 leading-tight tracking-tight drop-shadow-sm">
                                Empowering Farmers with <span className="text-primary">AI & Blockchain</span>
                            </h1>
                            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-10 leading-relaxed max-w-xl">
                                One-stop solution for early crop disease detection, smart business advice, and earning green credits.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-5">
                                <button onClick={scrollToFeatures} className="px-10 py-5 bg-gradient-to-r from-primary to-green-600 text-white font-bold rounded-2xl shadow-xl hover:shadow-green-500/40 hover:-translate-y-1 transition-all text-xl text-center">
                                    Overview
                                </button>
                                <Link to="/signup" className="px-10 py-5 bg-white dark:bg-gray-800 text-gray-800 dark:text-white font-bold rounded-2xl shadow-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all text-xl border border-gray-200 dark:border-gray-700 text-center flex items-center justify-center gap-2 group backdrop-blur-sm">
                                    {t('get.started')} <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </div>
                        </div>

                        {/* Right Side: Blended Plant Scanner Animation */}
                        <div className="relative h-[600px] w-full flex items-center justify-center perspective-[1000px] z-10">

                            {/* Ambient Glow */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-green-400/20 via-blue-400/10 to-transparent rounded-full blur-[80px] opacity-60 animate-[pulse-soft_4s_ease-in-out_infinite]"></div>

                            {/* Animation Container */}
                            <div className="relative w-full max-w-md h-full flex items-center justify-center">

                                {/* Grid Background */}
                                <div className="absolute inset-0 bg-[radial-gradient(#4ADE80_1px,transparent_1px)] [background-size:24px_24px] opacity-20 mask-image-radial-gradient"></div>

                                {/* The Plant */}
                                <div className="relative z-10">
                                    {/* Plant Aura */}
                                    <div className="absolute inset-0 bg-green-400/30 blur-[40px] rounded-full"></div>
                                    <Sprout size={240} className="text-green-500 drop-shadow-[0_20px_30px_rgba(74,222,128,0.3)] relative z-20" strokeWidth={1} />
                                </div>

                                {/* Scanning Beam */}
                                <div className="absolute w-[120%] h-full z-30 pointer-events-none overflow-hidden mask-image-linear-gradient-vertical">
                                    <div className="absolute left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-blue-400 to-transparent shadow-[0_0_20px_#60A5FA] animate-[scan-vertical_3s_linear_infinite]"></div>
                                    <div className="absolute left-0 w-full h-[40px] bg-gradient-to-b from-blue-400/10 to-transparent animate-[scan-vertical_3s_linear_infinite] -mt-[40px]"></div>
                                </div>

                                {/* Floating Badge 1: Disease Detected */}
                                <div className="absolute top-[20%] left-[-10%] md:left-[-20%] z-40 animate-[float-badge-left_6s_ease-in-out_infinite]">
                                    <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl p-4 rounded-2xl shadow-2xl border border-red-100 dark:border-red-900/30 flex items-center gap-4 transition-transform hover:scale-105">
                                        <div className="bg-red-100 dark:bg-red-900/50 p-3 rounded-full">
                                            <AlertTriangle size={24} className="text-red-500" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Analysis</p>
                                            <p className="text-lg font-bold text-gray-900 dark:text-white">Disease Detected</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Floating Badge 2: Green Credits */}
                                <div className="absolute top-[30%] right-[-10%] md:right-[-20%] z-40 animate-[float-badge-right_7s_ease-in-out_infinite] delay-1000">
                                    <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl p-4 rounded-2xl shadow-2xl border border-yellow-100 dark:border-yellow-900/30 flex items-center gap-4 transition-transform hover:scale-105">
                                        <div className="bg-yellow-100 dark:bg-yellow-900/50 p-3 rounded-full">
                                            <Coins size={24} className="text-yellow-600" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Earnings</p>
                                            <p className="text-lg font-bold text-gray-900 dark:text-white">+50 Credits</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Floating Badge 3: Advisory */}
                                <div className="absolute bottom-[20%] left-[10%] z-40 animate-[float-badge-left_8s_ease-in-out_infinite] delay-2000">
                                    <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl p-4 rounded-2xl shadow-2xl border border-blue-100 dark:border-blue-900/30 flex items-center gap-4 transition-transform hover:scale-105">
                                        <div className="bg-blue-100 dark:bg-blue-900/50 p-3 rounded-full">
                                            <TrendingUp size={24} className="text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Advisory</p>
                                            <p className="text-lg font-bold text-gray-900 dark:text-white">Price Rising</p>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-24 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-20">
                        <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-6">Key Features</h2>
                        <div className="w-24 h-1.5 bg-gradient-to-r from-primary to-green-300 mx-auto rounded-full"></div>
                        <p className="mt-4 text-xl text-gray-500 max-w-2xl mx-auto">Everything you need to succeed in modern sustainable farming.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
                        {features.map((feature, idx) => (
                            <div key={idx} className="p-8 rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 text-center group h-full flex flex-col items-center relative overflow-hidden">
                                <div className={`w-20 h-20 rounded-2xl ${feature.color} flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300 shadow-inner relative z-10`}>
                                    {feature.icon}
                                </div>
                                {/* Hover Glow */}
                                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 relative z-10">{feature.title}</h3>
                                <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-lg relative z-10">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Role Explanation */}
            <section className="py-24 relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md p-8 rounded-3xl shadow-lg border-t-8 border-green-500 hover:shadow-2xl transition-all hover:-translate-y-1">
                            <h3 className="text-2xl font-bold mb-6 flex items-center text-gray-900 dark:text-white">
                                <div className="p-2 bg-green-100 rounded-lg mr-3 shadow-sm"><Leaf className="w-6 h-6 text-green-600" /></div>
                                {t('role.farmer')}
                            </h3>
                            <ul className="space-y-4 text-gray-600 dark:text-gray-300 text-lg">
                                <li className="flex items-start"><CheckCircle size={24} className="mr-3 text-green-500 flex-shrink-0 mt-0.5" /> <span>{t('role.farmer.desc')}</span></li>
                            </ul>
                        </div>
                        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md p-8 rounded-3xl shadow-lg border-t-8 border-blue-500 hover:shadow-2xl transition-all hover:-translate-y-1">
                            <h3 className="text-2xl font-bold mb-6 flex items-center text-gray-900 dark:text-white">
                                <div className="p-2 bg-blue-100 rounded-lg mr-3 shadow-sm"><CheckCircle className="w-6 h-6 text-blue-600" /></div>
                                {t('role.validator')}
                            </h3>
                            <ul className="space-y-4 text-gray-600 dark:text-gray-300 text-lg">
                                <li className="flex items-start"><CheckCircle size={24} className="mr-3 text-blue-500 flex-shrink-0 mt-0.5" /> <span>{t('role.validator.desc')}</span></li>
                            </ul>
                        </div>
                        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md p-8 rounded-3xl shadow-lg border-t-8 border-yellow-500 hover:shadow-2xl transition-all hover:-translate-y-1">
                            <h3 className="text-2xl font-bold mb-6 flex items-center text-gray-900 dark:text-white">
                                <div className="p-2 bg-yellow-100 rounded-lg mr-3 shadow-sm"><TrendingUp className="w-6 h-6 text-yellow-600" /></div>
                                {t('role.buyer')}
                            </h3>
                            <ul className="space-y-4 text-gray-600 dark:text-gray-300 text-lg">
                                <li className="flex items-start"><CheckCircle size={24} className="mr-3 text-yellow-500 flex-shrink-0 mt-0.5" /> <span>{t('role.buyer.desc')}</span></li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* Call to Action Section */}
            <section className="py-24 relative overflow-hidden rounded-t-[3rem] -mt-10 bg-gradient-to-br from-primary to-green-800 shadow-inner">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent to-black/20"></div>

                <div className="max-w-5xl mx-auto px-4 text-center relative z-10">
                    <h2 className="text-4xl md:text-6xl font-extrabold text-white mb-8 drop-shadow-md">Ready to Transform Your Farming?</h2>
                    <p className="text-xl md:text-2xl text-green-100 mb-12 max-w-3xl mx-auto">Join thousands of farmers using KrishiSaarthi to improve yields and earn more.</p>
                    <Link to="/signup" className="inline-flex items-center px-12 py-6 bg-white text-primary font-bold text-2xl rounded-2xl shadow-2xl hover:bg-gray-100 transform hover:-translate-y-1 transition-all">
                        {t('get.started')} <ArrowRight size={32} className="ml-3" />
                    </Link>
                </div>
            </section>
        </div>
    );
}
