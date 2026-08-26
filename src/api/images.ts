// TMDB не отдаёт готовые ссылки на картинки — только относительный путь вроде "/abc123.jpg"
// в поле poster_path. Полный URL собирается так: <базовый адрес CDN> + <размер> + <путь>.
// Размеры (w200, w342, w500, w780, original) — фиксированный список TMDB, чем больше число,
// тем тяжелее файл. Для карточек в сетке w342 — разумный баланс качества и веса.

const IMAGE_CDN = 'https://image.tmdb.org/t/p'

export function posterUrl(path: string | null, size: 'w200' | 'w342' | 'w500' = 'w342') {
  if (!path) return null
  return `${IMAGE_CDN}/${size}${path}`
}
