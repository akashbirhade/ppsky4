import { readFileSync, writeFileSync } from 'fs'
import { randomUUID } from 'crypto'

const DATA = '/Users/aakashbirhade/ppsky4/data'
const users = JSON.parse(readFileSync(`${DATA}/users.json`, 'utf-8'))

// Find user id "1" (Priya) — she is the demo login user
const me = users.find(u => u.id === '1')
// Pick 8 random male users to create conversations with
const males = users.filter(u => u.gender === 'Male' && u.id !== '1').slice(0, 8)

function daysAgo(n, hoursOffset = 0) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  d.setHours(d.getHours() - hoursOffset)
  return d.toISOString()
}

const CONVERSATIONS = [
  {
    partner: males[0],
    messages: [
      { from: 'them', text: 'Hello, I went through your profile and found it very interesting!', offset: 5 },
      { from: 'me', text: 'Thank you so much! Your profile is impressive too.', offset: 4 },
      { from: 'them', text: 'Would love to know more about you. What do you do for fun?', offset: 4 },
      { from: 'me', text: 'I enjoy reading, yoga and traveling. What about you?', offset: 3 },
      { from: 'them', text: 'Love cricket and trekking! We have complementary interests 😊', offset: 3 },
      { from: 'me', text: 'That sounds wonderful! Let\'s connect more 💜', offset: 2 },
    ]
  },
  {
    partner: males[1],
    messages: [
      { from: 'me', text: 'Hi! I liked your profile. You seem very ambitious.', offset: 10 },
      { from: 'them', text: 'Thank you! I noticed your profile too. Where are you based?', offset: 9 },
      { from: 'me', text: 'I\'m in Mumbai. And you?', offset: 9 },
      { from: 'them', text: 'Pune! Just an hour away 😄 Maybe we can meet someday', offset: 8 },
    ]
  },
  {
    partner: males[2],
    messages: [
      { from: 'them', text: 'Hi Priya, your smile in the profile pic is lovely!', offset: 15 },
      { from: 'me', text: 'Aww thank you! That\'s very sweet of you to say 😊', offset: 14 },
      { from: 'them', text: 'I\'m a software engineer based in Nagpur. What\'s your background?', offset: 14 },
      { from: 'me', text: 'MBA in Marketing. Currently working as Marketing Manager.', offset: 13 },
      { from: 'them', text: 'Wow great! We could make a great team 🚀', offset: 12 },
    ]
  },
  {
    partner: males[3],
    messages: [
      { from: 'them', text: 'Namaste! I think we would be a great match.', offset: 20 },
      { from: 'me', text: 'Namaste! What makes you say that? 😊', offset: 19 },
      { from: 'them', text: 'We share the same religion, similar family values, and both love traveling!', offset: 19 },
      { from: 'me', text: 'That\'s true! Tell me more about your family.', offset: 18 },
      { from: 'them', text: 'Joint family, very supportive. My parents are simple people.', offset: 17 },
      { from: 'me', text: 'That\'s wonderful. Family values matter a lot to me too.', offset: 16 },
      { from: 'them', text: 'Can we connect on a call sometime?', offset: 1 },
    ]
  },
  {
    partner: males[4],
    messages: [
      { from: 'me', text: 'Hi! I have liked your profile and believe it to be a good match. Kindly accept this invitation.', offset: 25 },
      { from: 'them', text: 'Thank you for the interest! Tell me more about yourself.', offset: 24 },
      { from: 'me', text: 'I am a fun-loving person who believes in balance between career and family.', offset: 24 },
      { from: 'them', text: 'That\'s great! I\'m also career-focused but family comes first.', offset: 23 },
    ]
  },
  {
    partner: males[5],
    messages: [
      { from: 'them', text: 'Hey! Saw your profile. You seem like a wonderful person 🌸', offset: 30 },
      { from: 'me', text: 'That\'s very kind! You look accomplished too.', offset: 29 },
      { from: 'them', text: 'I\'m a doctor. Looking for someone who values education and career.', offset: 28 },
      { from: 'me', text: 'I completely agree. Building something together is important.', offset: 27 },
      { from: 'them', text: 'Absolutely! Can we talk more?', offset: 0 },
    ]
  },
]

const messages = []
let count = 0

for (const conv of CONVERSATIONS) {
  const partner = conv.partner
  for (let i = 0; i < conv.messages.length; i++) {
    const m = conv.messages[i]
    const senderId = m.from === 'me' ? me.id : partner.id
    const receiverId = m.from === 'me' ? partner.id : me.id
    const timestamp = daysAgo(0, conv.messages.length - i + m.offset * 2)
    messages.push({
      id: randomUUID(),
      senderId,
      receiverId,
      content: m.text,
      timestamp,
      read: m.from === 'them' ? (i < conv.messages.length - 2) : true,
      type: 'text'
    })
    count++
  }
}

writeFileSync(`${DATA}/messages.json`, JSON.stringify(messages, null, 2))
console.log(`✅ Seeded ${count} messages across ${CONVERSATIONS.length} conversations`)
console.log(`   Login as priya@example.com / Test@123 to see them`)
