import { queryOptions } from '@tanstack/react-query'
import { tmdbFetch } from '@/shared/api/client'
import type { CastMember } from '../model/types'

export const castKeys = {
  forMovie: (movieId: number | string) => ['cast', movieId] as const,
}

export const movieCreditsOptions = (movieId: number | string) =>
  queryOptions({
    queryKey: castKeys.forMovie(movieId),
    queryFn: () => tmdbFetch<{ cast: CastMember[] }>(`/movie/${movieId}/credits`),
  })
