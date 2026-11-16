import { clientStageLabels } from '$lib/data/clientLifecycle';
import { formatBritishDate } from '$lib/data/britishDate';
import { describeClientPremises } from './describeClientPremises';
import { describeCompanyProfile } from './describeCompanyProfile';
import { describeContinuityCopy } from './describeContinuityCopy';
import { describeLeadConversations } from './describeLeadConversations';
import { describeFiledEmails } from './describeFiledEmails';
import { describeLeadOrganisation } from './describeLeadOrganisation';
import type { Client } from '$lib/server/clients/clientRecord';
import type { ClientContact } from '$lib/server/clients/clientContactRecord';
import type { ClientProject } from '$lib/server/clients/getProjectsForClient';
import type { LeadConversation } from '$lib/data/leadConversationRules';
import type { FiledEmail } from '$lib/data/filedEmailRules';
import type { ClientSummary } from '$lib/server/clients/listClients';
import type { Premises } from '$lib/server/premises/premisesRecord';
import type { OrganisationLink } from '$lib/server/onboarding/organisationLinks';

/** The client as the register holds it: who brought it in, its own organisation, and the premises it was made from when it was made from one. */
export type ClientOnRegister = { client: Client; broughtInBy: string; organisation: OrganisationLink | null; premises: Premises[] };

/** What is kept about a client beyond its own row: its contacts, projects, conversations and filed emails. */
export type ClientRecords = { contacts: ClientContact[]; projects: ClientProject[]; conversations: LeadConversation[]; emails: FiledEmail[] };

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
	{ client, broughtInBy, organisation, premises }: ClientOnRegister,
	{ contacts, projects, conversations, emails }: ClientRecords
): string {
	return [
		`${client.name} — ${clientStageLabels[client.stage]} — id ${client.id}`,
		client.website === '' ? null : `Website: ${client.website}`,
		broughtInBy === '' ? 'Brought in by nobody named yet (set_client_brought_in_by)' : `Brought in by ${broughtInBy}`,
		`On the register since ${formatBritishDate(client.createdAt)}`,
		describeLeadOrganisation(organisation),
		describeContinuityCopy(client.continuityCopy),
		'',
		...describeCompanyProfile(client),
		...describeClientPremises(premises, client.website),
		'',
		'Contacts:',
		contacts.length === 0 ? 'None yet.' : contacts.map(describeContactLine).join('\n'),
		'',
		'Conversations, the latest first:',
		...describeLeadConversations(conversations),
		'',
		'Emails filed, the latest first:',
		...describeFiledEmails(emails),
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
	return `${contact.name} (${contact.email}) — ${role} — ${standing} — id ${contact.id} — person ${contact.personId}`;
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
