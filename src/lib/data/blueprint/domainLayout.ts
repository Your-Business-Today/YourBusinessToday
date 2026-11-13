import { shortenedToFit } from '$lib/data/textFit';
import { contextRowsOf, type EntityRow, type GroupRows } from './domainContextRows';
import type { BoundedContext, DomainEntity, DomainEntityKind } from './domainModel';

type Box = { x: number; y: number; width: number; height: number };

export type PlacedEntity = Box & { name: string; title: string; kind: DomainEntityKind; entity: DomainEntity; isNested: boolean };

export type PlacedContext = Box & { name: string; title: string; fullTitle: string; context: BoundedContext };

/** A group's outline round its members, its title on the row above them. */
export type PlacedGroup = Box & { name: string; title: string; fullTitle: string };

export type DomainLayout = { contexts: PlacedContext[]; groups: PlacedGroup[]; entities: PlacedEntity[]; width: number; height: number };

export const domainLayoutSizes = {
	columns: 3,
	contextWidth: 250,
	gap: 40,
	heading: 36,
	row: 30,
	padding: 10,
	nesting: 16,
	groupInset: 8,
	groupLift: 3
} as const;

const sizes = domainLayoutSizes;
const longestTitle = 34;

/** The contexts laid out as boxes in columns, each dropped into the shortest column, their groups and things listed inside. */
export function layOutDomain(domain: { contexts: BoundedContext[] }): DomainLayout {
	const columnHeights: number[] = Array.from({ length: sizes.columns }, () => 0);
	const layout: DomainLayout = { contexts: [], groups: [], entities: [], width: 0, height: 0 };
	for (const context of domain.contexts) {
		const column = columnHeights.indexOf(Math.min(...columnHeights));
		const rows = contextRowsOf(context);
		const placed = placeContext(context, rows.rowCount, { x: columnLeft(column), y: columnHeights[column] + sizes.gap });
		layout.contexts.push(placed);
		layout.groups.push(...rows.groups.map((groupRows) => placeGroup(placed, groupRows)));
		layout.entities.push(...rows.entities.map((entityRow) => placeEntity(placed, entityRow)));
		columnHeights[column] += placed.height + sizes.gap;
	}
	const width = sizes.columns * sizes.contextWidth + (sizes.columns + 1) * sizes.gap;
	return { ...layout, width, height: Math.max(...columnHeights) + sizes.gap };
}

function columnLeft(column: number): number {
	return sizes.gap + column * (sizes.contextWidth + sizes.gap);
}

function placeContext(context: BoundedContext, rowCount: number, corner: { x: number; y: number }): PlacedContext {
	const height = sizes.heading + rowCount * sizes.row + sizes.padding;
	const box = { ...corner, width: sizes.contextWidth, height };
	return { ...box, name: context.name, title: shortenedToFit(context.title, longestTitle), fullTitle: context.title, context };
}

function rowTop(placed: PlacedContext, row: number): number {
	return placed.y + sizes.heading + row * sizes.row;
}

function placeGroup(placed: PlacedContext, { group, firstRow, rowCount }: GroupRows): PlacedGroup {
	const { name, title } = group;
	const margin = sizes.padding / 2;
	const box = { x: placed.x + margin, y: rowTop(placed, firstRow) - sizes.groupLift, width: placed.width - 2 * margin, height: rowCount * sizes.row };
	return { ...box, name, title: shortenedToFit(title, longestTitle), fullTitle: title };
}

function placeEntity(placed: PlacedContext, { entity, row, isInGroup }: EntityRow): PlacedEntity {
	const isNested = entity.name !== entity.aggregateRootName;
	const nesting = isNested ? sizes.nesting : 0;
	const inset = sizes.padding + (isInGroup ? sizes.groupInset : 0);
	const { name, title, kind } = entity;
	const box = { x: placed.x + inset + nesting, y: rowTop(placed, row), width: placed.width - 2 * inset - nesting, height: sizes.row - 6 };
	return { ...box, name, title, kind, entity, isNested };
}
