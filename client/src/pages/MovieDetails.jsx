import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'

const BACKDROP = 'https://image.tmdb.org/t/p/original'
const PROFILE = 'https://image.tmdb.org/t/p/w185'

export default function MovieDetails() {
  const { id } = useParams()
  const { user } = useAuth()

  const [movie, setMovie] = useState(null)
  const [reviews, setReviews] = useState([])
  const [rating, setRating] = useState(8)
  const [comment, setComment] = useState('')
  const [message, setMessage] = useState('')
  const [isInWatchlist, setIsInWatchlist] = useState(false)

  const loadReviews = () => {
    api
      .get(`/reviews/${id}`)
      .then((response) => {
        setReviews(response.data.reviews || [])
      })
      .catch((error) => {
        console.error('Failed to load reviews:', error)
      })
  }

  const checkWatchlist = async () => {
    if (!user) {
      setIsInWatchlist(false)
      return
    }

    try {
      const response = await api.get('/watchlist')

      const items = response.data.items || []

      const exists = items.some(
        (item) =>
          Number(item.movieId) === Number(id)
      )

      setIsInWatchlist(exists)
    } catch (error) {
      console.error(
        'Failed to check watchlist:',
        error
      )
    }
  }

  useEffect(() => {
    setMovie(null)
    setMessage('')

    api
      .get(`/movies/${id}`)
      .then((response) => {
        setMovie(response.data)
      })
      .catch((error) => {
        console.error(
          'Failed to load movie:',
          error
        )
      })

    loadReviews()
  }, [id])

  useEffect(() => {
    checkWatchlist()
  }, [id, user])

  const addWatchlist = async () => {
    if (!user) {
      setMessage('Please login first.')
      return
    }

    if (isInWatchlist) {
      return
    }

    try {
      await api.post('/watchlist', {
        movieId: movie.id,
        title: movie.title,
        posterPath: movie.poster_path,
        releaseDate: movie.release_date,
        voteAverage: movie.vote_average
      })

      setIsInWatchlist(true)

      setMessage(
        'Added to your watchlist.'
      )
    } catch (error) {
      console.error(
        'Failed to add to watchlist:',
        error
      )

      setMessage(
        'Could not add movie to watchlist.'
      )
    }
  }

  const submitReview = async (e) => {
    e.preventDefault()

    if (!user) {
      setMessage('Please login first.')
      return
    }

    try {
      await api.post('/reviews', {
        movieId: Number(id),
        rating: Number(rating),
        comment
      })

      setComment('')
      setMessage('Review saved.')

      loadReviews()
    } catch (error) {
      console.error(
        'Failed to save review:',
        error
      )

      setMessage(
        'Could not save review.'
      )
    }
  }

  if (!movie) {
    return (
      <div className="page-status">
        Loading movie…
      </div>
    )
  }

  const trailer =
    movie.videos?.results?.find(
      (video) =>
        video.site === 'YouTube' &&
        video.type === 'Trailer'
    )

  return (
    <>
      <section
        className="details-hero"
        style={{
          backgroundImage: `
            linear-gradient(
              0deg,
              #090b10,
              rgba(9,11,16,.25)
            ),
            url(${BACKDROP}${movie.backdrop_path})
          `
        }}
      />

      <section className="details-shell">

        <div className="details-main">

          <span className="eyebrow">
            {movie.release_date?.slice(0, 4)}
            {' • '}
            {movie.runtime} MIN
          </span>

          <h1>
            {movie.title}
          </h1>

          <div className="genre-row">

            {movie.genres?.map((genre) => (
              <span key={genre.id}>
                {genre.name}
              </span>
            ))}

          </div>

          <p className="overview">
            {movie.overview}
          </p>

          <div className="detail-actions">

            <button
              className={
                isInWatchlist
                  ? 'primary-btn watchlist-added'
                  : 'primary-btn'
              }
              onClick={addWatchlist}
              disabled={isInWatchlist}
            >
              {isInWatchlist
                ? '✓ Added to Watchlist'
                : '+ Watchlist'}
            </button>

            {trailer && (
              <a
                className="ghost-btn"
                target="_blank"
                rel="noreferrer"
                href={`https://www.youtube.com/watch?v=${trailer.key}`}
              >
                Watch Trailer
              </a>
            )}

          </div>

          {message && (
            <p className="notice">
              {message}
            </p>
          )}

          <h2 className="subheading">
            Top Cast
          </h2>

          <div className="cast-row">

            {movie.credits?.cast
              ?.slice(0, 6)
              .map((person) => (

                <div
                  className="cast-card"
                  key={person.id}
                >

                  {person.profile_path ? (
                    <img
                      src={`${PROFILE}${person.profile_path}`}
                      alt={person.name}
                    />
                  ) : (
                    <div className="cast-fallback" />
                  )}

                  <strong>
                    {person.name}
                  </strong>

                  <span>
                    {person.character}
                  </span>

                </div>

              ))}

          </div>

          <h2 className="subheading">
            Community Reviews
          </h2>

          <form
            className="review-form"
            onSubmit={submitReview}
          >

            <select
              value={rating}
              onChange={(e) =>
                setRating(e.target.value)
              }
            >
              {[10, 9, 8, 7, 6, 5, 4, 3, 2, 1]
                .map((number) => (
                  <option
                    key={number}
                    value={number}
                  >
                    {number}/10
                  </option>
                ))}
            </select>

            <textarea
              value={comment}
              onChange={(e) =>
                setComment(e.target.value)
              }
              placeholder="Write your review..."
              required
            />

            <button className="primary-btn">
              Post Review
            </button>

          </form>

          <div className="reviews-list">

            {reviews.length === 0 && (
              <p className="muted">
                No reviews yet.
              </p>
            )}

            {reviews.map((review) => (

              <article
                className="review-card"
                key={review._id}
              >

                <div>

                  <strong>
                    {review.user?.name || 'User'}
                  </strong>

                  <span>
                    ★ {review.rating}/10
                  </span>

                </div>

                <p>
                  {review.comment}
                </p>

              </article>

            ))}

          </div>

        </div>

        <aside className="score-panel">

          <span>
            TMDB SCORE
          </span>

          <strong>
            {Number(
              movie.vote_average || 0
            ).toFixed(1)}
          </strong>

          <small>
            {movie.vote_count?.toLocaleString()}
            {' '}votes
          </small>

        </aside>

      </section>
    </>
  )
}