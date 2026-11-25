import { clientDocumentsFor, documentAudiences } from '$lib/data/clientDocumentCatalogue';
import { defaultClauseSlugs, validateChosenClauses } from '$lib/data/contractOptionalClauses';
import { contractPackLimits as limits, type ContractPackRequest } from '$lib/data/contractPackRules';
import { validateRecordId } from '$lib/data/isUuid';
import { blanksWithNoPlace } from './draftContractDocuments';
import { validateWrittenValues } from './validateWrittenValues';

const contractSlugs = clientDocumentsFor(documentAudiences.client).map((entry) => entry.slug);

/** The pack asked for, every value checked, or why it cannot be made, naming the field. */
export function validateContractPackRequest(input: Record<string, unknown>): ContractPackRequest | string {
	const organisationId = String(input.organisationId ?? '').trim();
	const idRefusal = validateRecordId('organisationId', organisationId);
	if (idRefusal !== null) return idRefusal;
	const documentSlugs = readDocumentSlugs(input.documents);
	if (typeof documentSlugs === 'string') return documentSlugs;
	const clauseSlugs = readClauseSlugs(input.clauses);
	if (typeof clauseSlugs === 'string') return clauseSlugs;
	const writtenValues = validateWrittenValues(input.values);
	if (typeof writtenValues === 'string') return writtenValues;
	const placeRefusal = blanksWithNoPlace(documentSlugs, clauseSlugs, Object.keys(writtenValues));
	if (placeRefusal !== null) return placeRefusal;
	return { organisationId, documentSlugs, clauseSlugs, writtenValues };
}

function readSlugs(given: unknown, whenLeftOut: readonly string[]): string[] | null {
	if (given === undefined || given === null) return [...whenLeftOut];
	if (!Array.isArray(given) || !given.every((slug) => typeof slug === 'string')) return null;
	return given.map((slug: string) => slug.trim());
}

function readDocumentSlugs(given: unknown): string[] | string {
	const slugs = readSlugs(given, contractSlugs);
	if (slugs === null) return 'The documents are a list of slugs, as list_client_documents gives them.';
	if (slugs.length === 0) return 'Choose at least one document for the pack.';
	if (slugs.length > limits.mostDocuments) return `A pack holds at most ${limits.mostDocuments} documents.`;
	if (hasRepeats(slugs)) return 'Each document is chosen once.';
	const notAContract = slugs.find((slug) => !contractSlugs.includes(slug));
	if (notAContract === undefined) return slugs;
	return `"${notAContract}" is not a contract document. The contract documents are: ${contractSlugs.join(', ')}.`;
}

function readClauseSlugs(given: unknown): string[] | string {
	const slugs = readSlugs(given, defaultClauseSlugs);
	if (slugs === null) return 'The clauses are a list of optional clause slugs, as read_client_document lists them.';
	if (slugs.length > limits.mostClauses) return `A pack chooses at most ${limits.mostClauses} optional clauses.`;
	if (hasRepeats(slugs)) return 'Each optional clause is chosen once.';
	return validateChosenClauses(slugs) ?? slugs;
}

function hasRepeats(slugs: string[]): boolean {
	const distinct = new Set(slugs);
	return distinct.size !== slugs.length;
}
