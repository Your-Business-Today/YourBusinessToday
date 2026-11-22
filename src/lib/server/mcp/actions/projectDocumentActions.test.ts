import { beforeEach, describe, expect, it, vi } from 'vitest';
import { projectDocumentActions } from './projectDocumentActions';
import type { McpCaller } from '../resolveMcpCaller';

const harbourId = '11111111-1111-4111-8111-111111111111';
const specId = '22222222-2222-4222-8222-222222222222';
const guideId = '33333333-3333-4333-8333-333333333333';
const harbour = { id: harbourId, name: 'Harbour' };
const placed = { projectId: harbourId, summary: '', addedBy: 'nigel', recordedAt: '2026-11-22T10:00:00Z' };
const spec = { ...placed, id: specId, title: 'Specification', section: 'Product', position: 1, filename: 'spec.pdf', mimeType: 'application/pdf', byteCount: 2_097_152, isWritten: false, storagePath: `${harbourId}/${specId}/spec.pdf` };
const guide = { ...placed, id: guideId, title: 'How it works', section: 'Guides', position: 0, filename: 'how-it-works.md', mimeType: 'text/markdown', byteCount: 40, isWritten: true, storagePath: null };
const world = { kept: [] as unknown[], granted: [] as unknown[], changed: [] as unknown[], rewritten: [] as unknown[], removed: [] as unknown[] };

vi.mock('../projectAccess', () => ({
	noReachableProject: 'No project you are on has that id.',
	reachableProject: async (_caller: unknown, projectId: string) => (projectId === harbourId ? harbour : null)
}));
vi.mock('$lib/server/projectDocuments/findProjectDocuments', () => ({
	readKeptDocuments: async () => [spec, guide],
	findKeptDocument: async (_supabase: unknown, _projectId: string, id: string) => [spec, guide].find((document) => document.id === id) ?? null,
	readDocumentMarkdown: async () => '# How it works\n\nSign in, then open the project.'
}));
vi.mock('$lib/server/storage/signFetchLink', () => ({ fetchLinkLifetimeMinutes: 10, signFetchLink: async () => 'https://files.example/spec?token=s' }));
vi.mock('$lib/server/projectDocuments/keepProjectDocument', () => ({
	keepWrittenDocument: async (_supabase: unknown, adder: unknown, details: unknown, markdown: unknown) => (world.kept.push({ adder, details, markdown }), guideId),
	grantDocumentUpload: async (_supabase: unknown, adder: unknown, details: unknown, file: unknown) => (world.granted.push({ adder, details, file }), { documentId: specId, uploadUrl: 'https://files.example/up?token=u' })
}));
vi.mock('$lib/server/projectDocuments/recordDocumentUpload', () => ({
	documentUploadRecordings: { recorded: 'recorded', notArrived: 'not_arrived', lapsed: 'lapsed', alreadyRecorded: 'already_recorded', notGranted: 'not_granted' },
	recordDocumentUpload: async () => ({ status: 'recorded', byteCount: 2_097_152 })
}));
vi.mock('$lib/server/projectDocuments/changeProjectDocument', () => ({
	changeDocumentDetails: async (_supabase: unknown, _document: unknown, changes: unknown) => void world.changed.push(changes),
	rewriteDocument: async (_supabase: unknown, _document: unknown, markdown: unknown) => void world.rewritten.push(markdown),
	removeProjectDocument: async (_supabase: unknown, document: unknown) => void world.removed.push(document)
}));

const nigel = { accountId: 'nigel' } as unknown as McpCaller;

function runDocumentAction(name: string, input: Record<string, unknown> = {}): Promise<string> {
	const action = projectDocumentActions.find((candidate) => candidate.name === name)!;
	return action.run(nigel, { projectId: harbourId, ...input }).then(String);
}

describe('a project’s documents over the connector', () => {
	beforeEach(() => Object.assign(world, { kept: [], granted: [], changed: [], rewritten: [], removed: [] }));

	it('lists the documents section by section, with where to read them', async () => {
		const answer = await runDocumentAction('list_project_documents');
		expect(answer).toContain('## Guides');
		expect(answer).toContain(`How it works (position 0, written in Markdown, 40 B, document id: ${guideId})`);
		expect(answer).toContain(`/projects/${harbourId}/documents`);
	});

	it('reads a written document in full, and gives a fetch link for a file', async () => {
		expect(await runDocumentAction('read_project_document', { documentId: guideId })).toContain('Sign in, then open the project.');
		expect(await runDocumentAction('read_project_document', { documentId: specId })).toContain('https://files.example/spec?token=s');
	});

	it('keeps a written document at once under the person asking', async () => {
		const answer = await runDocumentAction('add_project_document', { title: 'How it works', markdown: '# How it works' });
		expect(answer).toContain(`document id ${guideId}`);
		expect(world.kept[0]).toMatchObject({ adder: { projectId: harbourId, accountId: 'nigel' }, markdown: '# How it works' });
	});

	it('gives the link to send a file to, then records it', async () => {
		const answer = await runDocumentAction('add_project_document', { title: 'Specification', filename: 'spec.pdf', mimeType: 'application/pdf', byteCount: 2048 });
		expect(answer).toContain('https://files.example/up?token=u');
		expect(answer).toContain(`record_project_document with projectId ${harbourId} and documentId ${specId}`);
		expect(await runDocumentAction('record_project_document', { documentId: specId })).toContain('On Harbour\'s documents (2.0 MB');
	});

	it('refuses by name a value that does not fit, keeping nothing, and a project the person is not on', async () => {
		expect(await runDocumentAction('add_project_document', { title: 'Spec', filename: 'a.zip', mimeType: 'application/zip', byteCount: 9 })).toContain('Not added: mimeType');
		expect(await runDocumentAction('add_project_document', { title: 'Spec', markdown: 'x', projectId: specId })).toContain('No project you are on');
		expect(world.kept).toHaveLength(0);
		expect(world.granted).toHaveLength(0);
	});

	it('changes only what is named, rewrites only a written document, and takes one off on request', async () => {
		expect(await runDocumentAction('update_project_document', { documentId: guideId, position: 5, markdown: '# New' })).toContain('is changed: position, markdown');
		expect(world.changed).toEqual([{ position: 5 }]);
		expect(world.rewritten).toEqual(['# New']);
		expect(await runDocumentAction('update_project_document', { documentId: specId, markdown: '# New' })).toContain('only a written document');
		expect(await runDocumentAction('update_project_document', { documentId: guideId })).toContain('name at least one of');
		expect(await runDocumentAction('delete_project_document', { documentId: specId })).toContain('off Harbour');
		expect(world.removed).toHaveLength(1);
	});
});
