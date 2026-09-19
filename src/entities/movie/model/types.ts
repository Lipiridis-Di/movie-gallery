// Описания "формы" данных о фильмах, которые мы получаем от TMDB API.

// Один фильм в списке (каталог, поиск, избранное)
export interface Movie {
  id: number
  title: string
  poster_path: string | null // постера может не быть
  release_date: string // формат "2024-03-15"
  vote_average: number // рейтинг, например 7.8
  genre_ids: number[] // список ID жанров
}

// Подробная информация о фильме (страница фильма).
// "extends Movie" значит: MovieDetails содержит все поля Movie + ещё вот эти.
export interface MovieDetails extends Movie {
  overview: string // описание
  runtime: number // длительность в минутах
  genres: { id: number; name: string }[] // здесь уже не ID, а полные объекты жанров
}

// TMDB почти всегда возвращает списки в таком "конверте" с пагинацией.
// <T> — дженерик: один и тот же конверт подходит для списка фильмов и для любого другого списка.
export interface PaginatedResponse<T> {
  page: number
  results: T[]
  total_pages: number
  total_results: number
}
