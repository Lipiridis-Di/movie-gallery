// Общее "здесь пока пусто" — для случая, когда запрос прошёл успешно,
// но данных всё равно нет (ничего не нашли, избранное пустое и т.п.).
// Это НЕ ошибка (status !== 'error'), поэтому отдельный компонент, а не переиспользование ErrorMessage.

interface EmptyStateProps {
  message: string
}

export function EmptyState({ message }: EmptyStateProps) {
  return (
    <div className="text-center py-16 text-slate-500">
      <p>{message}</p>
    </div>
  )
}
