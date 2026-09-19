// Стор хранит только ID избранных фильмов (favoriteIds: number[]), без самих данных —
// то есть здесь их нужно ДОГРУЗИТЬ из TMDB по каждому ID отдельно. Все запросы независимы
// друг от друга и их количество меняется динамически (столько, сколько сейчас в избранном) —
// это ровно случай useQueries: один хук, список queryOptions, каждый со своим кешем.

import { useQueries } from '@tanstack/react-query'
import { movieDetailsOptions } from '@/entities/movie'
import { useFavoritesStore } from '@/features/toggle-favorite'
import { MovieGrid } from '@/widgets/movie-grid'
import { Loader, ErrorMessage, EmptyState } from '@/shared/ui'

export function FavoritesPage() {
  const favoriteIds = useFavoritesStore((state) => state.favoriteIds)

  const results = useQueries({
    queries: favoriteIds.map((id) => movieDetailsOptions(id)),
  })

  const isPending = results.some((result) => result.isPending)
  const isError = results.some((result) => result.isError)
  const movies = results.map((result) => result.data).filter((movie) => movie !== undefined)

  const retry = () => results.forEach((result) => result.refetch())

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900 mb-4">Избранное</h1>

      {isPending && <Loader label="Загружаем избранное…" />}
      {!isPending && isError && (
        <ErrorMessage message="Не получилось загрузить избранные фильмы." onRetry={retry} />
      )}
      {!isPending && !isError && movies.length === 0 && (
        <EmptyState message="Пока пусто — добавляйте фильмы кнопкой ♡ в каталоге или на странице фильма." />
      )}
      {!isPending && !isError && movies.length > 0 && <MovieGrid movies={movies} />}
    </div>
  )
}
