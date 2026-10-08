// Preloads of a lazily loaded page (LOT 4, A0), read from Vite's build manifest
// (dist/.vite/manifest.json): the page chunk, the chunks it imports and their
// stylesheets. The entry chunk is skipped: index.html already loads it.

/**
 * @param {Record<string, { file: string, css?: string[], imports?: string[], isEntry?: boolean }>} manifest
 * @param {string} source manifest key of the page module (e.g. 'src/pages/About/About.tsx')
 * @returns {{ scripts: string[], styles: string[] }} files relative to dist/, in load order
 */
export function collectPreloads(manifest, source) {
    if (!manifest[source]) throw new Error(`preloads: « ${source} » absent du manifeste Vite`);
    const scripts = [];
    const styles = [];
    const seen = new Set();
    const visit = (key) => {
        const chunk = manifest[key];
        if (!chunk || chunk.isEntry || seen.has(key)) return;
        seen.add(key);
        scripts.push(chunk.file);
        for (const file of chunk.css ?? []) if (!styles.includes(file)) styles.push(file);
        for (const imported of chunk.imports ?? []) visit(imported);
    };
    visit(source);
    return { scripts, styles };
}

/** HTML tags for <head>: stylesheets first (they block the page's first paint), then module preloads. */
export function preloadTags({ scripts, styles }, base = '/') {
    return [
        ...styles.map((file) => `<link rel="stylesheet" crossorigin href="${base}${file}">`),
        ...scripts.map((file) => `<link rel="modulepreload" crossorigin href="${base}${file}">`),
    ];
}
