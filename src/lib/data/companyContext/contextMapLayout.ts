import { areasOfContext, type ContextArea } from './contextAreas';
import { shortenedToFit } from '$lib/data/textFit';
import { lowConfidence, type CompanyContextVersion, type ContextPart } from './companyContext';
import { partKindNames, reviewStateMarks } from './companyContextWords';
import type { MapBox } from '$lib/data/blueprint/relationshipPath';

export type PlacedArea = MapBox & { key: string; title: string; fullTitle: string; isAnArea: boolean; isCore: boolean };

/** A part drawn on the map: its name cut to fit, the mark of the client's check, what kind it is and whether Claude is unsure. */
export type PlacedPart = MapBox & {
	key: string;
	name: string;
	title: string;
	reviewMark: string;
	kindName: string;
	isUnsure: boolean;
};

export type ContextMapLayout = { areas: PlacedArea[]; parts: PlacedPart[]; width: number; height: number };

export const acrossTheBusiness = { key: 'across the business', title: 'Across the business' } as const;

export const contextMapColumns = { wide: 3, narrow: 1 } as const;

const sizes = { areaWidth: 250, gap: 40, heading: 36, row: 30, padding: 10, rowGap: 6 } as const;
const longestAreaTitle = 30;
const longestPartTitle = 26;

/** The areas laid out as regions in columns, the core first, each dropped into the shortest column with its parts inside. */
export function layOutContextMap(context: CompanyContextVersion, columns: number): ContextMapLayout {
	const columnHeights: number[] = Array.from({ length: columns }, () => 0);
	const areas: PlacedArea[] = [];
	const parts: PlacedPart[] = [];
	for (const contextArea of areasOfContext(context)) {
		const column = columnHeights.indexOf(Math.min(...columnHeights));
		const placed = placeArea(contextArea, column, columnHeights[column]);
		areas.push(placed);
		parts.push(...placeParts(placed, contextArea.parts));
		columnHeights[column] += placed.height + sizes.gap;
	}
	const width = columns * sizes.areaWidth + (columns + 1) * sizes.gap;
	return { areas, parts, width, height: Math.max(...columnHeights) + sizes.gap };
}

function placeArea({ area, parts }: ContextArea, column: number, top: number): PlacedArea {
	const height = sizes.heading + parts.length * sizes.row + sizes.padding;
	const x = sizes.gap + column * (sizes.areaWidth + sizes.gap);
	const box = { x, y: top + sizes.gap, width: sizes.areaWidth, height };
	const fullTitle = area?.name ?? acrossTheBusiness.title;
	const key = area?.key ?? acrossTheBusiness.key;
	const title = shortenedToFit(fullTitle, longestAreaTitle);
	return { ...box, key, title, fullTitle, isAnArea: area !== null, isCore: area?.isCore === true };
}

function placeParts(placed: PlacedArea, parts: ContextPart[]): PlacedPart[] {
	return parts.map((part, index) => ({
		key: part.key,
		name: part.name,
		title: shortenedToFit(part.name, longestPartTitle),
		reviewMark: reviewStateMarks[part.reviewState],
		kindName: partKindNames[part.kind],
		isUnsure: part.confidence === lowConfidence,
		x: placed.x + sizes.padding,
		y: placed.y + sizes.heading + index * sizes.row,
		width: placed.width - 2 * sizes.padding,
		height: sizes.row - sizes.rowGap
	}));
}
