import { consultancyOfferSteps } from '$lib/data/consultancyOffer';

export const contextPartKind = {
	context: 'context',
	source: 'source',
	record: 'record',
	process: 'process',
	role: 'role'
} as const;
export const contextPartKinds = Object.values(contextPartKind);
export const confidenceLevels = ['high', 'medium', 'low'] as const;
export const reviewStates = {
	notChecked: 'not_checked',
	right: 'right',
	notRight: 'not_right'
} as const;
export const contextLinkKinds = ['creates', 'is_created_by', 'goes_next_to'] as const;

export type ContextPartKind = (typeof contextPartKind)[keyof typeof contextPartKind];
export type Confidence = (typeof confidenceLevels)[number];
export type ReviewState = (typeof reviewStates)[keyof typeof reviewStates];
export type ContextLinkKind = (typeof contextLinkKinds)[number];

/** The confidence Claude records when it is unsure, so the client is asked about the part. */
export const lowConfidence: Confidence = 'low';

export const contextStages = consultancyOfferSteps.map((step) => step.id);

/** Where Claude saw a part: the connector and the place in it, never what it read there. */
export type SeenIn = { connector: string; place: string | null };

/** One part of the company context: an area, a source, a kind of record, a process or a role. */
export type ContextPart = {
	key: string;
	kind: ContextPartKind;
	name: string;
	description: string | null;
	isCore: boolean;
	seenIn: SeenIn | null;
	confidence: Confidence;
	reviewState: ReviewState;
	whatIsWrong: string | null;
};

/** One step of a process, in order, with the role that does it when Claude knows. */
export type ProcessStep = {
	processKey: string;
	position: number;
	description: string;
	roleKey: string | null;
};

/** What one part does to another: a source creates a record, a record is created by a role, or goes next somewhere. */
export type ContextLink = {
	fromKey: string;
	kind: ContextLinkKind;
	toKey: string;
};

/** Everything one run of a client's Claude records: a whole version, never a change to one. */
export type CompanyContextDraft = {
	stage: string;
	connectors: string[];
	parts: ContextPart[];
	steps: ProcessStep[];
	links: ContextLink[];
};

/** A version as it was kept: its number, who recorded it and when, and what it holds. */
export type CompanyContextVersion = CompanyContextDraft & {
	versionNumber: number;
	recordedAt: string;
};
