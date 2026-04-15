import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
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
    basename: "/Portfolio" // <--- AJOUTE CE BLOC ICI (après le tableau des routes)
});

const App: React.FC = () => {
    return <RouterProvider router={router} />;
};

export default App;
