import { describe, expect, it } from 'vitest';
import { validateCountersignature } from './validateCountersignature';
import { countersignRefusal, documentsAwaitingCopy } from './countersignRefusals';
import type { ContractPack, ContractPackDocument } from '$lib/data/contractPack';
import type { ContractPackStage } from '$lib/data/contractPackRules';

const packId = '00000000-0000-4000-8000-000000000001';
const given = { packId, signerName: 'James Beadle', signerPosition: 'Director', signedOn: '2026-11-25' };
const signature = { versionNumber: 2, signerName: 'Ada Lane', signerPosition: 'Director', signedOn: '2026-11-24', signedAt: '2026-11-24T10:00:00Z' };
const countersignature = { signerName: 'James Beadle', signerPosition: 'Director', signedOn: '2026-11-25', signedAt: '2026-11-25T18:00:00Z' };

function documentAt(versionNumber: number, changes: Partial<ContractPackDocument> = {}): ContractPackDocument {
	return { documentId: 'document', templateSlug: 'order-form', title: 'Order Form', versionNumber, openBlanks: [], signature, signedCopyVersion: null, ...changes };
}

function packOf(stage: ContractPackStage, documents: ContractPackDocument[], changes: Partial<ContractPack> = {}): ContractPack {
	return { id: packId, organisationId: 'organisation', stage, chosenClauses: [], quoteVersion: null, preparedAt: '', viewedAt: null, sending: null, countersignature: null, documents, comments: [], ...changes };
}

describe('a YBT director countersigning a pack', () => {
	it('takes a name, a position and a day', () => {
		expect(validateCountersignature(given)).toEqual(given);
	});

	it('refuses, naming the field, a value its column cannot hold', () => {
		expect(validateCountersignature({ ...given, packId: 'pack' })).toContain('packId');
		expect(validateCountersignature({ ...given, signerName: '' })).toBe('Your name is 1 to 120 characters.');
		expect(validateCountersignature({ ...given, signerPosition: 'x'.repeat(121) })).toBe('Your position is 1 to 120 characters.');
		expect(validateCountersignature({ ...given, signedOn: '25/11/2026' })).toBe('The date you sign is a day, such as 2026-11-25.');
	});

	it('countersigns only a pack the client has signed throughout, as it was signed', () => {
		expect(countersignRefusal(packOf('signed_by_client', [documentAt(2)]))).toBeNull();
		expect(countersignRefusal(packOf('viewed', [documentAt(2)]))).toBe('The client has not signed every document yet: the pack is viewed by the client.');
		expect(countersignRefusal(packOf('countersigned', [documentAt(2)], { countersignature }))).toBe('This pack is countersigned already.');
		expect(countersignRefusal(packOf('signed_by_client', [documentAt(3)]))).toContain('has changed since the client signed version 2');
	});

	it('picks up a countersigning that stopped part way, keeping no document twice', () => {
		const kept = documentAt(3, { documentId: 'kept', signedCopyVersion: 3 });
		const pack = packOf('signed_by_client', [kept, documentAt(2)]);
		expect(countersignRefusal(pack)).toBeNull();
		expect(documentsAwaitingCopy(pack).map((document) => document.documentId)).toEqual(['document']);
	});
});
