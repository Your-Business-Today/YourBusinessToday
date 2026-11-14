import { filingHistoryOrigin } from './accountsBulkFile';

/** The public page a person opens an accounts filing on: its PDF, shown in the browser. */
export function accountsDocumentPage(companyNumber: string, transactionId: string): string {
	return `${filingHistoryOrigin}${companyNumber}/filing-history/${transactionId}/document?format=pdf&download=0`;
}


/** Whether a page is that company's own document on Companies House, as a reading made from a PDF must name. */
export function isCompanyDocumentPage(page: string, companyNumber: string): boolean {
	return page.startsWith(`${filingHistoryOrigin}${companyNumber}/filing-history/`);
}
