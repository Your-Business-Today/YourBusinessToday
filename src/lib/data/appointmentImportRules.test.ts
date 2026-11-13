import { describe, expect, it } from 'vitest';
import { appointmentChoiceRefusals, validateAppointmentChoice } from './appointmentImportRules';

describe('choosing appointments to import', () => {
	it('normalises each company number and drops a repeat, with the group name trimmed', () => {
		expect(validateAppointmentChoice({ companyNumbers: ['1234567', 'sc 123456', '01234567'], groupName: ' Rivers group ' })).toEqual({
			companyNumbers: ['01234567', 'SC123456'],
			groupName: 'Rivers group'
		});
	});

	it('refuses no numbers, a number that is not one, and a group name too long for its column', () => {
		expect(validateAppointmentChoice({})).toBe(appointmentChoiceRefusals.numbersRequired);
		expect(validateAppointmentChoice({ companyNumbers: [] })).toBe(appointmentChoiceRefusals.numbersRequired);
		expect(validateAppointmentChoice({ companyNumbers: ['12-34'] })).toContain('is not a company number');
		expect(validateAppointmentChoice({ companyNumbers: ['12345678'], groupName: 'x'.repeat(161) })).toBe(appointmentChoiceRefusals.groupNameTooLong);
	});
});
