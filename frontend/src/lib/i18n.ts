import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from '@/locales/en/common.json';
import hi from '@/locales/hi/common.json';
import bn from '@/locales/bn/common.json';
import ta from '@/locales/ta/common.json';
import te from '@/locales/te/common.json';
import mr from '@/locales/mr/common.json';
import gu from '@/locales/gu/common.json';
import kn from '@/locales/kn/common.json';
import ml from '@/locales/ml/common.json';
import pa from '@/locales/pa/common.json';

export interface SupportedLanguage {
  code: string;
  label: string;
  nativeLabel: string;
}

// Order shown in the language switcher. Add a new language by dropping a
// `common.json` under `src/locales/<code>/` and one more entry here + the
// `resources` map below — nothing else needs to change.
export const SUPPORTED_LANGUAGES: SupportedLanguage[] = [
  { code: 'en', label: 'English', nativeLabel: 'English' },
  { code: 'hi', label: 'Hindi', nativeLabel: 'हिन्दी' },
  { code: 'bn', label: 'Bengali', nativeLabel: 'বাংলা' },
  { code: 'ta', label: 'Tamil', nativeLabel: 'தமிழ்' },
  { code: 'te', label: 'Telugu', nativeLabel: 'తెలుగు' },
  { code: 'mr', label: 'Marathi', nativeLabel: 'मराठी' },
  { code: 'gu', label: 'Gujarati', nativeLabel: 'ગુજરાતી' },
  { code: 'kn', label: 'Kannada', nativeLabel: 'ಕನ್ನಡ' },
  { code: 'ml', label: 'Malayalam', nativeLabel: 'മലയാളം' },
  { code: 'pa', label: 'Punjabi', nativeLabel: 'ਪੰਜਾਬੀ' },
];

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { common: en },
      hi: { common: hi },
      bn: { common: bn },
      ta: { common: ta },
      te: { common: te },
      mr: { common: mr },
      gu: { common: gu },
      kn: { common: kn },
      ml: { common: ml },
      pa: { common: pa },
    },
    fallbackLng: 'en',
    supportedLngs: SUPPORTED_LANGUAGES.map((lang) => lang.code),
    defaultNS: 'common',
    ns: ['common'],
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'woodivo_lang',
    },
  });

export default i18n;
