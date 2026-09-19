// MovieGrid раскладывает массив фильмов сеткой из MovieCard и навешивает на каждую карточку
// кнопку "избранное" через её проп `action`. Сама сущность movie ничего не знает про фичу
// toggle-favorite (entities не должны зависеть от features) — их соединяет именно этот виджет.
// Переиспользуется на главной, в поиске и в избранном — просто разный массив movies.

import { MovieCard, type Movie } from '@/entities/movie'
import { FavoriteButton } from '@/features/toggle-favorite'

interface MovieGridProps {
  movies: Movie[]
}

export function MovieGrid({ movies }: MovieGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {movies.map((movie) => (
        <MovieCard
          key={movie.id}
          movie={movie}
          action={<FavoriteButton movieId={movie.id} stopPropagation />}
        />
      ))}
    </div>
  )
}
