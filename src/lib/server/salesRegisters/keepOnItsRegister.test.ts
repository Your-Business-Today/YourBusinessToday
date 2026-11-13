import { describe, expect, it } from 'vitest';
import { isRedirect } from '@sveltejs/kit';
import { keepOnItsRegister } from './keepOnItsRegister';

const companyId = 'a29a0e0e-3a9e-434f-b1c4-1201ff18dec3';

function locationAfter(path: string, registerSegment: string, stage: 'lead' | 'client'): string | null {
	try {
		keepOnItsRegister(new URL(`https://portal.example${path}`), registerSegment, stage);
		return null;
	} catch (thrown) {
		if (!isRedirect(thrown)) throw thrown;
		return thrown.location;
	}
}

describe('keepOnItsRegister', () => {
	it('leaves a lead opened under Leads where it is', () => {
		expect(locationAfter(`/leads/${companyId}`, 'leads', 'lead')).toBeNull();
	});

	it('moves a lead opened by an old Clients link to Leads, keeping the rest of the address', () => {
		expect(locationAfter(`/clients/${companyId}`, 'clients', 'lead')).toBe(`/leads/${companyId}`);
		expect(locationAfter(`/clients/${companyId}/workflow-map?x=1`, 'clients', 'lead')).toBe(`/leads/${companyId}/workflow-map?x=1`);
	});

	it('moves a lead that has signed back to Clients', () => {
		expect(locationAfter(`/leads/${companyId}`, 'leads', 'client')).toBe(`/clients/${companyId}`);
	});
});
