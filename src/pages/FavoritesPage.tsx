// Стор хранит только ID избранных фильмов (favoriteIds: number[]), без самих данных —
// то есть здесь их нужно ДОГРУЗИТЬ из TMDB по каждому ID отдельно. Все запросы независимы
// друг от друга, поэтому опять Promise.all — теперь не над тремя разными запросами
// как на странице фильма, а над массивом ОДИНАКОВЫХ запросов, просто с разными ID.

import { useCallback, useEffect, useState } from 'react'
import { getMovieDetails } from '../api/movies'
import { useFavoritesStore } from '../store/favoritesStore'
import { MovieGrid } from '../components/movies/MovieGrid'
import { Loader } from '../components/ui/Loader'
import { ErrorMessage } from '../components/ui/ErrorMessage'
import { EmptyState } from '../components/ui/EmptyState'
import type { MovieDetails } from '../types/movie'

export function FavoritesPage() {
  const favoriteIds = useFavoritesStore((state) => state.favoriteIds)
  const [movies, setMovies] = useState<MovieDetails[]>([])
  const [status, setStatus] = useState<'loading' | 'error' | 'ready'>('loading')

  const load = useCallback(() => {
    if (favoriteIds.length === 0) {
      setMovies([])
      setStatus('ready')
      return
    }

    setStatus('loading')

    Promise.all(favoriteIds.map((id) => getMovieDetails(id)))
      .then((results) => {
        setMovies(results)
        setStatus('ready')
      })
      .catch((error) => {
        console.error(error)
        setStatus('error')
      })
    // favoriteIds — это массив, а массивы в JS сравниваются по ссылке, не по содержимому.
    // Zustand при каждом toggleFavorite создаёт НОВЫЙ массив, поэтому useEffect ниже
    // корректно перезапускается при каждом изменении избранного.
  }, [favoriteIds])

  useEffect(() => {
    load()
  }, [load])

  if (status === 'loading') {
    return <Loader label="Загружаем избранное…" />
  }

  if (status === 'error') {
    return <ErrorMessage message="Не получилось загрузить избранные фильмы." onRetry={load} />
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900 mb-4">Избранное</h1>
      {movies.length === 0 ? (
        <EmptyState message="Пока пусто — добавляйте фильмы кнопкой ♡ в каталоге или на странице фильма." />
      ) : (
        <MovieGrid movies={movies} />
      )}
    </div>
  )
}
