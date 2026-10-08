import { describe, expect, it } from 'vitest';
import { parseEmphasis, parseInlineLinks, splitParagraphs } from './story';

describe('splitParagraphs', () => {
    it('makes one paragraph per line and drops empty lines', () => {
        // Arrange
        const text = 'Né aux Sables-d\'Olonne.\n\nPassionné par les sports.\n  Après le bac.  ';

        // Act
        const paragraphs = splitParagraphs(text);

        // Assert
        expect(paragraphs).toEqual(['Né aux Sables-d\'Olonne.', 'Passionné par les sports.', 'Après le bac.']);
    });
});

describe('parseInlineLinks', () => {
    it('keeps a paragraph without link as one text run', () => {
        // Arrange / Act
        const segments = parseInlineLinks('Mon objectif à long terme est de gérer un SI complet.');

        // Assert
        expect(segments).toEqual([{ kind: 'text', text: 'Mon objectif à long terme est de gérer un SI complet.' }]);
    });

    it('cuts the text around a link, punctuation kept outside', () => {
        // Arrange
        const paragraph = 'Retrouvez mon parcours sur [LinkedIn](https://www.linkedin.com/in/corentin-fanic-832630293).';

        // Act
        const segments = parseInlineLinks(paragraph);

        // Assert
        expect(segments).toEqual([
            { kind: 'text', text: 'Retrouvez mon parcours sur ' },
            { kind: 'link', text: 'LinkedIn', href: 'https://www.linkedin.com/in/corentin-fanic-832630293' },
            { kind: 'text', text: '.' },
        ]);
    });

    it('reads a label with parentheses and a link at the very start', () => {
        // Arrange
        const paragraph = '[Rugby Club Sablais (R.C.S.)](https://rc-sablais.ffr.fr/) puis [DevOps](https://www.opiiec.fr/metiers/139882-specialiste-devops#:~:text=Finalit%C3%A9)';

        // Act
        const segments = parseInlineLinks(paragraph);

        // Assert
        expect(segments).toEqual([
            { kind: 'link', text: 'Rugby Club Sablais (R.C.S.)', href: 'https://rc-sablais.ffr.fr/' },
            { kind: 'text', text: ' puis ' },
            { kind: 'link', text: 'DevOps', href: 'https://www.opiiec.fr/metiers/139882-specialiste-devops#:~:text=Finalit%C3%A9' },
        ]);
    });

    it('leaves a non-http address and a broken link as plain text', () => {
        // Arrange
        const paragraph = 'Voir [ici](javascript:alert(1)) ou [là](https://';

        // Act
        const segments = parseInlineLinks(paragraph);

        // Assert
        expect(segments).toEqual([{ kind: 'text', text: paragraph }]);
    });
});

describe('parseEmphasis', () => {
    it('separates keywords written **like this** from the plain text, in order', () => {
        // Arrange
        const text = 'Composants (**React**, **Angular**) et typage strict.';

        // Act
        const segments = parseEmphasis(text);

        // Assert
        expect(segments).toEqual([
            { kind: 'text', text: 'Composants (' },
            { kind: 'keyword', text: 'React' },
            { kind: 'text', text: ', ' },
            { kind: 'keyword', text: 'Angular' },
            { kind: 'text', text: ') et typage strict.' },
        ]);
    });

    it('leaves an unclosed marker as plain text', () => {
        // Arrange
        const text = 'Un **mot sans fin';

        // Act
        const segments = parseEmphasis(text);

        // Assert
        expect(segments).toEqual([{ kind: 'text', text: 'Un **mot sans fin' }]);
    });
});
