import { companyDetails } from '$lib/data/companyDetails';
import { documentOwnerKinds, documentsHrefOf, type DocumentOwner, type DocumentOwnerKind } from '$lib/projectDocuments/documentOwner';
import { noReachableProject, reachableProject } from '../projectAccess';
import { noSuchOrganisation, reachableOrganisation } from '../organisationAccess';
import type { ActionArea } from '../actionTypes';
import type { McpCaller } from '../resolveMcpCaller';

/** An owner the caller reaches: who it is and what it is called. */
export type ReachedOwner = { owner: DocumentOwner; name: string };

/** The names of a home's actions: list_project_documents, add_organisation_document and the rest. */
export type DocumentActionNames = { list: string; read: string; add: string; record: string; update: string; remove: string };

export const productDocumentNames = {
	list: 'list_project_documents',
	read: 'read_project_document',
	add: 'add_project_document',
	record: 'record_project_document',
	update: 'update_project_document',
	remove: 'delete_project_document'
};

export const organisationDocumentNames = {
	list: 'list_organisation_documents',
	read: 'read_organisation_document',
	add: 'add_organisation_document',
	record: 'record_organisation_document',
	update: 'update_organisation_document',
	remove: 'delete_organisation_document'
};

/** Whose documents a set of connector actions keeps: a product's or an organisation's, how each is named and how it is reached. */
export type DocumentHome = {
	names: DocumentActionNames;
	kind: DocumentOwnerKind;
	noun: string;
	idField: string;
	idDescription: string;
	area: ActionArea;
	unreachable: string;
	reach: (caller: McpCaller, ownerId: string) => Promise<ReachedOwner | null>;
};

export const productDocumentHome: DocumentHome = {
	names: productDocumentNames,
	kind: documentOwnerKinds.project,
	noun: 'project',
	idField: 'projectId',
	idDescription: 'The project id, as list_projects gives it',
	area: 'projects',
	unreachable: noReachableProject,
	reach: async (caller, projectId) => {
		const project = await reachableProject(caller, projectId);
		if (project === null) return null;
		return { owner: { kind: documentOwnerKinds.project, id: project.id }, name: project.name };
	}
};

export const organisationDocumentHome: DocumentHome = {
	names: organisationDocumentNames,
	kind: documentOwnerKinds.organisation,
	noun: 'organisation',
	idField: 'organisationId',
	idDescription: 'The organisation id, as list_organisations gives it',
	area: 'organisations',
	unreachable: noSuchOrganisation,
	reach: async (caller, organisationId) => {
		const organisation = await reachableOrganisation(caller, organisationId);
		if (organisation === null) return null;
		return { owner: { kind: documentOwnerKinds.organisation, id: organisation.id }, name: organisation.name };
	}
};

export const documentHomes: Record<DocumentOwnerKind, DocumentHome> = { project: productDocumentHome, organisation: organisationDocumentHome };

/** Where a person reads the owner's documents on the site. */
export function documentsPageAddress(owner: DocumentOwner): string {
	return `${companyDetails.websiteUrl}${documentsHrefOf(owner)}`;
}

/** The refusal for a document id the owner does not hold. */
export function noSuchDocumentIn(home: DocumentHome): string {
	const { names, noun } = home;
	return `No document on this ${noun} has that id. Call ${names.list} for the ones it holds.`;
}
