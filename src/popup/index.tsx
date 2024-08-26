import { ThemeProvider } from '@/components/theme-provider'
import { createRoot } from 'react-dom/client'
import '../index.css'
import Popup from './Popup'

function init() {
  const appContainer = document.querySelector('#app-container')
  if (!appContainer) {
    throw new Error('Can not find #app-container')
  }
  const root = createRoot(appContainer)
  root.render(
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <div className="flex flex-col items-center p-5 w-[400px] h-[600px] bg-background text-foreground">
        <Popup />
      </div>
    </ThemeProvider>,
  )
}

init()
