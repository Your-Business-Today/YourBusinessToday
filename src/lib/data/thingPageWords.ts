import { isFilledText } from './filledText';

/** What a thing's page says beyond its facts: the first paragraph before its sections, and each line of its Examples. */
export type ThingPageWords = { opening: string; examples: string[] };

type Section = { heading: string; lines: string[] };

const sectionHeading = /^#{2,6}\s+(.+?)\s*#*\s*$/;
const titleHeading = /^#\s/;
const listMarker = /^\s*(?:[-*+]|\d+[.)])\s+/;
const paragraphBreak = /\n\s*\n/;
const runOfSpace = /\s+/g;
const openingHeading = '';
const examplesHeading = 'examples';

/** The page's own words in the parts the Domain page shows: its opening paragraph and its examples, one to a row. */
export function thingPageWordsOf(body: string): ThingPageWords {
	const sections = sectionsOf(body);
	const opening = linesUnder(sections, openingHeading).filter((line) => !titleHeading.test(line));
	const [firstParagraph = ''] = paragraphsOf(opening);
	return { opening: firstParagraph, examples: examplesOf(linesUnder(sections, examplesHeading)) };
}

function sectionsOf(body: string): Section[] {
	let lines: string[] = [];
	const sections: Section[] = [{ heading: openingHeading, lines }];
	for (const line of body.split('\n')) {
		const heading = sectionHeading.exec(line);
		if (heading === null) {
			lines.push(line);
			continue;
		}
		const [, title] = heading;
		lines = [];
		sections.push({ heading: title.toLowerCase(), lines });
	}
	return sections;
}

function linesUnder(sections: Section[], heading: string): string[] {
	return sections.filter((section) => section.heading === heading).flatMap((section) => section.lines);
}

function paragraphsOf(lines: string[]): string[] {
	const paragraphs = lines.join('\n').split(paragraphBreak);
	return paragraphs.map((paragraph) => paragraph.replace(runOfSpace, ' ').trim()).filter(isFilledText);
}

function examplesOf(lines: string[]): string[] {
	return lines.map((line) => line.replace(listMarker, '').trim()).filter(isFilledText);
}
