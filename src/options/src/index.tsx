import { createRoot } from 'react-dom/client'
import Options from './Options'
import '../../index.css'

function init() {
  const appContainer = document.querySelector('#app-container')
  if (!appContainer) {
    throw new Error('Can not find #app-container')
  }
  const root = createRoot(appContainer)
  root.render(
    <div className="flex flex-col items-center pt-8">
      <Options />
    </div>,
  )
}

init()
