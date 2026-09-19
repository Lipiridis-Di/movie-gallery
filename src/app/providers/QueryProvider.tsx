// Единственное место создания QueryClient на всё приложение.
// staleTime задан не нулевым: данные TMDB в рамках одной сессии практически не меняются,
// незачем рефетчить каталог заново при каждом возврате на вкладку.

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
})

export function QueryProvider({ children }: { children: ReactNode }) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}
