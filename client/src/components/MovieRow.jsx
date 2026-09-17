import MovieCard from './MovieCard'
export default function MovieRow({title,movies=[]}){return <section className="content-section"><div className="section-heading"><h2>{title}</h2></div><div className="movie-grid">{movies.map(m=><MovieCard key={m.id} movie={m}/>)}</div></section>}
