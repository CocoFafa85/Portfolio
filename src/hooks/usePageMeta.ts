import { useEffect } from 'react';
import seo from '../data/seo.json';
import { buildPageMeta } from '../utils/seo';

const setMeta = (attribute: 'name' | 'property', key: string, value: string | null) => {
    let tag = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`);
    if (value === null) {
        tag?.remove();
        return;
    }
    if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute(attribute, key);
        document.head.appendChild(tag);
    }
    tag.content = value;
};

const setCanonical = (href: string | null) => {
    let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (href === null) {
        link?.remove();
        return;
    }
    if (!link) {
        link = document.createElement('link');
        link.rel = 'canonical';
        document.head.appendChild(link);
    }
    link.href = href;
};

/**
 * Applies the page metadata from src/data/seo.json (title, description,
 * canonical, Open Graph / Twitter, robots) when a page is displayed.
 * The same file feeds scripts/postbuild.mjs for crawlers that do not run JS.
 */
export function usePageMeta(pageId: string): void {
    useEffect(() => {
        const meta = buildPageMeta(seo, pageId);
        document.title = meta.title;
        setMeta('name', 'description', meta.description);
        setMeta('property', 'og:title', meta.title);
        setMeta('property', 'og:description', meta.description);
        setMeta('property', 'og:url', meta.canonical ?? `${seo.siteUrl}/`);
        setMeta('name', 'twitter:title', meta.title);
        setMeta('name', 'twitter:description', meta.description);
        setMeta('name', 'robots', meta.robots);
        setCanonical(meta.canonical);
    }, [pageId]);
}
