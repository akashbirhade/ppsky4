// ─── Smart Reply Suggestions ────────────────────────────────────────────────────
// Lightweight, rule-based reply suggestions (no network / AI dependency).
// Given the latest incoming message it returns a short list of context-aware
// quick replies the user can tap to send instantly.

const uniq = (arr: string[]) => Array.from(new Set(arr.filter(Boolean)));

/**
 * Returns up to 4 suggested replies based on the other person's last message.
 * @param lastMessage The most recent message received from the other user.
 * @param firstName   The other user's first name (used to personalise openers).
 */
export function getSmartReplies(lastMessage?: string, firstName?: string): string[] {
  const name = (firstName || '').trim();
  const opener = name ? `Hi ${name}! 👋` : 'Hi there! 👋';

  // No conversation yet → friendly openers
  if (!lastMessage || !lastMessage.trim()) {
    return uniq([opener, 'Lovely to connect with you!', 'How has your day been?']);
  }

  const t = lastMessage.toLowerCase();
  const has = (...keys: string[]) => keys.some((k) => t.includes(k));
  const isQuestion = t.includes('?');
  const out: string[] = [];

  // Greetings
  if (has('hi', 'hello', 'hey', 'namaste', 'good morning', 'good evening', 'good afternoon')) {
    out.push('Hi! 😊', 'Hello! Nice to hear from you.');
  }

  // "How are you"
  if (has('how are you', 'how r u', 'how have you been', 'kaise ho', 'wassup', "what's up")) {
    out.push("I'm doing great, thanks! How about you?", 'All good here! 😊 And you?');
  }

  // Thanks
  if (has('thank', 'thanks', 'thx', 'shukriya')) {
    out.push("You're welcome! 😊", 'Anytime!');
  }

  // Compliments
  if (has('beautiful', 'pretty', 'handsome', 'cute', 'nice pic', 'lovely', 'gorgeous', 'good looking')) {
    out.push('That’s so sweet, thank you! 😊', 'You’re very kind!');
  }

  // Meeting / call / video
  if (has('meet', 'coffee', 'call', 'video', 'talk', 'catch up', 'phone')) {
    out.push('Sure, I’d love that!', 'Sounds good — when works for you?', 'Yes, let’s plan it 😊');
  }

  // Availability / time
  if (has('free', 'available', 'when', 'time', 'today', 'tomorrow', 'weekend', 'evening')) {
    out.push('I’m usually free in the evenings.', 'This weekend works for me!', 'Let me check and get back to you.');
  }

  // Family / background
  if (has('family', 'parents', 'mother', 'father', 'siblings', 'brother', 'sister')) {
    out.push('I’d be happy to tell you about my family.', 'Family means a lot to me too.');
  }

  // Work / job / education
  if (has('work', 'job', 'career', 'company', 'study', 'education', 'profession', 'business')) {
    out.push('I’d love to hear more about your work!', 'Tell me more about what you do 😊');
  }

  // Location / city
  if (has('city', 'live', 'from', 'location', 'place', 'hometown', 'where')) {
    out.push('I’d be happy to share more about where I’m from.', 'Where are you based?');
  }

  // Hobbies / interests
  if (has('hobby', 'hobbies', 'interest', 'music', 'movie', 'travel', 'food', 'cook', 'read', 'sport')) {
    out.push('We seem to have a lot in common! 😊', 'That’s one of my favourites too!', 'Tell me more!');
  }

  // Agreement / plans
  if (has('yes', 'sure', 'okay', 'ok', 'great', 'perfect', 'sounds good')) {
    out.push('Great! 😊', 'Looking forward to it!', 'Awesome!');
  }

  // Bye
  if (has('bye', 'good night', 'goodnight', 'talk later', 'ttyl', 'gtg')) {
    out.push('Talk soon! 😊', 'Have a lovely day!', 'Good night! 🌙');
  }

  // Generic question fallback
  if (isQuestion && out.length < 2) {
    out.push('That’s a great question! 😊', 'Let me tell you…', 'Good question — what about you?');
  }

  // Always-available fallbacks so the bar is never empty
  out.push('😊', 'Tell me more!', 'That sounds nice 😊', 'Absolutely!');

  return uniq(out).slice(0, 4);
}
