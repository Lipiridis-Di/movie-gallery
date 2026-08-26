// Логика выбора запроса — три случая:
// 1. есть текст поиска (q) → searchMovies (endpoint TMDB для текстового поиска)
// 2. текста нет, но выбран жанр → getMoviesByGenre (endpoint discover с фильтром)
// 3. ничего не выбрано → getPopularMovies, как и было
//
// TMDB не даёт совместить текстовый поиск и фильтр по жанру одним запросом —
// /search/movie не принимает with_genres. Поэтому если выбраны И текст, И жанр — досеиваем
// результат текстового поиска фильтром по genre_ids уже на нашей стороне (в браузере).

import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getMoviesByGenre, getPopularMovies, searchMovies } from '../api/movies'
import { MovieGrid } from '../components/movies/MovieGrid'
import { SearchBar } from '../components/catalog/SearchBar'
import { GenreFilter } from '../components/catalog/GenreFilter'
import { Loader } from '../components/ui/Loader'
import { ErrorMessage } from '../components/ui/ErrorMessage'
import { EmptyState } from '../components/ui/EmptyState'
import type { Movie } from '../types/movie'

export function HomePage() {
  const [searchParams] = useSearchParams()
  const query = searchParams.get('q') ?? ''
  const genre = searchParams.get('genre') ?? ''

  const [movies, setMovies] = useState<Movie[]>([])
  const [status, setStatus] = useState<'loading' | 'error' | 'ready'>('loading')

  const load = useCallback(() => {
    setStatus('loading')

    let request
    if (query) {
      request = searchMovies(query).then((data) =>
        genre
          ? data.results.filter((movie) => movie.genre_ids.includes(Number(genre)))
          : data.results,
      )
    } else if (genre) {
      request = getMoviesByGenre(Number(genre)).then((data) => data.results)
    } else {
      request = getPopularMovies().then((data) => data.results)
    }

    request
      .then((results) => {
        setMovies(results)
        setStatus('ready')
      })
      .catch((error) => {
        console.error(error)
        setStatus('error')
      })
  }, [query, genre])

  useEffect(() => {
    load()
  }, [load])

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">
          {query ? `Результаты по «${query}»` : 'Популярные фильмы'}
        </h1>
        <div className="flex gap-3">
          <SearchBar />
          <GenreFilter />
        </div>
      </div>

      {status === 'loading' && <Loader label="Загружаем фильмы…" />}
      {status === 'error' && <ErrorMessage onRetry={load} />}
      {status === 'ready' && movies.length === 0 && (
        <EmptyState message="Ничего не нашлось — попробуйте другой запрос или жанр." />
      )}
      {status === 'ready' && movies.length > 0 && <MovieGrid movies={movies} />}
    </div>
  )
}
