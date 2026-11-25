import { clausePlaces, contractOptionalClauses } from '$lib/data/contractOptionalClauses';
import { readClientDocumentBySlug } from './readClientDocumentBySlug';
import { readOptionalClause } from './readOptionalClause';

const orderFormChangesSection = 9;

/** A contract template with the optional clauses a pack chose put in their places, the template itself unchanged. */
export function assembleContractDocument(slug: string, chosenClauseSlugs: readonly string[]): string | undefined {
	const template = readClientDocumentBySlug(slug);
	if (template === undefined) return undefined;
	const lines = template.split('\n');
	const chosen = contractOptionalClauses.filter((clause) => chosenClauseSlugs.includes(clause.slug));
	const afterEntireAgreement = chosen.filter((clause) => clause.place === clausePlaces.afterEntireAgreement);
	const orderFormChanges = chosen.filter((clause) => clause.place === clausePlaces.orderFormChanges);
	const withMsaClauses = insertAfterAnchor(lines, clausePlaces.afterEntireAgreement.anchor, afterEntireAgreement.map(textOf));
	return replaceAnchor(withMsaClauses, clausePlaces.orderFormChanges.anchor, orderFormChanges.map(numberedChange)).join('\n');
}

function textOf({ slug }: { slug: string }): string {
	return readOptionalClause(slug) ?? '';
}

function numberedChange(clause: { slug: string; title: string }, index: number): string {
	return `### ${orderFormChangesSection}.${index + 1} ${clause.title}\n\n${textOf(clause)}`;
}

function insertAfterAnchor(lines: string[], anchor: string, texts: string[]): string[] {
	const at = lines.findIndex((line) => line.startsWith(anchor));
	if (at === -1 || texts.length === 0) return lines;
	const inserted = texts.flatMap((text) => ['', text]);
	return [...lines.slice(0, at + 1), ...inserted, ...lines.slice(at + 1)];
}

function replaceAnchor(lines: string[], anchor: string, texts: string[]): string[] {
	const at = lines.findIndex((line) => line.startsWith(anchor));
	if (at === -1 || texts.length === 0) return lines;
	return [...lines.slice(0, at), texts.join('\n\n'), ...lines.slice(at + 1)];
}
