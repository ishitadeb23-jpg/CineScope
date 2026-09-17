import { useEffect, useState } from 'react'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import ProtectedMessage from '../components/ProtectedMessage'
import MovieCard from '../components/MovieCard'

export default function Watchlist() {
  const { user } = useAuth()
  const [items, setItems] = useState([])

async function loadWatchlist() {
  if (!user) return

  try {
    const response = await api.get('/watchlist')
    const savedItems = response.data.items || []

    const moviesWithRatings = []

    for (const item of savedItems) {
      try {
        const movieResponse = await api.get(
          `/movies/${item.movieId}`
        )

        moviesWithRatings.push({
          ...item,
          voteAverage:
            movieResponse.data.vote_average ??
            item.voteAverage ??
            0
        })
      } catch (error) {
        console.error(
          `Failed to load rating for movie ${item.movieId}`,
          error
        )

        moviesWithRatings.push({
          ...item,
          voteAverage: item.voteAverage ?? 0
        })
      }
    }

    setItems(moviesWithRatings)

  } catch (error) {
    console.error(
      'Failed to load watchlist:',
      error
    )
  }
}

  useEffect(() => {
    loadWatchlist()
  }, [user])

  async function removeMovie(movieId) {
    try {
      await api.delete(`/watchlist/${movieId}`)
      await loadWatchlist()
    } catch (error) {
      console.error('Failed to remove movie:', error)
    }
  }

  if (!user) {
    return (
      <section className="page-shell">
        <ProtectedMessage />
      </section>
    )
  }

  return (
    <section className="page-shell">
      <div className="page-header">
        <span className="eyebrow">MY SPACE</span>
        <h1>Watchlist</h1>
        <p>Your saved movies, ready whenever you are.</p>
      </div>

      {items.length === 0 ? (
        <div className="empty-state">
          <h2>Your watchlist is empty</h2>
          <p>Add movies from any movie details page.</p>
        </div>
      ) : (
        <div className="watchlist-grid">
          {items.map((item) => {
            const movie = {
              id: item.movieId,
              title: item.title,
              poster_path: item.posterPath,
              release_date: item.releaseDate,
              vote_average: item.voteAverage ?? 0
            }

            return (
              <div
                className="watchlist-item"
                key={item.movieId}
              >
                <MovieCard movie={movie} />

                <button
                  className="danger-btn"
                  onClick={() => removeMovie(item.movieId)}
                >
                  Remove
                </button>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}