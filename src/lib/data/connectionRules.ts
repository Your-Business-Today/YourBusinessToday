import { validateCompanyNumber } from './prospectRules';

/** How a company is connected to the one being looked at. */
export const connectionKinds = {
	directorOwns: 'director_owns',
	directorSits: 'director_sits',
	ownsThisCompany: 'owns_this_company'
} as const;
export type ConnectionKind = (typeof connectionKinds)[keyof typeof connectionKinds];

/** An officer with more current appointments than this is a formation agent or a nominee, and is left out. */
export const mostAppointmentsForARealDirector = 25;

/** A company's connections are read again once they are older than this. */
export const connectionsFreshForDays = 30;

/** The column limits of company_connections (0240), stated once for the door and the migration to agree on. */
export const connectionLimits = { name: 200, leftOutOfficers: 100 };

/** One company connected to another, and through whom. */
export type CompanyConnection = { connectedCompanyNumber: string; connectedCompanyName: string; kind: ConnectionKind; throughName: string };

/** What was found for one company: its connections, the officers left out by name, and when it was checked. */
export type ConnectionsReading = { companyNumber: string; connections: CompanyConnection[]; leftOutOfficers: string[]; checkedAt: string };

/** Why the reading cannot be stored as it stands, naming the field and the limit, or null when it fits. */
export function validateConnectionsReading(reading: ConnectionsReading): string | null {
	const notANumber = validateCompanyNumber(reading.companyNumber);
	if (notANumber !== null) return notANumber;
	const { connections, leftOutOfficers } = reading;
	const isTooManyLeftOut = leftOutOfficers.length > connectionLimits.leftOutOfficers;
	if (isTooManyLeftOut) return `leftOutOfficers holds more than ${connectionLimits.leftOutOfficers} names: not stored.`;
	const names = [...leftOutOfficers, ...connections.flatMap((connection) => [connection.connectedCompanyName, connection.throughName])];
	const tooLongName = names.find((name) => name.length > connectionLimits.name);
	if (tooLongName !== undefined) return `A name is longer than ${connectionLimits.name} characters: not stored.`;
	const badNumber = connections.map((connection) => validateCompanyNumber(connection.connectedCompanyNumber)).find((refusal) => refusal !== null);
	return badNumber ?? null;
}
