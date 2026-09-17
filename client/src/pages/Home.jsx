import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import MovieRow from '../components/MovieRow'

const BACKDROP = 'https://image.tmdb.org/t/p/original'

export default function Home() {
  const [data, setData] = useState({
    trending: [],
    popular: [],
    topRated: []
  })

  const [loading, setLoading] = useState(true)

  const [heroIndex, setHeroIndex] = useState(0)

  const [heroPaused, setHeroPaused] = useState(false)

  useEffect(() => {
    Promise.all([
      api.get('/movies/trending'),
      api.get('/movies/popular'),
      api.get('/movies/top-rated')
    ])
      .then(([trending, popular, topRated]) => {
        setData({
          trending: trending.data.results,
          popular: popular.data.results,
          topRated: topRated.data.results
        })
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  const heroMovies = data.trending
    .filter((movie) => movie.backdrop_path)
    .slice(0, 6)

  const hero = heroMovies[heroIndex]

  useEffect(() => {
    if (
      heroPaused ||
      heroMovies.length <= 1
    ) {
      return
    }

    const timer = setInterval(() => {
      setHeroIndex((current) =>
        (current + 1) % heroMovies.length
      )
    }, 6000)

    return () => {
      clearInterval(timer)
    }
  }, [
    heroPaused,
    heroMovies.length
  ])

  const nextHero = () => {
    setHeroIndex((current) =>
      (current + 1) % heroMovies.length
    )
  }

  const previousHero = () => {
    setHeroIndex((current) =>
      (
        current -
        1 +
        heroMovies.length
      ) % heroMovies.length
    )
  }

  if (loading) {
    return (
      <div className="cinema-loader">

        <div className="loader-ring"></div>

        <p>
          Preparing your cinema...
        </p>

      </div>
    )
  }

  return (
    <div className="home-page">

      {hero && (

        <section
          className="hero"
          onMouseEnter={() =>
            setHeroPaused(true)
          }
          onMouseLeave={() =>
            setHeroPaused(false)
          }
          style={{
            backgroundImage: `
              linear-gradient(
                90deg,
                rgba(5,6,10,1) 0%,
                rgba(5,6,10,.92) 25%,
                rgba(5,6,10,.55) 60%,
                rgba(5,6,10,.25) 100%
              ),
              linear-gradient(
                0deg,
                #090b10 0%,
                transparent 35%
              ),
              url(${BACKDROP}${hero.backdrop_path})
            `
          }}
        >

          <div className="hero-content">

            <div className="hero-badge">
              <span className="live-dot"></span>
              TRENDING THIS WEEK
            </div>

            <h1>
              {hero.title}
            </h1>

            <div className="hero-meta">

              <span>
                ★ {Number(
                  hero.vote_average || 0
                ).toFixed(1)}
              </span>

              <span>
                {
                  hero.release_date
                    ?.slice(0, 4)
                }
              </span>

              <span className="quality-badge">
                HD
              </span>

            </div>

            <p className="hero-description">
              {hero.overview}
            </p>

            <div className="hero-actions">

              <Link
                to={`/movie/${hero.id}`}
                className="hero-primary-btn"
              >
                <span>▶</span>
                Explore Movie
              </Link>

              <Link
                to="/mood"
                className="hero-secondary-btn"
              >
                ✦ Find by Mood
              </Link>

            </div>

          </div>

          <div className="hero-carousel-controls">

            <button
              type="button"
              className="hero-carousel-arrow"
              onClick={previousHero}
              aria-label="Previous trending movie"
            >
              ‹
            </button>

            <div className="hero-carousel-dots">

              {heroMovies.map(
                (movie, index) => (

                  <button
                    type="button"
                    key={movie.id}
                    className={
                      index === heroIndex
                        ? 'hero-carousel-dot active'
                        : 'hero-carousel-dot'
                    }
                    onClick={() =>
                      setHeroIndex(index)
                    }
                    aria-label={`Show ${movie.title}`}
                  />

                )
              )}

            </div>

            <button
              type="button"
              className="hero-carousel-arrow"
              onClick={nextHero}
              aria-label="Next trending movie"
            >
              ›
            </button>

          </div>

          <div className="hero-scroll">
            <span>
              Scroll to discover
            </span>

            <div className="scroll-line"></div>
          </div>

        </section>

      )}

      <section className="cinema-intro">

        <span className="section-kicker">
          YOUR PERSONAL CINEMA
        </span>

        <h2>
          Discover stories worth watching.
        </h2>

        <p>
          Explore trending releases,
          timeless favourites and movies
          chosen around your mood.
        </p>

      </section>

      <MovieRow
        title="Trending Now"
        movies={data.trending.slice(0, 10)}
      />

      <MovieRow
        title="Popular Picks"
        movies={data.popular.slice(0, 10)}
      />

      <MovieRow
        title="Top Rated"
        movies={data.topRated.slice(0, 10)}
      />

      <section className="mood-banner">

        <div className="mood-banner-content">

          <span className="section-kicker">
            NOT SURE WHAT TO WATCH?
          </span>

          <h2>
            Let your mood choose the movie.
          </h2>

          <p>
            Tell CineScope how you feel
            and discover movies that match
            the moment.
          </p>

          <Link
            to="/mood"
            className="hero-primary-btn"
          >
            ✦ Explore by Mood
          </Link>

        </div>

        <div className="mood-icons">

          <span>😂</span>
          <span>🧠</span>
          <span>🔥</span>
          <span>🌙</span>

        </div>

      </section>

    </div>
  )
}