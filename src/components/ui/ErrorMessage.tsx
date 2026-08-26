// Общее сообщение об ошибке. onRetry — необязательный проп: если передали функцию,
// показываем кнопку "Повторить", если нет — просто текст без кнопки.
// Такой опциональный колбэк-проп — обычный способ сделать компонент гибким:
// он ничего не знает о ТОМ, как повторить запрос, просто вызывает то, что дали.

interface ErrorMessageProps {
  message?: string
  onRetry?: () => void
}

export function ErrorMessage({
  message = 'Что-то пошло не так. Попробуйте ещё раз.',
  onRetry,
}: ErrorMessageProps) {
  return (
    <div className="text-center py-16">
      <p className="text-red-600 mb-3">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="text-sm px-4 py-2 rounded-md border border-red-300 text-red-700 hover:bg-red-50 transition-colors"
        >
          Повторить
        </button>
      )}
    </div>
  )
}
