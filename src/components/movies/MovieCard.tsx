// Карточка одного фильма для сетки каталога.
// Вся карточка — это <Link> (ссылка на страницу фильма), а кнопка "избранное" лежит ВНУТРИ
// этой ссылки, поэтому у FavoriteButton здесь включён stopPropagation — иначе клик по сердечку
// одновременно ещё и запускал бы переход на страницу фильма.

import { Link } from 'react-router-dom'
import { posterUrl } from '../../api/images'
import { FavoriteButton } from './FavoriteButton'
import type { Movie } from '../../types/movie'

interface MovieCardProps {
  movie: Movie
}

export function MovieCard({ movie }: MovieCardProps) {
  const poster = posterUrl(movie.poster_path)
  const year = movie.release_date?.slice(0, 4) || '—'

  return (
    <Link
      to={`/movie/${movie.id}`}
      className="group block bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
    >
      <div className="relative aspect-[2/3] bg-slate-200">
        {poster ? (
          <img
            src={poster}
            alt={movie.title}
            loading="lazy"
            className="w-full h-full object-cover"
          />
        ) : (
          // Если постера нет — показываем плейсхолдер вместо сломанной картинки
          <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm px-2 text-center">
            Нет постера
          </div>
        )}

        <div className="absolute top-2 right-2">
          <FavoriteButton movieId={movie.id} stopPropagation />
        </div>
      </div>

      <div className="p-3">
        <h3 className="font-medium text-slate-900 text-sm line-clamp-2 group-hover:text-slate-700">
          {movie.title}
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          {year} · ⭐ {movie.vote_average.toFixed(1)}
        </p>
      </div>
    </Link>
  )
}
