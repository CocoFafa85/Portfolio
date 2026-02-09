import { createBrowserRouter } from 'react-router-dom'
import { MainLayout } from './layouts/MainLayout'
import { ProjectsPage } from './features/projects/ProjectsPage'
import { HomePage } from './features/home/HomePage'
import { AboutPage } from './features/about/AboutPage'
import { DebugData } from './features/debug/DebugData'
import { DesignSystem } from './features/debug/DesignSystem'
import { Outlet } from 'react-router-dom';

// Layout Wrapper
const LayoutWrapper = () => (
    <MainLayout>
        <Outlet />
    </MainLayout>
);

export const router = createBrowserRouter([
    {
        path: '/',
        element: <LayoutWrapper />,
        children: [
            {
                path: '/',
                element: <HomePage />,
            },
            {
                path: '/about',
                element: <AboutPage />,
            },
            {
                path: '/projects',
                element: <ProjectsPage />,
            },
            {
                path: '/debug',
                element: <DebugData />,
            },
            {
                path: '/design-system',
                element: <DesignSystem />,
            },
        ],
    },
], {
    future: {
        v7_startTransition: true,
        v7_relativeSplatPath: true,
        v7_fetcherPersist: true,
        v7_normalizeFormMethod: true,
        v7_partialHydration: true,
        v7_skipActionErrorRevalidation: true,
    } as any
});
