/** Whom a document belongs to: a product (a project) or an organisation, exactly one of them (migration 0281). */
export const documentOwnerKinds = { project: 'project', organisation: 'organisation' } as const;

export type DocumentOwnerKind = (typeof documentOwnerKinds)[keyof typeof documentOwnerKinds];

export type DocumentOwner = { kind: DocumentOwnerKind; id: string };

const ownerColumns: Record<DocumentOwnerKind, string> = { project: 'project_id', organisation: 'organisation_id' };

const ownerFolders: Record<DocumentOwnerKind, string> = { project: '', organisation: 'organisations/' };

const ownerPages: Record<DocumentOwnerKind, string> = { project: '/projects', organisation: '/organisations' };

/** The column of project_documents that names this owner. */
export function ownerColumnOf(owner: DocumentOwner): string {
	return ownerColumns[owner.kind];
}

/** The folder of the bucket an owner's files are kept under: a product's at its own id, as they always were, an organisation's beside them. */
export function ownerFolderOf(owner: DocumentOwner): string {
	return `${ownerFolders[owner.kind]}${owner.id}`;
}

/** Where an owner's Documents page is on the site. */
export function documentsHrefOf(owner: DocumentOwner): string {
	return `${ownerPages[owner.kind]}/${owner.id}/documents`;
}

/** The owner a project_documents row names. */
export function ownerOfRow(row: Record<string, unknown>): DocumentOwner {
	const projectId = (row.project_id as string | null) ?? null;
	if (projectId !== null) return { kind: documentOwnerKinds.project, id: projectId };
	return { kind: documentOwnerKinds.organisation, id: row.organisation_id as string };
}
