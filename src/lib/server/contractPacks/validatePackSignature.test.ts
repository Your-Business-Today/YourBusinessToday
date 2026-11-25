import { describe, expect, it } from 'vitest';
import { validatePackSignature } from './validatePackSignature';
import { validatePackComment } from './validatePackComment';
import { signatureRefusal } from './packSigningRefusals';
import type { ContractPack } from '$lib/data/contractPack';

const documentId = '00000000-0000-4000-8000-000000000002';
const signing = { documentId, versionNumber: '2', signerName: 'Ada Lane', signerPosition: 'Director', signedOn: '2026-11-25', isAuthorisedToSign: 'on' };

const packHolding = (versionNumber: number, isSigned = false) =>
	({
		documents: [
			{
				documentId,
				title: 'Order Form',
				versionNumber,
				signature: isSigned ? { versionNumber, signerName: 'Ada Lane', signerPosition: 'Director', signedOn: '2026-11-25', signedAt: '' } : null
			}
		]
	}) as unknown as ContractPack;

describe('a client signing a document of their pack', () => {
	it('takes a signature with the authority confirmed', () => {
		expect(validatePackSignature(signing)).toEqual({ documentId, versionNumber: 2, signerName: 'Ada Lane', signerPosition: 'Director', signedOn: '2026-11-25' });
	});

	it('refuses a signature without the authority confirmed, without a name or a day', () => {
		expect(validatePackSignature({ ...signing, isAuthorisedToSign: undefined })).toContain('authorised to sign');
		expect(validatePackSignature({ ...signing, signerName: ' ' })).toContain('Your name is 1 to 120');
		expect(validatePackSignature({ ...signing, signedOn: '25/11/2026' })).toContain('a day');
	});

	it('keeps a signature only against the version the pack holds now, and only once', () => {
		const given = { documentId, versionNumber: 2, signerName: 'Ada Lane', signerPosition: 'Director', signedOn: '2026-11-25' };
		expect(signatureRefusal(packHolding(2), given)).toBeNull();
		expect(signatureRefusal(packHolding(3), given)).toContain('now version 3');
		expect(signatureRefusal(packHolding(2, true), given)).toContain('signed already');
	});
});

describe('a client commenting on a clause', () => {
	it('takes a comment and refuses an empty or too long one', () => {
		expect(validatePackComment({ documentId, clause: '9.1', comment: 'We would like to own it.' })).toEqual({ documentId, clause: '9.1', comment: 'We would like to own it.' });
		expect(validatePackComment({ documentId, comment: '' })).toBe('Write the comment.');
		expect(validatePackComment({ documentId, comment: 'x'.repeat(4001) })).toContain('at most 4000');
	});
});
