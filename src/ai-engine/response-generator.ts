/**
 * Soulmate Sync AI Engine - Response Generator
 * 
 * Generates natural, contextual responses based on:
 * - RAG-retrieved knowledge
 * - Detected intent
 * - User's language preference
 * - Conversation history
 * - Extracted entities
 * - Sentiment analysis
 */

import { Language, ExtractedEntities } from './nlp-processor'
import { Intent } from './intent-classifier'
import { RetrievalResult } from './rag-retriever'

interface ResponseContext {
  intent: Intent
  confidence: number
  language: Language
  entities: ExtractedEntities
  sentiment: 'positive' | 'negative' | 'neutral'
  ragResults: RetrievalResult[]
  conversationHistory: string[]
  userName?: string
}

/**
 * Generate a contextual response based on all analyzed inputs
 */
export function generateResponse(ctx: ResponseContext): string {
  const { intent, language, entities, sentiment, ragResults, userName } = ctx
  
  // Get RAG content in appropriate language
  const ragContent = getRAGContent(ragResults, language)
  
  // Generate based on intent + language
  let response = ''
  
  switch (intent) {
    case 'greeting':
      response = getGreeting(language, userName)
      break
    case 'farewell':
      response = getFarewell(language)
      break
    case 'complaint':
      response = getComplaintResponse(language, sentiment)
      break
    default:
      // Use RAG content as primary response
      if (ragContent) {
        response = formatRAGResponse(ragContent, intent, language, entities)
      } else {
        response = getFallback(language, intent)
      }
  }
  
  return response
}

function getRAGContent(results: RetrievalResult[], language: Language): string | null {
  if (results.length === 0) return null
  
  const best = results[0]
  if (best.score < 0.5) return null
  
  const doc = best.document
  if (language === 'hi' && doc.content_hi) return doc.content_hi
  if (language === 'mr' && doc.content_mr) return doc.content_mr
  return doc.content
}

function formatRAGResponse(content: string, intent: Intent, language: Language, entities: ExtractedEntities): string {
  let response = content
  
  // Add contextual prefix based on intent
  const prefixes: Record<string, Record<Language, string>> = {
    profile_help: {
      en: "Here's how you can improve your profile:\n\n",
      hi: "अपनी प्रोफाइल सुधारने के लिए:\n\n",
      mr: "तुमची प्रोफाइल सुधारण्यासाठी:\n\n"
    },
    search_match: {
      en: "Here's how our matching works:\n\n",
      hi: "हमारी मैचमेकिंग ऐसे काम करती है:\n\n",
      mr: "आमची मॅचमेकिंग अशी काम करते:\n\n"
    },
    kundali: {
      en: "About Kundali Matching:\n\n",
      hi: "कुंडली मिलान के बारे में:\n\n",
      mr: "कुंडली जुळवणीबद्दल:\n\n"
    },
    premium_info: {
      en: "About our Premium plans:\n\n",
      hi: "हमारे प्रीमियम प्लान:\n\n",
      mr: "आमचे प्रीमियम प्लान:\n\n"
    },
    safety: {
      en: "Your safety is our priority:\n\n",
      hi: "आपकी सुरक्षा हमारी प्राथमिकता है:\n\n",
      mr: "तुमची सुरक्षा आमची प्राथमिकता आहे:\n\n"
    },
    first_meeting: {
      en: "Tips for your first meeting:\n\n",
      hi: "पहली मुलाकात के टिप्स:\n\n",
      mr: "पहिल्या भेटीसाठी टिप्स:\n\n"
    },
    family_advice: {
      en: "Regarding family involvement:\n\n",
      hi: "परिवार को शामिल करने के बारे में:\n\n",
      mr: "कुटुंबाला सहभागी करण्याबद्दल:\n\n"
    },
    verification: {
      en: "About verification:\n\n",
      hi: "सत्यापन के बारे में:\n\n",
      mr: "पडताळणीबद्दल:\n\n"
    },
  }
  
  const prefix = prefixes[intent]?.[language] || ''
  
  // Add entity-specific context
  let entityNote = ''
  if (entities.city) {
    const cityNotes: Record<Language, string> = {
      en: `\n\n💡 Tip: We have many verified profiles from ${entities.city}. Check the Nearby section!`,
      hi: `\n\n💡 टिप: हमारे पास ${entities.city} से कई वेरिफाइड प्रोफाइल हैं। Nearby सेक्शन देखें!`,
      mr: `\n\n💡 टिप: आमच्याकडे ${entities.city} मधून अनेक वेरिफाइड प्रोफाइल आहेत. Nearby सेक्शन पहा!`
    }
    entityNote = cityNotes[language]
  }
  if (entities.religion) {
    const relNotes: Record<Language, string> = {
      en: `\n\n💡 You can filter matches by ${entities.religion} community in the Search section.`,
      hi: `\n\n💡 आप सर्च में ${entities.religion} समुदाय के अनुसार फिल्टर कर सकते हैं।`,
      mr: `\n\n💡 तुम्ही सर्चमध्ये ${entities.religion} समुदायानुसार फिल्टर करू शकता.`
    }
    entityNote = relNotes[language]
  }
  
  return prefix + response + entityNote
}

function getGreeting(language: Language, userName?: string): string {
  const name = userName ? ` ${userName}` : ''
  const greetings: Record<Language, string[]> = {
    en: [
      `Hello${name}! 💜 I'm your Soulmate Sync AI assistant. How can I help you find your perfect match today?`,
      `Hi${name}! Welcome to Soulmate Sync. I can help with profile tips, finding matches, kundali compatibility, safety guidance, and more. What would you like to know?`,
      `Hey${name}! 👋 Ready to help you on your journey to finding love. Ask me anything about matchmaking, profiles, or our features!`
    ],
    hi: [
      `नमस्ते${name}! 💜 मैं आपका Soulmate Sync AI सहायक हूं। आज मैं आपकी कैसे मदद कर सकता हूं?`,
      `हेलो${name}! Soulmate Sync में स्वागत है। मैं प्रोफाइल टिप्स, मैच ढूंढने, कुंडली मिलान, सुरक्षा गाइडेंस में मदद कर सकता हूं। क्या जानना चाहेंगे?`,
      `नमस्ते${name}! 👋 आपकी शादी की यात्रा में मदद के लिए तैयार हूं। कुछ भी पूछें!`
    ],
    mr: [
      `नमस्कार${name}! 💜 मी तुमचा Soulmate Sync AI सहाय्यक आहे. आज मी तुम्हाला कशी मदत करू शकतो?`,
      `हॅलो${name}! Soulmate Sync मध्ये स्वागत आहे. मी प्रोफाइल टिप्स, मॅच शोधणे, कुंडली जुळवणी, सुरक्षा मार्गदर्शनात मदत करू शकतो.`,
      `नमस्कार${name}! 👋 तुमच्या लग्नाच्या प्रवासात मदतीसाठी तयार आहे. काहीही विचारा!`
    ]
  }
  return greetings[language][Math.floor(Math.random() * greetings[language].length)]
}

function getFarewell(language: Language): string {
  const farewells: Record<Language, string[]> = {
    en: [
      "You're welcome! Wishing you all the best in finding your soulmate. Come back anytime! 💜",
      "Happy to help! May you find the perfect life partner soon. Take care! 🌟",
      "Goodbye! Remember, your perfect match is out there. Keep exploring! 💝"
    ],
    hi: [
      "आपका स्वागत है! आपको सही जीवन साथी मिलने की शुभकामनाएं। कभी भी वापस आएं! 💜",
      "खुशी हुई मदद करके! जल्दी ही आपको परफेक्ट पार्टनर मिले। ध्यान रखें! 🌟",
      "अलविदा! याद रखें, आपका सही मैच कहीं है। खोजते रहें! 💝"
    ],
    mr: [
      "तुमचे स्वागत आहे! तुम्हाला योग्य जीवन साथी मिळण्यासाठी शुभेच्छा. कधीही परत या! 💜",
      "मदत करून आनंद झाला! लवकरच तुम्हाला परफेक्ट पार्टनर मिळो. काळजी घ्या! 🌟",
      "बाय! लक्षात ठेवा, तुमचा योग्य मॅच कुठेतरी आहे. शोधत रहा! 💝"
    ]
  }
  return farewells[language][Math.floor(Math.random() * farewells[language].length)]
}

function getComplaintResponse(language: Language, sentiment: 'positive' | 'negative' | 'neutral'): string {
  const responses: Record<Language, string> = {
    en: `I'm sorry to hear you're facing issues. Here's what you can do:
1. For technical issues - try refreshing the page or clearing cache
2. To report a profile - use the Report button on their profile
3. For account issues - go to Settings
4. For urgent help - contact our support team

Is there something specific I can help you with?`,
    hi: `मुझे खेद है कि आपको समस्या हो रही है। आप यह कर सकते हैं:
1. तकनीकी समस्या - पेज रीफ्रेश करें या कैश क्लियर करें
2. प्रोफाइल रिपोर्ट करना - उनकी प्रोफाइल पर Report बटन दबाएं
3. अकाउंट समस्या - Settings में जाएं
4. तुरंत मदद - सपोर्ट टीम से संपर्क करें

क्या कुछ खास है जिसमें मैं मदद कर सकता हूं?`,
    mr: `तुम्हाला समस्या येत आहे हे ऐकून वाईट वाटले. तुम्ही हे करू शकता:
1. तांत्रिक समस्या - पेज रिफ्रेश करा किंवा कॅश क्लिअर करा
2. प्रोफाइल रिपोर्ट - त्यांच्या प्रोफाइलवर Report बटण दाबा
3. अकाउंट समस्या - Settings मध्ये जा
4. तातडीची मदत - सपोर्ट टीमशी संपर्क करा

काही विशेष मदत हवी आहे का?`
  }
  return responses[language]
}

function getFallback(language: Language, intent: Intent): string {
  const fallbacks: Record<Language, string> = {
    en: `I'd be happy to help! Here's what I can assist you with:
• Profile improvement tips
• Finding compatible matches
• Kundali/horoscope matching
• Safety and verification
• Premium membership info
• Communication advice
• First meeting guidance

Could you tell me more about what you'd like to know?`,
    hi: `मुझे खुशी होगी मदद करने में! मैं इनमें सहायता कर सकता हूं:
• प्रोफाइल सुधारने के टिप्स
• संगत मैच खोजना
• कुंडली मिलान
• सुरक्षा और सत्यापन
• प्रीमियम सदस्यता जानकारी
• संवाद सलाह
• पहली मुलाकात गाइडेंस

क्या आप और बता सकते हैं कि आप क्या जानना चाहते हैं?`,
    mr: `मदत करण्यात मला आनंद होईल! मी यामध्ये सहाय्य करू शकतो:
• प्रोफाइल सुधारणा टिप्स
• सुसंगत मॅच शोधणे
• कुंडली जुळवणी
• सुरक्षा आणि पडताळणी
• प्रीमियम सदस्यत्व माहिती
• संवाद सल्ला
• पहिल्या भेटीचे मार्गदर्शन

तुम्हाला काय जाणून घ्यायचे आहे ते अधिक सांगू शकता का?`
  }
  return fallbacks[language]
}
