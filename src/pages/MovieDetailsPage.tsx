// Три отдельных запроса к TMDB (детали, актёры, видео) не зависят друг от друга,
// поэтому запускаем их ОДНОВРЕМЕННО через Promise.all, а не по очереди через await/await/await.
// Если бы делали по очереди, страница ждала бы втрое дольше без всякой причины —
// запросы никак не связаны между собой.

import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getMovieCredits, getMovieDetails, getMovieVideos } from '../api/movies'
import { posterUrl } from '../api/images'
import { CastList } from '../components/movies/CastList'
import { TrailerEmbed } from '../components/movies/TrailerEmbed'
import { FavoriteButton } from '../components/movies/FavoriteButton'
import { Loader } from '../components/ui/Loader'
import { ErrorMessage } from '../components/ui/ErrorMessage'
import type { CastMember, MovieDetails } from '../types/movie'

// Переводит минуты в формат "2ч 14мин" — TMDB отдаёт runtime одним числом.
function formatRuntime(minutes: number) {
  if (!minutes) return null
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  return `${hours}ч ${rest}мин`
}

export function MovieDetailsPage() {
  const { id } = useParams<{ id: string }>()

  const [details, setDetails] = useState<MovieDetails | null>(null)
  const [cast, setCast] = useState<CastMember[]>([])
  const [trailerKey, setTrailerKey] = useState<string | null>(null)
  const [status, setStatus] = useState<'loading' | 'error' | 'ready'>('loading')

  const load = useCallback(() => {
    if (!id) return

    setStatus('loading')

    Promise.all([getMovieDetails(id), getMovieCredits(id), getMovieVideos(id)])
      .then(([detailsData, creditsData, videosData]) => {
        setDetails(detailsData)
        setCast(creditsData.cast)

        // Среди видео ищем именно трейлер на YouTube (бывают ещё тизеры, клипы,
        // ролики за кадром — нам для страницы нужен конкретно трейлер).
        const trailer = videosData.results.find(
          (video) => video.site === 'YouTube' && video.type === 'Trailer',
        )
        setTrailerKey(trailer?.key ?? null)

        setStatus('ready')
      })
      .catch((error) => {
        console.error(error)
        setStatus('error')
      })
  }, [id])

  useEffect(() => {
    load()
  }, [load])

  if (status === 'loading') {
    return <Loader label="Загружаем информацию о фильме…" />
  }

  if (status === 'error' || !details) {
    return <ErrorMessage message="Не получилось загрузить фильм." onRetry={load} />
  }

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
