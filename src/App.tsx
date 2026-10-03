import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { MotionConfig } from 'motion/react';
import MainLayout from './components/templates/MainLayout';
import Home from './pages/Home/Home';
import About from './pages/About/About';
import Skills from './pages/Skills/Skills';
import Projects from './pages/Projects/Projects';

const router = createBrowserRouter([
    {
        path: "/",
        element: <MainLayout />,
        children: [
            {
                index: true,
                element: <Home />,
            },
            {
                path: "about",
                element: <About />,
            },
            {
                path: "skills",
                element: <Skills />,
            },
            {
                path: "projects",
                element: <Projects />,
            },
        ],
    },
], {
    basename: import.meta.env.BASE_URL // Suit automatiquement le `base` de vite.config.ts
});

const App: React.FC = () => {
    return (
        // "user": transform/layout animations are skipped when the OS asks for reduced motion
        <MotionConfig reducedMotion="user">
            <RouterProvider router={router} />
        </MotionConfig>
    );
};

export default App;
