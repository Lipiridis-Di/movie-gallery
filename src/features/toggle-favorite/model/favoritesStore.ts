// Zustand-хранилище для избранных фильмов.
// Зачем global state, а не useState: страница фильма (кнопка "в избранное")
// и страница "Избранное" — это два разных компонента, и им обоим нужны одни и те же данные.
// useState живёт только внутри одного компонента, поэтому здесь нужно что-то "общее".
//
// Стор хранит только ID, не сами объекты фильмов — полные данные по каждому избранному
// фильму запрашиваются через TanStack Query (см. pages/favorites), а не дублируются здесь.

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface FavoritesState {
  favoriteIds: number[]
  addFavorite: (id: number) => void
  removeFavorite: (id: number) => void
  toggleFavorite: (id: number) => void
  isFavorite: (id: number) => boolean
}

export const useFavoritesStore = create<FavoritesState>()(
  // persist — middleware, которое само сохраняет стор в localStorage
  // и восстанавливает его при следующем открытии сайта.
  persist(
    (set, get) => ({
      favoriteIds: [],

      addFavorite: (id) =>
        set((state) => ({
          favoriteIds: state.favoriteIds.includes(id)
            ? state.favoriteIds
            : [...state.favoriteIds, id],
        })),

      removeFavorite: (id) =>
        set((state) => ({
          favoriteIds: state.favoriteIds.filter((favoriteId) => favoriteId !== id),
        })),

      toggleFavorite: (id) => {
        const { isFavorite, addFavorite, removeFavorite } = get()
        if (isFavorite(id)) {
          removeFavorite(id)
        } else {
          addFavorite(id)
        }
      },

      isFavorite: (id) => get().favoriteIds.includes(id),
    }),
    { name: 'movie-gallery-favorites' }, // ключ, под которым данные лежат в localStorage
  ),
)
