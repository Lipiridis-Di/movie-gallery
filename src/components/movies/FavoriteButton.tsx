// Вынесли кнопку "избранное" из MovieCard в отдельный компонент — она понадобилась
// в двух местах (карточка в сетке и страница фильма), а копировать одну и ту же логику
// дважды — плохая идея: если завтра захочется поменять иконку, придётся помнить
// про оба места. Один компонент — одно место для правок.

import { useFavoritesStore } from '../../store/favoritesStore'

interface FavoriteButtonProps {
  movieId: number
  // stopPropagation нужен только когда кнопка лежит ВНУТРИ кликабельной ссылки (как в MovieCard).
  // На странице фильма ссылки вокруг нет, поэтому там можно обойтись без этого.
  stopPropagation?: boolean
}

export function FavoriteButton({ movieId, stopPropagation }: FavoriteButtonProps) {
  const isFavorite = useFavoritesStore((state) => state.isFavorite(movieId))
  const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite)

  return (
    <button
      type="button"
      onClick={(event) => {
        if (stopPropagation) {
          event.preventDefault()
          event.stopPropagation()
        }
        toggleFavorite(movieId)
      }}
      aria-label={isFavorite ? 'Убрать из избранного' : 'Добавить в избранное'}
      className={`w-8 h-8 rounded-full flex items-center justify-center text-lg transition-colors ${
        isFavorite ? 'bg-rose-500 text-white' : 'bg-white/80 text-slate-600 hover:bg-white'
      }`}
    >
      {isFavorite ? '♥' : '♡'}
    </button>
  )
}
