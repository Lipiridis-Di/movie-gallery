// Описания "формы" данных, которые мы получаем от TMDB API.
// Это не меняет поведение кода, но даёт подсказки редактора и защиту от опечаток в названиях полей.

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
  genres: Genre[] // здесь уже не ID, а полные объекты жанров
}

export interface Genre {
  id: number
  name: string
}

export interface CastMember {
  id: number
  name: string
  character: string // какую роль играет
  profile_path: string | null
}

export interface Video {
  id: string
  key: string // ID видео на YouTube
  site: string // "YouTube"
  type: string // "Trailer", "Teaser" и т.д.
}

// TMDB почти всегда возвращает списки в таком "конверте" с пагинацией.
// <T> — дженерик: один и тот же конверт подходит для списка фильмов и для любого другого списка.
export interface PaginatedResponse<T> {
  page: number
  results: T[]
  total_pages: number
  total_results: number
}
