// Страница для любого адреса, который не совпал ни с одним маршрутом в AppRouter —
// опечатка в URL, несуществующий /movie/999999999 и т.п.

import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <div className="text-center py-16">
      <h1 className="text-2xl font-semibold text-slate-900 mb-2">Страница не найдена</h1>
      <p className="text-slate-500 mb-4">Такого адреса нет в приложении.</p>
      <Link to="/" className="text-slate-700 underline hover:text-slate-900">
        Вернуться в каталог
      </Link>
    </div>
  )
}
