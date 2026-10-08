// Runs after `vite build`.
// 1. Writes one static HTML file per route (dist/about.html…) carrying that page's
//    own title, description, canonical and Open Graph / Twitter tags. GitHub Pages
//    serves /about from about.html with a 200 status, and link previews (LinkedIn…)
//    get the right texts without running JavaScript.
//    An inner page (its own chunk, LOT 4 A0) also gets its chunk preloaded and its
//    stylesheet linked, so a direct visit never waits for the app to request them.
// 2. Generates dist/sitemap.xml.
// Source of truth: src/data/seo.json (also used at runtime by usePageMeta).
import { readFileSync, rmSync, writeFileSync } from 'node:fs';
import { collectPreloads, preloadTags } from './preloads.mjs';

const seo = JSON.parse(readFileSync(new URL('../src/data/seo.json', import.meta.url), 'utf8'));
const distDir = new URL('../dist/', import.meta.url);
const template = readFileSync(new URL('index.html', distDir), 'utf8');
const manifestDir = new URL('.vite/', distDir);
const manifest = JSON.parse(readFileSync(new URL('manifest.json', manifestDir), 'utf8'));

// Lazily loaded pages: id in seo.json → page module (src/pages/<Name>/<Name>.tsx)
const lazyModules = {
    about: 'src/pages/About/About.tsx',
    skills: 'src/pages/Skills/Skills.tsx',
    projects: 'src/pages/Projects/Projects.tsx',
};

const escapeAttr = (value) =>
    value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const replaceTag = (html, pattern, replacement, label) => {
    if (!pattern.test(html)) {
        throw new Error(`postbuild: balise « ${label} » introuvable dans index.html`);
    }
    return html.replace(pattern, () => replacement);
};

const metaContent = (html, attribute, key, value) =>
    replaceTag(
        html,
        new RegExp(`<meta ${attribute}="${key}" content="[^"]*"\\s*/?>`),
        `<meta ${attribute}="${key}" content="${escapeAttr(value)}" />`,
        key
    );

const pageUrl = (page) => (page.path === '/' ? `${seo.siteUrl}/` : `${seo.siteUrl}${page.path}`);

const render = (page) => {
    const url = pageUrl(page);
    let html = template;
    html = replaceTag(html, /<title>[^<]*<\/title>/, `<title>${escapeAttr(page.title)}</title>`, 'title');
    html = replaceTag(html, /<link rel="canonical" href="[^"]*"\s*\/?>/, `<link rel="canonical" href="${url}" />`, 'canonical');
    html = metaContent(html, 'name', 'description', page.description);
    html = metaContent(html, 'property', 'og:title', page.title);
    html = metaContent(html, 'property', 'og:description', page.description);
    html = metaContent(html, 'property', 'og:url', url);
    html = metaContent(html, 'name', 'twitter:title', page.title);
    html = metaContent(html, 'name', 'twitter:description', page.description);
    const source = lazyModules[page.id];
    if (source) {
        const tags = preloadTags(collectPreloads(manifest, source)).map((tag) => `    ${tag}\n`).join('');
        html = replaceTag(html, /[ \t]*<\/head>/, `${tags}  </head>`, '/head');
    }
    return html;
};

for (const page of seo.pages) {
    const file = page.path === '/' ? 'index.html' : `${page.path.replace(/^\//, '')}.html`;
    writeFileSync(new URL(file, distDir), render(page));
    console.log(`postbuild: ${file} (${page.title})`);
}

const today = new Date().toISOString().slice(0, 10);
const sitemap = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...seo.pages.map((page) => `  <url><loc>${pageUrl(page)}</loc><lastmod>${today}</lastmod></url>`),
    '</urlset>',
    '',
].join('\n');
writeFileSync(new URL('sitemap.xml', distDir), sitemap);
console.log(`postbuild: sitemap.xml (${seo.pages.length} URL)`);

// The manifest was only needed here: it is not published
rmSync(manifestDir, { recursive: true, force: true });
