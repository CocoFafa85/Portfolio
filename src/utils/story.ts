/** A run of an era text (About, LOT 3, B3): plain words or a `[label](url)` link. */
export type StorySegment = { kind: 'text'; text: string } | { kind: 'link'; text: string; href: string };

const LINK = /\[([^\]]+)\]\(([^)\s]+)\)/g;
const SAFE_URL = /^https?:\/\//;

/** One paragraph per line of the text (empty lines are ignored). */
export function splitParagraphs(text: string): string[] {
    return text.split('\n').map((line) => line.trim()).filter((line) => line.length > 0);
}

/**
 * Splits a paragraph into text and links written `[label](url)`. Only
 * http(s) addresses become links: anything else stays plain text.
 */
export function parseInlineLinks(paragraph: string): StorySegment[] {
    const segments: StorySegment[] = [];
    let last = 0;
    for (const match of paragraph.matchAll(LINK)) {
        const [whole, label, href] = match;
        if (!SAFE_URL.test(href)) continue;
        if (match.index > last) segments.push({ kind: 'text', text: paragraph.slice(last, match.index) });
        segments.push({ kind: 'link', text: label, href });
        last = match.index + whole.length;
    }
    if (last < paragraph.length) segments.push({ kind: 'text', text: paragraph.slice(last) });
    return segments;
}
