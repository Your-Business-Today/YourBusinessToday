import { describe, expect, it } from 'vitest';
import { isAdmittedBy, wasMadeBeforeCutOff } from './admissionFacts';

const stranger = {
	wasMadeBeforeCutOff: false,
	isStaff: false,
	isOnAnOrganisation: false,
	wasAddedToAProject: false,
	isClientContact: false,
};

describe('isAdmittedBy', () => {
	it('keeps a stranger who signed up at the contact page', () => {
		expect(isAdmittedBy(stranger)).toBe(false);
	});

	it('lets in everyone already on the user list', () => {
		expect(isAdmittedBy({ ...stranger, wasMadeBeforeCutOff: true })).toBe(true);
	});

	it('lets in someone brought onto an organisation, a project or the staff, or a client contact', () => {
		expect(isAdmittedBy({ ...stranger, isOnAnOrganisation: true })).toBe(true);
		expect(isAdmittedBy({ ...stranger, wasAddedToAProject: true })).toBe(true);
		expect(isAdmittedBy({ ...stranger, isStaff: true })).toBe(true);
		expect(isAdmittedBy({ ...stranger, isClientContact: true })).toBe(true);
	});
});

describe('wasMadeBeforeCutOff', () => {
	it('reads an account made the day before the video as already on the list', () => {
		expect(wasMadeBeforeCutOff('2026-11-16T09:00:00Z')).toBe(true);
	});

	it('reads an account made after the video, or with no date, as new', () => {
		expect(wasMadeBeforeCutOff('2026-11-18T00:05:00Z')).toBe(false);
		expect(wasMadeBeforeCutOff(null)).toBe(false);
	});
});
