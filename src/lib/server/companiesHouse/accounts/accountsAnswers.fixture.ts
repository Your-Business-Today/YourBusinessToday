import { readFileSync } from 'node:fs';

export const taggedAccounts = readFileSync(new URL('./fixtures/accounts.html', import.meta.url), 'utf8');
export const microEntityAccounts = readFileSync(new URL('./fixtures/micro-entity.html', import.meta.url), 'utf8');

const storageHost = 'storage.example';
const storageLink = `https://${storageHost}/accounts-document?signature=abc`;
const badRequest = 400;
const found = 302;

/** A filing history page holding one accounts filing, of the type given, whose document is the id given. */
export function accountsFilingAnswer(accountsType: string, documentId: string): Response {
	const item = {
		category: 'accounts',
		description: `accounts-with-accounts-type-${accountsType}`,
		description_values: { made_up_date: '2026-03-31' },
		transaction_id: `transaction-${documentId}`,
		links: { document_metadata: `https://frontend-doc-api.company-information.service.gov.uk/document/${documentId}` }
	};
	return Response.json({ items: [item] });
}

export function noFilingsAnswer(): Response {
	return Response.json({ items: [] });
}

/** A stand-in for the filing history, the Document API and the storage it redirects to, holding the documents given by id. */
export function accountsWorld(filingAnswer: () => Response, taggedDocuments: Record<string, string>, calls: string[]) {
	return async (address: URL | string, init?: RequestInit) => {
		const url = new URL(String(address));
		calls.push(`${url.host}${url.pathname}`);
		const { pathname } = url;
		const isFilingHistory = pathname.includes('/filing-history');
		if (isFilingHistory) return filingAnswer();
		const isStorage = url.host === storageHost;
		const headers = new Headers(init?.headers);
		if (isStorage) return storageAnswer(url, headers, taggedDocuments);
		const documentId = pathname.split('/')[2];
		const isTagged = documentId in taggedDocuments;
		const isContent = pathname.endsWith('/content');
		const redirect = { status: found, headers: { location: `${storageLink}&id=${documentId}` } };
		if (isContent) return new Response(null, redirect);
		const resources = isTagged ? { 'application/pdf': {}, 'application/xhtml+xml': {} } : { 'application/pdf': {} };
		return Response.json({ resources });
	};
}

/** The storage link carries its own authentication, so a call that also sends the key is refused, as the real storage refuses it. */
function storageAnswer(url: URL, headers: Headers, taggedDocuments: Record<string, string>): Response {
	const isKeySent = headers.has('authorization');
	if (isKeySent) return new Response('', { status: badRequest });
	const documentId = url.searchParams.get('id') ?? '';
	return new Response(taggedDocuments[documentId] ?? '');
}
