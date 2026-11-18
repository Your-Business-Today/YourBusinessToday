import { addProjectVideo, deleteProjectVideo, recordProjectVideo, updateProjectVideo } from './projectVideoWriteRuns';
import { addProjectVideoAction, listProjectVideosAction, recordProjectVideoAction } from './describeProjectVideos';
import { listProjectVideos, readProjectVideo } from './projectVideoRuns';
import { VideoLimits, videoUploadLinkLifetimeHours } from '$lib/projectVideos/videoLimits';
import {
	addProjectVideoSchema,
	listProjectVideosSchema,
	oneProjectVideoSchema,
	recordProjectVideoSchema,
	updateProjectVideoSchema
} from './projectVideoSchemas';
import type { McpAction } from '../actionTypes';

const projectsArea = 'projects';
const everyone = 'everyone';
const { largestMegabytes } = VideoLimits;

const makingTheFilm =
	'Make the film in your own workspace, never on a service of ours: for a walk through the site, drive a browser over its pages ' +
	'with Playwright recording video and captions on screen, or put stills and narration together with ffmpeg; a promotional film is ' +
	'the strongest moments of the site cut short, with bold titles over them. Encode it as MP4 ' +
	`(H.264, AAC) under ${largestMegabytes} MB, with a still from it as the thumbnail and what is said as WebVTT captions.`;

/** The connector actions on a project's tutorial and promotional videos: list and read the library, add a video by sending its files, change and remove one. */
export const projectVideoActions: McpAction[] = [
	{
		name: listProjectVideosAction,
		area: projectsArea,
		audience: everyone,
		isWrite: false,
		summary: 'the project’s tutorial and promotional videos, library by library and section by section, in the order they are watched',
		inputSchema: listProjectVideosSchema,
		run: listProjectVideos
	},
	{
		name: 'read_project_video',
		area: projectsArea,
		audience: everyone,
		isWrite: false,
		summary: 'one of the project’s videos: what it is about, which library it is in, where it sits, and a link to fetch its film',
		guidance: 'The link lasts a few minutes, for you to look at the film now; do not pass it on.',
		inputSchema: oneProjectVideoSchema,
		run: readProjectVideo
	},
	{
		name: addProjectVideoAction,
		area: projectsArea,
		audience: everyone,
		isWrite: true,
		summary: 'add a tutorial or promotional video to one of the project’s libraries: describe it, then send its film and thumbnail to the links given',
		guidance:
			`${makingTheFilm} Each value is checked against its column, and one that does not fit is refused by name. The answer gives ` +
			`a link for one HTTP PUT of the film, and one for the thumbnail when you name it, open for ${videoUploadLinkLifetimeHours} hours; ` +
			`then call ${recordProjectVideoAction}. Only the people on the project see it.`,
		inputSchema: addProjectVideoSchema,
		run: addProjectVideo
	},
	{
		name: recordProjectVideoAction,
		area: projectsArea,
		audience: everyone,
		isWrite: true,
		summary: 'record that a film sent to a link from add_project_video arrived, so the video shows in the library',
		guidance: 'Call this once the PUTs have succeeded: send the thumbnail and captions before this, or they are let go.',
		inputSchema: recordProjectVideoSchema,
		run: recordProjectVideo
	},
	{
		name: 'update_project_video',
		area: projectsArea,
		audience: everyone,
		isWrite: true,
		summary: 'change a video’s title, description, section, position, running time or library',
		guidance: 'Name only what changes. To put up a new film, thumbnail or captions, add the video again and delete the old one.',
		inputSchema: updateProjectVideoSchema,
		run: updateProjectVideo
	},
	{
		name: 'delete_project_video',
		area: projectsArea,
		audience: everyone,
		isWrite: true,
		summary: 'take a video and its files out of the project’s library, for good',
		guidance: 'Only on the person’s word, after naming the video to them: the film cannot be brought back.',
		inputSchema: oneProjectVideoSchema,
		run: deleteProjectVideo
	}
];
