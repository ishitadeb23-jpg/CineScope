import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()

  return (
    <header className="navbar">
      <div className="navbar-inner">

        <Link to="/" className="brand">
          <span className="brand-icon">◉</span>
          Cine<span>Scope</span>
        </Link>

        <nav className="nav-links">
          <NavLink to="/" end>
            Home
          </NavLink>

          <NavLink to="/search">
            Discover
          </NavLink>

          <NavLink to="/mood">
            Mood
          </NavLink>

            <NavLink to="/watchlist">
              Watchlist
            </NavLink>
        </nav>

        <div className="nav-actions">
          {user ? (
            <>
              <div className="user-avatar">
                {user.name?.charAt(0).toUpperCase()}
              </div>

              <span className="user-name">
                {user.name}
              </span>

              <button
                className="nav-login-btn"
                onClick={logout}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="nav-login-btn"
              >
                Login
              </Link>

              <Link
                to="/register"
                className="nav-join-btn"
              >
                Join CineScope
              </Link>
            </>
          )}
        </div>

      </div>
    </header>
  )
}