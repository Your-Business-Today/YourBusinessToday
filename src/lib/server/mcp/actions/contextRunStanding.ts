import { consultancyOfferSteps } from '$lib/data/consultancyOffer';
import { contextGaps } from '$lib/server/companyContext/contextGaps';
import { notRightLines } from './describeContextReview';
import type { CompanyContextVersion } from '$lib/data/companyContext/companyContext';

const firstStage = consultancyOfferSteps[0];

/** Step 1 of the context run: what YBT holds, what to put right first, what is missing and what the stage needs. */
export function contextRunStanding(organisationName: string, context: CompanyContextVersion | null): string {
	if (context === null) return emptyStanding(organisationName);
	return [
		`1. **Read what Your Business Today holds.** Version ${context.versionNumber} of ${organisationName}'s company context, recorded ${context.recordedAt.slice(0, 10)}. Read it whole with read_company_context before anything else.`,
		notRightSection(context),
		gapSection(context),
		stageSentence(context.stage)
	]
		.filter((paragraph) => paragraph !== '')
		.join('\n\n');
}

function emptyStanding(organisationName: string): string {
	return (
		`1. **Read what Your Business Today holds.** Nothing yet: this is ${organisationName}'s first run, so it is ` +
		'a broad first conversation. Go through every connector and work out how the business runs, then record ' +
		`version 1 at the stage ${firstStage.id} (${firstStage.name}: ${firstStage.summary})`
	);
}

function notRightSection(context: CompanyContextVersion): string {
	const lines = notRightLines(context);
	if (lines.length === 0) return 'Nothing is marked not right.';
	return ['Put these right first, as the client marked them not right:', ...lines].join('\n');
}

function gapSection(context: CompanyContextVersion): string {
	const gaps = contextGaps(context);
	if (gaps.length === 0) return 'Nothing obvious is missing: ask only what the stage still needs.';
	const lines = gaps.map((gap) => `   - ${gap}`);
	return ['Still missing:', ...lines].join('\n');
}

function stageSentence(stageId: string): string {
	const stage = consultancyOfferSteps.find((step) => step.id === stageId);
	if (stage === undefined) return `The stage recorded is ${stageId}.`;
	return `The stage is ${stage.name}, so the context has to serve this: ${stage.summary} Ask for what that still needs.`;
}
