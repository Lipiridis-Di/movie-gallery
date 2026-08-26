// Поле поиска. Состояние живёт в двух местах одновременно, и это специально:
// - `text` (useState) — то, что человек прямо сейчас печатает, обновляется на каждую букву;
// - `?q=` в адресной строке — то, что реально уходит в запрос к API.
//
// Если писать сразу в URL на каждую букву, при вводе слова "матрица" улетит 7 отдельных
// запросов к TMDB. Debounce — это просто "подожди чуть-чуть тишины": таймер обновляет URL
// только через 400мс после того, как человек перестал печатать. Если он печатает быстрее —
// предыдущий таймер отменяется и ставится новый.

import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

export function SearchBar() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [text, setText] = useState(searchParams.get('q') ?? '')

  useEffect(() => {
    const timer = setTimeout(() => {
      // Функциональная форма setSearchParams (берёт САМЫЙ свежий URL на момент вызова,
      // а не тот, что был при рендере) — так фильтр по жанру не затрётся, если он
      // поменялся, пока человек ещё печатал.
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          if (text) {
            next.set('q', text)
          } else {
            next.delete('q')
          }
          return next
        },
        { replace: true },
      )
    }, 400)

    return () => clearTimeout(timer) // отменяем предыдущий таймер при каждой новой букве
  }, [text, setSearchParams])

  return (
    <input
      type="text"
      value={text}
      onChange={(event) => setText(event.target.value)}
      placeholder="Поиск фильмов…"
      className="w-full sm:w-72 px-3 py-2 rounded-md border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
    />
  )
}
