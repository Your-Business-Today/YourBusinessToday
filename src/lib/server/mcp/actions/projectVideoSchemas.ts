import { VideoLimits, captionsTypes, thumbnailTypes, videoFileTypes } from '$lib/projectVideos/videoLimits';
import { objectSchema, textField } from '../actionTypes';
import { videoLibraryNames } from '$lib/projectVideos/videoLibraries';

const {
	longestTitle,
	longestDescription,
	longestSection,
	longestFilename,
	largestByteCount,
	largestThumbnailByteCount,
	largestCaptionsByteCount,
	highestPosition,
	longestDurationSeconds
} = VideoLimits;

const projectIdField = textField('The project id, as list_projects gives it');
const videoIdField = textField('The video id, as list_project_videos gives it');

const detailFields = {
	title: textField(`What the video is called, at most ${longestTitle} characters`),
	description: textField(`What the video teaches, in a sentence or two, at most ${longestDescription} characters`),
	section: textField(`The part of the library it sits in, such as Getting started, at most ${longestSection} characters`),
	position: { type: 'integer', description: `Where it plays, lowest first, from 0 up to ${highestPosition}; sections are ordered by their first video` },
	durationSeconds: { type: 'integer', description: `How long it runs, in whole seconds, from 1 up to ${longestDurationSeconds}` },
	library: {
		type: 'string',
		enum: videoLibraryNames,
		description: 'Which library it sits in: tutorials, teaching people to use what was built, or promotional, showing it off; tutorials when left out'
	}
};

const fileFields = {
	filename: textField(`What the film is called, such as signing-in.mp4, at most ${longestFilename} characters`),
	mimeType: { type: 'string', enum: videoFileTypes, description: 'The film’s type; MP4 (H.264) plays everywhere' },
	byteCount: { type: 'integer', description: `The film’s size in bytes, from 1 up to ${largestByteCount}` },
	thumbnailFilename: textField(`What the thumbnail picture is called, such as signing-in.jpg; leave out to show the film’s first frame`),
	thumbnailMimeType: { type: 'string', enum: thumbnailTypes, description: 'The thumbnail’s type' },
	thumbnailByteCount: { type: 'integer', description: `The thumbnail’s size in bytes, from 1 up to ${largestThumbnailByteCount}` },
	captionsFilename: textField('What the captions file is called, such as signing-in.vtt; leave out for a film with none'),
	captionsMimeType: { type: 'string', enum: captionsTypes, description: 'The captions’ type: WebVTT' },
	captionsByteCount: { type: 'integer', description: `The captions’ size in bytes, from 1 up to ${largestCaptionsByteCount}` }
};

export const listProjectVideosSchema = objectSchema({ projectId: projectIdField }, ['projectId']);

export const oneProjectVideoSchema = objectSchema({ projectId: projectIdField, videoId: videoIdField }, ['projectId', 'videoId']);

export const addProjectVideoSchema = objectSchema({ projectId: projectIdField, ...detailFields, ...fileFields }, [
	'projectId',
	'title',
	'section',
	'position',
	'filename',
	'mimeType',
	'byteCount'
]);

export const recordProjectVideoSchema = objectSchema(
	{ projectId: projectIdField, videoId: textField('The videoId add_project_video gave') },
	['projectId', 'videoId']
);

export const updateProjectVideoSchema = objectSchema({ projectId: projectIdField, videoId: videoIdField, ...detailFields }, [
	'projectId',
	'videoId'
]);
