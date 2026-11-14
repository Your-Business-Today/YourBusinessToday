import { mapStageNames } from '$lib/data/workflowMap/workflowMapWords';
import { lineKinds, type LineKind, type MapStage, type WorkflowMapVersion } from '$lib/data/workflowMap/workflowMap';

/** The marks the legend draws a sample of. */
export const LegendMarks = {
	line: 'line',
	outsideParty: 'outsideParty',
	system: 'system',
	tick: 'tick',
	ours: 'ours',
	planned: 'planned',
	arrival: 'arrival',
	output: 'output',
	failure: 'failure'
} as const;

export type LegendMark = (typeof LegendMarks)[keyof typeof LegendMarks];

export type LegendItem = { mark: LegendMark; words: string };

const lineItem: LegendItem = { mark: LegendMarks.line, words: 'A line is a role' };

/** A role is the plain line above; the other kinds each have a mark of their own. */
const lineKindItems: Partial<Record<LineKind, LegendItem>> = {
	outside_party: { mark: LegendMarks.outsideParty, words: 'A dashed line is an outside party' },
	system: { mark: LegendMarks.system, words: 'A dotted line is a system' }
};
const arrivalItem: LegendItem = { mark: LegendMarks.arrival, words: 'A hand-over from another role arrives' };
const outputItem: LegendItem = { mark: LegendMarks.output, words: 'An output the business runs on' };

const legendItems: Record<MapStage, LegendItem[]> = {
	before: [
		lineItem,
		{ mark: LegendMarks.tick, words: 'A task' },
		arrivalItem,
		outputItem,
		{ mark: LegendMarks.failure, words: 'A hand-over that goes wrong today' }
	],
	after: [
		lineItem,
		{ mark: LegendMarks.ours, words: 'Done in one of our products' },
		{ mark: LegendMarks.planned, words: 'Planned' },
		{ mark: LegendMarks.tick, words: 'Still done elsewhere' },
		arrivalItem,
		outputItem
	]
};

const productItems: LegendItem[] = [
	lineItem,
	{ mark: LegendMarks.ours, words: 'Done in this product' },
	{ mark: LegendMarks.planned, words: 'Planned for this product' },
	arrivalItem,
	outputItem
];

/** The marks of the kinds of line other than a role that a map draws, each once. */
function otherLineKindItems(map: WorkflowMapVersion | null): LegendItem[] {
	const drawnKinds = new Set(map?.lines.map((line) => line.kind) ?? []);
	return lineKinds.filter((kind) => drawnKinds.has(kind)).flatMap((kind) => lineKindItems[kind] ?? []);
}

/** What the marks mean on a product's tab, where its own stations are lit and the rest of the map is dimmed. */
export function productLegendItemsOf(map: WorkflowMapVersion | null): LegendItem[] {
	const [line, ...marks] = productItems;
	return [line, ...otherLineKindItems(map), ...marks];
}

/** What the marks on a Before or an After mean, in the order the legend under the map lists them. */
export function legendItemsOf(map: WorkflowMapVersion): LegendItem[] {
	const [line, ...marks] = legendItems[map.stage];
	return [line, ...otherLineKindItems(map), ...marks];
}

/** What a reader of the map's picture is told it shows. */
export function mapLabelOf(stage: MapStage): string {
	return `The workflow map, ${mapStageNames[stage]}`;
}
