import { describeByteCount } from '$lib/data/taskAttachmentRules';
import { addProjectVideoAction, listProjectVideosAction, recordProjectVideoAction, videosPageAddress } from './describeProjectVideos';
import { videoUploadLinkLifetimeHours } from '$lib/projectVideos/videoLimits';
import { videoUploadRecordings, type VideoUploadRecording } from '$lib/server/projectVideos/videoUploadRecording';
import type { GrantedVideoUpload } from '$lib/server/projectVideos/grantedVideoUpload';
import type { Project } from '$lib/server/projects/projectRecord';
import type { VideoFileGiven, VideoGiven } from '$lib/projectVideos/projectVideo';

const sendingCommand = (contentType: string, url: string) =>
	`curl --fail --upload-file <path to the file> -H "content-type: ${contentType}" "${url}"`;

/** The links the files go to, the commands that send them, and the call that puts the video in the library. */
export function describeVideoUpload(project: Project, video: VideoGiven, grant: GrantedVideoUpload): string {
	const { details, film, thumbnail, captions } = video;
	return [
		`Upload link for "${details.title}" in ${project.name}'s tutorial videos, to be used once within ${videoUploadLinkLifetimeHours} hours. ` +
			`Send the film "${film.filename}" to it as an HTTP PUT with the raw bytes as the body, for example:`,
		sendingCommand(film.mimeType, grant.filmUploadUrl),
		...companionLines('thumbnail', thumbnail, grant.thumbnailUploadUrl),
		...companionLines('captions', captions, grant.captionsUploadUrl),
		`Then call ${recordProjectVideoAction} with projectId ${project.id} and videoId ${grant.videoId}: only then does it show in the library.`,
		'If your own network refuses the PUT, a proxy answering 403 or the address not reached, retrying will not help: ' +
			'send it from a Claude whose network reaches the file store, such as Claude Code on the person’s own computer.'
	].join('\n');
}

function companionLines(kind: string, file: VideoFileGiven | null, uploadUrl: string | null): string[] {
	if (file === null || uploadUrl === null) return [];
	return [`Send the ${kind} "${file.filename}" the same way:`, sendingCommand(file.mimeType, uploadUrl)];
}

const recordingSentences: Record<string, string> = {
	[videoUploadRecordings.notGranted]: `No upload of that videoId was started by you on this project. Call ${addProjectVideoAction} for one.`,
	[videoUploadRecordings.notArrived]: 'Nothing has arrived at the film’s link yet. Send the film with the PUT first, then call again.',
	[videoUploadRecordings.lapsed]: `That link lapsed ${videoUploadLinkLifetimeHours} hours after it was granted. Call ${addProjectVideoAction} again.`,
	[videoUploadRecordings.alreadyRecorded]: `That video is already in the library. Call ${listProjectVideosAction} to see it.`
};

/** What recording the video found, in a sentence for the Claude that sent it. */
export function describeVideoRecording(project: Project, videoId: string, recording: VideoUploadRecording): string {
	if (recording.status !== videoUploadRecordings.recorded) return recordingSentences[recording.status];
	const thumbnail = recording.hasThumbnail ? 'with its thumbnail' : 'with no thumbnail, so the page shows its first frame';
	const captions = recording.hasCaptions ? 'with captions' : 'with no captions';
	const kept = `${describeByteCount(recording.byteCount)}, ${thumbnail}, ${captions}, video id ${videoId}`;
	return `In ${project.name}'s tutorial videos (${kept}). Watch it at ${videosPageAddress(project)}.`;
}
