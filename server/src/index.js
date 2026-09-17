import 'dotenv/config'
import express from 'express'
import cors from 'cors'

import { connectDB } from './config/db.js'

import authRoutes from './routes/auth.js'
import movieRoutes from './routes/movies.js'
import watchlistRoutes from './routes/watchlist.js'
import reviewRoutes from './routes/reviews.js'
import recommendationsRoutes from './routes/recommendations.js'

const app = express()

app.use(
  cors({
    origin:
      process.env.CLIENT_URL
        ?.split(',')
        .map((s) => s.trim()) || '*',
    credentials: true
  })
)

app.use(express.json({ limit: '1mb' }))

app.get('/api/health', (_, res) => {
  res.json({
    ok: true,
    service: 'CineScope API'
  })
})

app.use('/api/auth', authRoutes)

app.use('/api/movies', movieRoutes)

app.use('/api/watchlist', watchlistRoutes)

app.use('/api/reviews', reviewRoutes)

app.use(
  '/api/recommendations',
  recommendationsRoutes
)

app.use((err, req, res, next) => {
  console.error(err)

  res.status(500).json({
    message: 'Unexpected server error'
  })
})

const port = process.env.PORT || 5000

connectDB()
  .then(() => {
    app.listen(port, () => {
      console.log(
        `CineScope API running on port ${port}`
      )
    })
  })
  .catch((err) => {
    console.error(
      'Database connection failed:',
      err.message
    )

    process.exit(1)
  })