import '../index.css'

import Account from '@/pages/Account/index'
import Relays from '@/pages/Relays/index'
import React from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider, createHashRouter } from 'react-router-dom'
import Options from './Options'

const router = createHashRouter([
  {
    path: '/',
    element: <Options />,
    children: [
      { index: true, element: <Relays /> },
      { path: '/account', element: <Account /> },
    ],
  },
])

function init() {
  const appContainer = document.querySelector('#app-container')
  if (!appContainer) {
    throw new Error('Can not find #app-container')
  }
  const root = createRoot(appContainer)
  root.render(
    <React.StrictMode>
      <RouterProvider router={router} />
    </React.StrictMode>,
  )
}

init()
