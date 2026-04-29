import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useState } from 'react'
import {
  fetchMarketInsight,
  fetchPortfolioChatHistory,
  fetchPortfolioRiskAnalysis,
  fetchStockAIAnalysis,
  parseNaturalLanguageScreener,
  sendPortfolioChatMessage,
} from '../api/aiApi'
import type { MarketInsight, ParsedScreenerQuery, PortfolioRiskAnalysis, StockAnalysis } from '../types/ai'

export function usePortfolioRiskAnalysis(portfolioId: string) {
  return useQuery<{ analysis: PortfolioRiskAnalysis; cached: boolean }>({
    queryKey: ['ai', 'portfolio', 'risk', portfolioId],
    queryFn: () => fetchPortfolioRiskAnalysis(portfolioId),
    staleTime: 14 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: 1,
    enabled: Boolean(portfolioId),
  })
}

export function useRefreshAIAnalysis(portfolioId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => fetchPortfolioRiskAnalysis(portfolioId, { refresh: true }),
    onSuccess: (payload) => {
      queryClient.setQueryData(['ai', 'portfolio', 'risk', portfolioId], payload)
    },
  })
}

export function useStockAIAnalysis(symbol: string) {
  return useQuery<StockAnalysis>({
    queryKey: ['ai', 'stock', symbol],
    queryFn: () => fetchStockAIAnalysis(symbol),
    staleTime: 30 * 60 * 1000,
    enabled: Boolean(symbol),
  })
}

export function useMarketInsight() {
  return useQuery<MarketInsight>({
    queryKey: ['ai', 'market', 'insight'],
    queryFn: fetchMarketInsight,
    staleTime: 60 * 60 * 1000,
    refetchOnWindowFocus: false,
  })
}

type ChatMessage = {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export function usePortfolioChat(portfolioId: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [suggestedFollowUps, setSuggestedFollowUps] = useState<string[]>([
    'What is my biggest risk?',
    'Which stock should I trim first?',
    'How diversified is my portfolio?',
  ])

  const loadHistory = useCallback(async () => {
    if (!portfolioId) {
      return
    }

    const history = await fetchPortfolioChatHistory(portfolioId)
    setMessages(
      history.map((entry) => ({
        id: entry.id,
        role: entry.role,
        content: entry.content,
        timestamp: new Date(entry.createdAt ?? Date.now()),
      })),
    )
  }, [portfolioId])

  const sendMessage = useCallback(
    async (userMessage: string) => {
      if (!userMessage.trim() || isLoading || !portfolioId) {
        return
      }

      const optimisticMessage: ChatMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: userMessage,
        timestamp: new Date(),
      }

      const historyPayload = [...messages, optimisticMessage].slice(-10).map((entry) => ({
        role: entry.role,
        content: entry.content,
      }))

      setMessages((previous) => [...previous, optimisticMessage])
      setIsLoading(true)

      try {
        const response = await sendPortfolioChatMessage({
          portfolioId,
          message: userMessage,
          history: historyPayload,
        })

        setMessages((previous) => [
          ...previous,
          {
            id: `ai-${Date.now()}`,
            role: 'assistant',
            content: response.reply,
            timestamp: new Date(),
          },
        ])

        setSuggestedFollowUps(response.suggestedFollowUps)
      } catch {
        setMessages((previous) => previous.filter((entry) => entry.id !== optimisticMessage.id))
      } finally {
        setIsLoading(false)
      }
    },
    [isLoading, messages, portfolioId],
  )

  const clearChat = useCallback(() => {
    setMessages([])
  }, [])

  return {
    messages,
    isLoading,
    suggestedFollowUps,
    sendMessage,
    loadHistory,
    clearChat,
  }
}

export function useNaturalLanguageScreener() {
  return useMutation<ParsedScreenerQuery, Error, string>({
    mutationFn: (query: string) => parseNaturalLanguageScreener(query),
  })
}
