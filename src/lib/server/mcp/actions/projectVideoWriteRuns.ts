import { changeVideoDetails, removeProjectVideo } from '$lib/server/projectVideos/changeProjectVideo';
import { validateVideoChanges } from '$lib/projectVideos/validateVideoDetails';
import { validateVideoGiven } from '$lib/projectVideos/validateVideoGiven';
import { describeVideoRecording, describeVideoUpload } from './describeVideoUpload';
import { findKeptVideo } from '$lib/server/projectVideos/findProjectVideos';
import { grantVideoUpload } from '$lib/server/projectVideos/grantVideoUpload';
import { noReachableProject, reachableProject } from '../projectAccess';
import { noSuchVideo, videosPageAddress } from './describeProjectVideos';
import { readText } from '../actionTypes';
import { recordVideoUpload } from '$lib/server/projectVideos/recordVideoUpload';
import type { McpCaller } from '../resolveMcpCaller';

type Input = Record<string, unknown>;

/** Keeps a video as described, waiting for its film, under the person asking, and gives the links to send its files to. */
export async function addProjectVideo(caller: McpCaller, input: Input): Promise<string> {
	const video = validateVideoGiven(input);
	if (typeof video === 'string') return `Not added: ${video}. Nothing was kept.`;
	const project = await reachableProject(caller, readText(input, 'projectId'));
	if (project === null) return noReachableProject;
	const grant = await grantVideoUpload(caller.supabase, { projectId: project.id, accountId: caller.accountId }, video);
	return describeVideoUpload(project, video, grant);
}

/** Records that the film sent to a granted link arrived, so the video shows in the library. */
export async function recordProjectVideo(caller: McpCaller, input: Input): Promise<string> {
	const project = await reachableProject(caller, readText(input, 'projectId'));
	if (project === null) return noReachableProject;
	const videoId = readText(input, 'videoId');
	const recording = await recordVideoUpload(caller.supabase, { projectId: project.id, accountId: caller.accountId }, videoId);
	return describeVideoRecording(project, videoId, recording);
}

/** Changes the words or the place of a video already in the library. */
export async function updateProjectVideo(caller: McpCaller, input: Input): Promise<string> {
	const changes = validateVideoChanges(input);
	if (typeof changes === 'string') return `Not changed: ${changes}. Nothing was changed.`;
	const project = await reachableProject(caller, readText(input, 'projectId'));
	if (project === null) return noReachableProject;
	const video = await findKeptVideo(caller.supabase, project.id, readText(input, 'videoId'));
	if (video === null) return noSuchVideo;
	await changeVideoDetails(caller.supabase, video, changes);
	return `"${changes.title ?? video.title}" is changed: ${Object.keys(changes).join(', ')}. It shows at ${videosPageAddress(project)}.`;
}

/** Takes a video and its files out of the project's library. */
export async function deleteProjectVideo(caller: McpCaller, input: Input): Promise<string> {
	const project = await reachableProject(caller, readText(input, 'projectId'));
	if (project === null) return noReachableProject;
	const video = await findKeptVideo(caller.supabase, project.id, readText(input, 'videoId'));
	if (video === null) return noSuchVideo;
	await removeProjectVideo(caller.supabase, video);
	return `"${video.title}" and its files are out of ${project.name}'s tutorial videos.`;
}
