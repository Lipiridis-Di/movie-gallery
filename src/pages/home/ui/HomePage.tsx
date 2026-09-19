// Логика выбора запроса — три случая:
// 1. есть текст поиска (q) → searchMoviesOptions (endpoint TMDB для текстового поиска)
// 2. текста нет, но выбран жанр → moviesByGenreOptions (endpoint discover с фильтром)
// 3. ничего не выбрано → popularMoviesOptions, как и было
//
// Все три useQuery вызываются на каждом рендере (правила хуков не разрешают вызывать их
// условно), но реально сеть дёргает только тот, у кого enabled === true — остальные два
// просто "спят" без запроса. Активный выбирается через `active` ниже.
//
// TMDB не даёт совместить текстовый поиск и фильтр по жанру одним запросом —
// /search/movie не принимает with_genres. Поэтому если выбраны И текст, И жанр — досеиваем
// результат текстового поиска фильтром по genre_ids уже на нашей стороне.

import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { popularMoviesOptions, searchMoviesOptions, moviesByGenreOptions } from '@/entities/movie'
import { MovieGrid } from '@/widgets/movie-grid'
import { SearchBar } from '@/features/search-movies'
import { GenreFilter } from '@/features/filter-by-genre'
import { Loader, ErrorMessage, EmptyState } from '@/shared/ui'

export function HomePage() {
  const [searchParams] = useSearchParams()
  const query = searchParams.get('q') ?? ''
  const genre = searchParams.get('genre') ?? ''

  const isSearch = Boolean(query)
  const isGenreOnly = !query && Boolean(genre)
  const isPopular = !query && !genre

  const popularQuery = useQuery({ ...popularMoviesOptions(), enabled: isPopular })
  const searchQuery = useQuery({ ...searchMoviesOptions(query), enabled: isSearch })
  const genreQuery = useQuery({ ...moviesByGenreOptions(Number(genre) || 0), enabled: isGenreOnly })

  const active = isSearch ? searchQuery : isGenreOnly ? genreQuery : popularQuery

  const movies = useMemo(() => {
    if (isSearch) {
      const results = searchQuery.data?.results ?? []
      return genre ? results.filter((movie) => movie.genre_ids.includes(Number(genre))) : results
    }
    return active.data?.results ?? []
  }, [isSearch, genre, searchQuery.data, active.data])

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

      {active.status === 'pending' && <Loader label="Загружаем фильмы…" />}
      {active.status === 'error' && <ErrorMessage onRetry={active.refetch} />}
      {active.status === 'success' && movies.length === 0 && (
        <EmptyState message="Ничего не нашлось — попробуйте другой запрос или жанр." />
      )}
      {active.status === 'success' && movies.length > 0 && <MovieGrid movies={movies} />}
    </div>
  )
}
