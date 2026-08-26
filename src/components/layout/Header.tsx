// NavLink — как обычная ссылка <a>, но React Router не перезагружает страницу
// и умеет подсвечивать активную ссылку через isActive.
import { NavLink } from 'react-router-dom'

const linkClasses = ({ isActive }: { isActive: boolean }) =>
  `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
    isActive ? 'bg-white text-slate-900' : 'text-slate-300 hover:text-white'
  }`

export function Header() {
  return (
    <header className="bg-slate-900 sticky top-0 z-10">
      <div className="max-w-5xl mx-auto flex items-center justify-between px-4 py-3">
        <NavLink to="/" className="text-white font-semibold text-lg tracking-tight">
          🎬 Кино-галерея
        </NavLink>
        <nav className="flex gap-1">
          <NavLink to="/" end className={linkClasses}>
            Каталог
          </NavLink>
          <NavLink to="/favorites" className={linkClasses}>
            Избранное
          </NavLink>
        </nav>
      </div>
    </header>
  )
}
