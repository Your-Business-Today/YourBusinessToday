import type { RequestEvent } from '@sveltejs/kit';
import { requireOrganisationAccess } from '$lib/server/auth/requireOrganisationAccess';
import { requireProjectAccess } from '$lib/server/auth/requireProjectAccess';
import { documentOwnerKinds, type DocumentOwner } from '$lib/projectDocuments/documentOwner';

/** The owner a Documents page is on, and the signed-in person on it; a page the person cannot reach is a 404. */
export type DocumentPageOwner = { owner: DocumentOwner; name: string; accountId: string };

/** A request to one of a Documents page's doors. */
export type DocumentPageRequest = RequestEvent<Record<string, string>>;

/** Finds the owner a Documents page's address names, as the signed-in person reaches it. */
export type ReachPageOwner = (locals: App.Locals, params: Record<string, string>) => Promise<DocumentPageOwner>;

export const reachProductPage: ReachPageOwner = async (locals, params) => {
	const { user, project } = await requireProjectAccess(locals, params.projectId);
	return { owner: { kind: documentOwnerKinds.project, id: project.id }, name: project.name, accountId: user.id };
};

export const reachOrganisationPage: ReachPageOwner = async (locals, params) => {
	const { user, organisation } = await requireOrganisationAccess(locals, params.organisationId);
	return { owner: { kind: documentOwnerKinds.organisation, id: organisation.id }, name: organisation.name, accountId: user.id };
};
