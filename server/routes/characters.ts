import { Router } from 'express'

export const charactersRouter = Router()

// GET /api/characters — list saved characters
charactersRouter.get('/', async (_req, res) => {
  // TODO: read from data/characters/
  res.json({ characters: [] })
})

// POST /api/characters — save a character
charactersRouter.post('/', async (req, res) => {
  // TODO: write to data/characters/
  res.json({ status: 'not_implemented' })
})
