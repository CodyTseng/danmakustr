import '../index.css'

import Relays from '@/pages/Relays'
import React from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider, createHashRouter } from 'react-router-dom'
import Popup from './Popup'
import Account from '@/pages/Account'

const router = createHashRouter([
  {
    path: '/',
    element: <Popup />,
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
