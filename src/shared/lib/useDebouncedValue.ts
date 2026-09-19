// "Подожди чуть-чуть тишины": возвращает значение, но с задержкой — обновляется только
// через delayMs после того, как value перестало меняться. Если value меняется быстрее —
// предыдущий таймер отменяется и ставится новый. Нужно, чтобы при вводе "матрица" в поиск
// не улетало 7 отдельных запросов к TMDB, а только один — после паузы в печати.

import { useEffect, useState } from 'react'

export function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs)
    return () => clearTimeout(timer)
  }, [value, delayMs])

  return debounced
}
