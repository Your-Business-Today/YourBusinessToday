/** What a company's profile says about its standing, beyond its status: the few flags an approach turns on. */
export type CompanyIndicators = {
	statusDetail: string;
	lastAccountsType: string;
	isAccountsOverdue: boolean;
	isConfirmationOverdue: boolean;
	hasInsolvency: boolean;
	hasCharges: boolean;
};

export const statusDetails = { proposalToStrikeOff: 'active-proposal-to-strike-off' } as const;

const statusDetailWords: Record<string, string> = {
	'active-proposal-to-strike-off': 'proposal to strike off',
	'converted-closed': 'converted or closed',
	'transferred-from-uk': 'transferred from the UK',
	'transformed-to-se': 'transformed to an SE'
};

/** "proposal to strike off · accounts overdue · confirmation statement overdue · insolvency history · charges", or ''. */
export function indicatorSentence(indicators: CompanyIndicators): string {
	return [
		indicators.statusDetail === '' ? '' : (statusDetailWords[indicators.statusDetail] ?? indicators.statusDetail.replace(/-/g, ' ')),
		indicators.isAccountsOverdue ? 'accounts overdue' : '',
		indicators.isConfirmationOverdue ? 'confirmation statement overdue' : '',
		indicators.hasInsolvency ? 'insolvency history' : '',
		indicators.hasCharges ? 'charges registered' : ''
	]
		.filter((part) => part !== '')
		.join(' · ');
}

export function areIndicatorsEqual(first: CompanyIndicators, second: CompanyIndicators): boolean {
	return (Object.keys(first) as (keyof CompanyIndicators)[]).every((key) => first[key] === second[key]);
}
