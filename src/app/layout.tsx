import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/context/AuthContext'
import { LanguageProvider } from '@/context/LanguageContext'
import { ThemeProvider } from '@/context/ThemeContext'
import { ToastProvider } from '@/components/Toast'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import ChatSidebar from '@/components/ChatSidebar'
import { ChatSidebarProvider } from '@/context/ChatSidebarContext'
import PageTransition from '@/components/PageTransition'
import AIChatBot from '@/components/AIChatBot'
import VoiceAssistant from '@/components/VoiceAssistant'
import ServiceWorkerRegistration from '@/components/ServiceWorker'
import SideDrawer from '@/components/SideDrawer'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://soulmatesync.com'),
  title: 'Soulmate Sync - Find Your Perfect Life Partner | AI Matchmaking',
  description: 'India\'s most luxurious AI-Powered Matchmaking Platform. Verified profiles, smart matching, video calls & more.',
  applicationName: 'Soulmate Sync',
  keywords: [
    'matrimony',
    'matchmaking',
    'ai matchmaking',
    'shaadi',
    'indian matrimony',
    'verified profiles',
  ],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    url: '/',
    siteName: 'Soulmate Sync',
    title: 'Soulmate Sync - Find Your Perfect Life Partner',
    description: 'AI-powered matchmaking with verified profiles, secure chat, and video calling.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Soulmate Sync - Find Your Perfect Life Partner',
    description: 'AI-powered matchmaking with verified profiles, secure chat, and video calling.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#7c3aed" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Soulmate Sync" />
        <script dangerouslySetInnerHTML={{ __html: `
          try {
            const t = localStorage.getItem('theme');
            if (t === 'light') document.documentElement.classList.remove('dark');
          } catch(e) {}
        `}} />
      </head>
      <body className={`${inter.className} min-h-screen transition-colors duration-300`}>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:px-4 focus:py-2 focus:rounded-lg focus:bg-white focus:text-slate-900"
        >
          Skip to main content
        </a>
        <ThemeProvider>
        <ChatSidebarProvider>
        <AuthProvider>
          <LanguageProvider>
            <ToastProvider>
              <div className="relative">
            {/* Global animated background orbs */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
              <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-teal-400/8 dark:bg-purple-600/10 rounded-full blur-[120px] animate-float-slow" />
              <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-cyan-400/6 dark:bg-fuchsia-600/8 rounded-full blur-[100px] animate-float" />
              <div className="absolute top-2/3 left-1/2 w-72 h-72 bg-sky-400/5 dark:bg-blue-600/5 rounded-full blur-[80px] animate-float-slow" style={{animationDelay: '2s'}} />
            </div>
            
            <div className="relative z-10">
              <Navbar />
              <ChatSidebar />
              <main id="main-content" className="min-h-screen">
                <PageTransition>
                  {children}
                </PageTransition>
              </main>
              <Footer />
            </div>
            <AIChatBot />
            <VoiceAssistant />
            <SideDrawer />
            <ServiceWorkerRegistration />
              </div>
            </ToastProvider>
          </LanguageProvider>
        </AuthProvider>
        </ChatSidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
