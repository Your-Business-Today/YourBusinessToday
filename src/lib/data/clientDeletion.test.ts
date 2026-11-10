import { describe, expect, it } from 'vitest';
import { isContinuityCopyRecorded, refusalToDeleteClient, type ClientStanding } from './clientDeletion';
import { noContinuityCopy } from './continuityCopy';

const mistake: ClientStanding = { projectCount: 0, invoiceCount: 0, groupedCompanyCount: 0, hasContinuityCopy: false };

describe('refusalToDeleteClient', () => {
	it('lets a record holding nothing be deleted', () => {
		expect(refusalToDeleteClient('Personal', mistake)).toBeNull();
	});

	it('keeps a client with projects, naming them and the way to retire it instead', () => {
		const refusal = refusalToDeleteClient('Jewel Enterprises Ltd', { ...mistake, projectCount: 7 });
		expect(refusal).toBe(
			'Jewel Enterprises Ltd cannot be deleted: it has 7 projects. ' +
				'Move it to dormant or lost instead, so the register keeps it and its history.'
		);
	});

	it('keeps a client with invoices', () => {
		expect(refusalToDeleteClient('Acme', { ...mistake, invoiceCount: 1 })).toContain('it has one invoice.');
	});

	it('keeps a client heading a group', () => {
		const refusal = refusalToDeleteClient('Acme Group', { ...mistake, groupedCompanyCount: 2 });
		expect(refusal).toContain('it has 2 companies grouped under it.');
	});

	it('keeps a client with a continuity copy', () => {
		const refusal = refusalToDeleteClient('Acme', { ...mistake, hasContinuityCopy: true });
		expect(refusal).toContain('it has a continuity copy recorded.');
	});

	it('names every reason at once', () => {
		const standing = { projectCount: 2, invoiceCount: 3, groupedCompanyCount: 0, hasContinuityCopy: true };
		const refusal = refusalToDeleteClient('Acme', standing);
		expect(refusal).toContain('it has 2 projects, 3 invoices and a continuity copy recorded.');
	});
});

describe('isContinuityCopyRecorded', () => {
	it('is false while nothing of the copy is recorded', () => {
		expect(isContinuityCopyRecorded(noContinuityCopy)).toBe(false);
	});

	it('is true once the storage is connected', () => {
		expect(isContinuityCopyRecorded({ ...noContinuityCopy, storageConnectedOn: '2026-11-01' })).toBe(true);
	});
});
