import { audienceActions } from '../actions/audienceActions';
import { formatPoundsAndPence, fromPence } from '$lib/data/books/money';

const wholeNumbers = new Intl.NumberFormat('en-GB');
const wholePercents = new Intl.NumberFormat('en-GB', { style: 'percent', maximumFractionDigits: 0 });

/** Where one campaign's page is, inside its organisation's Brand place. */
export function campaignPagePath(organisationId: string, campaignId: string): string {
	return `/organisations/${organisationId}/brand/campaigns/${campaignId}`;
}

/** A count as the report shows it: 3,717. */
export function formatCount(count: number): string {
	return wholeNumbers.format(count);
}

/** Pence as the report shows them: £1,234.50. */
export function formatPence(pence: number): string {
	return formatPoundsAndPence(fromPence(pence));
}

/** A part of everyone reached as the report shows it: 38%. */
export function formatShare(shareOfReach: number): string {
	return wholePercents.format(shareOfReach);
}

/** What a click cost, or that there has been no click to cost yet. */
export function describeCostPerClick(costPerClickPence: number | null): string {
	if (costPerClickPence === null) return 'No clicks yet';
	return formatPence(costPerClickPence);
}

/** The audience action a campaign pays for, by the name the catalogue gives it. */
export function objectiveLabelOf(objective: string): string {
	const action = audienceActions.find((candidate) => candidate.key === objective);
	return action?.label ?? objective;
}
