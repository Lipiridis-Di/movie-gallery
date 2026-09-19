// Таблица маршрутов: "какой адрес — какая страница".
// Route с path="/" вложен в Layout — значит на всех страницах будет общий Header/Footer.
// path="*" в самом низу — "мусорная корзина" для всего, что не совпало выше; React Router
// проверяет маршруты по порядку и берёт первый подходящий, поэтому "*" обязательно последний.
import { Route, Routes } from 'react-router-dom'
import { Layout } from '@/widgets/layout'
import { HomePage } from '@/pages/home'
import { MovieDetailsPage } from '@/pages/movie-details'
import { FavoritesPage } from '@/pages/favorites'
import { NotFoundPage } from '@/pages/not-found'

export function AppRouter() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/movie/:id" element={<MovieDetailsPage />} />
        <Route path="/favorites" element={<FavoritesPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
