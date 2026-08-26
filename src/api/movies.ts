// Конкретные функции похода в TMDB — каждая знает только свой endpoint,
// а всю "грязную работу" (ключ, обработка ошибок) делает tmdbFetch из client.ts.

import { tmdbFetch } from './client'
import type { CastMember, Genre, MovieDetails, PaginatedResponse, Movie, Video } from '../types/movie'

export function getPopularMovies(page = 1) {
  return tmdbFetch<PaginatedResponse<Movie>>('/movie/popular', { page: String(page) })
}

export function searchMovies(query: string, page = 1) {
  return tmdbFetch<PaginatedResponse<Movie>>('/search/movie', { query, page: String(page) })
}

export function getMovieDetails(id: number | string) {
  return tmdbFetch<MovieDetails>(`/movie/${id}`)
}

export function getMovieCredits(id: number | string) {
  return tmdbFetch<{ cast: CastMember[] }>(`/movie/${id}/credits`)
}

export function getMovieVideos(id: number | string) {
  return tmdbFetch<{ results: Video[] }>(`/movie/${id}/videos`)
}

export function getGenres() {
  return tmdbFetch<{ genres: Genre[] }>('/genre/movie/list')
}

// У TMDB отдельный endpoint для фильтрации/сортировки без текстового поиска — "discover".
// /search/movie принимает только текстовый запрос и не умеет фильтровать по жанру,
// поэтому фильтр по жанру (без текста в поиске) идёт именно через discover.
export function getMoviesByGenre(genreId: number, page = 1) {
  return tmdbFetch<PaginatedResponse<Movie>>('/discover/movie', {
    with_genres: String(genreId),
    sort_by: 'popularity.desc',
    page: String(page),
  })
}
