import { journeyLegendWords } from './journeySiteMapWords';

/** The marks the legend under the journeys draws a sample of. */
export const JourneyLegendMarks = { line: 'line', view: 'view', shared: 'shared' } as const;

export type JourneyLegendMark = (typeof JourneyLegendMarks)[keyof typeof JourneyLegendMarks];

/** What each mark means, in the order the legend lists them. */
export const journeyLegendItems: { mark: JourneyLegendMark; words: string }[] = [
	{ mark: JourneyLegendMarks.line, words: journeyLegendWords.line },
	{ mark: JourneyLegendMarks.view, words: journeyLegendWords.view },
	{ mark: JourneyLegendMarks.shared, words: journeyLegendWords.shared }
];
