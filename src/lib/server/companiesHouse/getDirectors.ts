import { companyOfficersUrl } from './getOfficersOfCompany';
import { officerAppointmentsUrl } from './getOfficerAppointments';
import { parseDirectors, type Director } from './directorRecord';
import { parseOfficerAppointments, type OfficerAppointment } from './officerAppointmentRecord';
import { requestCompaniesHouse } from './companiesHouseRequest';

/** A director's current appointments at active companies, and how many current appointments the record says they hold. */
export type DirectorAppointments = { appointments: OfficerAppointment[]; currentCount: number };

export async function getDirectors(companyNumber: string): Promise<Director[]> {
	return parseDirectors(await requestCompaniesHouse(companyOfficersUrl(companyNumber)));
}

export async function getDirectorAppointments(officerId: string): Promise<DirectorAppointments> {
	const body = await requestCompaniesHouse(officerAppointmentsUrl(officerId));
	const { appointments } = parseOfficerAppointments(body);
	return { appointments, currentCount: Number(body.active_count ?? appointments.length) };
}
