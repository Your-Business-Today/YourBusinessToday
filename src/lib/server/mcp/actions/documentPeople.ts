import { findOrganisationMember, getMembersOfOrganisation } from '$lib/server/organisations/getMembersOfOrganisation';
import { getPeopleOnProject } from '$lib/server/members/getPeopleOnProject';
import { documentHomes, type ReachedOwner } from './documentHomes';
import { findKeptDocumentById } from '$lib/server/projectDocuments/findProjectDocuments';
import { documentOwnerKinds, type DocumentOwner } from '$lib/projectDocuments/documentOwner';
import type { Account } from '$lib/server/accounts/accountRecord';
import type { McpCaller } from '../resolveMcpCaller';
import type { KeptDocument } from '$lib/projectDocuments/projectDocument';

export const noReachableDocument = 'No document you can reach has that id. Call list_organisation_documents or list_project_documents for the ones you can.';

/** A kept document by its id, with its owner, when the caller reaches that owner. */
export async function reachableDocument(caller: McpCaller, documentId: string): Promise<{ reached: ReachedOwner; document: KeptDocument } | null> {
	const document = await findKeptDocumentById(caller.supabase, documentId);
	if (document === null) return null;
	const { owner } = document;
	const home = documentHomes[owner.kind];
	const reached = await home.reach(caller, owner.id);
	if (reached === null) return null;
	return { reached, document };
}

/** The person named, by id, email or name, among the people on the document's owner; null when nobody there is called that. */
export async function findPersonOnOwner(caller: McpCaller, owner: DocumentOwner, named: string): Promise<Account | null> {
	if (owner.kind === documentOwnerKinds.organisation) {
		return findOrganisationMember(await getMembersOfOrganisation(caller.supabase, owner.id), named);
	}
	const people = await getPeopleOnProject(caller.supabase, owner.id);
	const wanted = named.toLowerCase();
	return people.find((person) => person.id === named || person.email.toLowerCase() === wanted || person.name.toLowerCase() === wanted) ?? null;
}
