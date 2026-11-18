import { describeVideo, describeVideoLibrary, noSuchVideo } from './describeProjectVideos';
import { fetchLinkLifetimeMinutes, signFetchLink } from '$lib/server/storage/signFetchLink';
import { findKeptVideo, readKeptVideos } from '$lib/server/projectVideos/findProjectVideos';
import { noReachableProject, reachableProject } from '../projectAccess';
import { projectVideoBucket } from '$lib/server/projectVideos/projectVideoStorage';
import { readText } from '../actionTypes';
import type { McpCaller } from '../resolveMcpCaller';

type Input = Record<string, unknown>;

/** The project's tutorial videos, section by section, in the order they are watched. */
export async function listProjectVideos(caller: McpCaller, input: Input): Promise<string> {
	const project = await reachableProject(caller, readText(input, 'projectId'));
	if (project === null) return noReachableProject;
	return describeVideoLibrary(project, await readKeptVideos(caller.supabase, project.id));
}

/** One of the project's videos in full, with a short-lived link to fetch its film. */
export async function readProjectVideo(caller: McpCaller, input: Input): Promise<string> {
	const project = await reachableProject(caller, readText(input, 'projectId'));
	if (project === null) return noReachableProject;
	const video = await findKeptVideo(caller.supabase, project.id, readText(input, 'videoId'));
	if (video === null) return noSuchVideo;
	const filmLink = await signFetchLink(caller.supabase, projectVideoBucket, video);
	return describeVideo(video, filmLink, fetchLinkLifetimeMinutes);
}
