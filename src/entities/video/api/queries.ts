import { queryOptions } from '@tanstack/react-query'
import { tmdbFetch } from '@/shared/api/client'
import type { Video } from '../model/types'

export const videoKeys = {
  forMovie: (movieId: number | string) => ['videos', movieId] as const,
}

export const movieVideosOptions = (movieId: number | string) =>
  queryOptions({
    queryKey: videoKeys.forMovie(movieId),
    queryFn: () => tmdbFetch<{ results: Video[] }>(`/movie/${movieId}/videos`),
  })
