// Выпадающий список жанров. В отличие от SearchBar, здесь debounce не нужен —
// у select один "клик выбора", а не поток нажатий клавиш, так что можно сразу
// писать выбор в URL. Список жанров приходит через useQuery — TanStack Query
// сам кеширует его (см. staleTime в genresOptions), повторной загрузки при
// возврате на страницу не будет.

import { useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { genresOptions } from '@/entities/genre'

export function GenreFilter() {
  const { data } = useQuery(genresOptions())
  const genres = data?.genres ?? []
  const [searchParams, setSearchParams] = useSearchParams()

  const selectedGenre = searchParams.get('genre') ?? ''

  return (
    <select
      value={selectedGenre}
      onChange={(event) => {
        setSearchParams((prev) => {
          const next = new URLSearchParams(prev)
          if (event.target.value) {
            next.set('genre', event.target.value)
          } else {
            next.delete('genre')
          }
          return next
        })
      }}
      className="px-3 py-2 rounded-md border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-400"
    >
      <option value="">Все жанры</option>
      {genres.map((genre) => (
        <option key={genre.id} value={genre.id}>
          {genre.name}
        </option>
      ))}
    </select>
  )
}
