import { describeScreenCover } from './cashScreenAnswer';
import { formatBritishDate } from './britishDate';
import type { CashScreenNarrowing } from './cashScreenRules';

/** A screen as its territory's list shows it: what it covers and how far it has got. */
export type ListedCashScreen = CashScreenNarrowing & { id: string; startedAt: string; companiesDone: number; finishedAt: string | null };

/** A territory's screens as a staff member's Claude is told them, the newest first, so one already run is read and not run again. */
export function describeCashScreenList(territoryName: string, screens: ListedCashScreen[]): string {
	if (screens.length === 0) return `No cash screen has been run on ${territoryName} yet: start_cash_screen starts one.`;
	const heading = `Cash screens of ${territoryName}, the newest first. Read one with read_cash_screen; one that is not finished is carried on with carry_on_cash_screen.`;
	return [heading, ...screens.map(listLineFor)].join('\n');
}

function listLineFor(screen: ListedCashScreen): string {
	const startedOn = formatBritishDate(screen.startedAt.slice(0, 10));
	return `- Screen ${screen.id}${describeScreenCover(screen)}, started ${startedOn}: ${standingOf(screen)}`;
}

function standingOf({ finishedAt, companiesDone }: ListedCashScreen): string {
	if (finishedAt === null) return `${companiesDone} companies screened so far.`;
	return `finished on ${formatBritishDate(finishedAt.slice(0, 10))}.`;
}
