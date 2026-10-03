export interface SeoPage {
    id: string;
    path: string;
    title: string;
    description: string;
}

export interface SeoConfig {
    siteUrl: string;
    siteName: string;
    image: string;
    pages: SeoPage[];
    notFound: SeoPage;
}

export interface PageMeta {
    title: string;
    description: string;
    /** Absolute canonical URL, null for pages that must not be indexed */
    canonical: string | null;
    /** Absolute share-image URL */
    image: string;
    robots: string | null;
}

/** Resolves the metadata of a page; unknown ids fall back to the 404 entry (noindex). */
export function buildPageMeta(seo: SeoConfig, id: string): PageMeta {
    const page = seo.pages.find((p) => p.id === id);
    const image = `${seo.siteUrl}${seo.image}`;

    if (!page) {
        return {
            title: seo.notFound.title,
            description: seo.notFound.description,
            canonical: null,
            image,
            robots: 'noindex',
        };
    }

    return {
        title: page.title,
        description: page.description,
        canonical: page.path === '/' ? `${seo.siteUrl}/` : `${seo.siteUrl}${page.path}`,
        image,
        robots: null,
    };
}
