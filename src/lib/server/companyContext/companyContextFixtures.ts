import { validateCompanyContext } from './validateCompanyContext';

const quotingProcess = {
	key: 'quoting',
	kind: 'process',
	name: 'Quoting',
	confidence: 'low',
	reviewState: 'not_right',
	whatIsWrong: 'The site visit comes before the drawing, not after.',
	steps: [{ does: 'Draw the job', roleKey: 'estimator' }, { does: 'Price it from the rates' }]
};

const quoteSpreadsheet = {
	key: 'quote-spreadsheet',
	kind: 'source',
	name: 'Quote spreadsheet',
	seenInConnector: 'Google Drive',
	seenAtPlace: 'Shared drive, Quotes folder',
	confidence: 'medium'
};

/** A small joinery firm's context as a client's Claude would record it: concepts, never specimens. */
export function joineryContextInput(): Record<string, unknown> {
	const parts = [
		{ key: 'bespoke-joinery', kind: 'context', name: 'Bespoke joinery', isCore: true, confidence: 'high' },
		{ ...quoteSpreadsheet },
		{ key: 'quote', kind: 'record', name: 'Quote', confidence: 'high', reviewState: 'right' },
		{ key: 'estimator', kind: 'role', name: 'Estimator', confidence: 'medium' },
		{ ...quotingProcess }
	];
	const links = [
		{ fromKey: 'quote-spreadsheet', kind: 'creates', toKey: 'quote' },
		{ fromKey: 'quote', kind: 'is_created_by', toKey: 'estimator' }
	];
	return { stage: 'map-data-sources', connectors: ['Gmail', 'Xero'], parts, links };
}

/** The joinery firm's context as it stands recorded, at its third version. */
export function joineryVersion() {
	const draft = validateCompanyContext(joineryContextInput());
	if ('refusal' in draft) throw new Error(draft.refusal);
	return { ...draft, versionNumber: 3, recordedAt: '2026-11-10T17:00:00Z' };
}
