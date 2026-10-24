import type { LineIconKind } from '$lib/components/site/lineIcons';
import { buildTimeline } from '$lib/data/consultancyOffer';

export type HeroPromise = {
	id: string;
	icon: LineIconKind;
	title: string;
	line: string;
	badge: string;
	isHighlighted: boolean;
};

export const heroAudience = 'For UK business owners & MDs';

export const heroChecklist = [
	'Process mapping.',
	'Design.',
	'Engineering.',
	'AI connector.',
	'Security.',
	'Hosting.'
];

export const heroPromises: HeroPromise[] = [
	{
		id: 'live',
		icon: 'rocket',
		title: `Live in ${buildTimeline}`,
		line: 'Mapped with your team. Built fast. In use.',
		badge: '',
		isHighlighted: false
	},
	{
		id: 'change',
		icon: 'refresh',
		title: 'Change it however you want',
		line: 'Ongoing support after launch, one monthly fee.',
		badge: 'Retainer',
		isHighlighted: true
	},
	{
		id: 'hosted',
		icon: 'shield',
		title: 'Hosted, backed up, supported',
		line: 'All inside that one fee. Cancel on a month’s notice.',
		badge: '',
		isHighlighted: false
	}
];
