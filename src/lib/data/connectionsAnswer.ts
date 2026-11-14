import { connectionKinds, mostAppointmentsForARealDirector, type CompanyConnection, type ConnectionKind, type ConnectionsReading } from './connectionRules';
import { formatBritishDate } from './britishDate';

const connectionWords: Record<ConnectionKind, (connection: CompanyConnection) => string> = {
	[connectionKinds.directorOwns]: (connection) => `${connection.throughName} is a director and owns over 25%`,
	[connectionKinds.directorSits]: (connection) => `${connection.throughName} is a director, with no shareholding on record`,
	[connectionKinds.ownsThisCompany]: () => 'owns over 25% of this company'
};

const kindOrder: ConnectionKind[] = [connectionKinds.ownsThisCompany, connectionKinds.directorOwns, connectionKinds.directorSits];

const leftOutAlways = `Left out: resigned officers, secretaries, companies that are not active, and any officer with more than ${mostAppointmentsForARealDirector} current appointments.`;
const linkedOnly = 'This lists what the public record links, not everything they own: one person can have two officer records when their details were typed differently.';

export function describeConnections(reading: ConnectionsReading): string {
	const sorted = [...reading.connections].sort((first, second) => kindOrder.indexOf(first.kind) - kindOrder.indexOf(second.kind));
	const lines = sorted.map((connection) => `- ${connection.connectedCompanyName} (${connection.connectedCompanyNumber}): ${connectionWords[connection.kind](connection)}`);
	const heading = lines.length === 0 ? `${reading.companyNumber}: no connected company on record.` : `${reading.companyNumber}: ${lines.length} connected companies.`;
	const { leftOutOfficers } = reading;
	const nominees = leftOutOfficers.length === 0 ? '' : `Left out as formation agents or nominees: ${leftOutOfficers.join(', ')}.`;
	const checked = `Checked ${formatBritishDate(reading.checkedAt.slice(0, 10))}.`;
	return [heading, ...lines, leftOutAlways, nominees, linkedOnly, checked].filter((line) => line !== '').join('\n');
}
