import { contextPartKind, contextPartKinds, lowConfidence } from '$lib/data/companyContext/companyContext';
import { partKindHeadings } from '$lib/data/companyContext/companyContextWords';
import type { CompanyContextVersion, ContextPartKind } from '$lib/data/companyContext/companyContext';

/** What a kept version still lacks, one sentence each: the gaps a client's next run asks about. */
export function contextGaps(context: CompanyContextVersion): string[] {
	const gaps = [
		coreGap(context),
		...contextPartKinds.map((kind) => missingKindGap(context, kind)),
		...processesWithoutSteps(context),
		lowConfidenceGap(context),
		connectorGap(context)
	];
	return gaps.filter((gap): gap is string => gap !== null);
}

function coreGap({ parts }: CompanyContextVersion): string | null {
	const hasCore = parts.some((part) => part.isCore);
	if (hasCore) return null;
	return 'No area is marked as the core of the business.';
}

function missingKindGap({ parts }: CompanyContextVersion, kind: ContextPartKind): string | null {
	const hasKind = parts.some((part) => part.kind === kind);
	if (hasKind) return null;
	return `No ${partKindHeadings[kind].toLowerCase()} yet.`;
}

function processesWithoutSteps({ parts, steps }: CompanyContextVersion): string[] {
	const processes = parts.filter((part) => part.kind === contextPartKind.process);
	const stepless = processes.filter((process) => !steps.some((step) => step.processKey === process.key));
	return stepless.map((process) => `${process.name} has no steps yet.`);
}

function lowConfidenceGap({ parts }: CompanyContextVersion): string | null {
	const unsure = parts.filter((part) => part.confidence === lowConfidence);
	if (unsure.length === 0) return null;
	const names = unsure.map((part) => part.name);
	return `Recorded with low confidence, so worth asking about: ${names.join(', ')}.`;
}

function connectorGap({ connectors }: CompanyContextVersion): string | null {
	if (connectors.length > 0) return null;
	return 'No connectors are recorded as switched on.';
}
