// Выпадающий список жанров. В отличие от SearchBar, здесь debounce не нужен —
// у select один "клик выбора", а не поток нажатий клавиш, так что можно сразу
// писать выбор в URL.

import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getGenres } from '../../api/movies'
import type { Genre } from '../../types/movie'

export function GenreFilter() {
  const [genres, setGenres] = useState<Genre[]>([])
  const [searchParams, setSearchParams] = useSearchParams()

  useEffect(() => {
    getGenres()
      .then((data) => setGenres(data.genres))
      .catch((error) => console.error(error))
  }, [])

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
