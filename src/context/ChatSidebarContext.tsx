'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

interface ChatSidebarContextType {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
}

const ChatSidebarContext = createContext<ChatSidebarContextType>({ isOpen: true, setIsOpen: () => {} })

export function ChatSidebarProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(true)
  return (
    <ChatSidebarContext.Provider value={{ isOpen, setIsOpen }}>
      {children}
    </ChatSidebarContext.Provider>
  )
}

export function useChatSidebar() {
  return useContext(ChatSidebarContext)
}
