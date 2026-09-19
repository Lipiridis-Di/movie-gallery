// Карточка одного фильма для сетки каталога.
// Вся карточка — это <Link> (ссылка на страницу фильма). Кнопка "избранное" сюда не
// импортируется напрямую (это фича из другого слоя, entity о ней знать не должна) —
// вместо этого сборщик карточки (виджет/страница) передаёт её через проп `action`,
// который рисуется поверх постера.

import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { posterUrl } from '@/shared/api/images'
import type { Movie } from '../model/types'

interface MovieCardProps {
  movie: Movie
  action?: ReactNode
}

export function MovieCard({ movie, action }: MovieCardProps) {
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

        {action && <div className="absolute top-2 right-2">{action}</div>}
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
