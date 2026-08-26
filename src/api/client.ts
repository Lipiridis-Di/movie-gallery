// Общая "обёртка" над fetch для похода в TMDB.
// Идея: остальной код не должен знать детали запроса (адрес, ключ, обработка ошибок) —
// он просто вызывает функцию вроде getPopularMovies() и получает готовый результат.

const BASE_URL = 'https://api.themoviedb.org/3'

// Vite подставляет сюда значение из .env (переменная должна начинаться с VITE_,
// иначе Vite не даст доступ к ней из кода браузера — это защита от случайной утечки секретов).
const API_KEY = import.meta.env.VITE_TMDB_API_KEY as string | undefined

export async function tmdbFetch<T>(
  endpoint: string,
  params: Record<string, string> = {},
): Promise<T> {
  if (!API_KEY) {
    throw new Error(
      'Не найден VITE_TMDB_API_KEY. Скопируйте .env.example в .env и вставьте свой ключ TMDB.',
    )
  }

  const url = new URL(BASE_URL + endpoint)
  url.searchParams.set('api_key', API_KEY)
  url.searchParams.set('language', 'ru-RU') // сразу просим данные на русском, TMDB это умеет
  Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value))

  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`Запрос к TMDB не удался: ${response.status} ${response.statusText}`)
  }

  return response.json() as Promise<T>
}
