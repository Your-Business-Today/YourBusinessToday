import { companyDetails } from '$lib/data/companyDetails';
import { buildTimeline } from '$lib/data/consultancyOffer';
import { tasksDoneOnTheBoard } from './promoBoard';
import type { PromoChapterId } from './promoTimeline';

export type PromoLine = { text: string; fromBeat: number; toBeat: number; isHeadline: boolean };

export type CaptionPlacement = 'lower' | 'beneathMark';

export type PromoCaption = {
	chapterId: PromoChapterId;
	kicker: string;
	placement: CaptionPlacement;
	lines: PromoLine[];
};

const heldThroughTheLastFrame = 17;

function headline(text: string, fromBeat: number, toBeat: number): PromoLine {
	return { text, fromBeat, toBeat, isHeadline: true };
}

function aside(text: string, fromBeat: number, toBeat: number): PromoLine {
	return { text, fromBeat, toBeat, isHeadline: false };
}

/** Every word on screen, in the site's own words, with the beats of its chapter it is shown between. */
export const promoCaptions: PromoCaption[] = [
	{
		chapterId: 'signal',
		kicker: 'Your Business Today',
		placement: 'lower',
		lines: [headline('Every business runs on information.', 1.5, 7.6)]
	},
	{
		chapterId: 'noise',
		kicker: 'The way it runs now',
		placement: 'lower',
		lines: [
			headline('Emails. Spreadsheets. Memory.', 0.75, 5.6),
			headline('And two or three people who can never take a week off.', 6, 11.6)
		]
	},
	{
		chapterId: 'map',
		kicker: '01 · Map',
		placement: 'lower',
		lines: [headline('We map how information travels through your company.', 0.75, 11.6)]
	},
	{
		chapterId: 'board',
		kicker: '02 · Build',
		placement: 'lower',
		lines: [
			headline('Every goal and every task on one board, built in the open.', 0.75, 9.6),
			headline('Sized, built and reviewed by AI. Watched by you.', 10, 19.6),
			aside(`${tasksDoneOnTheBoard} tasks built and merged on our own board so far.`, 11, 19.6)
		]
	},
	{
		chapterId: 'app',
		kicker: '03 · Run',
		placement: 'lower',
		lines: [
			headline('Your own app, built around how your business works.', 0.75, 7.6),
			headline('Plus an AI assistant your team can simply talk to.', 8, 15.6)
		]
	},
	{
		chapterId: 'launch',
		kicker: '04 · Live',
		placement: 'lower',
		lines: [
			headline(`Live in ${buildTimeline}.`, 0.5, 7.8),
			aside('Then changed however you want, for one monthly fee.', 1.5, 7.8)
		]
	},
	{
		chapterId: 'brand',
		kicker: '',
		placement: 'beneathMark',
		lines: [
			headline('AI tools that actually know your business.', 3, heldThroughTheLastFrame),
			aside(companyDetails.websiteHost, 4.5, heldThroughTheLastFrame)
		]
	}
];
