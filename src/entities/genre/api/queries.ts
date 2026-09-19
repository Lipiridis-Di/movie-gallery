import { queryOptions } from '@tanstack/react-query'
import { tmdbFetch } from '@/shared/api/client'
import type { Genre } from '../model/types'

export const genreKeys = {
  all: ['genres'] as const,
}

// Список жанров почти никогда не меняется — держим его в кеше подольше (5 минут),
// не нужно перезапрашивать при каждом переходе на страницу с фильтром.
export const genresOptions = () =>
  queryOptions({
    queryKey: genreKeys.all,
    queryFn: () => tmdbFetch<{ genres: Genre[] }>('/genre/movie/list'),
    staleTime: 5 * 60 * 1000,
  })
