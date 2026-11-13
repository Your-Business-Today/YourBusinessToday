import { getPortalVisitor } from '$lib/server/portal/getPortalVisitor';
import { notAClientContact } from './clientContactAccess';
import { readOptionalText, textField } from './actionTypes';
import { validateRecordId } from '$lib/data/isUuid';
import type { McpCaller } from './resolveMcpCaller';
import type { PortalVisitor } from '$lib/portal/portalVisitor';

export const notYourOrganisation = 'No organisation you are a contact at has that id. Leave clientId out to see the ones you are at.';
export const notAnAdministrator = 'Only your organisation’s administrators can change its people.';

export const clientIdField = textField(
	'The organisation to act for, by the id the portal answers give it — leave out when you are a contact at one organisation only'
);

/**
 * The caller as a client contact on the portal, working in the organisation they named or, as the portal does,
 * the first of theirs by name; otherwise why not.
 */
export async function portalVisitorOf(caller: McpCaller, input: Record<string, unknown>): Promise<PortalVisitor | string> {
	const chosenClientId = readOptionalText(input, 'clientId');
	const idRefusal = chosenClientId === null ? null : validateRecordId('clientId', chosenClientId);
	if (idRefusal !== null) return idRefusal;
	const visitor = await getPortalVisitor(caller.supabase, caller.accountId, chosenClientId);
	if (visitor === null) return notAClientContact;
	const isAtAnother = chosenClientId !== null && visitor.clientId !== chosenClientId;
	if (isAtAnother) return notYourOrganisation;
	return visitor;
}

export async function portalAdministratorOf(caller: McpCaller, input: Record<string, unknown>): Promise<PortalVisitor | string> {
	const visitor = await portalVisitorOf(caller, input);
	if (typeof visitor === 'string') return visitor;
	if (!visitor.isAdministrator) return notAnAdministrator;
	return visitor;
}

/** Which organisation the answer is about, and the others the person could name instead. */
export function describeVisitorStanding(visitor: PortalVisitor): string {
	const others = visitor.organisations.filter((organisation) => organisation.clientId !== visitor.clientId);
	const here = `For ${visitor.organisationName} (clientId ${visitor.clientId}).`;
	if (others.length === 0) return here;
	const named = others.map((organisation) => `${organisation.name} (clientId ${organisation.clientId})`).join(', ');
	return `${here} You are also at ${named}: give clientId to act there.`;
}
