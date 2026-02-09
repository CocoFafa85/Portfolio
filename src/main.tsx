import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { router } from './routes'
import { MatrixProvider } from './core/context/MatrixContext'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <MatrixProvider>
            <RouterProvider router={router} />
        </MatrixProvider>
    </React.StrictMode>,
)
