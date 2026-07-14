// ─── Ticket / Booking store (persisted) ─────────────────────────────────────
// Holds the user's purchased event passes locally. Demo mode: no backend/payment
// yet, but the Booking shape mirrors the future backend model.

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { TicketEvent, TicketType } from '@/data/eventTickets';

export type BookingStatus = 'upcoming' | 'used' | 'expired' | 'cancelled';

export interface Booking {
  id: string;
  ticketNumber: string;
  eventId: string;
  eventTitle: string;
  eventDate: string;
  venue: string;
  ticketTypeId: string;
  ticketTypeName: string;
  price: number;
  quantity: number;
  status: BookingStatus;
  bookingDate: string;
  qrData: string;
}

interface TicketState {
  bookings: Booking[];
  createBooking: (event: TicketEvent, ticket: TicketType, quantity?: number) => Booking;
  cancelBooking: (id: string) => void;
  getBooking: (id: string) => Booking | undefined;
}

const genTicketNumber = () => {
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  const stamp = Date.now().toString(36).slice(-4).toUpperCase();
  return `SMT-${stamp}${rand}`;
};

export const useTicketStore = create<TicketState>()(
  persist(
    (set, get) => ({
      bookings: [],

      createBooking: (event, ticket, quantity = 1) => {
        const ticketNumber = genTicketNumber();
        const booking: Booking = {
          id: `bk_${Date.now()}`,
          ticketNumber,
          eventId: event.id,
          eventTitle: event.title,
          eventDate: event.date,
          venue: event.venue,
          ticketTypeId: ticket.id,
          ticketTypeName: ticket.name,
          price: ticket.price * quantity,
          quantity,
          status: 'upcoming',
          bookingDate: new Date().toISOString(),
          // Encodes the data an entry scanner would validate against.
          qrData: JSON.stringify({ t: ticketNumber, e: event.id, k: ticket.id, q: quantity }),
        };
        set((s) => ({ bookings: [booking, ...s.bookings] }));
        return booking;
      },

      cancelBooking: (id) =>
        set((s) => ({
          bookings: s.bookings.map((b) =>
            b.id === id ? { ...b, status: 'cancelled' as BookingStatus } : b,
          ),
        })),

      getBooking: (id) => get().bookings.find((b) => b.id === id),
    }),
    {
      name: 'ss-tickets',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
