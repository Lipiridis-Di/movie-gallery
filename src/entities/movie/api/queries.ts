// Query-слой сущности "фильм": фабрика ключей + queryOptions на базе TanStack Query.
// Каждая queryOptions()-функция — это то, что раньше было отдельной функцией в api/movies.ts
// (getPopularMovies, searchMovies, ...), просто обёрнутое так, чтобы страницы вызывали
// useQuery(popularMoviesOptions(page)) и получали кеш, isPending/isError/refetch "бесплатно".

import { queryOptions } from '@tanstack/react-query'
import { tmdbFetch } from '@/shared/api/client'
import type { Movie, MovieDetails, PaginatedResponse } from '../model/types'

export const movieKeys = {
  all: ['movies'] as const,
  popular: (page: number) => [...movieKeys.all, 'popular', page] as const,
  search: (query: string, page: number) => [...movieKeys.all, 'search', query, page] as const,
  byGenre: (genreId: number, page: number) => [...movieKeys.all, 'genre', genreId, page] as const,
  detail: (id: number | string) => [...movieKeys.all, 'detail', id] as const,
}

export const popularMoviesOptions = (page = 1) =>
  queryOptions({
    queryKey: movieKeys.popular(page),
    queryFn: () => tmdbFetch<PaginatedResponse<Movie>>('/movie/popular', { page: String(page) }),
  })

export const searchMoviesOptions = (query: string, page = 1) =>
  queryOptions({
    queryKey: movieKeys.search(query, page),
    queryFn: () =>
      tmdbFetch<PaginatedResponse<Movie>>('/search/movie', { query, page: String(page) }),
    enabled: query.length > 0,
  })

// У TMDB отдельный endpoint для фильтрации/сортировки без текстового поиска — "discover".
// /search/movie принимает только текстовый запрос и не умеет фильтровать по жанру,
// поэтому фильтр по жанру (без текста в поиске) идёт именно через discover.
export const moviesByGenreOptions = (genreId: number, page = 1) =>
  queryOptions({
    queryKey: movieKeys.byGenre(genreId, page),
    queryFn: () =>
      tmdbFetch<PaginatedResponse<Movie>>('/discover/movie', {
        with_genres: String(genreId),
        sort_by: 'popularity.desc',
        page: String(page),
      }),
  })

export const movieDetailsOptions = (id: number | string) =>
  queryOptions({
    queryKey: movieKeys.detail(id),
    queryFn: () => tmdbFetch<MovieDetails>(`/movie/${id}`),
  })
