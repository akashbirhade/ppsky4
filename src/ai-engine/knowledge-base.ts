/**
 * Soulmate Sync AI Engine - Knowledge Base for RAG
 * 
 * This is the retrieval corpus for the RAG system.
 * Documents are chunked and indexed for semantic similarity search.
 * Supports: Hindi, English, Marathi
 */

export interface KnowledgeDocument {
  id: string
  category: string
  tags: string[]
  content: string
  content_hi?: string  // Hindi
  content_mr?: string  // Marathi
  priority: number
}

export const knowledgeBase: KnowledgeDocument[] = [
  // ===== PROFILE HELP =====
  {
    id: 'profile-1',
    category: 'profile',
    tags: ['profile', 'bio', 'about', 'write', 'create', 'complete', 'fill', 'update', 'description'],
    content: `To create a great matrimonial profile:
1. Write a genuine "About Me" - mention your personality, hobbies, values, and what makes you unique.
2. Upload 4-6 clear photos including close-up and full-length.
3. Fill in all details - education, career, family background, and partner preferences.
4. Be honest about your expectations and lifestyle.
5. Highlight your strengths - career achievements, interests, family values.
A complete profile gets 10x more responses than an incomplete one.`,
    content_hi: `एक बेहतरीन मैट्रिमोनी प्रोफाइल बनाने के लिए:
1. एक सच्चा "मेरे बारे में" लिखें - अपने स्वभाव, शौक, मूल्यों का उल्लेख करें।
2. 4-6 स्पष्ट फोटो अपलोड करें - क्लोज-अप और फुल-लेंथ दोनों।
3. सभी विवरण भरें - शिक्षा, करियर, पारिवारिक पृष्ठभूमि।
4. अपनी अपेक्षाओं के बारे में ईमानदार रहें।
5. अपनी ताकत को हाइलाइट करें।
पूर्ण प्रोफाइल को 10 गुना अधिक रिस्पॉन्स मिलता है।`,
    content_mr: `एक उत्तम मॅट्रिमोनी प्रोफाइल तयार करण्यासाठी:
1. खरे "माझ्याबद्दल" लिहा - तुमचा स्वभाव, छंद, मूल्ये सांगा।
2. 4-6 स्पष्ट फोटो अपलोड करा - क्लोज-अप आणि फुल-लेंथ दोन्ही।
3. सर्व माहिती भरा - शिक्षण, करिअर, कौटुंबिक पार्श्वभूमी।
4. तुमच्या अपेक्षांबद्दल प्रामाणिक रहा।
5. तुमच्या सामर्थ्यांवर प्रकाश टाका।
पूर्ण प्रोफाइलला 10 पट अधिक प्रतिसाद मिळतात.`,
    priority: 10
  },
  {
    id: 'profile-2',
    category: 'profile',
    tags: ['photo', 'picture', 'image', 'upload', 'selfie', 'dp', 'pic', 'फोटो', 'तस्वीर'],
    content: `Photo tips for better matches:
- Use recent photos (within last 6 months)
- First photo should be a clear face close-up with good lighting
- Include at least one full-length photo
- Avoid group photos as primary - it confuses viewers
- Smile naturally - it increases interest by 40%
- Avoid heavy filters - people want to see the real you
- Include photos showing hobbies (travel, sports, cooking)
- Professional photos work great but keep it natural`,
    content_hi: `बेहतर मैच के लिए फोटो टिप्स:
- हाल की फोटो इस्तेमाल करें (पिछले 6 महीने)
- पहली फोटो चेहरे की स्पष्ट क्लोज-अप हो
- कम से कम एक फुल-लेंथ फोटो रखें
- ग्रुप फोटो को प्राइमरी न रखें
- नेचुरली मुस्कुराएं - यह 40% ज्यादा इंटरेस्ट लाता है
- भारी फिल्टर से बचें
- शौक दिखाने वाली फोटो रखें`,
    content_mr: `चांगल्या मॅचसाठी फोटो टिप्स:
- अलीकडील फोटो वापरा (मागील 6 महिन्यांतील)
- पहिला फोटो स्पष्ट चेहऱ्याचा क्लोज-अप असावा
- किमान एक फुल-लेंथ फोटो ठेवा
- ग्रुप फोटो प्राइमरी म्हणून ठेवू नका
- नैसर्गिकरित्या हसा - 40% अधिक इंटरेस्ट मिळतो
- जास्त फिल्टर टाळा`,
    priority: 9
  },
  // ===== MATCHMAKING =====
  {
    id: 'match-1',
    category: 'matchmaking',
    tags: ['match', 'compatibility', 'suitable', 'partner', 'find', 'search', 'rishta', 'रिश्ता', 'मैच', 'जोड'],
    content: `Our AI matchmaking considers multiple factors:
1. Basic compatibility - age, religion, caste, location preferences
2. Education & career alignment - similar professional backgrounds
3. Family values match - traditional vs modern outlook
4. Personality compatibility - based on your "About Me" and interests
5. Partner preference overlap - how well you match each other's criteria
6. Activity signals - who's active and responsive

Tips: Set realistic preferences, don't be too restrictive. Expand your search radius for better results. Profiles with 80%+ compatibility score are highly recommended.`,
    content_hi: `हमारी AI मैचमेकिंग कई कारकों पर विचार करती है:
1. बुनियादी संगतता - उम्र, धर्म, जाति, स्थान
2. शिक्षा और करियर - समान पेशेवर पृष्ठभूमि
3. पारिवारिक मूल्य - पारंपरिक बनाम आधुनिक दृष्टिकोण
4. व्यक्तित्व संगतता - आपकी रुचियों के आधार पर
5. पार्टनर प्रेफरेंस - आप दोनों की अपेक्षाएं कितनी मेल खाती हैं
6. एक्टिविटी सिग्नल - कौन सक्रिय है

टिप्स: यथार्थवादी प्रेफरेंस सेट करें, बहुत प्रतिबंधात्मक न हों।`,
    content_mr: `आमची AI मॅचमेकिंग अनेक घटकांचा विचार करते:
1. मूलभूत सुसंगतता - वय, धर्म, जात, स्थान
2. शिक्षण आणि करिअर - समान व्यावसायिक पार्श्वभूमी
3. कौटुंबिक मूल्ये - पारंपारिक विरुद्ध आधुनिक दृष्टिकोन
4. व्यक्तिमत्व सुसंगतता - तुमच्या आवडीनिवडींवर आधारित
5. पार्टनर प्रेफरेंस - दोघांच्या अपेक्षा किती जुळतात
6. अॅक्टिव्हिटी सिग्नल - कोण सक्रिय आहे

टिप्स: वास्तववादी प्रेफरेंस सेट करा.`,
    priority: 10
  },
  {
    id: 'match-2',
    category: 'matchmaking',
    tags: ['kundali', 'horoscope', 'astrology', 'guna', 'manglik', 'कुंडली', 'राशि', 'ग्रह', 'जन्मपत्रिका'],
    content: `Kundali Matching (Horoscope):
Our platform offers Ashtakoota Guna Milan - the traditional 36-point system:
- 18+ points: Acceptable match
- 24+ points: Good match
- 30+ points: Excellent match
- Below 18: Consult an astrologer

The 8 Kootas checked: Varna (1), Vashya (2), Tara (3), Yoni (4), Graha Maitri (5), Gana (6), Bhakoot (7), Nadi (8).

Manglik Dosha: If one partner is Manglik, specific remedies exist. Both being Manglik cancels the dosha. Go to the Kundali page to check compatibility with any profile.`,
    content_hi: `कुंडली मिलान (ज्योतिष):
हमारा प्लेटफॉर्म अष्टकूट गुण मिलान - पारंपरिक 36 अंक प्रणाली प्रदान करता है:
- 18+ अंक: स्वीकार्य मैच
- 24+ अंक: अच्छा मैच
- 30+ अंक: उत्तम मैच
- 18 से नीचे: ज्योतिषी से परामर्श करें

8 कूट: वर्ण (1), वश्य (2), तारा (3), योनि (4), ग्रह मैत्री (5), गण (6), भकूट (7), नाड़ी (8)।

मांगलिक दोष: यदि एक पार्टनर मांगलिक है, तो विशेष उपाय हैं। कुंडली पेज पर जाकर किसी भी प्रोफाइल से संगतता जांचें।`,
    content_mr: `कुंडली जुळवणी (ज्योतिष):
आमचे प्लॅटफॉर्म अष्टकूट गुण मिलान - पारंपारिक 36 गुण प्रणाली देते:
- 18+ गुण: स्वीकार्य जोडी
- 24+ गुण: चांगली जोडी
- 30+ गुण: उत्तम जोडी
- 18 पेक्षा कमी: ज्योतिषांचा सल्ला घ्या

8 कूट: वर्ण (1), वश्य (2), तारा (3), योनी (4), ग्रह मैत्री (5), गण (6), भकूट (7), नाडी (8)।

मांगलिक दोष: एक पार्टनर मांगलिक असल्यास विशेष उपाय आहेत. कुंडली पेजवर जाऊन कोणत्याही प्रोफाइलसह सुसंगतता तपासा.`,
    priority: 8
  },
  // ===== PREMIUM =====
  {
    id: 'premium-1',
    category: 'premium',
    tags: ['premium', 'membership', 'plan', 'price', 'paid', 'upgrade', 'subscribe', 'पैसे', 'सब्सक्रिप्शन', 'प्लान'],
    content: `Premium Membership Benefits:
Silver (₹1,499/3 months): 50 profiles/day, 10 interests/day, basic chat
Gold (₹2,999/6 months): Unlimited views, 30 interests, video calling, AI recommendations, see who viewed you
Platinum (₹4,999/12 months): Everything in Gold + unlimited interests, personal relationship advisor, background checks, featured profile, premium events access

Free members can: Create profile, browse, send limited interests, basic search
Premium members get 3x more responses and find matches 60% faster.`,
    content_hi: `प्रीमियम सदस्यता लाभ:
सिल्वर (₹1,499/3 महीने): 50 प्रोफाइल/दिन, 10 इंटरेस्ट/दिन, बेसिक चैट
गोल्ड (₹2,999/6 महीने): अनलिमिटेड व्यू, 30 इंटरेस्ट, वीडियो कॉलिंग, AI रेकमेंडेशन
प्लेटिनम (₹4,999/12 महीने): गोल्ड + अनलिमिटेड इंटरेस्ट, पर्सनल एडवाइजर, बैकग्राउंड चेक

फ्री मेंबर: प्रोफाइल बना सकते हैं, ब्राउज़ कर सकते हैं, सीमित इंटरेस्ट भेज सकते हैं
प्रीमियम मेंबर को 3 गुना ज्यादा रिस्पॉन्स मिलता है।`,
    content_mr: `प्रीमियम सदस्यत्व फायदे:
सिल्व्हर (₹1,499/3 महिने): 50 प्रोफाइल/दिवस, 10 इंटरेस्ट/दिवस
गोल्ड (₹2,999/6 महिने): अनलिमिटेड व्ह्यू, 30 इंटरेस्ट, व्हिडिओ कॉलिंग, AI शिफारसी
प्लॅटिनम (₹4,999/12 महिने): गोल्ड + अनलिमिटेड इंटरेस्ट, वैयक्तिक सल्लागार

फ्री सदस्य: प्रोफाइल तयार करू शकतात, ब्राउझ करू शकतात
प्रीमियम सदस्यांना 3 पट अधिक प्रतिसाद मिळतो.`,
    priority: 7
  },
  // ===== SAFETY =====
  {
    id: 'safety-1',
    category: 'safety',
    tags: ['safe', 'security', 'scam', 'fraud', 'fake', 'report', 'block', 'verify', 'trust', 'सुरक्षा', 'धोखा'],
    content: `Safety Tips for Online Matchmaking:
1. Never share financial details or send money to anyone
2. Verify profiles before meeting - look for Blue Tick verified profiles
3. First meeting should always be in a public place
4. Inform family/friends before meeting someone
5. Use our in-app video call to verify identity before meeting
6. Report suspicious profiles immediately - we take action within 24 hours
7. Don't share personal details (address, passwords) early
8. Trust your instincts - if something feels wrong, it probably is

Our platform encrypts all data and never shares your contact details without consent.`,
    content_hi: `ऑनलाइन मैचमेकिंग के लिए सुरक्षा टिप्स:
1. कभी भी वित्तीय विवरण साझा न करें या पैसे न भेजें
2. मिलने से पहले प्रोफाइल सत्यापित करें - Blue Tick प्रोफाइल देखें
3. पहली मुलाकात हमेशा सार्वजनिक स्थान पर हो
4. किसी से मिलने से पहले परिवार/दोस्तों को बताएं
5. मिलने से पहले इन-ऐप वीडियो कॉल से पहचान सत्यापित करें
6. संदिग्ध प्रोफाइल की तुरंत रिपोर्ट करें
7. जल्दी व्यक्तिगत विवरण (पता, पासवर्ड) साझा न करें
8. अपनी अंतर्ज्ञान पर भरोसा करें`,
    content_mr: `ऑनलाइन मॅचमेकिंगसाठी सुरक्षा टिप्स:
1. कधीही आर्थिक तपशील शेअर करू नका किंवा पैसे पाठवू नका
2. भेटण्यापूर्वी प्रोफाइल सत्यापित करा - Blue Tick प्रोफाइल पहा
3. पहिली भेट नेहमी सार्वजनिक ठिकाणी असावी
4. कोणाला भेटण्यापूर्वी कुटुंब/मित्रांना सांगा
5. भेटण्यापूर्वी इन-अॅप व्हिडिओ कॉलने ओळख पडताळा
6. संशयास्पद प्रोफाइलची लगेच तक्रार करा
7. लवकर वैयक्तिक तपशील शेअर करू नका`,
    priority: 9
  },
  // ===== RELATIONSHIP ADVICE =====
  {
    id: 'relationship-1',
    category: 'relationship',
    tags: ['first', 'meeting', 'date', 'talk', 'conversation', 'what to say', 'nervous', 'पहली मुलाकात', 'बात', 'पहिली भेट'],
    content: `First Meeting Tips:
1. Choose a comfortable public place - coffee shop, restaurant, or park
2. Dress well but be yourself - don't overdo it
3. Be punctual - shows respect for their time
4. Ask open-ended questions about their interests, family, goals
5. Listen actively - show genuine interest in what they say
6. Be honest about yourself - don't exaggerate
7. Keep the first meeting short (1-2 hours) - leave them wanting more
8. Follow up with a kind message after the meeting
9. Don't discuss marriage pressure or dowry on the first meeting
10. Be respectful regardless of the outcome`,
    content_hi: `पहली मुलाकात के टिप्स:
1. एक आरामदायक सार्वजनिक स्थान चुनें - कॉफी शॉप, रेस्टोरेंट
2. अच्छे कपड़े पहनें लेकिन स्वाभाविक रहें
3. समय पर पहुंचें - यह सम्मान दर्शाता है
4. उनकी रुचियों, परिवार, लक्ष्यों के बारे में पूछें
5. ध्यान से सुनें - सच्ची दिलचस्पी दिखाएं
6. अपने बारे में ईमानदार रहें
7. पहली मुलाकात छोटी रखें (1-2 घंटे)
8. मुलाकात के बाद एक अच्छा मैसेज भेजें
9. पहली मुलाकात में शादी का दबाव या दहेज की बात न करें
10. परिणाम चाहे जो हो, सम्मानजनक रहें`,
    content_mr: `पहिल्या भेटीसाठी टिप्स:
1. आरामदायक सार्वजनिक ठिकाण निवडा - कॉफी शॉप, रेस्टॉरंट
2. चांगले कपडे घाला पण स्वाभाविक रहा
3. वेळेवर पोहोचा - आदर दर्शवतो
4. त्यांच्या आवडी, कुटुंब, ध्येयांबद्दल विचारा
5. लक्षपूर्वक ऐका - खरी आवड दाखवा
6. स्वतःबद्दल प्रामाणिक रहा
7. पहिली भेट छोटी ठेवा (1-2 तास)
8. भेटीनंतर एक चांगला मेसेज पाठवा
9. पहिल्या भेटीत लग्नाचा दबाव किंवा हुंड्याचा विषय काढू नका`,
    priority: 8
  },
  {
    id: 'relationship-2',
    category: 'relationship',
    tags: ['family', 'parents', 'convince', 'approval', 'intercaste', 'love', 'arrange', 'परिवार', 'माता-पिता', 'कुटुंब'],
    content: `Involving Family in Your Decision:
1. Introduce the idea gradually - don't spring it suddenly
2. Share the person's positive qualities first (education, values, career)
3. Let them see the profile together - transparency builds trust
4. Arrange a video call first before in-person family meeting
5. Be patient - parents may need time to accept changes
6. Highlight shared values between families
7. If intercaste, focus on compatibility and character over caste
8. Our platform provides family verification to build trust
9. Consider involving a respected family elder as mediator
10. Remember - marriage is between two families in Indian culture`,
    content_hi: `परिवार को शामिल करना:
1. धीरे-धीरे बात करें - अचानक न बताएं
2. पहले सकारात्मक गुण बताएं (शिक्षा, संस्कार, करियर)
3. प्रोफाइल साथ में देखें - पारदर्शिता विश्वास बनाती है
4. पहले वीडियो कॉल करवाएं
5. धैर्य रखें - माता-पिता को समय चाहिए
6. परिवारों के बीच समान मूल्यों को हाइलाइट करें
7. इंटरकास्ट हो तो संगतता और चरित्र पर ध्यान दें
8. हमारा प्लेटफॉर्म फैमिली वेरिफिकेशन देता है
9. एक सम्मानित बुजुर्ग को मध्यस्थ बनाएं`,
    content_mr: `कुटुंबाला सहभागी करणे:
1. हळूहळू विषय मांडा - अचानक सांगू नका
2. आधी सकारात्मक गुण सांगा (शिक्षण, संस्कार, करिअर)
3. प्रोफाइल एकत्र पहा - पारदर्शकता विश्वास निर्माण करते
4. आधी व्हिडिओ कॉल करून घ्या
5. धीर धरा - पालकांना वेळ लागतो
6. कुटुंबांमधील समान मूल्ये अधोरेखित करा
7. आंतरजातीय असल्यास सुसंगतता आणि चारित्र्यावर भर द्या`,
    priority: 7
  },
  // ===== HOW IT WORKS =====
  {
    id: 'howto-1',
    category: 'howto',
    tags: ['how', 'work', 'use', 'start', 'register', 'sign up', 'begin', 'कैसे', 'शुरू', 'कसे'],
    content: `How to Use Soulmate Sync:
1. Register free with email/phone
2. Create your detailed profile with photos
3. Set your partner preferences (age, religion, location, education)
4. Browse daily AI recommendations or search manually
5. Send interest to profiles you like
6. If mutual interest, start chatting
7. Use video calling to know them better
8. Involve families when you're ready
9. Check Kundali compatibility if desired
10. Plan your first meeting!

Features: AI matching, Kundali matching, Video calls, Profile verification, Recently viewed, Who visited you, Shortlist, Nearby matches.`,
    content_hi: `Soulmate Sync कैसे इस्तेमाल करें:
1. ईमेल/फोन से मुफ्त रजिस्टर करें
2. फोटो के साथ विस्तृत प्रोफाइल बनाएं
3. पार्टनर प्रेफरेंस सेट करें (उम्र, धर्म, शहर, शिक्षा)
4. डेली AI रेकमेंडेशन ब्राउज़ करें या मैनुअली सर्च करें
5. पसंद आने पर इंटरेस्ट भेजें
6. म्यूचुअल इंटरेस्ट हो तो चैट शुरू करें
7. वीडियो कॉलिंग से बेहतर जानें
8. तैयार होने पर परिवारों को शामिल करें
9. कुंडली संगतता जांचें
10. पहली मुलाकात प्लान करें!`,
    content_mr: `Soulmate Sync कसे वापरायचे:
1. ईमेल/फोनने मोफत रजिस्टर करा
2. फोटोसह सविस्तर प्रोफाइल तयार करा
3. पार्टनर प्रेफरेंस सेट करा (वय, धर्म, शहर, शिक्षण)
4. दैनिक AI शिफारसी ब्राउझ करा किंवा स्वतः शोधा
5. आवडल्यास इंटरेस्ट पाठवा
6. म्यूच्युअल इंटरेस्ट असल्यास चॅट सुरू करा
7. व्हिडिओ कॉलिंगने अधिक जाणून घ्या
8. तयार असताना कुटुंबांना सहभागी करा
9. कुंडली सुसंगतता तपासा
10. पहिली भेट प्लॅन करा!`,
    priority: 9
  },
  // ===== INTEREST/COMMUNICATION =====
  {
    id: 'comm-1',
    category: 'communication',
    tags: ['message', 'interest', 'accepted', 'declined', 'chat', 'reply', 'response', 'no reply', 'मैसेज', 'जवाब', 'संवाद'],
    content: `Communication Tips:
- When sending interest: Add a personalized message mentioning what you liked about their profile
- If interest accepted: Start with a warm greeting, ask about their interests
- If no reply: Be patient, people are busy. Don't spam. Send a follow-up after 3-4 days
- If declined: Don't take it personally. Move on gracefully. There are many compatible profiles.
- First message ideas: Mention a shared interest, ask about their work/hobbies, compliment something specific from their profile
- Avoid: Generic "hi", asking personal questions too soon, being pushy, commenting only on looks`,
    content_hi: `संवाद के टिप्स:
- इंटरेस्ट भेजते समय: व्यक्तिगत मैसेज जोड़ें, बताएं क्या पसंद आया
- इंटरेस्ट स्वीकार होने पर: गर्मजोशी से शुरू करें, उनकी रुचियों के बारे में पूछें
- जवाब न आने पर: धैर्य रखें, 3-4 दिन बाद फॉलो-अप करें
- अस्वीकृत होने पर: व्यक्तिगत न लें, आगे बढ़ें
- पहला मैसेज: साझा रुचि का उल्लेख करें, काम/शौक के बारे में पूछें
- बचें: "hi" जैसे जेनेरिक मैसेज, बहुत जल्दी व्यक्तिगत सवाल`,
    content_mr: `संवादाचे टिप्स:
- इंटरेस्ट पाठवताना: वैयक्तिक मेसेज जोडा, काय आवडले ते सांगा
- इंटरेस्ट स्वीकारला गेल्यास: मैत्रीपूर्ण सुरुवात करा
- उत्तर न आल्यास: धीर धरा, 3-4 दिवसांनी फॉलो-अप करा
- नकार मिळाल्यास: वैयक्तिकरित्या घेऊ नका, पुढे जा
- पहिला मेसेज: सामायिक आवड सांगा, काम/छंदांबद्दल विचारा`,
    priority: 8
  },
  // ===== VERIFICATION =====
  {
    id: 'verify-1',
    category: 'verification',
    tags: ['verify', 'verification', 'blue tick', 'id', 'proof', 'trust', 'genuine', 'real', 'सत्यापन', 'पडताळणी'],
    content: `Profile Verification Options:
1. Photo Verification: Take a selfie to prove identity (Quick - instant)
2. ID Verification: Upload Aadhaar/PAN/Passport (Trusted - 24hrs review)
3. Phone Verification: OTP on mobile number (Instant)

Benefits of verification:
- Get the Blue Tick badge on your profile
- 40% more connection requests
- Higher search ranking
- Increased trust from other members
- Access to other verified profiles

All documents are encrypted and never shared with third parties.`,
    content_hi: `प्रोफाइल सत्यापन विकल्प:
1. फोटो सत्यापन: सेल्फी लें (तुरंत)
2. ID सत्यापन: आधार/पैन/पासपोर्ट अपलोड करें (24 घंटे)
3. फोन सत्यापन: मोबाइल पर OTP (तुरंत)

सत्यापन के फायदे:
- Blue Tick बैज मिलता है
- 40% अधिक कनेक्शन रिक्वेस्ट
- सर्च में ऊपर रैंकिंग
- अन्य सदस्यों से अधिक विश्वास`,
    content_mr: `प्रोफाइल पडताळणी पर्याय:
1. फोटो पडताळणी: सेल्फी घ्या (तात्काळ)
2. ID पडताळणी: आधार/पॅन/पासपोर्ट अपलोड करा (24 तास)
3. फोन पडताळणी: मोबाइलवर OTP (तात्काळ)

पडताळणीचे फायदे:
- Blue Tick बॅज मिळतो
- 40% अधिक कनेक्शन विनंत्या
- शोधात वरच्या रँकिंग
- इतर सदस्यांकडून अधिक विश्वास`,
    priority: 8
  },
  // ===== GENERAL/GREETINGS =====
  {
    id: 'general-1',
    category: 'general',
    tags: ['hello', 'hi', 'hey', 'good', 'morning', 'evening', 'night', 'namaste', 'नमस्ते', 'हेलो', 'नमस्कार'],
    content: `Hello! I'm your Soulmate Sync AI assistant. I can help you with:
- Finding compatible matches
- Improving your profile
- Understanding premium features
- Safety tips
- Kundali compatibility
- Communication advice
- First meeting guidance

Just ask me anything about your matrimonial journey! I speak English, Hindi, and Marathi.`,
    content_hi: `नमस्ते! मैं आपका Soulmate Sync AI सहायक हूं। मैं आपकी मदद कर सकता हूं:
- संगत मैच खोजने में
- प्रोफाइल सुधारने में
- प्रीमियम सुविधाओं को समझने में
- सुरक्षा टिप्स
- कुंडली संगतता
- संवाद सलाह
- पहली मुलाकात गाइडेंस

अपनी शादी की यात्रा के बारे में कुछ भी पूछें! मैं हिंदी, English और मराठी बोलता हूं।`,
    content_mr: `नमस्कार! मी तुमचा Soulmate Sync AI सहाय्यक आहे. मी तुम्हाला मदत करू शकतो:
- सुसंगत जोडीदार शोधण्यात
- प्रोफाइल सुधारण्यात
- प्रीमियम सुविधा समजण्यात
- सुरक्षा टिप्स
- कुंडली सुसंगतता
- संवाद सल्ला
- पहिल्या भेटीचे मार्गदर्शन

तुमच्या लग्नाच्या प्रवासाबद्दल काहीही विचारा! मी हिंदी, English आणि मराठी बोलतो.`,
    priority: 5
  },
  {
    id: 'general-2',
    category: 'general',
    tags: ['thank', 'thanks', 'bye', 'goodbye', 'ok', 'okay', 'cool', 'धन्यवाद', 'शुक्रिया', 'अलविदा', 'आभारी'],
    content: `You're welcome! I'm always here to help you on your journey to finding the perfect life partner. Feel free to ask me anything anytime. Wishing you all the best in finding your soulmate! 💜`,
    content_hi: `आपका स्वागत है! मैं हमेशा आपकी सही जीवन साथी खोजने की यात्रा में मदद के लिए यहां हूं। कभी भी कुछ भी पूछें। आपको आपका सोलमेट मिलने की शुभकामनाएं! 💜`,
    content_mr: `तुमचे स्वागत आहे! मी तुमच्या योग्य जीवन साथी शोधण्याच्या प्रवासात नेहमी मदतीसाठी येथे आहे. कधीही काहीही विचारा. तुम्हाला तुमचा सोलमेट मिळण्यासाठी शुभेच्छा! 💜`,
    priority: 3
  },
  // ===== FEATURES =====
  {
    id: 'feature-1',
    category: 'features',
    tags: ['feature', 'what can', 'help', 'do', 'option', 'service', 'सुविधा', 'क्या कर सकते', 'वैशिष्ट्ये'],
    content: `Soulmate Sync Features:
📱 Smart Search - Filter by age, religion, caste, location, education, income
🤖 AI Daily Picks - Personalized recommendations based on your preferences
👁 Who Viewed You - See who checked your profile
💝 Interests - Send/receive interests, accept/decline
📌 Shortlist - Save profiles to review later
🔮 Kundali Matching - Vedic astrology compatibility (36 Guna)
📍 Nearby Matches - Find profiles in your city/state
💬 Chat & Messaging - Text chat with matches
📹 Video Calling - Face-to-face calls before meeting
✅ Verification - Photo, ID, Phone verification for trust
🌟 Premium - Enhanced features for serious searchers
🛡 Safety - Report, block, encrypted communication`,
    content_hi: `Soulmate Sync सुविधाएं:
📱 स्मार्ट सर्च - उम्र, धर्म, जाति, शहर से फिल्टर करें
🤖 AI डेली पिक्स - व्यक्तिगत सिफारिशें
👁 कौन देखा - आपकी प्रोफाइल कौन देख रहा है
💝 इंटरेस्ट - भेजें/प्राप्त करें
📌 शॉर्टलिस्ट - बाद में देखने के लिए सेव करें
🔮 कुंडली मिलान - वैदिक ज्योतिष (36 गुण)
📍 नजदीकी मैच - अपने शहर/राज्य में खोजें
💬 चैट - मैच के साथ बातचीत
📹 वीडियो कॉल - मिलने से पहले फेस-टू-फेस
✅ सत्यापन - फोटो, ID, फोन
🌟 प्रीमियम - गंभीर खोजकर्ताओं के लिए
🛡 सुरक्षा - रिपोर्ट, ब्लॉक, एन्क्रिप्टेड`,
    content_mr: `Soulmate Sync वैशिष्ट्ये:
📱 स्मार्ट सर्च - वय, धर्म, जात, शहरानुसार फिल्टर
🤖 AI डेली पिक्स - वैयक्तिक शिफारसी
👁 कोणी पाहिले - तुमची प्रोफाइल कोण पाहतोय
💝 इंटरेस्ट - पाठवा/प्राप्त करा
📌 शॉर्टलिस्ट - नंतर पाहण्यासाठी सेव्ह करा
🔮 कुंडली जुळवणी - वैदिक ज्योतिष (36 गुण)
📍 जवळचे मॅच - तुमच्या शहर/राज्यात शोधा
💬 चॅट - मॅचशी संवाद
📹 व्हिडिओ कॉल - भेटण्यापूर्वी फेस-टू-फेस
✅ पडताळणी - फोटो, ID, फोन
🌟 प्रीमियम - गंभीर शोधकर्त्यांसाठी
🛡 सुरक्षा - रिपोर्ट, ब्लॉक, एन्क्रिप्टेड`,
    priority: 8
  },
]
