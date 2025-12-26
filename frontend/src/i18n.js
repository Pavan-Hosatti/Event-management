import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

i18n
  .use(Backend) // Use the HTTP backend to load translation files
  .use(LanguageDetector) // Detect user language automatically
  .use(initReactI18next) // Passes i18n down to react-i18next
  .init({
    // Configuration options
    fallbackLng: 'en', 
    supportedLngs: ['en', 'kn'], // English and Kannada
    ns: ['translation'], // Default namespace/file to load
    defaultNS: 'translation',
    
    debug: false, // Set to true if you are debugging issues
    
    interpolation: {
      escapeValue: false, // Not needed for React
    },
    
    backend: {
      // Path where i18next will look for your translation files
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    }
  });

export default i18n;