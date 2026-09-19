// Детали, актёры и трейлер — три независимых query, поэтому три отдельных useQuery,
// а не один big useEffect с Promise.all: TanStack Query сам запускает их параллельно
// при монтировании и кеширует каждый по своему ключу отдельно.

import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { movieDetailsOptions } from '@/entities/movie'
import { movieCreditsOptions, CastList } from '@/entities/cast'
import { movieVideosOptions, TrailerEmbed } from '@/entities/video'
import { FavoriteButton } from '@/features/toggle-favorite'
import { posterUrl } from '@/shared/api/images'
import { Loader, ErrorMessage } from '@/shared/ui'

// Переводит минуты в формат "2ч 14мин" — TMDB отдаёт runtime одним числом.
function formatRuntime(minutes: number) {
  if (!minutes) return null
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  return `${hours}ч ${rest}мин`
}

export function MovieDetailsPage() {
  const { id = '' } = useParams<{ id: string }>()

  const detailsQuery = useQuery({ ...movieDetailsOptions(id), enabled: Boolean(id) })
  const creditsQuery = useQuery({ ...movieCreditsOptions(id), enabled: Boolean(id) })
  const videosQuery = useQuery({ ...movieVideosOptions(id), enabled: Boolean(id) })

  const isPending = detailsQuery.isPending || creditsQuery.isPending || videosQuery.isPending
  const isError = detailsQuery.isError || creditsQuery.isError || videosQuery.isError

  const retry = () => {
    detailsQuery.refetch()
    creditsQuery.refetch()
    videosQuery.refetch()
  }

  if (isPending) {
    return <Loader label="Загружаем информацию о фильме…" />
  }

  if (isError || !detailsQuery.data) {
    return <ErrorMessage message="Не получилось загрузить фильм." onRetry={retry} />
  }

  const details = detailsQuery.data
  const cast = creditsQuery.data?.cast ?? []
  // Среди видео ищем именно трейлер на YouTube (бывают ещё тизеры, клипы,
  // ролики за кадром — нам для страницы нужен конкретно трейлер).
  const trailerKey = videosQuery.data?.results.find(
    (video) => video.site === 'YouTube' && video.type === 'Trailer',
  )?.key

  const poster = posterUrl(details.poster_path, 'w500')
  const runtime = formatRuntime(details.runtime)

  return (
    <div>
      <Link to="/" className="text-sm text-slate-500 hover:text-slate-700 mb-4 inline-block">
        ← Назад в каталог
      </Link>

      <div className="flex flex-col sm:flex-row gap-6 mb-8">
        <div className="w-48 flex-shrink-0">
          <div className="aspect-[2/3] rounded-lg overflow-hidden bg-slate-200">
            {poster ? (
              <img src={poster} alt={details.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm">
                Нет постера
              </div>
            )}
          </div>
        </div>

        <div className="flex-1">
          <div className="flex items-start justify-between gap-4">
            <h1 className="text-2xl font-semibold text-slate-900">{details.title}</h1>
            <FavoriteButton movieId={details.id} />
          </div>

          <p className="text-sm text-slate-500 mt-1">
            {details.release_date?.slice(0, 4) || '—'}
            {runtime ? ` · ${runtime}` : ''} · ⭐ {details.vote_average.toFixed(1)}
          </p>

          {details.genres.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {details.genres.map((genre) => (
                <span
                  key={genre.id}
                  className="text-xs px-2 py-1 rounded-full bg-slate-200 text-slate-700"
                >
                  {genre.name}
                </span>
              ))}
            </div>
          )}

          <p className="text-slate-700 mt-4 leading-relaxed">{details.overview}</p>
        </div>
      </div>

      <div className="space-y-8">
        <CastList cast={cast} />
        {trailerKey && <TrailerEmbed videoKey={trailerKey} />}
      </div>
    </div>
  )
}
