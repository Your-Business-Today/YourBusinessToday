import { describeClientDocument, describeClientDocumentCatalogue } from './describeClientDocuments';
import { findClientDocumentEntry, noSuchClientDocument, validateClientDocumentSlug } from '$lib/data/clientDocumentCatalogue';
import { objectSchema, readText, textField } from '../actionTypes';
import { readClientDocumentBySlug } from '$lib/server/clientDocuments/readClientDocumentBySlug';
import type { McpAction } from '../actionTypes';

const documentsGuidance =
	'These are the documents we sign a client with and the procedures behind them, kept in the repository and ' +
	'read as written. The Word pack a client is sent is downloaded from the admin Documents page, not through ' +
	'the connector; read_client_document gives the same text as Markdown.';

export const clientDocumentActions: McpAction[] = [
	{
		name: 'list_client_documents',
		area: 'clients',
		audience: 'admin',
		isWrite: false,
		summary: 'the contract documents a client signs and the internal procedures behind them, each with its slug',
		guidance: documentsGuidance,
		inputSchema: objectSchema({}),
		run: async () => describeClientDocumentCatalogue()
	},
	{
		name: 'read_client_document',
		area: 'clients',
		audience: 'admin',
		isWrite: false,
		summary: 'read one contract document or procedure in full, as Markdown',
		guidance: documentsGuidance,
		inputSchema: objectSchema({ slug: textField('The document slug, as list_client_documents gives it') }, ['slug']),
		run: async (_caller, input) => {
			const slug = readText(input, 'slug');
			const slugRefusal = validateClientDocumentSlug(slug);
			if (slugRefusal !== null) return slugRefusal;
			const entry = findClientDocumentEntry(slug);
			const markdown = readClientDocumentBySlug(slug);
			if (entry === undefined || markdown === undefined) return noSuchClientDocument;
			return describeClientDocument(entry, markdown);
		}
	}
];
