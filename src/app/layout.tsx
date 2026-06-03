import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/context/AuthContext'
import { LanguageProvider } from '@/context/LanguageContext'
import { ToastProvider } from '@/components/Toast'
import Navbar from '@/components/Navbar'
import ChatSidebar from '@/components/ChatSidebar'
import PageTransition from '@/components/PageTransition'
import AIChatBot from '@/components/AIChatBot'
import ServiceWorkerRegistration from '@/components/ServiceWorker'
import SideDrawer from '@/components/SideDrawer'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Soulmate Sync - Find Your Perfect Life Partner | AI Matchmaking',
  description: 'India\'s most luxurious AI-Powered Matchmaking Platform. Verified profiles, smart matching, video calls & more.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#14b8a6" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Soulmate Sync" />
      </head>
      <body className={`${inter.className} min-h-screen bg-gradient-to-br from-mint-50 via-sky-50 to-mint-100`}>
        <AuthProvider>
          <LanguageProvider>
            <ToastProvider>
              <div className="relative">
            {/* Global animated background orbs - light mode */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
              <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-teal-400/10 rounded-full blur-[120px] animate-float-slow" />
              <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-cyan-400/8 rounded-full blur-[100px] animate-float" />
              <div className="absolute top-2/3 left-1/2 w-72 h-72 bg-emerald-400/5 rounded-full blur-[80px] animate-float-slow" style={{animationDelay: '2s'}} />
            </div>
            
            <div className="relative z-10">
              <Navbar />
              <ChatSidebar />
              <main className="min-h-screen">
                <PageTransition>
                  {children}
                </PageTransition>
              </main>
            </div>
            <AIChatBot />
            <SideDrawer />
            <ServiceWorkerRegistration />
              </div>
            </ToastProvider>
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
