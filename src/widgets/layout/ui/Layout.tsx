// Outlet — специальный компонент React Router: сюда подставляется
// содержимое той страницы (Route), которая сейчас открыта.
import { Outlet } from 'react-router-dom'
import { Header } from '@/widgets/header'
import { Footer } from '@/widgets/footer'

export function Layout() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />
      <main className="max-w-5xl mx-auto px-4 py-6 flex-1 w-full">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
