// Shared types between client and server

export interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: number
}

export interface Character {
  id: string
  name: string
  description: string
  personality: string
  firstMessage?: string
  avatar?: string
  tags?: string[]
}

export interface ChatSession {
  id: string
  characterId: string
  messages: Message[]
  createdAt: number
  updatedAt: number
}

export interface LLMConfig {
  provider: 'openai' | 'anthropic' | 'custom'
  apiKey: string
  model: string
  baseUrl?: string
  temperature?: number
  maxTokens?: number
}
