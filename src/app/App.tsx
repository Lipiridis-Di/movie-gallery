import { QueryProvider } from './providers/QueryProvider'
import { AppRouter } from './providers/router'

export function App() {
  return (
    <QueryProvider>
      <AppRouter />
    </QueryProvider>
  )
}
