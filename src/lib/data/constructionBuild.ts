import type { CaseStudyFigure } from './caseStudies';

export type BuildPhase = {
	id: string;
	period: string;
	name: string;
	description: string;
};

export const constructionBuildPhases: BuildPhase[] = [
	{
		id: 'discovery',
		period: 'Week one',
		name: 'Discovery on paper',
		description:
			'A week with the people who do the work. What arrives at the business. Who decides what about it. What somebody then has to type out again.'
	},
	{
		id: 'proof',
		period: 'Week two',
		name: 'Proving it in code',
		description:
			'Enough of the idea built to find out whether it held up outside the meeting room. It did and we stopped there rather than building on.'
	},
	{
		id: 'pause',
		period: 'Three and a half weeks',
		name: 'The business decided',
		description:
			'A pause while the business weighed it up. We did not build through it. Nothing was spent and nothing was wasted. That is the point of proving it first.'
	},
	{
		id: 'production',
		period: '24 June 2026',
		name: 'Into production',
		description:
			'The portal went live and the work moved onto it. From there it grew a piece at a time. Each piece was in use before the next was started.'
	},
	{
		id: 'connector',
		period: '28 August 2026',
		name: 'The move to a connector',
		description:
			'The chat built into the portal came out and a connector to their own AI assistant went in. The business could then reach its own work from the assistant it already used.'
	}
];

export const constructionBuildFigures: CaseStudyFigure[] = [
	{ value: '1,032', label: 'commits' },
	{ value: '79', label: 'days with commits' },
	{ value: '41', label: 'pull requests' },
	{ value: '221', label: 'database changes' },
	{ value: '85', label: 'connector tools' },
	{ value: '11', label: 'roles modelled' },
	{ value: '~170', label: 'user stories' },
	{ value: '16 weeks', label: 'May to September' }
];
