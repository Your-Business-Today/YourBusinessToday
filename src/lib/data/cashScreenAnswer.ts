import { cashScreenOutcomes, type CashScreenOutcome, type ScreenVerdict } from './cashScreenOutcome';
import { formatBritishDate } from './britishDate';
import { formatPounds } from './filedFigures';
import type { CashScreenNarrowing } from './cashScreenRules';

/** One company the screen has reached, and what it comes out as. */
export type ScreenedCompany = ScreenVerdict & { companyNumber: string; name: string };

/** What a staff member's Claude is told about a screen: what it covers, how far it has got, and each company it reached, the fails only when asked for. */
export type CashScreenSummary = CashScreenNarrowing & {
	id: string;
	territoryName: string;
	startedAt: string;
	isFinished: boolean;
	screened: ScreenedCompany[];
	waiting: number;
	isListingFails: boolean;
};

/** Said wherever a screen is not finished: a screen someone is waiting for is carried on by hand, because the background knock is rare. */
export const howToCarryOn = 'Carry it on with carry_on_cash_screen until it answers that the screen is finished; left alone it is carried on in the background only a few times a day.';

export const noSuchScreen = "No cash screen has that id: list_cash_screens gives a territory's, and start_cash_screen starts one.";

const failsLeftOut = 'not listed, since nobody approaches them: read_cash_screen with showFails true lists each with its reason.';

const outcomeHeadings: [CashScreenOutcome, string][] = [
	[cashScreenOutcomes.passes, 'Passes'],
	[cashScreenOutcomes.passesThroughConnected, 'Passes through a connected company'],
	[cashScreenOutcomes.maybe, 'Maybe'],
	[cashScreenOutcomes.fails, 'Fails']
];

export function describeCashScreen(summary: CashScreenSummary): string {
	const sections = outcomeHeadings.map(([outcome, heading]) => sectionFor(summary, outcome, heading)).filter((section) => section !== '');
	return [headerFor(summary), progressFor(summary), ...sections].join('\n\n');
}

/** What a screen covers, as its own header and its line in a territory's list both say it: ", SIC codes starting 41, for at least £100k cash at bank". */
export function describeScreenCover(narrowing: CashScreenNarrowing): string {
	const narrowedTo = [narrowing.sector === '' ? '' : `sector ${narrowing.sector}`, narrowing.sicCode === '' ? '' : `SIC codes starting ${narrowing.sicCode}`].filter((part) => part !== '');
	const narrowingWords = narrowedTo.length === 0 ? '' : `, ${narrowedTo.join(', ')}`;
	return `${narrowingWords}, for at least ${formatPounds(narrowing.leastCash)} cash at bank`;
}

function headerFor(summary: CashScreenSummary): string {
	return `Screen ${summary.id} of ${summary.territoryName}${describeScreenCover(summary)}, started ${formatBritishDate(summary.startedAt.slice(0, 10))}.`;
}

function progressFor(summary: CashScreenSummary): string {
	const { screened, waiting } = summary;
	const total = screened.length + waiting;
	if (summary.isFinished) return `Finished: all ${total} companies screened. Cash figures are the balance on the day each company's accounts are made up to, not today.`;
	return `${screened.length} of ${total} companies screened so far. ${howToCarryOn}`;
}

/** How far a screen has got after one turn at it, and how long Companies House makes the next turn wait: nothing while calls remain. */
export type ScreenTurnProgress = { screenedThisTurn: number; companiesDone: number; companyCount: number; isFinished: boolean; secondsUntilMoreCalls: number };

/** What a staff member's Claude is told after carrying a screen on: how far it has got, and what to do next. */
export function describeScreenTurn(progress: ScreenTurnProgress): string {
	if (progress.isFinished) return `Finished: all ${progress.companyCount} companies are screened. Read it with read_cash_screen.`;
	const soFar = `${progress.screenedThisTurn} more companies screened: ${progress.companiesDone} of ${progress.companyCount} so far.`;
	const hasCallsLeft = progress.secondsUntilMoreCalls === 0;
	if (hasCallsLeft) return `${soFar} Call carry_on_cash_screen again to carry on.`;
	return `${soFar} Companies House allows no more reading for the next ${progress.secondsUntilMoreCalls} seconds: call carry_on_cash_screen again after that.`;
}

function sectionFor(summary: CashScreenSummary, outcome: CashScreenOutcome, heading: string): string {
	const companies = summary.screened.filter((company) => company.outcome === outcome);
	if (companies.length === 0) return '';
	const title = `${heading} (${companies.length}):`;
	const isLeftOut = outcome === cashScreenOutcomes.fails && !summary.isListingFails;
	if (isLeftOut) return `${title} ${failsLeftOut}`;
	const lines = companies.map((company) => `- ${company.name} (${company.companyNumber}): ${company.reason}`);
	return [title, ...lines].join('\n');
}
