import { useApp } from '../contexts/AppContext';
import { Languages } from 'lucide-react';

export default function LanguageToggle() {
  const { language, setLanguage } = useApp();
  
  const languages = [
    { code: 'en' as const, label: 'EN' },
    { code: 'hi' as const, label: 'हिं' },
    { code: 'mr' as const, label: 'मर' },
  ];
  
  return (
    <div className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-white rounded-full shadow-lg p-2 hover:shadow-xl transition-shadow">
      <Languages className="w-5 h-5 text-green-600" />
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => setLanguage(lang.code)}
          className={`px-3 py-2 rounded-full transition-all ${
            language === lang.code
              ? 'bg-green-600 text-white shadow-md scale-110'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105'
          }`}
        >
          {lang.label}
        </button>
      ))}
    </div>
  );
}