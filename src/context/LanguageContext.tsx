'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

type Language = 'en' | 'hi' | 'mr'

interface Translations {
  [key: string]: { en: string; hi: string; mr: string }
}

// Core UI translations
const translations: Translations = {
  // Navigation
  'nav.dashboard': { en: 'Dashboard', hi: 'डैशबोर्ड', mr: 'डॅशबोर्ड' },
  'nav.search': { en: 'Search', hi: 'खोजें', mr: 'शोधा' },
  'nav.matches': { en: 'Matches', hi: 'मैच', mr: 'मॅच' },
  'nav.messages': { en: 'Messages', hi: 'संदेश', mr: 'संदेश' },
  'nav.profile': { en: 'Profile', hi: 'प्रोफाइल', mr: 'प्रोफाइल' },
  'nav.settings': { en: 'Settings', hi: 'सेटिंग्स', mr: 'सेटिंग्ज' },
  'nav.premium': { en: 'Premium', hi: 'प्रीमियम', mr: 'प्रीमियम' },
  'nav.notifications': { en: 'Notifications', hi: 'सूचनाएं', mr: 'सूचना' },
  
  // Dashboard
  'dash.welcome': { en: 'Welcome back', hi: 'वापस स्वागत है', mr: 'पुन्हा स्वागत' },
  'dash.hello': { en: 'Hello', hi: 'नमस्ते', mr: 'नमस्कार' },
  'dash.journey': { en: 'Your journey to finding love continues.', hi: 'प्यार खोजने की आपकी यात्रा जारी है।', mr: 'प्रेम शोधण्याचा तुमचा प्रवास सुरू आहे.' },
  'dash.profile_views': { en: 'Profile Views', hi: 'प्रोफाइल व्यूज', mr: 'प्रोफाइल व्यूज' },
  'dash.interests': { en: 'Interests Received', hi: 'रुचि प्राप्त', mr: 'रुची प्राप्त' },
  'dash.mutual': { en: 'Mutual Matches', hi: 'आपसी मैच', mr: 'परस्पर मॅच' },
  'dash.shortlisted': { en: 'Shortlisted By', hi: 'शॉर्टलिस्ट किया', mr: 'शॉर्टलिस्ट केले' },
  'dash.daily_picks': { en: 'AI Daily Picks', hi: 'AI दैनिक चयन', mr: 'AI दैनिक निवडी' },
  'dash.complete_profile': { en: 'Complete Profile', hi: 'प्रोफाइल पूरा करें', mr: 'प्रोफाइल पूर्ण करा' },
  
  // Search
  'search.title': { en: 'Find Your Match', hi: 'अपना मैच खोजें', mr: 'तुमचा मॅच शोधा' },
  'search.filter': { en: 'Filters', hi: 'फिल्टर', mr: 'फिल्टर' },
  'search.age': { en: 'Age', hi: 'उम्र', mr: 'वय' },
  'search.religion': { en: 'Religion', hi: 'धर्म', mr: 'धर्म' },
  'search.city': { en: 'City', hi: 'शहर', mr: 'शहर' },
  'search.education': { en: 'Education', hi: 'शिक्षा', mr: 'शिक्षण' },
  
  // Profile
  'profile.about': { en: 'About Me', hi: 'मेरे बारे में', mr: 'माझ्याबद्दल' },
  'profile.partner_pref': { en: 'Partner Preferences', hi: 'पार्टनर प्राथमिकताएं', mr: 'जोडीदार प्राधान्ये' },
  'profile.send_interest': { en: 'Send Interest', hi: 'रुचि भेजें', mr: 'रुची पाठवा' },
  'profile.message': { en: 'Message', hi: 'संदेश', mr: 'संदेश' },
  'profile.view': { en: 'View Profile', hi: 'प्रोफाइल देखें', mr: 'प्रोफाइल पहा' },
  'profile.verified': { en: 'Verified', hi: 'सत्यापित', mr: 'पडताळलेले' },
  
  // Actions
  'action.save': { en: 'Save', hi: 'सेव करें', mr: 'सेव्ह करा' },
  'action.cancel': { en: 'Cancel', hi: 'रद्द करें', mr: 'रद्द करा' },
  'action.submit': { en: 'Submit', hi: 'जमा करें', mr: 'सबमिट करा' },
  'action.next': { en: 'Next', hi: 'आगे', mr: 'पुढे' },
  'action.back': { en: 'Back', hi: 'पीछे', mr: 'मागे' },
  'action.join': { en: 'Join', hi: 'जुड़ें', mr: 'सामील व्हा' },
  'action.register': { en: 'Register', hi: 'रजिस्टर', mr: 'नोंदणी' },
  'action.login': { en: 'Login', hi: 'लॉगिन', mr: 'लॉगिन' },
  
  // General
  'general.loading': { en: 'Loading...', hi: 'लोड हो रहा है...', mr: 'लोड होत आहे...' },
  'general.no_results': { en: 'No results found', hi: 'कोई परिणाम नहीं मिला', mr: 'कोणतेही निकाल सापडले नाहीत' },
  'general.compatibility': { en: 'Compatibility', hi: 'अनुकूलता', mr: 'सुसंगतता' },
  'general.online': { en: 'Online', hi: 'ऑनलाइन', mr: 'ऑनलाइन' },
}

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
  languages: { code: Language; name: string; nativeName: string }[]
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en')

  useEffect(() => {
    const saved = localStorage.getItem('soulmateSync_language') as Language
    if (saved && ['en', 'hi', 'mr'].includes(saved)) setLanguageState(saved)
  }, [])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem('soulmateSync_language', lang)
  }

  const t = (key: string): string => {
    const entry = translations[key]
    if (!entry) return key
    return entry[language] || entry.en
  }

  const languages = [
    { code: 'en' as Language, name: 'English', nativeName: 'English' },
    { code: 'hi' as Language, name: 'Hindi', nativeName: 'हिंदी' },
    { code: 'mr' as Language, name: 'Marathi', nativeName: 'मराठी' },
  ]

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, languages }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) throw new Error('useLanguage must be used within LanguageProvider')
  return context
}
