import { mapStageNames } from '$lib/data/workflowMap/workflowMapWords';
import type { MapStage } from '$lib/data/workflowMap/workflowMap';

/** The marks the legend draws a sample of. */
export const LegendMarks = {
	line: 'line',
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

/** What the marks mean on a product's tab, where its own stations are lit and the rest of the map is dimmed. */
export const productLegendItems: LegendItem[] = [
	lineItem,
	{ mark: LegendMarks.ours, words: 'Done in this product' },
	{ mark: LegendMarks.planned, words: 'Planned for this product' },
	arrivalItem,
	outputItem
];

/** What the marks on a Before or an After mean, in the order the legend under the map lists them. */
export function legendItemsOf(stage: MapStage): LegendItem[] {
	return legendItems[stage];
}

/** What a reader of the map's picture is told it shows. */
export function mapLabelOf(stage: MapStage): string {
	return `The workflow map, ${mapStageNames[stage]}`;
}
