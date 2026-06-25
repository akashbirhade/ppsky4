import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Success Stories - Soulmate Sync | Real Couples, Real Matches',
  description: 'Read inspiring success stories from couples who found love on Soulmate Sync. Over 10,000 happy couples matched through AI-powered matchmaking.',
}

export default function SuccessStoriesLayout({ children }: { children: React.ReactNode }) {
  return children
}
