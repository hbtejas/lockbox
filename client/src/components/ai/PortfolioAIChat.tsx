import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePortfolioChat } from '../../hooks/useAI'

interface PortfolioAIChatProps {
  portfolioId: string
}

function PortfolioAIChat({ portfolioId }: PortfolioAIChatProps) {
  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const { messages, isLoading, suggestedFollowUps, sendMessage, loadHistory, clearChat } =
    usePortfolioChat(portfolioId)

  useEffect(() => {
    void loadHistory()
  }, [loadHistory])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  const handleSend = async () => {
    const trimmed = input.trim()
    if (!trimmed || isLoading) return
    setInput('')
    await sendMessage(trimmed)
    inputRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      void handleSend()
    }
  }

  return (
    <section className="card-shell flex flex-col" style={{ minHeight: 480 }}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">💬</span>
          <h3 className="text-sm font-semibold">Ask AI About Your Portfolio</h3>
        </div>
        {messages.length > 0 && (
          <button
            onClick={clearChat}
            className="text-xs text-[var(--text-muted)] hover:text-red-400 transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto space-y-3 p-4" style={{ maxHeight: 340 }}>
        {messages.length === 0 && !isLoading && (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <span className="text-3xl mb-2">🤖</span>
            <p className="text-sm font-semibold">AI Portfolio Advisor</p>
            <p className="mt-1 text-xs text-[var(--text-muted)]">
              Ask me anything about your portfolio — risks, rebalancing, which stocks to sell, and more.
            </p>
          </div>
        )}

        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-brand-500/20 text-sm">
                  🤖
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
                  msg.role === 'user'
                    ? 'bg-brand-500 text-white'
                    : 'bg-[var(--bg-elev)] text-[var(--text-base)] border border-[var(--border)]'
                }`}
              >
                <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
              </div>
              {msg.role === 'user' && (
                <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300">
                  U
                </div>
              )}
            </motion.div>
          ))}

          {isLoading && (
            <motion.div
              key="loading"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-2 justify-start"
            >
              <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-brand-500/20 text-sm">
                🤖
              </div>
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-elev)] px-4 py-3">
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-brand-500 [animation-delay:0ms]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-brand-500 [animation-delay:150ms]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-brand-500 [animation-delay:300ms]" />
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={bottomRef} />
      </div>

      {/* Suggested Follow-ups */}
      {suggestedFollowUps.length > 0 && messages.length > 0 && !isLoading && (
        <div className="flex flex-wrap gap-2 border-t border-[var(--border)] px-4 py-2">
          {suggestedFollowUps.slice(0, 3).map((q) => (
            <button
              key={q}
              onClick={() => { setInput(q); void sendMessage(q) }}
              className="rounded-full border border-brand-500/30 bg-brand-500/10 px-3 py-1 text-xs text-brand-400 hover:bg-brand-500/20 transition-colors"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Input Area */}
      <div className="border-t border-[var(--border)] p-3 flex gap-2">
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about risks, rebalancing, which to sell..."
          maxLength={500}
          disabled={isLoading}
          className="flex-1 rounded-xl border border-[var(--border)] bg-[var(--bg-elev)] px-3 py-2 text-sm outline-none placeholder:text-[var(--text-muted)] focus:border-brand-500 disabled:opacity-50"
        />
        <button
          onClick={handleSend}
          disabled={isLoading || !input.trim()}
          className="flex items-center gap-1 rounded-xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-40 transition-colors"
        >
          {isLoading ? '...' : 'Send'}
        </button>
      </div>
    </section>
  )
}

export default PortfolioAIChat
