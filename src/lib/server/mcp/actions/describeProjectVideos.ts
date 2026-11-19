import { companyDetails } from '$lib/data/companyDetails';
import { describeByteCount } from '$lib/data/taskAttachmentRules';
import { videoLibraryHref } from '$lib/components/projects/videos/videoLibraryAddress';
import { videoLibraryNames, videoLibraryWords, type VideoLibrary } from '$lib/projectVideos/videoLibraries';
import { videoRunningTime } from '$lib/projectVideos/videoRunningTime';
import { videoSectionsOf, type VideoSection } from '$lib/projectVideos/videoSections';
import type { Project } from '$lib/server/projects/projectRecord';
import type { ProjectVideo } from '$lib/projectVideos/projectVideo';

export const addProjectVideoAction = 'add_project_video';
export const recordProjectVideoAction = 'record_project_video';
export const listProjectVideosAction = 'list_project_videos';

export const noSuchVideo = `No video in this project's library has that id. Call ${listProjectVideosAction} for the ones it holds.`;

/** Where a person watches one of the project's video libraries on the site. */
export function videosPageAddress(project: Project, library: VideoLibrary): string {
	return `${companyDetails.websiteUrl}${videoLibraryHref(project.id, library)}`;
}

/** Both of the project's libraries, each section by section, each video with its place, its length and its id. */
export function describeVideoLibraries(project: Project, videos: ProjectVideo[]): string {
	return videoLibraryNames.map((library) => describeVideoLibrary(project, library, videos)).join('\n\n');
}

function describeVideoLibrary(project: Project, library: VideoLibrary, videos: ProjectVideo[]): string {
	const { videosAre } = videoLibraryWords[library];
	const shelved = videos.filter((video) => video.library === library);
	const address = videosPageAddress(project, library);
	if (shelved.length === 0) return `${project.name} has no ${videosAre} yet. Add one with ${addProjectVideoAction}, library ${library}; they show at ${address}.`;
	const sections = videoSectionsOf(shelved).map(describeSection);
	return [`# ${project.name}'s ${videosAre} (library ${library}), as ${address} shows them:`, ...sections].join('\n\n');
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
		`${video.title} — in the ${videoLibraryWords[video.library].videosAre}, in ${video.section}, position ${video.position}${runningTime === '' ? '' : `, runs ${runningTime}`}.`,
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
