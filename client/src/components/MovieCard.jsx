import {Link} from 'react-router-dom'
const IMG='https://image.tmdb.org/t/p/w500'
export default function MovieCard({movie}){return <Link to={`/movie/${movie.id}`} className="movie-card"><div className="poster-wrap">{movie.poster_path?<img src={`${IMG}${movie.poster_path}`} alt={movie.title}/>:<div className="poster-fallback">No Poster</div>}<span className="rating">★ {Number(movie.vote_average||0).toFixed(1)}</span></div><h3>{movie.title}</h3><p>{movie.release_date?.slice(0,4)||'TBA'}</p></Link>}
