import type { DocumentOwner } from '$lib/projectDocuments/documentOwner';

/** Who is adding a document, and to whose documents. */
export type DocumentAdder = { owner: DocumentOwner; accountId: string };
