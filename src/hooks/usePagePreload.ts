import { useEffect } from 'react';
import { pageRoute, preloadPage } from '../pages/lazyPages';

/**
 * Loads an inner page's chunk on intent (LOT 4, A0): a pointer over a link
 * to it, or the keyboard focus on that link — hundreds of ms before the
 * click, on top of the trip's own half-way swap. Never at idle: loading every
 * page then inserted their stylesheets mid-load and re-rendered the home page
 * (its gate link became a late LCP). Mounted once, in MainLayout.
 */
export function usePagePreload(): void {
    useEffect(() => {
        const onIntent = (event: Event) => {
            const link = event.target instanceof Element ? event.target.closest('a[href]') : null;
            if (link instanceof HTMLAnchorElement && link.origin === window.location.origin) {
                preloadPage(pageRoute(link.pathname)).catch(() => undefined);
            }
        };
        document.addEventListener('pointerover', onIntent, { passive: true });
        document.addEventListener('focusin', onIntent);
        return () => {
            document.removeEventListener('pointerover', onIntent);
            document.removeEventListener('focusin', onIntent);
        };
    }, []);
}
