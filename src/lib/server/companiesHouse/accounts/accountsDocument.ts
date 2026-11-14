import { requestCompaniesHouse, requestCompaniesHouseDocument } from '../companiesHouseRequest';

export const documentApiOrigin = 'https://document-api.company-information.service.gov.uk';
export const taggedAccountsType = 'application/xhtml+xml';

/** One call: whether the document is held as tagged accounts, or only as a PDF. */
export async function isHeldAsTaggedAccounts(documentId: string): Promise<boolean> {
	const metadata = await requestCompaniesHouse(documentUrlOf(documentId, ''));
	const resources = (metadata.resources ?? {}) as Record<string, unknown>;
	return taggedAccountsType in resources;
}

/** One call: the tagged accounts document itself. */
export function readTaggedAccounts(documentId: string): Promise<string> {
	return requestCompaniesHouseDocument(documentUrlOf(documentId, '/content'), taggedAccountsType);
}

function documentUrlOf(documentId: string, suffix: string): URL {
	return new URL(`/document/${encodeURIComponent(documentId)}${suffix}`, documentApiOrigin);
}
