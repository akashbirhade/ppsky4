'use client'

export default function TypingIndicator({ name }: { name?: string }) {
  return (
    <div className="flex items-center gap-2 px-4 py-2">
      <div className="flex items-center gap-1 bg-slate-100 dark:bg-purple-900/30 px-3 py-2 rounded-2xl rounded-bl-sm">
        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
      {name && (
        <span className="text-xs text-slate-400 dark:text-purple-300/40">{name} is typing...</span>
      )}
    </div>
  )
}
