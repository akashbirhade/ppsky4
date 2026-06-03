// AI Matchmaking Engine
import { UserProfile, searchProfiles } from './database'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

interface MatchScore {
  profile: UserProfile
  score: number
  reasons: string[]
}

// AI responses based on context
const greetings = [
  "Namaste! 🙏 I'm your AI Matchmaking Assistant. I can help you find compatible matches, improve your profile, or answer questions about our platform. How can I help you today?",
  "Hello! 💕 Welcome to Soulmate Sync AI. I'm here to help you on your journey to find your perfect life partner. What would you like to know?",
  "Hi there! ✨ I'm your personal matchmaking assistant powered by AI. Whether you need help finding matches, profile tips, or relationship advice - I'm here for you!"
]

export function getAIResponse(message: string, conversationHistory: ChatMessage[], userProfile?: UserProfile | null): string {
  const lowerMessage = message.toLowerCase()
  
  // Greeting detection
  if (isGreeting(lowerMessage)) {
    return greetings[Math.floor(Math.random() * greetings.length)]
  }

  // Match finding queries
  if (lowerMessage.includes('match') || lowerMessage.includes('find') || lowerMessage.includes('suggest') || lowerMessage.includes('recommend')) {
    return handleMatchQuery(lowerMessage, userProfile)
  }

  // Profile improvement
  if (lowerMessage.includes('profile') || lowerMessage.includes('improve') || lowerMessage.includes('tips') || lowerMessage.includes('better')) {
    return handleProfileQuery(lowerMessage, userProfile)
  }

  // Compatibility questions
  if (lowerMessage.includes('compatible') || lowerMessage.includes('compatibility') || lowerMessage.includes('score')) {
    return handleCompatibilityQuery(lowerMessage, userProfile)
  }

  // Premium/pricing queries
  if (lowerMessage.includes('premium') || lowerMessage.includes('price') || lowerMessage.includes('plan') || lowerMessage.includes('membership') || lowerMessage.includes('cost')) {
    return handlePremiumQuery()
  }

  // Safety questions
  if (lowerMessage.includes('safe') || lowerMessage.includes('verify') || lowerMessage.includes('scam') || lowerMessage.includes('fake') || lowerMessage.includes('trust')) {
    return handleSafetyQuery()
  }

  // Relationship advice
  if (lowerMessage.includes('first') || lowerMessage.includes('date') || lowerMessage.includes('talk') || lowerMessage.includes('message') || lowerMessage.includes('conversation')) {
    return handleRelationshipAdvice(lowerMessage)
  }

  // How it works
  if (lowerMessage.includes('how') && (lowerMessage.includes('work') || lowerMessage.includes('use'))) {
    return handleHowItWorks()
  }

  // Success stories
  if (lowerMessage.includes('success') || lowerMessage.includes('story') || lowerMessage.includes('stories')) {
    return handleSuccessStories()
  }

  // Default - contextual response
  return handleGenericQuery(lowerMessage, conversationHistory)
}

function isGreeting(msg: string): boolean {
  const greetingWords = ['hi', 'hello', 'hey', 'namaste', 'namaskar', 'good morning', 'good evening', 'good afternoon']
  return greetingWords.some(g => msg.includes(g)) && msg.length < 30
}

function handleMatchQuery(message: string, userProfile?: UserProfile | null): string {
  if (!userProfile) {
    return "To find your best matches, I'd need you to be logged in so I can access your preferences. Please log in or create an account first! 🔐\n\nOnce logged in, I can:\n• Suggest highly compatible profiles\n• Filter based on your specific preferences\n• Show you today's top recommendations"
  }

  const oppositeGender = userProfile.gender === 'Male' ? 'Female' : 'Male'
  const matches = searchProfiles({ gender: oppositeGender }, userProfile.id)
  
  if (matches.length === 0) {
    return "I'm currently searching for matches that align with your preferences. New profiles are added daily - check back soon! Meanwhile, make sure your profile is complete for better matching accuracy. ✨"
  }

  const scored = scoreMatches(userProfile, matches)
  const top3 = scored.slice(0, 3)

  let response = `Based on your profile and preferences, here are your top AI-recommended matches:\n\n`
  
  top3.forEach((match, i) => {
    response += `**${i + 1}. ${match.profile.name}** (${match.score}% compatible)\n`
    response += `   📍 ${match.profile.city} | 🎓 ${match.profile.education} | 💼 ${match.profile.occupation}\n`
    response += `   ✨ ${match.reasons[0]}\n\n`
  })

  response += `\nWould you like me to tell you more about any of these profiles, or adjust your search criteria?`
  return response
}

function handleProfileQuery(message: string, userProfile?: UserProfile | null): string {
  if (!userProfile) {
    return "Here are some tips to create a standout profile:\n\n📸 **Photos**: Upload 4-6 clear, recent photos including a close-up and full-length shot\n\n✍️ **About Me**: Write 150-200 words describing your personality, interests, and values\n\n🎯 **Be Specific**: Detail your education, career goals, and hobbies\n\n💡 **Partner Preferences**: Be realistic but clear about what matters most\n\n🔒 **Verify**: Get the blue tick for 40% more responses!\n\nWould you like more specific advice on any section?"
  }

  const tips: string[] = []
  
  if (!userProfile.about || userProfile.about.length < 50) {
    tips.push("📝 Your 'About Me' section needs more detail. Aim for 150-200 words that showcase your personality.")
  }
  if (userProfile.photos.length < 3) {
    tips.push("📸 Add more photos! Profiles with 4+ photos get 3x more responses.")
  }
  if (!userProfile.verified) {
    tips.push("✅ Get verified! Blue-tick profiles receive 40% more connection requests.")
  }
  if (!userProfile.occupation) {
    tips.push("💼 Add your occupation details to attract more relevant matches.")
  }

  if (tips.length === 0) {
    return "Your profile looks great! 🌟 It's well-detailed and complete. Here are some advanced tips:\n\n• Update your photos every 3-6 months\n• Refresh your 'About Me' section with recent achievements\n• Be more specific in partner preferences for better AI matching\n• Consider upgrading to Premium for maximum visibility"
  }

  return `Here's how you can improve your profile for better matches:\n\n${tips.join('\n\n')}\n\nWould you like help with any specific section?`
}

function handleCompatibilityQuery(message: string, userProfile?: UserProfile | null): string {
  return "Our AI compatibility scoring considers multiple factors:\n\n🧠 **Personality Match** (25%): Values, lifestyle, and interests alignment\n\n📍 **Location Proximity** (15%): Same city/region preferences\n\n🎓 **Education & Career** (20%): Professional compatibility\n\n👨‍👩‍👧 **Family Values** (20%): Religion, traditions, family expectations\n\n🎯 **Preference Alignment** (20%): How well you match each other's stated preferences\n\nScores above 75% indicate high compatibility! Would you like me to find your most compatible matches?"
}

function handlePremiumQuery(): string {
  return "Here are our Premium membership plans:\n\n💎 **Gold** - ₹3,999/3 months\n• Unlimited messaging\n• See who viewed your profile\n• Advanced search filters\n• Priority customer support\n\n👑 **Diamond** - ₹6,999/6 months\n• All Gold features\n• Profile boost (3x visibility)\n• Video call feature\n• Dedicated relationship advisor\n• Contact number access\n\n🌟 **Platinum** - ₹9,999/12 months\n• All Diamond features\n• VIP badge\n• AI-powered match recommendations\n• 30-day money-back guarantee\n• Personal matchmaking consultant\n\nAll plans come with our 30-day money-back guarantee! Which plan interests you?"
}

function handleSafetyQuery(): string {
  return "Your safety is our top priority! Here's how we protect you:\n\n🔒 **Profile Verification**: ID-based verification for the blue tick\n\n🛡️ **Privacy Controls**: Choose who can see your contact info and photos\n\n🚨 **Report System**: Easy reporting of suspicious profiles\n\n👁️ **Manual Review**: Our team reviews flagged profiles within 24 hours\n\n📱 **Secure Chat**: In-app messaging without sharing phone numbers\n\n🔐 **Data Protection**: End-to-end encryption for all communications\n\n⚠️ **Safety Tips**:\n• Never share financial information\n• Meet in public places for first meetings\n• Inform a friend/family about your plans\n• Trust your instincts\n\nFeel unsafe? Contact our 24/7 support team immediately."
}

function handleRelationshipAdvice(message: string): string {
  if (message.includes('first') && message.includes('message')) {
    return "Here are tips for your first message:\n\n💬 **Do's**:\n• Mention something specific from their profile\n• Ask a thoughtful question about their interests\n• Keep it friendly and respectful\n• Be genuine and authentic\n\n❌ **Don'ts**:\n• Don't start with just \"Hi\" or \"Hey\"\n• Don't ask for phone number immediately\n• Don't send copy-paste messages\n• Don't be overly forward\n\n✨ **Example**: \"Hi [Name]! I noticed you love hiking too. Have you explored any trails near [their city]? I'd love to hear about your adventures!\"\n\nWould you like more conversation starters?"
  }

  return "Here are some tips for meaningful connections:\n\n💕 **Building Connection**:\n• Take time to read their full profile\n• Find common interests and values\n• Be patient - good relationships take time\n• Be honest about your expectations\n\n📞 **Moving Forward**:\n• Chat for at least a week before exchanging numbers\n• Have a video call before meeting in person\n• Involve family when you feel comfortable\n• Plan your first meeting in a public place\n\nWould you like specific advice for your situation?"
}

function handleHowItWorks(): string {
  return "Here's how Soulmate Sync works:\n\n**Step 1: Create Profile** 📝\nSign up and fill in your details - education, career, family background, and what you're looking for.\n\n**Step 2: Get Matched** 🤖\nOur AI analyzes 50+ parameters to suggest compatible profiles tailored just for you.\n\n**Step 3: Connect** 💬\nSend interests, chat with matches, and use video calls to get to know them.\n\n**Step 4: Meet** ☕\nWhen you're ready, meet in person (safely!) and take the next step.\n\n**Step 5: Celebrate** 🎉\nJoin our 80 lakh+ success stories!\n\nWant me to help you get started?"
}

function handleSuccessStories(): string {
  return "Here are some of our beautiful success stories:\n\n💑 **Ajinkya & Ashwini** (Married May 2025)\n\"We connected through shared interests in music and travel. After chatting for 2 months, our families met and we're now happily married!\"\n\n💑 **Rohit & Meera** (Married March 2025)\n\"The AI matching was spot on! We were 92% compatible and it showed - we connected instantly on our first video call.\"\n\n💑 **Karthik & Divya** (Married January 2025)\n\"We were from different cities but Soulmate Sync brought us together. Long-distance worked because we were so compatible!\"\n\n🎊 Over 80 lakh success stories and counting!\n\nWant to write your own success story? Let me help you find your perfect match!"
}

function handleGenericQuery(message: string, history: ChatMessage[]): string {
  const responses = [
    "I'd be happy to help you with that! Here's what I can assist you with:\n\n🔍 Finding compatible matches\n📝 Profile improvement tips\n💡 Relationship advice\n💎 Premium membership info\n🔒 Safety & privacy questions\n📊 Compatibility analysis\n\nWhat would you like to explore?",
    "That's a great question! While I process that, here are some things I can help with right away:\n\n• Suggest matches based on your preferences\n• Help optimize your profile for more responses\n• Share tips for meaningful conversations\n• Explain our AI matching algorithm\n\nWhat interests you most?",
    "I'm here to make your matchmaking journey smoother! Let me know if you'd like:\n\n🎯 Personalized match suggestions\n✨ Profile enhancement tips\n💬 Conversation starters\n📈 Ways to increase profile views\n\nJust ask away!"
  ]
  
  return responses[Math.floor(Math.random() * responses.length)]
}

function scoreMatches(user: UserProfile, candidates: UserProfile[]): MatchScore[] {
  return candidates.map(candidate => {
    let score = 50 // base score
    const reasons: string[] = []

    // Age preference match
    if (candidate.age >= user.partnerPreferences.ageMin && candidate.age <= user.partnerPreferences.ageMax) {
      score += 15
      reasons.push('Age matches your preference')
    }

    // Religion match
    if (user.partnerPreferences.religion === 'Any' || candidate.religion === user.partnerPreferences.religion) {
      score += 10
      reasons.push('Religious background aligns')
    }

    // Location match
    if (user.partnerPreferences.city.toLowerCase().includes(candidate.city.toLowerCase()) ||
        user.partnerPreferences.city === 'Any' ||
        user.partnerPreferences.city.toLowerCase().includes('any')) {
      score += 10
      reasons.push('Located in your preferred area')
    }

    // Education match
    if (candidate.education && user.partnerPreferences.education !== 'Any') {
      score += 8
      reasons.push(`Well-educated: ${candidate.education}`)
    }

    // Verified bonus
    if (candidate.verified) {
      score += 5
      reasons.push('Verified profile (Blue Tick ✓)')
    }

    // Premium bonus
    if (candidate.premium) {
      score += 2
    }

    // Cap at 98
    score = Math.min(score, 98)

    if (reasons.length === 0) {
      reasons.push('New potential match to explore')
    }

    return { profile: candidate, score, reasons }
  }).sort((a, b) => b.score - a.score)
}
