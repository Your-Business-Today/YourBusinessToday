import { formatBritishDate } from '$lib/data/britishDate';
import { mapStageNames } from './workflowMapWords';
import type { MapStage } from './workflowMap';
import type { StationReviewTally } from './stationReviewTally';

/** A version of a Before or an After the client confirmed as right, and when: a later filing is confirmed again. */
export type MapConfirmation = { stage: MapStage; versionNumber: number; confirmedAt: string };

/** The confirmations of an organisation's latest Before and After, either none until the client confirms it. */
export type MapConfirmations = { before: MapConfirmation | null; after: MapConfirmation | null };

export const noMapConfirmations: MapConfirmations = { before: null, after: null };

/** Confirm opens once no station is marked not right; stations not checked yet do not hold it back. */
export function canConfirmMap(tally: StationReviewTally): boolean {
	const stationCount = tally.right + tally.notRight + tally.notChecked;
	return stationCount > 0 && tally.notRight === 0;
}

/** Why Confirm is not open yet, said to the client under the map. */
export function mapConfirmationHeldBack(tally: StationReviewTally): string {
	if (tally.notRight === 0) return 'There is nothing to confirm yet: this map has no stations.';
	const stations = tally.notRight === 1 ? '1 station is' : `${tally.notRight} stations are`;
	return `${stations} marked not right. The next version filed puts them right; once no station is marked not right, you can confirm it.`;
}

/** What confirming does, said beside the button. */
export function mapConfirmInvitation(stage: MapStage, versionNumber: number): string {
	const map = `${mapStageNames[stage]} map`;
	return (
		`Once you are happy the stations are right, confirm it: version ${versionNumber} of your ${map} is kept as ` +
		'confirmed, and Your Business Today raises the services we build for you from it as goals on your project.'
	);
}

/** Said on the client's map once they have confirmed it, and on the staff's reading of it. */
export function mapConfirmedSentence({ stage, versionNumber, confirmedAt }: MapConfirmation, isClient: boolean): string {
	const day = formatBritishDate(confirmedAt);
	const map = `${mapStageNames[stage]} map`;
	if (isClient) return `You confirmed version ${versionNumber} of your ${map} as right on ${day}. It takes no more marks.`;
	return `The client confirmed version ${versionNumber} of their ${map} as right on ${day}.`;
}

/** Why a confirmed Before cannot be filed again: it is the picture of the business as we found it. */
export function beforeFrozenRefusal(organisationName: string, versionNumber: number): string {
	return (
		`${organisationName}'s Before map is frozen: the client confirmed version ${versionNumber} as the business as we ` +
		'found it, so no further Before is filed. File the change as an After instead.'
	);
}
