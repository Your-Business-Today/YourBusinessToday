/** Where a document stands: a draft the team works on, in review, or approved (migration 0281). */
export const documentStatuses = ['draft', 'in_review', 'approved'] as const;

export type DocumentStatus = (typeof documentStatuses)[number];

/** A new document starts as a draft. */
export const defaultDocumentStatus: DocumentStatus = 'draft';

export const documentStatusWords: Record<DocumentStatus, string> = { draft: 'Draft', in_review: 'In review', approved: 'Approved' };

/** Whether a document is material that came in, or what was made: outputs are usually the valuable part, so they are listed first. */
export const documentFlows = ['output', 'input'] as const;

export type DocumentFlow = (typeof documentFlows)[number];

/** A document is an output unless it is said to be an input. */
export const defaultDocumentFlow: DocumentFlow = 'output';

export const documentFlowWords: Record<DocumentFlow, string> = { output: 'Outputs', input: 'Inputs' };
