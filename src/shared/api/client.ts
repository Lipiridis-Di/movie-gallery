// Общая "обёртка" над fetch для похода в TMDB.
// Идея: остальной код не должен знать детали запроса (адрес, ключ, обработка ошибок) —
// он просто вызывает функцию вроде getPopularMovies() и получает готовый результат.

import { TMDB_API_KEY } from '@/shared/config/env'

const BASE_URL = 'https://api.themoviedb.org/3'

export async function tmdbFetch<T>(
  endpoint: string,
  params: Record<string, string> = {},
): Promise<T> {
  if (!TMDB_API_KEY) {
    throw new Error(
      'Не найден VITE_TMDB_API_KEY. Скопируйте .env.example в .env и вставьте свой ключ TMDB.',
    )
  }

  const url = new URL(BASE_URL + endpoint)
  url.searchParams.set('api_key', TMDB_API_KEY)
  url.searchParams.set('language', 'ru-RU') // сразу просим данные на русском, TMDB это умеет
  Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value))

  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`Запрос к TMDB не удался: ${response.status} ${response.statusText}`)
  }

  return response.json() as Promise<T>
}
