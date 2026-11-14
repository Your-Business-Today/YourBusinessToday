import { connectionKinds, mostAppointmentsForARealDirector, type CompanyConnection, type ConnectionsReading } from '$lib/data/connectionRules';
import { getDirectorAppointments, getDirectors } from '$lib/server/companiesHouse/getDirectors';
import { getSignificantControl } from '$lib/server/companiesHouse/getSignificantControl';
import { isDirectorRole } from '$lib/server/companiesHouse/directorRole';
import { isSamePerson } from './directorMatch';
import type { Director } from '$lib/server/companiesHouse/directorRecord';
import type { OfficerAppointment } from '$lib/server/companiesHouse/officerAppointmentRecord';
import type { SignificantControl } from '$lib/server/companiesHouse/significantControlRecord';

type ControlLists = Map<string, Promise<SignificantControl[]>>;

/** Who is behind a company: the companies that own over 25% of it, and each director's other companies, owned or only sat on. */
export async function findCompanyConnections(companyNumber: string, suppressed: Set<string>): Promise<ConnectionsReading> {
	const controlLists: ControlLists = new Map();
	const [directors, owners] = await Promise.all([getDirectors(companyNumber), controlListOf(companyNumber, controlLists)]);
	const connections: CompanyConnection[] = owners.filter((owner) => owner.companyNumber !== '' && !suppressed.has(owner.companyNumber)).map(ownerConnection);
	const leftOutOfficers: string[] = [];
	for (const director of directors) {
		const { appointments, currentCount } = await getDirectorAppointments(director.officerId);
		const isNominee = currentCount > mostAppointmentsForARealDirector;
		if (isNominee) leftOutOfficers.push(director.name);
		const otherCompanies = isNominee ? [] : appointments.filter((appointment) => isOtherDirectorship(appointment, companyNumber, suppressed));
		for (const appointment of otherCompanies) connections.push(await directorConnection(director, appointment, controlLists));
	}
	return { companyNumber, connections, leftOutOfficers, checkedAt: new Date().toISOString() };
}

function controlListOf(companyNumber: string, controlLists: ControlLists): Promise<SignificantControl[]> {
	const known = controlLists.get(companyNumber);
	if (known !== undefined) return known;
	const asked = getSignificantControl(companyNumber);
	controlLists.set(companyNumber, asked);
	return asked;
}

function isOtherDirectorship(appointment: OfficerAppointment, companyNumber: string, suppressed: Set<string>): boolean {
	const isElsewhere = appointment.companyNumber !== companyNumber && !suppressed.has(appointment.companyNumber);
	return isElsewhere && isDirectorRole(appointment.officerRole);
}

async function directorConnection(director: Director, appointment: OfficerAppointment, controlLists: ControlLists): Promise<CompanyConnection> {
	const controllers = await controlListOf(appointment.companyNumber, controlLists);
	const isOwner = controllers.some((entry) => isSamePerson(director, entry));
	const kind = isOwner ? connectionKinds.directorOwns : connectionKinds.directorSits;
	return { connectedCompanyNumber: appointment.companyNumber, connectedCompanyName: appointment.companyName, kind, throughName: director.name };
}

function ownerConnection(owner: SignificantControl): CompanyConnection {
	return { connectedCompanyNumber: owner.companyNumber, connectedCompanyName: owner.name, kind: connectionKinds.ownsThisCompany, throughName: '' };
}
