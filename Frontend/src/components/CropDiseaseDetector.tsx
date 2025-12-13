import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import Header from './Header';
import { ArrowLeft, Upload, Camera, Scan, AlertCircle, CheckCircle, HelpCircle, Sparkles, MessageCircle } from 'lucide-react';

type Stage = 'upload' | 'analyzing' | 'result';

interface DiseaseResult {
  crop: string;
  disease: string;
  severity: 'low' | 'medium' | 'high';
  treatment: string[];
  confidence?: number;
  pathogen?: string;
}

const API_BASE_URL = 'http://localhost:5000/api';

export default function CropDiseaseDetector() {
  const navigate = useNavigate();
  const { t } = useApp();
  const [stage, setStage] = useState<Stage>('upload');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [result, setResult] = useState<DiseaseResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedImage(reader.result as string);
        setSelectedFile(file);
        analyzeImage(file);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const analyzeImage = async (file: File) => {
    setStage('analyzing');
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
          treatment: Array.isArray(data.result.treatment) 
            ? data.result.treatment 
            : [data.result.treatment],
          confidence: data.result.confidence,
          pathogen: data.result.pathogen,
        });
        setStage('result');
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err) {
      console.error('Error analyzing image:', err);
      setError(err instanceof Error ? err.message : 'Failed to analyze image. Please try again.');
      setStage('upload');
    }
  };
  
  const handleGetBusinessAdvice = () => {
    if (!result) return;
    
    // Navigate to business advisor with disease context
    navigate('/business-advisor', { 
      state: { 
        diseaseResult: result,
        fromDiseaseDetector: true 
      } 
    });
  };
  
  const handleReset = () => {
    setStage('upload');
    setSelectedImage(null);
    setSelectedFile(null);
    setResult(null);
    setError(null);
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white dark:from-gray-900 dark:to-gray-950 transition-colors">
      <Header />
      
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 dark:from-green-700 dark:to-green-800 text-white py-6 shadow-lg">
        <div className="container mx-auto px-4 flex items-center gap-4">
          <button
            onClick={() => navigate('/farmer-dashboard')}
            className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-all hover:scale-110"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-3">
            <Scan className="w-8 h-8" />
            <h2>{t('crop.disease')}</h2>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          {/* Upload Stage */}
          {stage === 'upload' && (
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 animate-fadeIn">
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                  <Scan className="w-10 h-10 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-gray-900 dark:text-white mb-2">{t('crop.disease')}</h3>
                <p className="text-gray-600 dark:text-gray-300">{t('crop.disease.desc')}</p>
              </div>
              
              {selectedImage && (
                <div className="mb-6 animate-slideIn">
                  <img
                    src={selectedImage}
                    alt="Selected"
                    className="w-full h-64 object-cover rounded-xl shadow-lg"
                  />
                </div>
              )}
              
              {error && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 rounded-lg">
                  <p className="text-red-700 dark:text-red-400">{error}</p>
                </div>
              )}
              
              <div className="space-y-4">
                <label className="block group">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <div className="bg-gradient-to-r from-green-600 to-green-700 text-white py-5 rounded-2xl hover:from-green-700 hover:to-green-800 transition-all shadow-lg cursor-pointer flex items-center justify-center gap-3 group-hover:scale-105 transform">
                    <Upload className="w-6 h-6 group-hover:animate-bounce" />
                    <span>{t('upload.image')}</span>
                  </div>
                </label>
                
                <label className="block group">
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white py-5 rounded-2xl hover:from-yellow-600 hover:to-yellow-700 transition-all shadow-lg cursor-pointer flex items-center justify-center gap-3 group-hover:scale-105 transform">
                    <Camera className="w-6 h-6 group-hover:animate-pulse" />
                    <span>{t('click.photo')}</span>
                  </div>
                </label>
              </div>
            </div>
          )}
          
          {/* Analyzing Stage */}
          {stage === 'analyzing' && (
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 text-center animate-fadeIn">
              {selectedImage && (
                <div className="relative mb-8">
                  <img
                    src={selectedImage}
                    alt="Analyzing"
                    className="w-full h-64 object-cover rounded-xl"
                  />
                  <div className="absolute inset-0 bg-green-600/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                    <Sparkles className="w-12 h-12 text-white animate-pulse" />
                  </div>
                </div>
              )}
              
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
              <h3 className="text-gray-900 dark:text-white mb-2">{t('analyzing')}</h3>
              <p className="text-gray-600 dark:text-gray-300">AI is analyzing the leaf image...</p>
              
              <div className="mt-6 flex justify-center gap-2">
                <div className="w-2 h-2 bg-green-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-green-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-green-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          )}
          
          {/* Result Stage */}
          {stage === 'result' && result && (
            <div className="space-y-6 animate-fadeIn">
              {selectedImage && (
                <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg p-6">
                  <img
                    src={selectedImage}
                    alt="Result"
                    className="w-full h-64 object-cover rounded-xl"
                  />
                </div>
              )}
              
              <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8">
                <div className="flex items-center justify-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-green-600">Analysis Complete</h3>
                </div>
                
                <div className="space-y-6">
                  {/* Detected Crop */}
                  <div className="bg-green-50 dark:bg-green-900/30 rounded-2xl p-6 border-l-4 border-green-600 dark:border-green-500 hover:bg-green-100 dark:hover:bg-green-900/50 transition-colors">
                    <p className="text-gray-600 dark:text-gray-300 mb-2">{t('detected.crop')}</p>
                    <p className="text-gray-900 dark:text-white text-xl">{result.crop}</p>
                  </div>
                  
                  {/* Detected Disease */}
                  <div className="bg-red-50 dark:bg-red-900/30 rounded-2xl p-6 border-l-4 border-red-600 dark:border-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors">
                    <p className="text-gray-600 dark:text-gray-300 mb-2">{t('detected.disease')}</p>
                    <p className="text-gray-900 dark:text-white text-xl">{result.disease}</p>
                  </div>
                  
                  {/* Severity */}
                  <div className="bg-yellow-50 dark:bg-yellow-900/30 rounded-2xl p-6 border-l-4 border-yellow-600 dark:border-yellow-500 hover:bg-yellow-100 dark:hover:bg-yellow-900/50 transition-colors">
                    <p className="text-gray-600 dark:text-gray-300 mb-2">{t('severity')}</p>
                    <div className="flex items-center gap-2">
                      <AlertCircle className={`w-6 h-6 ${
                        result.severity === 'high' ? 'text-red-600 dark:text-red-400' :
                        result.severity === 'medium' ? 'text-yellow-600 dark:text-yellow-400' :
                        'text-green-600 dark:text-green-400'
                      }`} />
                      <p className="text-gray-900 dark:text-white text-xl capitalize">{result.severity}</p>
                    </div>
                  </div>
                  
                  {/* Treatment */}
                  <div className="bg-blue-50 dark:bg-blue-900/30 rounded-2xl p-6 border-l-4 border-blue-600 dark:border-blue-500">
                    <p className="text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      {t('treatment')}
                    </p>
                    <ul className="space-y-3">
                      {result.treatment.map((step, index) => (
                        <li key={index} className="flex gap-3 animate-slideIn" style={{ animationDelay: `${index * 100}ms` }}>
                          <span className="flex-shrink-0 w-6 h-6 bg-blue-600 dark:bg-blue-500 text-white rounded-full flex items-center justify-center">
                            {index + 1}
                          </span>
                          <span className="text-gray-700 dark:text-gray-300">{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                <div className="space-y-4 mt-8">
                  <button 
                    onClick={handleGetBusinessAdvice}
                    className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-5 rounded-2xl hover:from-green-700 hover:to-green-800 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-3"
                  >
                    <MessageCircle className="w-5 h-5" />
                    Get Business Advice for This Disease
                  </button>
                  
                  {result.confidence && (
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 text-center">
                      <p className="text-gray-600 dark:text-gray-300 text-sm">Confidence: {(result.confidence * 100).toFixed(1)}%</p>
                    </div>
                  )}
                  
                  <button className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 text-white py-5 rounded-2xl hover:from-yellow-600 hover:to-yellow-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105">
                    {t('learn.more')}
                  </button>
                  
                  <button
                    onClick={handleReset}
                    className="w-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 py-5 rounded-2xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-all transform hover:scale-105"
                  >
                    Scan Another Leaf
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Help Button */}
      <button className="fixed bottom-6 right-6 w-12 h-12 bg-gray-900 dark:bg-gray-800 text-white rounded-full flex items-center justify-center hover:bg-gray-800 dark:hover:bg-gray-700 transition-colors shadow-lg z-20 hover:scale-110">
        <HelpCircle className="w-6 h-6" />
      </button>
    </div>
  );
}