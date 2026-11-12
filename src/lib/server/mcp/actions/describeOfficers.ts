import { formatBritishDate } from '$lib/data/britishDate';
import type { OfficerAppointment } from '$lib/server/companiesHouse/officerAppointmentRecord';
import type { OfficerSearchResult } from '$lib/server/companiesHouse/officerSearchRecord';

export const noOfficerMatched = 'No officer on Companies House matched that name.';
export const everyAppointmentListed = 'Every current appointment of theirs is already on the register.';

/** The officers Companies House found, as the People page lists them: name, how many appointments, when born, where. */
export function describeOfficerSearch(officers: OfficerSearchResult[]): string {
	if (officers.length === 0) return noOfficerMatched;
	return officers.map(describeOfficerLine).join('\n');
}

function describeOfficerLine(officer: OfficerSearchResult): string {
	const born = officer.bornIn === '' ? null : `born ${officer.bornIn}`;
	return [officer.name, appointmentsCount(officer.appointmentCount), born, officer.addressSnippet || null, `officer ${officer.officerId}`]
		.filter((part) => part !== null)
		.join(' — ');
}

function appointmentsCount(count: number): string {
	if (count === 1) return 'one appointment';
	return `${count} appointments`;
}

/** The current appointments of a person that the register does not hold yet, one line each with the company number to import by. */
export function describePendingAppointments(appointments: OfficerAppointment[]): string {
	if (appointments.length === 0) return everyAppointmentListed;
	return appointments.map(describeAppointmentLine).join('\n');
}

function describeAppointmentLine(appointment: OfficerAppointment): string {
	const since = appointment.appointedOn === '' ? null : `since ${formatBritishDate(appointment.appointedOn)}`;
	return [appointment.companyName, appointment.officerRole || null, since, `company number ${appointment.companyNumber}`, appointment.address || null]
		.filter((part) => part !== null)
		.join(' — ');
}
