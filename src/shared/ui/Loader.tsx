// Общий индикатор загрузки. Раньше на каждой странице был свой одинаковый
// <p className="text-slate-500">Загружаем...</p> — три копии одного и того же текста
// с разной подписью. Вынесли один раз, текст передаём пропом.

interface LoaderProps {
  label?: string
}

export function Loader({ label = 'Загрузка…' }: LoaderProps) {
  return (
    <div className="flex items-center justify-center gap-3 py-16 text-slate-500">
      <span className="w-5 h-5 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
      <span>{label}</span>
    </div>
  )
}
