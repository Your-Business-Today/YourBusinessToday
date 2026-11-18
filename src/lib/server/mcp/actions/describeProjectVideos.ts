import { companyDetails } from '$lib/data/companyDetails';
import { describeByteCount } from '$lib/data/taskAttachmentRules';
import { projectHref, projectSegments } from '$lib/components/projects/projectAddresses';
import { videoRunningTime } from '$lib/projectVideos/videoRunningTime';
import { videoSectionsOf, type VideoSection } from '$lib/projectVideos/videoSections';
import type { Project } from '$lib/server/projects/projectRecord';
import type { ProjectVideo } from '$lib/projectVideos/projectVideo';

export const addProjectVideoAction = 'add_project_video';
export const recordProjectVideoAction = 'record_project_video';
export const listProjectVideosAction = 'list_project_videos';

export const noSuchVideo = `No video in this project's library has that id. Call ${listProjectVideosAction} for the ones it holds.`;

/** Where a person watches the project's videos on the site. */
export function videosPageAddress(project: Project): string {
	return `${companyDetails.websiteUrl}${projectHref(project.id, projectSegments.videos)}`;
}

/** The library, section by section, each video with its place, its length and its id. */
export function describeVideoLibrary(project: Project, videos: ProjectVideo[]): string {
	if (videos.length === 0) {
		return `${project.name} has no tutorial videos yet. Add one with ${addProjectVideoAction}; they show at ${videosPageAddress(project)}.`;
	}
	const sections = videoSectionsOf(videos).map(describeSection);
	return [`${project.name}'s tutorial videos, as ${videosPageAddress(project)} shows them:`, ...sections].join('\n\n');
}

function describeSection(section: VideoSection<ProjectVideo>): string {
	const lines = section.videos.map((video) => `- ${describeVideoLine(video)}`);
	return [`## ${section.name}`, ...lines].join('\n');
}

function describeVideoLine(video: ProjectVideo): string {
	const runningTime = videoRunningTime(video.durationSeconds);
	const length = runningTime === '' ? '' : `, ${runningTime}`;
	return `${video.title} (position ${video.position}${length}, ${describeByteCount(video.byteCount)}, video id: ${video.id})`;
}

/** One video in full, with a short-lived link to fetch its film. */
export function describeVideo(video: ProjectVideo, filmLink: string, linkMinutes: number): string {
	const runningTime = videoRunningTime(video.durationSeconds);
	return [
		`${video.title} — in ${video.section}, position ${video.position}${runningTime === '' ? '' : `, runs ${runningTime}`}.`,
		video.description === '' ? 'No description yet.' : video.description,
		`Film: ${video.filename}, ${video.mimeType}, ${describeByteCount(video.byteCount)}; ${describeCompanions(video)}.`,
		`Fetch the film within ${linkMinutes} minutes, to look at it now; do not pass the link on: ${filmLink}`
	].join('\n');
}

function describeCompanions(video: ProjectVideo): string {
	const thumbnail = video.thumbnailStoragePath === null ? 'no thumbnail, so the page shows its first frame' : 'its own thumbnail';
	const captions = video.captionsStoragePath === null ? 'no captions' : 'captions';
	return `${thumbnail}; ${captions}`;
}
