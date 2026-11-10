import { companyContextLimits as limits } from '$lib/data/companyContext/companyContextLimits';
import { confidenceLevels, contextPartKind, reviewStates } from '$lib/data/companyContext/companyContext';
import { isRefused, readChoice, readOptionalText } from './contextText';
import type { ContextPart, SeenIn } from '$lib/data/companyContext/companyContext';
import type { Refusal } from '$lib/server/portal/portalFormReading';

/** Where a part stands: whether it is the core, where it was seen, how sure Claude is and what the client said. */
export type PartStanding = Pick<ContextPart, 'isCore' | 'seenIn' | 'confidence' | 'reviewState' | 'whatIsWrong'>;

type PartBeingRead = { kind: string; label: string };
type Review = Pick<ContextPart, 'reviewState' | 'whatIsWrong'>;

const reviewStateChoices = Object.values(reviewStates);

export function readPartStanding(fields: Record<string, unknown>, part: PartBeingRead): PartStanding | Refusal {
	const isCore = readIsCore(fields.isCore, part);
	if (isRefused(isCore)) return isCore;
	const seenIn = readSeenIn(fields, part.label);
	if (isRefused(seenIn)) return seenIn;
	const confidence = readChoice(fields.confidence, confidenceLevels, `${part.label} confidence`);
	if (isRefused(confidence)) return confidence;
	const review = readReview(fields, part.label);
	if (isRefused(review)) return review;
	return { isCore, seenIn, confidence, ...review };
}

function readIsCore(value: unknown, part: PartBeingRead): boolean | Refusal {
	if (value === undefined || value === null || value === false) return false;
	if (value !== true) return { refusal: `${part.label} isCore must be true or false.` };
	if (part.kind === contextPartKind.context) return true;
	return { refusal: `${part.label} is a ${part.kind}: only an area of the business (a context) can be the core.` };
}

function readSeenIn(fields: Record<string, unknown>, label: string): SeenIn | null | Refusal {
	const connectorRule = { field: `${label} seenInConnector`, limit: limits.connectorLength };
	const connector = readOptionalText(fields.seenInConnector, connectorRule);
	if (isRefused(connector)) return connector;
	const place = readOptionalText(fields.seenAtPlace, { field: `${label} seenAtPlace`, limit: limits.placeLength });
	if (isRefused(place)) return place;
	if (connector !== null) return { connector, place };
	if (place === null) return null;
	return { refusal: `${label} seenAtPlace needs seenInConnector: name the connector the place is in.` };
}

function readReview(fields: Record<string, unknown>, label: string): Review | Refusal {
	const given = fields.reviewState ?? reviewStates.notChecked;
	const reviewState = readChoice(given, reviewStateChoices, `${label} reviewState`);
	if (isRefused(reviewState)) return reviewState;
	const rule = { field: `${label} whatIsWrong`, limit: limits.whatIsWrongLength };
	const whatIsWrong = readOptionalText(fields.whatIsWrong, rule);
	if (isRefused(whatIsWrong)) return whatIsWrong;
	const isNotRight = reviewState === reviewStates.notRight;
	if (isNotRight && whatIsWrong === null)
		return { refusal: `${label} is not right: say what is wrong in whatIsWrong.` };
	if (!isNotRight && whatIsWrong !== null)
		return { refusal: `${label} whatIsWrong is only for a part that is not right.` };
	return { reviewState, whatIsWrong };
}
