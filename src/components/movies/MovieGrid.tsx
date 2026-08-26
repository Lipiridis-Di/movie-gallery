// MovieGrid ничего не знает про API и загрузку — только берёт готовый массив фильмов
// и раскладывает его сеткой из MovieCard. Такое разделение (кто грузит данные / кто их
// показывает) удобно тем, что эту же сетку потом можно переиспользовать и для поиска,
// и для избранного — passing другой массив movies.

import { MovieCard } from './MovieCard'
import type { Movie } from '../../types/movie'

interface MovieGridProps {
  movies: Movie[]
}

export function MovieGrid({ movies }: MovieGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {movies.map((movie) => (
        <MovieCard key={movie.id} movie={movie} />
      ))}
    </div>
  )
}
