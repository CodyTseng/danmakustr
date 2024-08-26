import { createRoot } from 'react-dom/client'
import Options from './Options'
import '../index.css'
import { ThemeProvider } from '@/components/theme-provider'

function init() {
  const appContainer = document.querySelector('#app-container')
  if (!appContainer) {
    throw new Error('Can not find #app-container')
  }
  const root = createRoot(appContainer)
  root.render(
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <div className="flex flex-col items-center h-screen pt-8 bg-background text-foreground">
        <Options />
      </div>
    </ThemeProvider>,
  )
}

init()
