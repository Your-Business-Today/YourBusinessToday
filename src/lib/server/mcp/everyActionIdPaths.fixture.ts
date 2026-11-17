import { nestedRecordsOf, recordIdFieldsOf, type NestedRecord } from './recordIdFields';
import type { McpAction } from './actionTypes';

type Reading = Record<string, unknown>;

export type IdPath = { shownAs: string; isRequired: boolean; inputGiving: (value: unknown) => Reading };

type Placing = { shownAs: string; isRequired: boolean; place: (value: unknown) => Reading };

const idInWords = /\bids?\b/i;
const namedAsAnId = /Ids?$/;

/** Every place in an action's input that names a record by id, at any depth, with a way to put a value there. */
export function idPathsOf(action: McpAction): IdPath[] {
	return placingsIn(action.inputSchema, '').map(({ shownAs, isRequired, place }) => ({
		shownAs,
		isRequired,
		inputGiving: place
	}));
}

function placingsIn(schema: Reading, path: string): Placing[] {
	const ownFields = recordIdFieldsOf(schema).map((field) => ({
		shownAs: `${path}${field.name}`,
		isRequired: field.isRequired,
		place: (value: unknown) => recordHolding(field.name, value)
	}));
	return [...ownFields, ...nestedRecordsOf(schema).flatMap((nested) => placingsInNested(nested, path))];
}

function placingsInNested(nested: NestedRecord, path: string): Placing[] {
	const { isList } = nested;
	const where = isList ? `${path}${nested.name}[0].` : `${path}${nested.name}.`;
	return placingsIn(nested.schema, where).map((inner) => ({
		shownAs: inner.shownAs,
		isRequired: inner.isRequired,
		place: (value: unknown) => recordHolding(nested.name, wrapped(inner.place(value), isList))
	}));
}

function wrapped(record: Reading, isList: boolean): unknown {
	if (isList) return [record];
	return record;
}

function recordHolding(name: string, value: unknown): Reading {
	if (value === undefined) return {};
	return { [name]: value };
}

/** The names of the fields, at any depth, that say they hold an id though their name does not end in Id. */
export function fieldsDescribedAsIdsOf(schema: Reading): string[] {
	const fields = Object.entries((schema.properties ?? {}) as Record<string, { description?: string }>);
	const ownNames = fields
		.filter(([name, field]) => !namedAsAnId.test(name) && idInWords.test(field.description ?? ''))
		.map(([name]) => name);
	return [...ownNames, ...nestedRecordsOf(schema).flatMap((nested) => fieldsDescribedAsIdsOf(nested.schema))];
}
