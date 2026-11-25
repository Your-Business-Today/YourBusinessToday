import { beforeEach, describe, expect, it, vi } from 'vitest';
import { organisationDocumentActions, projectDocumentActions } from './projectDocumentActions';
import type { McpCaller } from '../resolveMcpCaller';

const harbourId = '11111111-1111-4111-8111-111111111111';
const specId = '22222222-2222-4222-8222-222222222222';
const guideId = '33333333-3333-4333-8333-333333333333';
const acmeId = '44444444-4444-4444-8444-444444444444';
const placed = { owner: { kind: 'project', id: harbourId }, summary: '', addedBy: 'nigel', recordedAt: '2026-11-22T10:00:00Z', status: 'approved', flow: 'output' };
const spec = { ...placed, id: specId, title: 'Specification', section: 'Product', position: 1, filename: 'spec.pdf', mimeType: 'application/pdf', byteCount: 2_097_152, isWritten: false, storagePath: `${harbourId}/${specId}/spec.pdf`, versionNumber: 1 };
const guide = { ...placed, id: guideId, title: 'How it works', section: 'Guides', position: 0, filename: 'how-it-works.md', mimeType: 'text/markdown', byteCount: 40, isWritten: true, storagePath: null, versionNumber: 2 };
const guideVersion = (versionNumber: number) => ({ id: `v${versionNumber}`, documentId: guideId, versionNumber, filename: 'how-it-works.md', mimeType: 'text/markdown', byteCount: 40, isWritten: true, storagePath: null, addedBy: 'nigel', recordedAt: '2026-11-22T10:00:00Z' });
const specVersion = { ...guideVersion(1), documentId: specId, filename: 'spec.pdf', mimeType: 'application/pdf', isWritten: false, storagePath: spec.storagePath };
const world = { kept: [] as unknown[], granted: [] as unknown[], changed: [] as unknown[], versions: [] as unknown[], removed: [] as unknown[] };

vi.mock('../projectAccess', () => ({ noReachableProject: 'No project you are on has that id.', reachableProject: async (_caller: unknown, id: string) => (id === harbourId ? { id, name: 'Harbour' } : null) }));
vi.mock('../organisationAccess', () => ({ noSuchOrganisation: 'No organisation of yours has that id.', reachableOrganisation: async (_caller: unknown, id: string) => (id === acmeId ? { id, name: 'Acme' } : null) }));
vi.mock('$lib/server/projectDocuments/findProjectDocuments', () => ({
	readKeptDocuments: async (_supabase: unknown, owner: { kind: string }) => (owner.kind === 'project' ? [spec, guide] : []),
	findKeptDocument: async (_supabase: unknown, _owner: unknown, id: string) => [spec, guide].find((document) => document.id === id) ?? null
}));
vi.mock('$lib/server/projectDocuments/findDocumentVersions', () => ({
	readDocumentVersions: async (_supabase: unknown, documentId: string) => (documentId === guideId ? [guideVersion(2), guideVersion(1)] : [specVersion]),
	readVersionMarkdown: async (_supabase: unknown, version: { versionNumber: number }) => `# How it works\n\nVersion ${version.versionNumber} of the text.`
}));
vi.mock('$lib/server/projectDocuments/readDocumentInput', () => ({ readDocumentInput: async () => [] }));
vi.mock('$lib/server/storage/signFetchLink', () => ({ fetchLinkLifetimeMinutes: 10, signFetchLink: async () => 'https://files.example/spec?token=s' }));
vi.mock('$lib/server/projectDocuments/keepProjectDocument', () => ({
	keepWrittenDocument: async (_supabase: unknown, adder: unknown, details: unknown, markdown: unknown) => (world.kept.push({ adder, details, markdown }), guideId),
	grantDocumentUpload: async (_supabase: unknown, adder: unknown, details: unknown, file: unknown) => (world.granted.push({ adder, details, file }), { documentId: specId, uploadUrl: 'https://files.example/up?token=u' })
}));
vi.mock('$lib/server/projectDocuments/keepDocumentVersion', () => ({
	keepWrittenVersion: async (_supabase: unknown, _document: unknown, _accountId: unknown, markdown: unknown) => (world.versions.push(markdown), 3),
	grantVersionUpload: async (_supabase: unknown, _document: unknown, _accountId: unknown, file: unknown) => (world.versions.push(file), { versionNumber: 2, uploadUrl: 'https://files.example/v2?token=u' })
}));
vi.mock('$lib/server/projectDocuments/recordDocumentUpload', async (original) => ({ ...(await original()), recordDocumentUpload: async () => ({ status: 'recorded', byteCount: 2_097_152 }) }));
vi.mock('$lib/server/projectDocuments/changeProjectDocument', () => ({
	changeDocumentDetails: async (_supabase: unknown, _document: unknown, changes: unknown) => void world.changed.push(changes),
	removeProjectDocument: async (_supabase: unknown, document: unknown) => void world.removed.push(document)
}));

const nigel = { accountId: 'nigel' } as unknown as McpCaller;
const pdf = { filename: 'spec.pdf', mimeType: 'application/pdf', byteCount: 2048 };

function runDocumentAction(name: string, input: Record<string, unknown> = {}): Promise<string> {
	const action = [...projectDocumentActions, ...organisationDocumentActions].find((candidate) => candidate.name === name)!;
	return action.run(nigel, { projectId: harbourId, organisationId: acmeId, ...input }).then(String);
}

describe('a product’s and an organisation’s documents over the connector', () => {
	beforeEach(() => Object.assign(world, { kept: [], granted: [], changed: [], versions: [], removed: [] }));

	it('lists the documents outputs first, section by section, each with its status and version', async () => {
		const answer = await runDocumentAction('list_project_documents');
		expect(answer).toContain('## Outputs');
		expect(answer).toContain(`How it works (Approved, version 2, position 0, written in Markdown, 40 B, document id: ${guideId})`);
		expect(answer).toContain(`/projects/${harbourId}/documents`);
		expect(await runDocumentAction('list_organisation_documents')).toContain(`/organisations/${acmeId}/documents`);
	});

	it('reads a document at the version it holds now or an earlier one, and gives a fetch link for a file', async () => {
		expect(await runDocumentAction('read_project_document', { documentId: guideId })).toContain('Version 2 of the text.');
		const earlier = await runDocumentAction('read_project_document', { documentId: guideId, versionNumber: 1 });
		expect(earlier).toContain('You are reading version 1; the document now holds version 2.');
		expect(await runDocumentAction('read_project_document', { documentId: guideId, versionNumber: 0 })).toContain('Not read: versionNumber');
		expect(await runDocumentAction('read_project_document', { documentId: specId })).toContain('https://files.example/spec?token=s');
	});

	it('keeps a written document on the organisation as a draft, under the person asking', async () => {
		const answer = await runDocumentAction('add_organisation_document', { title: 'Policy', markdown: '# Policy' });
		expect(answer).toContain(`on Acme's documents as a draft (document id ${guideId})`);
		expect(world.kept[0]).toMatchObject({ adder: { owner: { kind: 'organisation', id: acmeId }, accountId: 'nigel' }, details: { status: 'draft', flow: 'output' } });
	});

	it('gives the link to send a file to, then records it', async () => {
		const answer = await runDocumentAction('add_project_document', { title: 'Specification', flow: 'input', ...pdf });
		expect(answer).toContain('https://files.example/up?token=u');
		expect(answer).toContain(`record_project_document with projectId ${harbourId} and documentId ${specId}`);
		expect(world.granted[0]).toMatchObject({ details: { flow: 'input' } });
		expect(await runDocumentAction('record_project_document', { documentId: specId })).toContain("Kept on Harbour's documents (2.0 MB");
	});

	it('refuses by name a value that does not fit, keeping nothing, and an owner the person cannot reach', async () => {
		expect(await runDocumentAction('add_project_document', { title: 'Spec', filename: 'a.zip', mimeType: 'application/zip', byteCount: 9 })).toContain('Not added: mimeType');
		expect(await runDocumentAction('add_project_document', { title: 'Spec', markdown: 'x', status: 'final' })).toContain('Not added: status');
		expect(await runDocumentAction('add_project_document', { title: 'Spec', markdown: 'x', projectId: specId })).toContain('No project you are on');
		expect(await runDocumentAction('add_organisation_document', { title: 'Spec', markdown: 'x', organisationId: specId })).toContain('No organisation of yours');
		expect([world.kept, world.granted]).toEqual([[], []]);
	});

	it('changes only what is named, keeps new text or a new file as the next version, and takes one off on request', async () => {
		expect(await runDocumentAction('update_project_document', { documentId: guideId, status: 'in_review', markdown: '# New' })).toContain('Its new text is version 3; version 2 is kept');
		expect(world.changed).toEqual([{ status: 'in_review' }]);
		expect(await runDocumentAction('update_project_document', { documentId: specId, ...pdf })).toContain('https://files.example/v2?token=u');
		expect(await runDocumentAction('update_project_document', { documentId: specId, markdown: '# New', ...pdf })).toContain('Not changed');
		expect(await runDocumentAction('update_project_document', { documentId: guideId })).toContain('Not changed');
		expect(await runDocumentAction('delete_project_document', { documentId: specId })).toContain('every version of it are off Harbour');
		expect(world.removed).toHaveLength(1);
	});
});
