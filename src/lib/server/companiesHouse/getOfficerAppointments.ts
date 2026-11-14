import { companiesHouseApiOrigin, requestCompaniesHouse } from './companiesHouseRequest';
import { parseOfficerAppointments, type OfficerAppointments } from './officerAppointmentRecord';

const longestResultPage = 50;

export async function getOfficerAppointments(officerId: string): Promise<OfficerAppointments> {
	return parseOfficerAppointments(await requestCompaniesHouse(officerAppointmentsUrl(officerId)));
}

export function officerAppointmentsUrl(officerId: string): URL {
	const url = new URL(`/officers/${encodeURIComponent(officerId)}/appointments`, companiesHouseApiOrigin);
	url.searchParams.set('items_per_page', String(longestResultPage));
	return url;
}
