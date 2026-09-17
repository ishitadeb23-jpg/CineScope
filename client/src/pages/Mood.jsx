import { useState } from 'react'
import api from '../services/api'
import MovieCard from '../components/MovieCard'

const moods = [
  ['funny', '😂', 'Something funny'],
  ['thoughtful', '🧠', 'Make me think'],
  ['feel-good', '✨', 'Feel-good'],
  ['intense', '🔥', 'Something intense'],
  ['emotional', '🥹', 'Emotional'],
  ['comfort', '🌙', 'Late-night comfort']
]

export default function Mood() {
  const [movies, setMovies] = useState([])
  const [active, setActive] = useState('')

  const [aiPrompt, setAiPrompt] = useState('')
  const [aiMovies, setAiMovies] = useState([])
  const [aiPreferences, setAiPreferences] = useState(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [speechSupported, setSpeechSupported] = useState(true)

  const choose = async (key) => {
    try {
      setActive(key)

      const { data } = await api.get(
        `/movies/mood/${key}`
      )

      setMovies(data.results || [])
    } catch (error) {
      console.error(
        'Mood recommendation error:',
        error
      )
    }
  }

  const startListening = () => {
  const SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition

  if (!SpeechRecognition) {
    setSpeechSupported(false)

    setAiError(
      'Voice input is not supported in this browser. You can still type your request.'
    )

    return
  }

  const recognition = new SpeechRecognition()

  recognition.lang = 'en-US'
  recognition.interimResults = false
  recognition.continuous = false

  recognition.onstart = () => {
    setIsListening(true)
    setAiError('')
  }

  recognition.onresult = (event) => {
    const transcript =
      event.results[0][0].transcript

    setAiPrompt(transcript)
  }

  recognition.onerror = (event) => {
    console.error(
      'Speech recognition error:',
      event.error
    )

    setAiError(
      'I could not hear that clearly. Please try again.'
    )

    setIsListening(false)
  }

  recognition.onend = () => {
    setIsListening(false)
  }

  recognition.start()
}

  const getAIRecommendations = async (e) => {
    e.preventDefault()

    if (!aiPrompt.trim()) {
      setAiError(
        'Tell CineScope what kind of movie you feel like watching.'
      )
      return
    }

    try {
      setAiLoading(true)
      setAiError('')
      setAiMovies([])
      setAiPreferences(null)

      const response = await api.post(
        '/recommendations/ai',
        {
          prompt: aiPrompt
        }
      )

      setAiMovies(
        response.data.movies || []
      )

      setAiPreferences(
        response.data.preferences || null
      )
    } catch (error) {
      console.error(
        'AI recommendation error:',
        error
      )

      setAiError(
        'CineScope AI could not find recommendations right now.'
      )
    } finally {
      setAiLoading(false)
    }
  }

  return (
    <section className="page-shell">

      {/* ========================
          EXISTING MOOD FEATURE
      ======================== */}

      <div className="page-header">
        <span className="eyebrow">
          MOOD DISCOVERY
        </span>

        <h1>
          What are you in the mood for?
        </h1>

        <p>
          Pick a vibe and let CineScope
          narrow the universe.
        </p>
      </div>

      <div className="mood-grid">
        {moods.map(([key, emoji, label]) => (
          <button
            className={`mood-card ${
              active === key ? 'active' : ''
            }`}
            key={key}
            onClick={() => choose(key)}
          >
            <span>{emoji}</span>
            <strong>{label}</strong>
          </button>
        ))}
      </div>

      <div className="movie-grid search-results">
        {movies.map((movie) => (
          <MovieCard
            key={movie.id}
            movie={movie}
          />
        ))}
      </div>


      {/* ========================
          AI MOVIE ASSISTANT
      ======================== */}

      <section className="ai-movie-assistant">

        <div className="ai-assistant-header">
          <span className="section-kicker">
            CINESCOPE AI
          </span>

          <h2>
            Tell me what you feel like watching.
          </h2>

          <p>
            Describe the mood, genre, runtime,
            story or experience you want.
            CineScope AI will understand your
            request and find matching movies.
          </p>
        </div>

        <form
          className="ai-recommendation-form"
          onSubmit={getAIRecommendations}
        >
          <textarea
            value={aiPrompt}
            onChange={(e) =>
              setAiPrompt(e.target.value)
            }
            placeholder="Example: I want something funny and romantic, under 2 hours, but not too cheesy..."
            rows="4"
          />

          <div className="ai-action-buttons">

  {speechSupported && (
    <button
      type="button"
      className={
        isListening
          ? 'voice-btn listening'
          : 'voice-btn'
      }
      onClick={startListening}
      disabled={isListening || aiLoading}
    >
      {isListening
        ? '🎙 Listening...'
        : '🎙 Speak'}
    </button>
  )}

  <button
    type="submit"
    className="primary-btn ai-submit-btn"
    disabled={aiLoading || isListening}
  >
    {aiLoading
      ? 'Finding movies...'
      : '✦ Ask CineScope AI'}
  </button>

</div>
        </form>


        {/* QUICK PROMPTS */}

        <div className="ai-prompt-examples">

          <button
            type="button"
            onClick={() =>
              setAiPrompt(
                'I want something emotional but hopeful, preferably science fiction.'
              )
            }
          >
            Emotional + hopeful
          </button>

          <button
            type="button"
            onClick={() =>
              setAiPrompt(
                'Give me a fun comedy under 2 hours that I can watch with friends.'
              )
            }
          >
            Fun with friends
          </button>

          <button
            type="button"
            onClick={() =>
              setAiPrompt(
                'I want a dark mystery thriller that keeps me guessing.'
              )
            }
          >
            Dark mystery
          </button>

        </div>


        {/* ERROR */}

        {aiError && (
          <p className="ai-error">
            {aiError}
          </p>
        )}


        {/* WHAT AI UNDERSTOOD */}

        {aiPreferences && (
          <div className="ai-understanding">

            <span className="ai-label">
              AI UNDERSTOOD
            </span>

            <p>
              {aiPreferences.explanation}
            </p>

            <div className="ai-preference-tags">

              {aiPreferences.genres?.map(
                (genre) => (
                  <span key={genre}>
                    {genre}
                  </span>
                )
              )}

              {aiPreferences.mood && (
                <span>
                  {aiPreferences.mood}
                </span>
              )}

              {aiPreferences.maxRuntime && (
                <span>
                  Under{' '}
                  {aiPreferences.maxRuntime} min
                </span>
              )}

              {aiPreferences.minRating && (
                <span>
                  ★ {aiPreferences.minRating}+
                </span>
              )}

            </div>
          </div>
        )}


        {/* AI MOVIE RESULTS */}

        {aiMovies.length > 0 && (
          <div className="ai-results">

            <div className="ai-results-heading">

              <span className="section-kicker">
                SELECTED FOR YOU
              </span>

              <h2>
                CineScope AI recommends
              </h2>

            </div>

            <div className="movie-grid search-results">
              {aiMovies.map((movie) => (
                <MovieCard
                  key={movie.id}
                  movie={movie}
                />
              ))}
            </div>

          </div>
        )}


        {/* NO RESULTS */}

        {!aiLoading &&
          aiPreferences &&
          aiMovies.length === 0 && (
            <p className="ai-empty">
              I understood your request,
              but couldn't find matching movies.
              Try making your request a little broader.
            </p>
          )}

      </section>

    </section>
  )
}