import { companyContextLimits as limits } from '$lib/data/companyContext/companyContextLimits';
import { contextStages } from '$lib/data/companyContext/companyContext';
import { isRefused, readChoice, readList, readRequiredText } from './contextText';
import { validateContextLinks } from './validateContextLinks';
import { validateContextParts } from './validateContextParts';
import type { CompanyContextDraft } from '$lib/data/companyContext/companyContext';
import type { Refusal } from '$lib/server/portal/portalFormReading';

/** Reads a whole version from a connector call and refuses the first value that does not fit its column. */
export function validateCompanyContext(input: Record<string, unknown>): CompanyContextDraft | Refusal {
	const stage = readChoice(input.stage, contextStages, 'stage');
	if (isRefused(stage)) return stage;
	const connectors = readConnectors(input.connectors);
	if (isRefused(connectors)) return connectors;
	const readParts = validateContextParts(input.parts);
	if (isRefused(readParts)) return readParts;
	const partKeys = new Set(readParts.parts.map((part) => part.key));
	const links = validateContextLinks(input.links, partKeys);
	if (isRefused(links)) return links;
	return {
		stage,
		connectors,
		parts: readParts.parts,
		steps: readParts.steps,
		links
	};
}

function readConnectors(value: unknown): string[] | Refusal {
	const candidates = readList(value, limits.mostConnectors, 'connectors');
	if (isRefused(candidates)) return candidates;
	const connectors: string[] = [];
	for (const [index, candidate] of candidates.entries()) {
		const connector = readRequiredText(candidate, {
			field: `Connector ${index + 1}`,
			limit: limits.connectorLength
		});
		if (isRefused(connector)) return connector;
		if (connectors.includes(connector))
			return {
				refusal: `Connector ${index + 1} repeats ${connector}: name each once.`
			};
		connectors.push(connector);
	}
	return connectors;
}
