/**
 * The longest each value of a workflow map may be, and how many of each a version may hold. Migration 0210 holds
 * the same limits on its columns; the connector refuses anything over them before writing.
 */
export const workflowMapLimits = {
	keyLength: 80,
	nameLength: 120,
	summaryLength: 300,
	wordLength: 120,
	doneInLength: 120,
	handedOverLength: 120,
	goesWrongLength: 300,
	thingSlugLength: 120,
	mostWordsInAList: 20,
	mostLines: 30,
	mostStationsOnALine: 60,
	mostStations: 300,
	mostHandovers: 500
} as const;

/** A line's or a station's key, and a Domain thing's slug: lower-case words joined by hyphens. */
export const mapKeyShape = /^[a-z0-9]+(-[a-z0-9]+)*$/;
