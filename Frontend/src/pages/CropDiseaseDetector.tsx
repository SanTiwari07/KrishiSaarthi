import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { Scan, ArrowLeft, Camera, Loader2, CheckCircle, Info, Upload } from 'lucide-react';

import { config } from '../config';

const API_BASE_URL = config.API_BASE_URL;

interface DiseaseResult {
    crop: string;
    disease: string;
    severity: 'low' | 'medium' | 'high';
    treatment: string[];
    prevention?: string[]; // New UI expects this, logic might not provide it?
    confidence?: number;
    description?: string; // New UI expects this
    pathogen?: string;
}

export default function CropDiseaseDetector() {
    const { t } = useApp();
    const navigate = useNavigate();
    const [image, setImage] = useState<string | null>(null);
    const [scanning, setScanning] = useState(false);
    const [result, setResult] = useState<DiseaseResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImage(reader.result as string);
                setResult(null);
                setError(null);
            };
            reader.readAsDataURL(file);
            analyzeImage(file);
        }
    };

    const analyzeImage = async (file: File) => {
        setScanning(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append('image', file);

            const response = await fetch(`${API_BASE_URL}/disease/detect`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to analyze image');
            }

            const data = await response.json();

            if (data.success && data.result) {
                setResult({
                    crop: data.result.crop,
                    disease: data.result.disease,
                    severity: data.result.severity,
                    treatment: Array.isArray(data.result.treatment) ? data.result.treatment : [data.result.treatment],
                    prevention: data.result.prevention || ['Keep area clean', 'Use resistant varieties'], // Fallback if backend missing
                    confidence: data.result.confidence,
                    description: data.result.description || `Detected ${data.result.severity} severity ${data.result.disease} in ${data.result.crop}.`,
                    pathogen: data.result.pathogen,
                });
            } else {
                throw new Error('Invalid response from server');
            }
        } catch (err) {
            console.error('Error analyzing image:', err);
            setError(err instanceof Error ? err.message : 'Failed to analyze image. Please try again.');
        } finally {
            setScanning(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6 pt-8 pb-16 px-4">
            <button onClick={() => navigate('/farmer-dashboard')} className="mb-4 text-gray-500 hover:text-primary flex items-center gap-2 font-bold text-lg">
                <ArrowLeft size={24} /> {t('back') || 'Back'}
            </button>
            <div className="mb-6">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                    <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg"><Scan className="text-green-600 dark:text-green-400" size={32} /></div>
                    {t('crop.disease')}
                </h2>
                <p className="text-xl text-gray-500 mt-2">{t('crop.disease.desc')}</p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-md border border-gray-100 dark:border-gray-700">
                {/* Upload Area */}
                <div
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-3 border-dashed rounded-2xl h-80 flex flex-col items-center justify-center cursor-pointer transition-all ${image ? 'border-primary bg-green-50 dark:bg-green-900/20' : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-400'
                        }`}
                >
                    {image ? (
                        <img src={image} alt="Crop" className="h-full object-contain rounded-lg shadow-sm" />
                    ) : (
                        <div className="text-center p-6">
                            <div className="bg-green-100 dark:bg-gray-700 p-4 rounded-full inline-block mb-4">
                                <Camera className="w-12 h-12 text-green-600 dark:text-green-400" />
                            </div>
                            <p className="text-xl font-bold text-gray-700 dark:text-gray-300">{t('upload.image') || 'Upload Image'}</p>
                            <p className="text-sm text-gray-500 mt-2">{t('tap.to.upload')}</p>
                        </div>
                    )}
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={scanning}
                    />
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 rounded-xl text-red-600 dark:text-red-400 font-bold text-center">
                        {error}
                    </div>
                )}

                {/* Loading Indicator */}
                {scanning && (
                    <div className="mt-8 text-center">
                        <div className="inline-flex items-center gap-3 bg-white dark:bg-gray-800 px-6 py-3 rounded-full shadow-lg border border-gray-100 dark:border-gray-700">
                            <Loader2 className="animate-spin text-primary" size={24} />
                            <span className="font-bold text-gray-700 dark:text-gray-200">{t('analyzing') || 'Analyzing...'}</span>
                        </div>
                    </div>
                )}

                {/* Action Button (Reuse Scan Logic if needed, but analyze is automatic on upload here for simplicity or manual?) 
            Frontend logic was automatic on upload? No, wait.
            Old Frontend logic: handleImageUpload -> calls analyzeImage IMMEDIATELY.
            So no need for a separate button unless image is set but result is null (e.g. error).
        */}

                {/* Results */}
                {result && !scanning && (
                    <div className="mt-8 bg-white dark:bg-gray-900 rounded-2xl p-6 border-2 border-green-100 dark:border-green-900 shadow-lg animate-fade-in-up">
                        <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-100 dark:border-gray-700">
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <CheckCircle className="text-green-500" /> {t(result.disease)}
                            </h3>
                            {result.confidence && (
                                <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 px-3 py-1.5 rounded-lg text-sm font-bold border border-green-200 dark:border-green-800">
                                    {Math.round(result.confidence * 100)}% {t('confidence')}
                                </span>
                            )}
                        </div>
                        <p className="text-lg text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
                            {t('detected.in')} <strong>{t(result.crop)}</strong>. {t('severity')}: <span className="capitalize font-bold">{t(`severity.${result.severity}` as any) || result.severity}</span>.
                            <br />
                            {t(result.description || '')}
                        </p>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="bg-blue-50 dark:bg-blue-900/20 p-5 rounded-xl border border-blue-100 dark:border-blue-800">
                                <h4 className="font-bold text-blue-700 dark:text-blue-300 mb-3 flex items-center gap-2 text-lg"><Info size={20} /> {t('treatment')}</h4>
                                <ul className="space-y-2">
                                    {result.treatment.map((item: string, i: number) => (
                                        <li key={i} className="flex items-start text-gray-700 dark:text-gray-300">
                                            <span className="mr-2 text-blue-500">•</span> {t(item)}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            {result.prevention && (
                                <div className="bg-green-50 dark:bg-green-900/20 p-5 rounded-xl border border-green-100 dark:border-green-800">
                                    <h4 className="font-bold text-green-700 dark:text-green-300 mb-3 flex items-center gap-2 text-lg"><CheckCircle size={20} /> {t('prevention')}</h4>
                                    <ul className="space-y-2">
                                        {result.prevention.map((item: string, i: number) => (
                                            <li key={i} className="flex items-start text-gray-700 dark:text-gray-300">
                                                <span className="mr-2 text-green-500">•</span> {t(item)}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
