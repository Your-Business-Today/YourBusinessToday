import { isRefused, readChoice, readOptionalText } from '$lib/server/companyContext/contextText';
import { mapStages, type MapStage } from '$lib/data/workflowMap/workflowMap';
import { readMapKey } from './readMapWords';
import { stationMarkStates, stationReviewStates, type StationMarkState } from '$lib/data/workflowMap/stationReview';
import { stationReviewLimits as limits } from '$lib/data/workflowMap/stationReviewLimits';
import type { Refusal } from '$lib/server/portal/portalFormReading';

/** A client's mark on one station of the version they were shown: right, or not right with what is wrong. */
export type StationMark = {
	stage: MapStage;
	versionNumber: number;
	stationKey: string;
	reviewState: StationMarkState;
	whatIsWrong: string | null;
};

export const stationMarkFields = {
	stage: 'stage',
	versionNumber: 'versionNumber',
	stationKey: 'stationKey',
	reviewState: 'reviewState',
	whatIsWrong: 'whatIsWrong'
} as const;

const wholeNumberShape = /^[0-9]+$/;
const whatIsWrongRule = { field: 'What is wrong', limit: limits.whatIsWrongLength };

/** Reads a mark from the portal's form, refusing the first value that does not fit its column. */
export function validateStationMarkForm(formData: FormData): StationMark | Refusal {
	const values = Object.fromEntries(Object.values(stationMarkFields).map((field) => [field, formData.get(field)]));
	return validateStationMark(values);
}

/** The one check both doors share: the portal's form and the client's Claude through the connector. */
export function validateStationMark(values: Record<string, unknown>): StationMark | Refusal {
	const stage = readChoice(values.stage, mapStages, 'The map');
	if (isRefused(stage)) return stage;
	const versionNumber = readVersionNumber(String(values.versionNumber ?? '').trim());
	if (isRefused(versionNumber)) return versionNumber;
	const stationKey = readMapKey(values.stationKey, 'The station');
	if (isRefused(stationKey)) return stationKey;
	const reviewState = readChoice(values.reviewState, stationMarkStates, 'The mark');
	if (isRefused(reviewState)) return reviewState;
	const whatIsWrong = readOptionalText(values.whatIsWrong, whatIsWrongRule);
	if (isRefused(whatIsWrong)) return whatIsWrong;
	const refusal = refuseMismatchedReason(reviewState, whatIsWrong);
	if (refusal !== null) return refusal;
	return { stage, versionNumber, stationKey, reviewState, whatIsWrong };
}

function readVersionNumber(text: string): number | Refusal {
	const versionNumber = Number(text);
	const isWholeNumber = wholeNumberShape.test(text);
	const isInRange = versionNumber >= 1 && versionNumber <= limits.largestVersionNumber;
	if (isWholeNumber && isInRange) return versionNumber;
	return { refusal: `The version must be a whole number from 1 to ${limits.largestVersionNumber}.` };
}

function refuseMismatchedReason(reviewState: StationMarkState, whatIsWrong: string | null): Refusal | null {
	const isNotRight = reviewState === stationReviewStates.notRight;
	if (isNotRight && whatIsWrong === null) return { refusal: 'Say what is wrong, so your Claude can put it right.' };
	if (!isNotRight && whatIsWrong !== null)
		return { refusal: 'What is wrong is kept only with Not right: clear it, or choose Not right.' };
	return null;
}
