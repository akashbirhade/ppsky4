'use client'

import { usePathname } from 'next/navigation'
import Navbar from '@/components/Navbar'
import ChatSidebar from '@/components/ChatSidebar'
import SideDrawer from '@/components/SideDrawer'
import MobileDock from '@/components/MobileDock'

/**
 * Conditionally renders navigation components based on the current route:
 * - Admin pages (/admin/*): No global nav (admin has its own sidebar/hamburger)
 * - Auth pages (/login, /register, /onboarding): Only Navbar (no sidedrawer/dock)
 * - Landing page (/ when not logged in): Only Navbar
 * - User pages (dashboard, messages, etc.): Full nav (Navbar + SideDrawer + MobileDock + ChatSidebar)
 */
export default function NavigationWrapper() {
  const pathname = usePathname()

  // Admin pages - no global nav at all (admin layout has its own navigation)
  if (pathname.startsWith('/admin')) {
    return <Navbar />
  }

  // Auth/onboarding pages - only Navbar, no side drawer or dock
  const authPaths = ['/login', '/register', '/onboarding']
  if (authPaths.some(p => pathname.startsWith(p))) {
    return <Navbar />
  }

  // Landing page - only Navbar
  if (pathname === '/') {
    return <Navbar />
  }

  // All other pages (user dashboard, messages, search, etc.) - full navigation
  return (
    <>
      <Navbar />
      <ChatSidebar />
      <SideDrawer />
      <MobileDock />
    </>
  )
}
