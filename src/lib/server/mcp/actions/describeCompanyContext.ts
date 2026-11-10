import { consultancyOfferSteps } from '$lib/data/consultancyOffer';
import { contextPartKind, contextPartKinds, reviewStates } from '$lib/data/companyContext/companyContext';
import { linkKindPhrases, partKindHeadings, reviewStateLabels } from '$lib/data/companyContext/companyContextWords';
import { describeContextPart } from './describeContextPart';
import type { CompanyContextVersion, ContextPartKind } from '$lib/data/companyContext/companyContext';

export function noCompanyContextYet(organisationName: string): string {
	return (
		`No company context has been recorded for ${organisationName} yet. It starts empty: the client's first ` +
		'run records version 1 with record_company_context.'
	);
}

/** The latest version as Markdown: the stage, what is connected, every part with its review, and the links. */
export function describeCompanyContext(organisationName: string, context: CompanyContextVersion): string {
	const recordedDay = context.recordedAt.slice(0, 10);
	const header = `**Company context of ${organisationName}, version ${context.versionNumber}**, recorded ${recordedDay}.`;
	const sections = contextPartKinds.map((kind) => partSection(context, kind)).filter((section) => section !== '');
	return [
		header,
		stageSentence(context.stage),
		connectedSentence(context),
		reviewTally(context),
		...sections,
		linkSection(context)
	]
		.filter((paragraph) => paragraph !== '')
		.join('\n\n');
}

function stageSentence(stageId: string): string {
	const stepIndex = consultancyOfferSteps.findIndex((step) => step.id === stageId);
	const step = consultancyOfferSteps[stepIndex];
	if (step === undefined) return `Stage: ${stageId}.`;
	return `Stage: ${step.name}, step ${stepIndex + 1} of ${consultancyOfferSteps.length} of the offer.`;
}

function connectedSentence({ connectors }: CompanyContextVersion): string {
	if (connectors.length === 0) return 'Connected in Claude: nothing recorded yet.';
	return `Connected in Claude: ${connectors.join(', ')}.`;
}

function reviewTally({ parts }: CompanyContextVersion): string {
	if (parts.length === 0) return 'No parts recorded yet.';
	const counts = Object.values(reviewStates).map((state) => {
		const count = parts.filter((part) => part.reviewState === state).length;
		return `${count} ${reviewStateLabels[state]}`;
	});
	return `${parts.length} parts: ${counts.join(', ')}.`;
}

function partSection(context: CompanyContextVersion, kind: ContextPartKind): string {
	const parts = context.parts.filter((part) => part.kind === kind);
	if (parts.length === 0) return '';
	const roleNames = new Map(
		context.parts.filter((part) => part.kind === contextPartKind.role).map((part) => [part.key, part.name])
	);
	const lines = parts.map((part) => {
		const steps = context.steps.filter((step) => step.processKey === part.key);
		return describeContextPart(part, steps, roleNames);
	});
	return [`### ${partKindHeadings[kind]}`, ...lines].join('\n');
}

function linkSection({ parts, links }: CompanyContextVersion): string {
	if (links.length === 0) return '';
	const names = new Map(parts.map((part) => [part.key, part.name]));
	const lines = links.map((link) => {
		const fromName = names.get(link.fromKey) ?? link.fromKey;
		const toName = names.get(link.toKey) ?? link.toKey;
		return `- ${fromName} ${linkKindPhrases[link.kind]} ${toName}`;
	});
	return ['### Links', ...lines].join('\n');
}
