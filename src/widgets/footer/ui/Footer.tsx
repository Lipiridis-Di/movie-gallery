// TMDB требует указывать атрибуцию у любого проекта, использующего их API/данные —
// обсуждали это в самом начале. Простой текстовый вариант внизу каждой страницы.

export function Footer() {
  return (
    <footer className="border-t border-slate-200 mt-12">
      <div className="max-w-5xl mx-auto px-4 py-6 text-xs text-slate-400 text-center">
        Этот продукт использует TMDB API, но не одобрен и не сертифицирован TMDB.
      </div>
    </footer>
  )
}
