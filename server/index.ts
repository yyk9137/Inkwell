import express from 'express'
import cors from 'cors'
import { chatRouter } from './routes/chat.js'
import { charactersRouter } from './routes/characters.js'

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors())
app.use(express.json())

// Routes
app.use('/api/chat', chatRouter)
app.use('/api/characters', charactersRouter)

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', version: '0.1.0' })
})

app.listen(PORT, () => {
  console.log(`[Inkwell] Server running on http://localhost:${PORT}`)
})
