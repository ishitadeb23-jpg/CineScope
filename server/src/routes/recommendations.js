import express from 'express'
import axios from 'axios'
import Groq from 'groq-sdk'

const router = express.Router()

const groq = new Groq({
  apiKey: process.env.OPENAI_API_KEY
})

const tmdb = axios.create({
  baseURL: 'https://api.themoviedb.org/3',
  headers: {
    Authorization:
      `Bearer ${process.env.TMDB_BEARER_TOKEN}`,
    accept: 'application/json'
  },
  timeout: 15000
})

const genreMap = {
  Action: 28,
  Adventure: 12,
  Animation: 16,
  Comedy: 35,
  Crime: 80,
  Documentary: 99,
  Drama: 18,
  Family: 10751,
  Fantasy: 14,
  History: 36,
  Horror: 27,
  Music: 10402,
  Mystery: 9648,
  Romance: 10749,
  'Science Fiction': 878,
  Thriller: 53,
  War: 10752,
  Western: 37
}

const tmdbRequest = async (
  url,
  config = {},
  retries = 2
) => {
  try {
    return await tmdb.get(url, config)
  } catch (error) {
    const networkError =
      error.code === 'ECONNRESET' ||
      error.code === 'ETIMEDOUT' ||
      error.code === 'ECONNABORTED'

    if (networkError && retries > 0) {
      console.log(
        'TMDB connection reset. Retrying...'
      )

      await new Promise((resolve) =>
        setTimeout(resolve, 1000)
      )

      return tmdbRequest(
        url,
        config,
        retries - 1
      )
    }

    throw error
  }
}

router.post('/ai', async (req, res) => {
  try {
    const { prompt } = req.body

    if (!prompt || !prompt.trim()) {
      return res.status(400).json({
        message:
          'Please describe what kind of movie you want.'
      })
    }

    // =========================
    // STEP 1: AI UNDERSTANDING
    // =========================

    const aiResponse =
      await groq.chat.completions.create({
        model: 'openai/gpt-oss-20b',
        temperature: 0.3,

        messages: [
          {
            role: 'system',
            content: `
You are CineScope's AI movie recommendation assistant.

Analyze the user's movie request.

Return ONLY valid JSON.

Use exactly this structure:

{
  "mood": "",
  "genres": [],
  "maxRuntime": null,
  "minRating": null,
  "keywords": [],
  "avoid": [],
  "explanation": ""
}

Rules:

- mood should briefly describe the desired feeling.

- genres must only use these values:
Action,
Adventure,
Animation,
Comedy,
Crime,
Documentary,
Drama,
Family,
Fantasy,
History,
Horror,
Music,
Mystery,
Romance,
Science Fiction,
Thriller,
War,
Western.

- maxRuntime must be a number in minutes
  only if the user specifies a runtime limit.

- Otherwise maxRuntime must be null.

- minRating should only be a number
  if the user clearly wants highly rated movies.

- Otherwise minRating must be null.

- keywords should contain important themes
  or concepts mentioned by the user.

- avoid should contain things they do not want.

- explanation should be one short,
  friendly sentence.

Return JSON only.
No markdown.
No code fences.
`
          },
          {
            role: 'user',
            content: prompt
          }
        ]
      })

    const text =
      aiResponse.choices[0]
        ?.message
        ?.content
        ?.trim()

    if (!text) {
      return res.status(500).json({
        message:
          'AI returned an empty response.'
      })
    }

    let preferences

    try {
      preferences = JSON.parse(text)
    } catch {
      console.error(
        'AI returned invalid JSON:',
        text
      )

      return res.status(500).json({
        message:
          'AI returned an invalid response.'
      })
    }

    // =========================
    // STEP 2: CONVERT GENRES
    // =========================

    const genreIds =
      preferences.genres
        ?.map((genre) => genreMap[genre])
        .filter(Boolean) || []

    // =========================
    // STEP 3: BUILD TMDB FILTER
    // =========================

    const tmdbParams = {
      sort_by: 'popularity.desc',
      include_adult: false,
      include_video: false,
      language: 'en-US',
      page: 1,
      'vote_count.gte': 100
    }

    if (genreIds.length > 0) {
      tmdbParams.with_genres =
        genreIds.join(',')
    }

    if (preferences.maxRuntime) {
      tmdbParams['with_runtime.lte'] =
        Number(preferences.maxRuntime)
    }

    if (preferences.minRating) {
      tmdbParams['vote_average.gte'] =
        Number(preferences.minRating)
    }

    // =========================
    // STEP 4: FETCH TMDB
    // =========================

    const tmdbResponse =
      await tmdbRequest(
        '/discover/movie',
        {
          params: tmdbParams
        }
      )

    const tmdbData =
      tmdbResponse.data

    // =========================
    // STEP 5: CLEAN RESULTS
    // =========================

    const movies =
      (tmdbData.results || [])
        .filter(
          (movie) =>
            movie.poster_path &&
            movie.overview
        )
        .slice(0, 10)

    // =========================
    // STEP 6: SEND RESPONSE
    // =========================

    return res.json({
      success: true,
      preferences,
      movies
    })

  } catch (error) {
    console.error(
      'AI recommendation error:',
      error.response?.data ||
      error.code ||
      error.message
    )

    return res.status(500).json({
      message:
        'Could not process AI recommendation.'
    })
  }
})

export default router