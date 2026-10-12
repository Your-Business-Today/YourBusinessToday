import { describeFiledFigures, type FiledFigures } from './filedFigures';
import { indicatorSentence, type CompanyIndicators } from './companyIndicators';
import { formatBritishDate } from './britishDate';

/** What the standing line is made from: the accounts type and figures filed, the profile's flags, and any notice. */
export type StandingFacts = { indicators: CompanyIndicators | null; figures: FiledFigures | null; statusNote: string };

/** "Micro-entity accounts to 31 Mar 2026 · Net assets £84k · cash £12k · confirmation statement overdue · Winding-up petition, noticed 14 Oct 2026", or ''. */
export function standingLine(facts: StandingFacts): string {
	const { indicators, figures, statusNote } = facts;
	return [
		accountsWords(indicators, figures),
		figures === null ? '' : describeFiledFigures(figures).replace(/ · to .*$/, ''),
		indicators === null ? '' : indicatorSentence(indicators),
		statusNote
	]
		.filter((part) => part !== '')
		.join(' · ');
}

function accountsWords(indicators: CompanyIndicators | null, figures: FiledFigures | null): string {
	const type = indicators?.lastAccountsType ?? '';
	if (type === '' && figures === null) return '';
	const words = type.replace(/-/g, ' ').replace(/^micro entity/, 'micro-entity');
	const typeWords = type === '' ? 'Accounts' : `${words.charAt(0).toUpperCase()}${words.slice(1)} accounts`;
	return figures === null ? `${typeWords} filed` : `${typeWords} to ${formatBritishDate(figures.madeUpTo)}`;
}
