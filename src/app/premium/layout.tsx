import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Premium Plans - Soulmate Sync | Unlock Unlimited Matches',
  description: 'Upgrade to Premium for unlimited profile views, direct messaging, video calls, AI matchmaking and priority support. Plans starting at ₹1,499.',
}

export default function PremiumLayout({ children }: { children: React.ReactNode }) {
  return children
}
