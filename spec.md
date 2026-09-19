# Spec: Кино-галерея

Техническая спецификация проекта — источник правды по стеку, архитектуре, контрактам данных и
конвенциям. Используется как опора при дальнейшей разработке.

> **Статус миграции:** выполнено. Код в `src/` реализован по FSD-структуре, описанной ниже, с
> TanStack Query для серверного состояния. §7 «Карта миграции» оставлена как справка о том,
> что из старой плоской структуры куда переехало.

## 1. Назначение и объём

Каталог фильмов в духе Кинопоиска: просмотр популярных фильмов, поиск, фильтр по жанру, страница
фильма (актёры, трейлер), избранное с сохранением между визитами. Данные — TMDB API.

**Сознательно не входит (пока):**
- Авторизация и облачное хранение избранного (только `localStorage`).
- Отзывы/рейтинги от пользователя.
- Тесты (см. §13 — статус тестирования).
- SSR/Next.js.

## 2. Стек и версии

| Слой | Технология | Версия (package.json) |
| --- | --- | --- |
| Язык | TypeScript | ~6.0.2 |
| UI | React | ^19.2.8 |
| Роутинг | React Router (`react-router-dom`) | ^7.18.2 |
| Серверное состояние | **TanStack Query** (`@tanstack/react-query`) | ^5.103.1 |
| Клиентское состояние | Zustand (+ `persist` middleware) | ^5.0.15 |
| Стили | Tailwind CSS (`@tailwindcss/vite`) | ^4.3.3 |
| Сборка | Vite | ^8.2.2 |
| Линтер | oxlint | ^1.79.0 |
| Внешний API | TMDB API v3 | — |

Package manager: npm (есть `package-lock.json`).

## 3. Команды

```
npm install        # установка зависимостей
npm run dev          # dev-сервер (http://localhost:5173)
npm run build        # tsc -b (type-check) && vite build
npm run lint          # oxlint
npm run preview       # предпросмотр production-сборки
```

Тестового раннера в проекте нет (Vitest + RTL — в планах, фаза 2).

## 4. Переменные окружения

`.env` (не в git, см. `.env.example`):

```
VITE_TMDB_API_KEY=
```

- Обязателен для любых запросов к TMDB. Ключ — бесплатный, получается на
  themoviedb.org/settings/api.
- Читается через `import.meta.env.VITE_TMDB_API_KEY` (Vite требует префикс `VITE_` для доступа
  из браузерного кода).
- Если ключ отсутствует, `tmdbFetch` (см. §6) бросает исключение с понятным русским текстом
  ошибки ещё до похода в сеть — приложение не должно падать молча.

## 5. Архитектура: Feature-Sliced Design

Проект организован по [FSD](https://feature-sliced.design/) — слоями сверху вниз, каждый слой
видит только нижестоящие:

```
app → pages → widgets → features → entities → shared
```

### 5.1 Роль каждого слоя в этом проекте

| Слой | Роль здесь |
| --- | --- |
| `app` | Инициализация приложения: провайдеры (`QueryClientProvider`, роутер), глобальные стили, точка входа. Аналог сегодняшних `main.tsx`/`App.tsx`. |
| `pages` | Целые страницы-маршруты: `home`, `movie-details`, `favorites`, `not-found`. Каждая страница — композиция виджетов/фичей, без собственной бизнес-логики. |
| `widgets` | Самостоятельные крупные блоки интерфейса, независимые от конкретной страницы: `layout` (Header+Footer+Outlet), `movie-grid` (сетка карточек + пагинация/подгрузка). |
| `features` | Действия пользователя, меняющие состояние: `search-movies` (?q= в URL), `filter-by-genre` (?genre= в URL), `toggle-favorite` (кнопка + Zustand-стор избранного). |
| `entities` | Бизнес-сущности домена и работа с ними: `movie` (карточка, типы, TanStack Query-запросы к TMDB), `genre`, `cast`, `video`. |
| `shared` | Переиспользуемое, не знающее о домене: `shared/api` (`tmdbFetch`, `images.ts`), `shared/ui` (`Loader`, `ErrorMessage`, `EmptyState`), `shared/lib` (хуки-утилиты, напр. debounce), `shared/config` (доступ к env). |

### 5.2 Правила импортов

- Слой может импортировать только из слоёв **строго ниже** себя: `pages` → `widgets`/`features`/`entities`/`shared`, но не наоборот, и не `pages` → `pages`.
- Срезы одного слоя **не импортируют друг друга напрямую** (например, `features/toggle-favorite` не должен импортировать `features/filter-by-genre`) — общее выносится на слой ниже (`entities`/`shared`).
- Каждый срез (`entities/movie`, `features/toggle-favorite` и т.д.) открывает наружу только `index.ts` (публичный API среза) — импорт вида `entities/movie/api/queries` из другого среза запрещён, только `entities/movie` → всё, что реально нужно снаружи, реэкспортировано из `index.ts`.
- Импорты — по алиасу `@/` от `src` (например `@/entities/movie`), не относительными путями через слои. Настроено в `tsconfig.app.json` (`compilerOptions.paths`) и `vite.config.ts` (`resolve.alias`).
- Рекомендация (пока не сделано): подключить [Steiger](https://github.com/feature-sliced/steiger) (официальный линтер границ FSD) — oxlint эти правила не проверяет.

### 5.3 Целевая структура проекта

```
src/
  app/
    providers/
      QueryProvider.tsx     — QueryClientProvider + инициализация QueryClient
      router.tsx             — сборка AppRouter (маршруты объявлены в pages/*)
    styles/
      index.css              — то, что сейчас index.css (шрифт, base-стили body)
    App.tsx                  — точка сборки всех провайдеров
  main.tsx                   — монтирование React в DOM

  pages/
    home/
      ui/HomePage.tsx
      index.ts
    movie-details/
      ui/MovieDetailsPage.tsx
      index.ts
    favorites/
      ui/FavoritesPage.tsx
      index.ts
    not-found/
      ui/NotFoundPage.tsx
      index.ts

  widgets/
    layout/
      ui/Layout.tsx          — Header + Outlet + Footer
      index.ts
    header/
      ui/Header.tsx
      index.ts
    footer/
      ui/Footer.tsx          — TMDB-атрибуция
      index.ts
    movie-grid/
      ui/MovieGrid.tsx       — сетка MovieCard + пагинация/"загрузить ещё"
      index.ts

  features/
    search-movies/
      ui/SearchBar.tsx       — пишет ?q= через useSearchParams
      index.ts
    filter-by-genre/
      ui/GenreFilter.tsx     — пишет ?genre= через useSearchParams, читает entities/genre
      index.ts
    toggle-favorite/
      ui/FavoriteButton.tsx
      model/favoritesStore.ts — Zustand + persist (см. §9)
      index.ts

  entities/
    movie/
      api/
        queries.ts            — фабрика ключей + queryOptions на базе TanStack Query (см. §6)
      model/
        types.ts               — Movie, MovieDetails, PaginatedResponse<T>
      ui/
        MovieCard.tsx
      index.ts
    genre/
      api/queries.ts           — getGenres как useQuery
      model/types.ts            — Genre
      index.ts
    cast/
      api/queries.ts           — getMovieCredits как useQuery
      model/types.ts             — CastMember
      ui/CastList.tsx
      index.ts
    video/
      api/queries.ts           — getMovieVideos как useQuery
      model/types.ts             — Video
      ui/TrailerEmbed.tsx
      index.ts

  shared/
    api/
      client.ts                — tmdbFetch<T>() (без изменений в поведении)
      images.ts                 — posterUrl()
    ui/
      Loader.tsx
      ErrorMessage.tsx
      EmptyState.tsx
    lib/
      useDebouncedValue.ts       — вынести debounce поиска сюда, если сейчас инлайн в SearchBar
    config/
      env.ts                     — единая точка чтения import.meta.env
```

## 6. API-слой и серверное состояние (TanStack Query)

### 6.1 Разделение ответственности

- **`shared/api/client.ts`** — низкоуровневый `tmdbFetch<T>(endpoint, params?)`, ровно та же
  функция, что сегодня в `src/api/client.ts`: базовый URL, подстановка `api_key` и
  `language=ru-RU`, обработка не-OK ответа. Ничего не знает про React Query.
- **`entities/*/api/queries.ts`** — здесь появляется TanStack Query. Для каждой сущности — фабрика
  query keys и `queryOptions()` (TanStack Query v5), которые уже внутри вызывают функции на базе
  `tmdbFetch`. Пример по аналогии с текущим `getPopularMovies`:

  ```typescript
  // entities/movie/api/queries.ts
  export const movieKeys = {
    all: ['movies'] as const,
    popular: (page: number) => [...movieKeys.all, 'popular', page] as const,
    byGenre: (genreId: number, page: number) => [...movieKeys.all, 'genre', genreId, page] as const,
    search: (query: string, page: number) => [...movieKeys.all, 'search', query, page] as const,
    detail: (id: number | string) => [...movieKeys.all, 'detail', id] as const,
  }

  export const popularMoviesOptions = (page: number) =>
    queryOptions({
      queryKey: movieKeys.popular(page),
      queryFn: () => tmdbFetch<PaginatedResponse<Movie>>('/movie/popular', { page: String(page) }),
    })
  ```

  Страницы/виджеты вызывают `useQuery(popularMoviesOptions(page))` — не ходят в `tmdbFetch`
  напрямую.
- **`app/providers/QueryProvider.tsx`** — единственное место создания `QueryClient` (один инстанс
  на приложение) и оборачивания дерева в `QueryClientProvider`.

### 6.2 Таблица TMDB-эндпоинтов (контракт не меняется при миграции)

| Запрос | TMDB endpoint | Возвращает | Где живёт |
| --- | --- | --- | --- |
| Популярные фильмы | `GET /movie/popular` | `PaginatedResponse<Movie>` | `entities/movie` |
| Поиск по названию | `GET /search/movie` | `PaginatedResponse<Movie>` | `entities/movie` |
| Детали фильма | `GET /movie/{id}` | `MovieDetails` | `entities/movie` |
| Актёры | `GET /movie/{id}/credits` | `{ cast: CastMember[] }` | `entities/cast` |
| Видео/трейлеры | `GET /movie/{id}/videos` | `{ results: Video[] }` | `entities/video` |
| Список жанров | `GET /genre/movie/list` | `{ genres: Genre[] }` | `entities/genre` |
| Фильтр по жанру | `GET /discover/movie` (`with_genres`, `sort_by=popularity.desc`) | `PaginatedResponse<Movie>` | `entities/movie` |

Важный нюанс сохраняется: фильтр по жанру **без** текста поиска идёт через `/discover/movie`, а
не `/search/movie` — у последнего нет параметра `with_genres`.

`shared/api/images.ts` — `posterUrl(path, size?)` — без изменений, собирает
`https://image.tmdb.org/t/p/{size}{path}`, возвращает `null` при отсутствии постера.

### 6.3 Что даёт переход на TanStack Query

- Кеширование по `queryKey` — переход между страницами и назад не бьёт TMDB повторно за те же
  данные.
- Убирает ручной `useState`-тройку (data/loading/error) со страниц — состояние загрузки/ошибки
  приходит из `useQuery` (`isPending`, `isError`, `error`, `refetch`) и пробрасывается в
  `shared/ui` компоненты (`Loader`/`ErrorMessage` с `onRetry={refetch}`).
- Страница `favorites`: вместо ручного `Promise.all` по каждому `favoriteId` — параллельные
  запросы через `useQueries` на основе `movieKeys.detail(id)` для каждого `id` из
  `favoritesStore`.
- Инвалидация не нужна почти нигде в этом проекте (данные TMDB статичны в рамках сессии) — не
  вводить `staleTime: 0`/агрессивный рефетч без причины, разумный дефолт (`staleTime` в
  несколько минут) достаточен.

## 7. Карта миграции (текущая структура → целевая FSD)

| Сейчас | Станет |
| --- | --- |
| `src/api/client.ts` | `src/shared/api/client.ts` |
| `src/api/images.ts` | `src/shared/api/images.ts` |
| `src/api/movies.ts` | разбивается по сущностям: `entities/movie/api/queries.ts`, `entities/genre/api/queries.ts` |
| `src/types/movie.ts` | разбивается: `entities/movie/model/types.ts` (Movie, MovieDetails, PaginatedResponse), `entities/genre/model/types.ts` (Genre), `entities/cast/model/types.ts` (CastMember), `entities/video/model/types.ts` (Video) |
| `src/components/layout/*` | `src/widgets/layout`, `src/widgets/header`, `src/widgets/footer` |
| `src/components/movies/MovieCard.tsx` | `entities/movie/ui/MovieCard.tsx` |
| `src/components/movies/MovieGrid.tsx` | `widgets/movie-grid/ui/MovieGrid.tsx` |
| `src/components/movies/FavoriteButton.tsx` | `features/toggle-favorite/ui/FavoriteButton.tsx` |
| `src/components/movies/CastList.tsx` | `entities/cast/ui/CastList.tsx` |
| `src/components/movies/TrailerEmbed.tsx` | `entities/video/ui/TrailerEmbed.tsx` |
| `src/components/catalog/SearchBar.tsx` | `features/search-movies/ui/SearchBar.tsx` |
| `src/components/catalog/GenreFilter.tsx` | `features/filter-by-genre/ui/GenreFilter.tsx` |
| `src/components/ui/*` | `src/shared/ui/*` |
| `src/pages/*` | `src/pages/<page-name>/ui/*Page.tsx`, каждая — свой срез с `index.ts` |
| `src/router/AppRouter.tsx` | `src/app/providers/router.tsx` (маршруты продолжают ссылаться на `pages/*`) |
| `src/store/favoritesStore.ts` | `features/toggle-favorite/model/favoritesStore.ts` |
| `src/App.tsx` / `src/main.tsx` | `src/app/App.tsx` (+ `QueryProvider`) / `src/main.tsx` (без изменений по сути) |

Перенос выполнен целиком — таблица выше служит только объяснением "почему файл лежит именно
здесь", если понадобится сослаться на дореформенную структуру.

## 8. Роутинг

| Путь | Страница (срез `pages/`) | Назначение |
| --- | --- | --- |
| `/` | `pages/home` | популярные фильмы, поиск, фильтр по жанру |
| `/movie/:id` | `pages/movie-details` | детали фильма, актёры, трейлер |
| `/favorites` | `pages/favorites` | список избранных |
| `*` | `pages/not-found` | 404, обязательно последним маршрутом |

Таблица маршрутов собирается в `app/providers/router.tsx`, но сами компоненты страниц — обычные
экспорты из соответствующих срезов `pages/*`. Все маршруты вложены в `widgets/layout` (Header +
Outlet + Footer общие для всех страниц). `:id` читается через `useParams()`.

## 9. Управление состоянием — три источника, три причины

Три разных механизма состояния — осознанный выбор под конкретную природу данных, не смешивать:

1. **Серверное состояние → TanStack Query** (`entities/*/api/queries.ts`). Всё, что приходит из
   TMDB: список фильмов, детали, актёры, видео, жанры. Никогда не копировать результат `useQuery`
   в `useState`/Zustand «про запас» — источник истины один.
2. **Состояние URL → `useSearchParams`** (`features/search-movies`, `features/filter-by-genre`).
   Поиск (`?q=`) и фильтр по жанру (`?genre=`) — должны быть шаримыми по ссылке
   (`/?q=matrix&genre=28`). Год фильтра, если будет добавлен, — тоже сюда (`?year=`).
3. **Клиентское состояние → Zustand** (`features/toggle-favorite/model/favoritesStore.ts`).
   Только избранное — единственный случай в проекте, когда одни и те же данные (`favoriteIds`)
   нужны одновременно в независимых компонентах (кнопка на карточке, кнопка на странице фильма,
   список на `/favorites`), а не в дереве, где помог бы просто проп.

**Контракт стора (без изменений при миграции):**

```typescript
interface FavoritesState {
  favoriteIds: number[]
  addFavorite: (id: number) => void
  removeFavorite: (id: number) => void
  toggleFavorite: (id: number) => void
  isFavorite: (id: number) => boolean
}
```

- Стор хранит только `id` фильмов, не сами объекты — полные данные по каждому избранному
  запрашиваются через `useQueries` на `entities/movie` (см. §6.3), а не дублируются в сторе.
- Обёрнут в `persist` middleware, ключ в `localStorage` — `movie-gallery-favorites`.
- Новое состояние по умолчанию не кладём в Zustand: сначала проверяем — это не данные с сервера
  (→ TanStack Query) и не шаримый по ссылке фильтр (→ URL)?

## 10. UI-кит и общие состояния (`shared/ui`)

- Tailwind CSS v4 через `@tailwindcss/vite` — конфиг-файла Tailwind нет, всё через Vite-плагин.
- Стили — утилитарные классы прямо в JSX. `app/styles/index.css` только для шрифта и базовых
  стилей `body`.
- `shared/ui`: `Loader` (загрузка), `ErrorMessage` (ошибка, с `onRetry` — прокидывается
  `refetch` из `useQuery`), `EmptyState` (пусто/ничего не найдено). Любая страница, которая
  показывает данные из `useQuery`, обязана обрабатывать все три состояния этим набором
  компонентов, а не писать свою реализацию.

## 11. Линтинг, типизация, границы слоёв

- oxlint (`.oxlintrc.json`), плагины `react`, `typescript`, `oxc`. Ключевые правила:
  `react/rules-of-hooks: error`, `react/only-export-components: warn`.
- TypeScript strict-режим де-факто через `noUnusedLocals`, `noUnusedParameters`,
  `noFallthroughCasesInSwitch`, `erasableSyntaxOnly` в `tsconfig.app.json`. `npm run build`
  прогоняет `tsc -b` перед сборкой — билд падает при любой ошибке типов.
- Границы FSD (правила §5.2) oxlint не проверяет — стоит добавить
  [Steiger](https://github.com/feature-sliced/steiger) отдельным шагом в `npm run lint` (пока
  не подключён).

## 12. Тестирование — текущий статус

Тестов пока нет. Плановый стек (фаза 2, не реализовано): Vitest + React Testing Library. При
появлении тесты должны лежать рядом со срезом (`entities/movie/ui/MovieCard.test.tsx` и т.п.), а
не в отдельном параллельном дереве.

## 13. Внешние зависимости рантайма

- **TMDB API** (`https://api.themoviedb.org/3`) — единственный источник данных, требует ключ.
  Обязательна атрибуция TMDB в футере (`widgets/footer`) — продукт использует TMDB API, но не
  одобрен и не сертифицирован TMDB.
- **TMDB image CDN** (`https://image.tmdb.org/t/p`) — постеры.
- **YouTube** — встраивание трейлера через iframe по `key` видео из запроса `entities/video`.

## 14. Известные будущие направления (не делать сейчас без запроса)

- Подключить Steiger (см. §5.2, §11) для автоматической проверки границ слоёв FSD.
- Vitest + React Testing Library для ключевых компонентов и хуков.
- Миграция избранного на Supabase/Firebase + авторизация (вместо `localStorage`).

Эти пункты — контекст на будущее, а не текущие задачи; не начинать реализацию без явного запроса
пользователя.
