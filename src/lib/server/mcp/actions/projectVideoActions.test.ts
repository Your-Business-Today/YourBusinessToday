import { beforeEach, describe, expect, it, vi } from 'vitest';
import { projectVideoActions } from './projectVideoActions';
import type { McpCaller } from '../resolveMcpCaller';

const harbourId = '11111111-1111-4111-8111-111111111111';
const videoId = '22222222-2222-4222-8222-222222222222';
const harbour = { id: harbourId, name: 'Harbour' };
const signingIn = {
	id: videoId, projectId: harbourId, title: 'Signing in', description: '', section: 'Getting started', position: 1,
	durationSeconds: 95, filename: 'signing-in.mp4', mimeType: 'video/mp4', byteCount: 2_097_152,
	storagePath: `${harbourId}/${videoId}/signing-in.mp4`, thumbnailStoragePath: null, captionsStoragePath: null, addedBy: 'nigel', recordedAt: '2026-11-18T10:00:00Z'
};
const world = { granted: [] as unknown[], changed: [] as unknown[], removed: [] as unknown[], recording: { status: 'recorded', byteCount: 2_097_152, hasThumbnail: true, hasCaptions: false } as object };

vi.mock('../projectAccess', () => ({
	noReachableProject: 'No project you are on has that id.',
	reachableProject: async (_caller: unknown, projectId: string) => (projectId === harbourId ? harbour : null)
}));
vi.mock('$lib/server/projectVideos/findProjectVideos', () => ({
	readKeptVideos: async () => [signingIn],
	findKeptVideo: async (_supabase: unknown, _projectId: string, id: string) => (id === videoId ? signingIn : null)
}));
vi.mock('$lib/server/projectVideos/grantVideoUpload', () => ({
	grantVideoUpload: async (_supabase: unknown, adder: unknown, video: unknown) => {
		world.granted.push({ adder, video });
		return { videoId, filmUploadUrl: 'https://files.example/film?token=f', thumbnailUploadUrl: 'https://files.example/thumb?token=t', captionsUploadUrl: 'https://files.example/captions?token=c' };
	}
}));
vi.mock('$lib/server/projectVideos/recordVideoUpload', () => ({
	recordVideoUpload: async () => world.recording
}));
vi.mock('$lib/server/projectVideos/changeProjectVideo', () => ({
	changeVideoDetails: async (_supabase: unknown, _video: unknown, changes: unknown) => void world.changed.push(changes),
	removeProjectVideo: async (_supabase: unknown, video: unknown) => void world.removed.push(video)
}));

const nigel = { accountId: 'nigel' } as unknown as McpCaller;

function runVideoAction(name: string, input: Record<string, unknown> = {}): Promise<string> {
	const action = projectVideoActions.find((candidate) => candidate.name === name)!;
	return action.run(nigel, { projectId: harbourId, ...input }).then(String);
}

const newVideo = { title: 'Signing in', section: 'Getting started', position: 1, filename: 'signing-in.mp4', mimeType: 'video/mp4', byteCount: 2_097_152 };

describe('a project’s tutorial videos over the connector', () => {
	beforeEach(() => Object.assign(world, { granted: [], changed: [], removed: [] }));

	it('lists the library section by section, with where to watch it', async () => {
		const answer = await runVideoAction('list_project_videos');
		expect(answer).toContain('## Getting started');
		expect(answer).toContain(`Signing in (position 1, 1:35, 2.0 MB, video id: ${videoId})`);
		expect(answer).toContain(`/projects/${harbourId}/videos`);
	});

	it('keeps a new video under the person asking and gives the links to send its film and thumbnail', async () => {
		const thumbnail = { thumbnailFilename: 'a.jpg', thumbnailMimeType: 'image/jpeg', thumbnailByteCount: 900 };
		const captions = { captionsFilename: 'a.vtt', captionsMimeType: 'text/vtt', captionsByteCount: 300 };
		const answer = await runVideoAction('add_project_video', { ...newVideo, ...thumbnail, ...captions });
		expect(answer).toContain('https://files.example/film?token=f');
		expect(answer).toContain('https://files.example/thumb?token=t');
		expect(answer).toContain('Send the captions "a.vtt" the same way');
		expect(answer).toContain(`record_project_video with projectId ${harbourId} and videoId ${videoId}`);
		expect(world.granted[0]).toMatchObject({ adder: { projectId: harbourId, accountId: 'nigel' } });
	});

	it('refuses by name a value that does not fit, keeping nothing, and a project the person is not on', async () => {
		expect(await runVideoAction('add_project_video', { ...newVideo, mimeType: 'video/avi' })).toContain('Not added: mimeType');
		expect(await runVideoAction('add_project_video', { ...newVideo, projectId: videoId })).toContain('No project you are on');
		expect(world.granted).toHaveLength(0);
	});

	it('records the film once it arrives', async () => {
		expect(await runVideoAction('record_project_video', { videoId })).toContain('In Harbour\'s tutorial videos (2.0 MB, with its thumbnail, with no captions');
		world.recording = { status: 'not_arrived' };
		expect(await runVideoAction('record_project_video', { videoId })).toContain('Nothing has arrived');
	});

	it('changes only what is named, and takes a video out on request', async () => {
		expect(await runVideoAction('update_project_video', { videoId, position: 5 })).toContain('is changed: position');
		expect(world.changed).toEqual([{ position: 5 }]);
		expect(await runVideoAction('update_project_video', { videoId })).toContain('name at least one of');
		expect(await runVideoAction('delete_project_video', { videoId })).toContain('out of Harbour');
		expect(world.removed).toHaveLength(1);
	});
});
