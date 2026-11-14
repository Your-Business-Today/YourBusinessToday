import { filingHistoryOrigin } from './accountsBulkFile';

/** The public page a person opens an accounts filing on: its PDF, shown in the browser. */
export function accountsDocumentPage(companyNumber: string, transactionId: string): string {
	return `${filingHistoryOrigin}${companyNumber}/filing-history/${transactionId}/document?format=pdf&download=0`;
}

