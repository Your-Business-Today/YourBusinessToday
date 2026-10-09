import { clientEventLabels } from '$lib/data/clientEventLabels';
import { clientStageLabels } from '$lib/data/clientLifecycle';
import { formatBritishDate } from '$lib/data/britishDate';
import type { Client } from '$lib/server/clients/clientRecord';
import type { ClientContact } from '$lib/server/clients/clientContactRecord';
import type { ClientEvent } from '$lib/server/clients/recordClientEvent';
import type { ClientProject } from '$lib/server/clients/getProjectsForClient';
import type { ClientSummary } from '$lib/server/clients/listClients';

export const noSuchClient = 'No client on the register has that id. Call list_clients to see them.';

export function describeClientList(clients: ClientSummary[]): string {
	if (clients.length === 0) return 'No clients are on the register yet.';
	return clients.map(describeClientLine).join('\n');
}

function describeClientLine(client: ClientSummary): string {
	return [
		`${client.name} — ${clientStageLabels[client.stage]}`,
		`id ${client.id}`,
		client.primaryContactName === '' ? 'no named contact' : client.primaryContactName,
		`${client.projectCount} project(s)`,
		`${client.awaitingAnswerCount} support task(s) awaiting an answer`
	].join(' — ');
}

export function describeClientInFull(
	client: Client,
	contacts: ClientContact[],
	projects: ClientProject[]
): string {
	return [
		`${client.name} — ${clientStageLabels[client.stage]} — id ${client.id}`,
		client.website === '' ? null : `Website: ${client.website}`,
		`On the register since ${formatBritishDate(client.createdAt)}`,
		'',
		'Contacts:',
		contacts.length === 0 ? 'None yet.' : contacts.map(describeContactLine).join('\n'),
		'',
		'Projects:',
		projects.length === 0 ? 'None assigned yet.' : projects.map(describeProjectLine).join('\n')
	]
		.filter((line) => line !== null)
		.join('\n');
}

function describeContactLine(contact: ClientContact): string {
	const standing = contact.accountId === null ? 'not invited yet' : 'has a sign-in';
	const role = describeContactRole(contact);
	return `${contact.name} (${contact.email}) — ${role} — ${standing} — id ${contact.id}`;
}

function describeContactRole(contact: ClientContact): string {
	if (contact.isPrimary) return 'primary contact';
	if (contact.role === '') return 'contact';
	return contact.role;
}

function describeProjectLine(project: ClientProject): string {
	const awaiting = `${project.awaitingAnswerCount} support task(s) awaiting an answer`;
	return `${project.name} — id ${project.id} — ${awaiting}`;
}

export function describeClientEvents(events: ClientEvent[]): string {
	if (events.length === 0) return 'Nothing has been recorded against this client yet.';
	return events.map(describeEventLine).join('\n');
}

function describeEventLine(event: ClientEvent): string {
	const when = formatBritishDate(event.createdAt);
	return `${when} — ${clientEventLabels[event.kind]}${describeEventDetail(event.detail)}`;
}

function describeEventDetail(detail: Record<string, unknown>): string {
	const words = Object.values(detail).filter((value) => typeof value === 'string');
	if (words.length === 0) return '';
	return `: ${words.join(', ')}`;
}
