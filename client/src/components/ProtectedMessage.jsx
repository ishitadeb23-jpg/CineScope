import {Link} from 'react-router-dom'
export default function ProtectedMessage(){return <div className="empty-state"><h2>Sign in to use your watchlist</h2><p>Create an account to save movies and keep your list synced.</p><Link className="primary-btn" to="/login">Login</Link></div>}
