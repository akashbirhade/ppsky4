// ─── Marriage Ticket / Event Pass — demo data & types ───────────────────────
// Demo pricing only. The data model mirrors the future backend (Event / Ticket /
// Booking) so this can be swapped for a real API + payment gateway later.

import { Colors } from '@/constants/theme';

export type TicketTypeKey =
  | 'standard'
  | 'premium'
  | 'earlybird'
  | 'couple'
  | 'family'
  | 'vip'
  | 'platinum'
  | 'sponsor';

export interface TicketType {
  id: TicketTypeKey;
  name: string;
  price: number;
  quantity: number;
  remaining: number;
  benefits: string[];
  badge?: string;
  gradient: readonly [string, string, ...string[]];
  icon: string;
}

export interface TicketEvent {
  id: string;
  title: string;
  description: string;
  bannerColors: readonly [string, string, ...string[]];
  bannerIcon: string;
  date: string; // ISO
  venue: string;
  address: string;
  mapUrl: string;
  organizer: string;
  dressCode?: string;
  parking?: string;
  refundPolicy: string;
  capacity: number;
  ticketTypes: TicketType[];
}

// Reusable ticket-type templates (Standard ₹2,000 / Premium ₹4,000 demo pricing)
const standard = (remaining: number, quantity = 100): TicketType => ({
  id: 'standard',
  name: 'Standard Pass',
  price: 2000,
  quantity,
  remaining,
  icon: 'ticket-outline',
  gradient: [Colors.primary, Colors.primaryDark],
  benefits: [
    'Event Entry',
    'Basic Matchmaking Session',
    'Tea & Snacks',
    'Meet Community Members',
  ],
});

const premium = (remaining: number, quantity = 50): TicketType => ({
  id: 'premium',
  name: 'Premium Pass',
  price: 4000,
  quantity,
  remaining,
  icon: 'diamond-outline',
  badge: 'BEST VALUE',
  gradient: Colors.gradientGold,
  benefits: [
    'Priority Entry',
    'VIP Seating',
    'Premium Matchmaking Session',
    'Direct Host Assistance',
    'Complimentary Refreshments',
    'Premium Networking Access',
  ],
});

export const DEMO_EVENTS: TicketEvent[] = [
  {
    id: 'evt-1',
    title: 'Grand Matrimonial Meet 2026',
    description:
      'A premium matchmaking gathering bringing together verified singles and families from the community. Curated introductions, expert matchmakers, and a warm, elegant setting to find your perfect match.',
    bannerColors: Colors.gradientSunset,
    bannerIcon: 'heart-circle',
    date: '2026-08-15T17:00:00',
    venue: 'The Grand Ballroom, Taj Lands End',
    address: 'Bandstand, Bandra West, Mumbai, Maharashtra 400050',
    mapUrl: 'https://maps.google.com/?q=Taj+Lands+End+Mumbai',
    organizer: 'Soulmate Sync Events',
    dressCode: 'Indian Formal / Ethnic',
    parking: 'Complimentary valet parking available',
    refundPolicy: 'Full refund up to 7 days before the event. 50% refund within 7 days.',
    capacity: 150,
    ticketTypes: [standard(52, 100), premium(8, 50)],
  },
  {
    id: 'evt-2',
    title: 'Community Networking Evening',
    description:
      'An intimate evening of community networking and matchmaking over dinner. Meet like-minded families, enjoy live music, and connect with our senior matchmakers for personalised guidance.',
    bannerColors: Colors.gradientPurple,
    bannerIcon: 'people-circle',
    date: '2026-08-28T18:30:00',
    venue: 'Leela Palace, Banquet Hall',
    address: 'Old Airport Road, Kodihalli, Bengaluru, Karnataka 560008',
    mapUrl: 'https://maps.google.com/?q=Leela+Palace+Bengaluru',
    organizer: 'Bengaluru Community Circle',
    dressCode: 'Smart Casual',
    parking: 'Basement parking (paid)',
    refundPolicy: 'Full refund up to 5 days before the event.',
    capacity: 100,
    ticketTypes: [standard(30, 60), premium(14, 40)],
  },
  {
    id: 'evt-3',
    title: 'Festive Match & Mingle',
    description:
      'Celebrate the festive season while you meet your special someone. Traditional decor, cultural performances, curated matchmaking rounds and a grand dinner to remember.',
    bannerColors: Colors.gradientGold,
    bannerIcon: 'sparkles',
    date: '2026-09-10T16:00:00',
    venue: 'ITC Maratha, Grand Hall',
    address: 'Sahar Airport Road, Andheri East, Mumbai, Maharashtra 400099',
    mapUrl: 'https://maps.google.com/?q=ITC+Maratha+Mumbai',
    organizer: 'Soulmate Sync Events',
    dressCode: 'Festive / Traditional',
    parking: 'Valet parking available',
    refundPolicy: 'Non-refundable. Tickets are transferable.',
    capacity: 200,
    ticketTypes: [standard(120, 150), premium(35, 50)],
  },
];

export const getEventById = (id: string) => DEMO_EVENTS.find((e) => e.id === id);

export const formatEventDate = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
};

export const formatEventTime = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
};

export const formatPrice = (n: number) => `\u20B9${n.toLocaleString('en-IN')}`;

export const startingPrice = (e: TicketEvent) =>
  Math.min(...e.ticketTypes.map((t) => t.price));

export const seatsLeft = (e: TicketEvent) =>
  e.ticketTypes.reduce((sum, t) => sum + t.remaining, 0);
