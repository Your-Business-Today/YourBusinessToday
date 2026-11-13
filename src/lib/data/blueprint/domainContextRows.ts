import { everyDomainEntityKind, type Aggregate, type BoundedContext, type DomainEntity, type ThingGroup } from './domainModel';

/** A group's place in its area: the row its title sits on and how many rows it spans, its title's among them. */
export type GroupRows = { group: ThingGroup; firstRow: number; rowCount: number };

/** A thing's row in its area, and whether it sits inside a group's outline. */
export type EntityRow = { entity: DomainEntity; row: number; isInGroup: boolean };

/** The rows of an area's box, top to bottom: each group's title with its members beneath, then every thing in no group. */
export type ContextRows = { groups: GroupRows[]; entities: EntityRow[]; rowCount: number };

/** The area's rows: its groups first, each round the members drawn in this area, then the rest, records before details, operations and events. */
export function contextRowsOf(context: BoundedContext): ContextRows {
	const things = drawingOrder(context.aggregates);
	const rows: ContextRows = { groups: [], entities: [], rowCount: 0 };
	const placedNames = new Set<string>();
	for (const group of context.groups) {
		const members = things.filter((entity) => group.memberNames.includes(entity.name) && !placedNames.has(entity.name));
		rows.groups.push({ group, firstRow: rows.rowCount, rowCount: members.length + 1 });
		rows.rowCount += 1;
		members.forEach((entity) => placedNames.add(entity.name));
		placeRows(rows, members, true);
	}
	placeRows(rows, things.filter((entity) => !placedNames.has(entity.name)), false);
	return rows;
}

function placeRows(rows: ContextRows, entities: DomainEntity[], isInGroup: boolean) {
	for (const entity of entities) {
		rows.entities.push({ entity, row: rows.rowCount, isInGroup });
		rows.rowCount += 1;
	}
}

/** Every thing in the area, aggregate by aggregate with each root before what it holds, the kinds in the key's order. */
function drawingOrder(aggregates: Aggregate[]): DomainEntity[] {
	const rankOf = (aggregate: Aggregate) => kindRankOf(aggregate.entities);
	const ranked = [...aggregates].sort((first, second) => rankOf(first) - rankOf(second));
	return ranked.flatMap((aggregate) => aggregate.entities);
}

function kindRankOf([root]: DomainEntity[]): number {
	return root === undefined ? 0 : everyDomainEntityKind.indexOf(root.kind);
}
