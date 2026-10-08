import { createElement, lazy, type ComponentType } from 'react';
import { pageRoute as routeOf } from '../utils/route';

type PageModule = { default: ComponentType };

export interface LazyPage {
    /** Route element: suspends only until the chunk is first loaded */
    Page: ComponentType;
    /** Loads the chunk (shared promise); rejects on failure and lets a later call retry */
    preload(): Promise<PageModule>;
}

/**
 * An inner page in its own chunk (LOT 4, A0). React.lazy alone suspends on
 * its first render even when the module is already in memory (the page then
 * showed ~250 ms late, after the trip cover had started to clear): once
 * `preload` resolved, `Page` renders the loaded component directly.
 */
export function lazyPage(load: () => Promise<PageModule>): LazyPage {
    let loaded: ComponentType | null = null;
    let pending: Promise<PageModule> | null = null;
    const preload = () => {
        pending ??= load().then(
            (module) => {
                loaded = module.default;
                return module;
            },
            (error: unknown) => {
                pending = null;
                throw error;
            }
        );
        return pending;
    };
    const Lazy = lazy(preload);
    const Page: ComponentType = () => createElement(loaded ?? Lazy);
    return { Page, preload };
}

/** Inner pages by route path (the home page stays in the main bundle: it is the LCP of the site) */
export const lazyPages: Record<string, LazyPage> = {
    '/about': lazyPage(() => import('./About/About')),
    '/skills': lazyPage(() => import('./Skills/Skills')),
    '/projects': lazyPage(() => import('./Projects/Projects')),
};

/** Route path of a pathname of this site ('/about' for '/about/' or '<base>/about') */
export const pageRoute = (pathname: string): string => routeOf(pathname, import.meta.env.BASE_URL);

/** Loads the chunk of the page at `path`; resolves at once for a page of the main bundle. */
export function preloadPage(path: string): Promise<unknown> {
    return lazyPages[path]?.preload() ?? Promise.resolve();
}

// Direct visit of an inner page: its HTML already downloaded the chunk (modulepreload);
// evaluating it now, while the main bundle starts, often has it in before React's first
// render (no fallback, no reveal in a later, separate layout). Never blocks the render.
preloadPage(pageRoute(window.location.pathname)).catch(() => undefined);
