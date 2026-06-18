import { Router } from 'express'

export const chatRouter = Router()

// POST /api/chat/completions — proxy to LLM provider
chatRouter.post('/completions', async (req, res) => {
  // TODO: implement LLM proxy
  res.json({ status: 'not_implemented' })
})
