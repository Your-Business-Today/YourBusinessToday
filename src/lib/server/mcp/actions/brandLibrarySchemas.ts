import { LibraryLimits } from '$lib/brand/library/libraryLimits';
import { objectSchema, textField } from '../actionTypes';
import { postingFootings } from '$lib/brand/library/libraryItem';
import { organisationIdField } from './organisationDetailsFields';

export const listBrandLibrarySchema = objectSchema({ organisationId: organisationIdField }, ['organisationId']);

export const readLibraryItemSchema = objectSchema(
	{ organisationId: organisationIdField, itemId: textField('The item, as list_brand_library gives its id') },
	['organisationId', 'itemId']
);

const { longestFilename, largestByteCount, showsCharacters, permissionGiverCharacters } = LibraryLimits;

export const addLibraryItemSchema = objectSchema(
	{
		organisationId: organisationIdField,
		filename: textField(`What the file is called, such as kitchen-finished.jpg, at most ${longestFilename} characters`),
		mimeType: textField('The file type: a photo or a video, such as image/jpeg or video/mp4'),
		byteCount: { type: 'integer', description: `The file's size in bytes, from 1 up to ${largestByteCount}` },
		shows: textField(`What the photo or video shows, at most ${showsCharacters} characters`),
		takenOn: textField('The day it was taken or made, as YYYY-MM-DD, no later than today'),
		posting: { type: 'string', enum: postingFootings, description: 'Whether it may be posted, and on what footing' },
		permissionGivenBy: textField(`Who gave permission, only when posting is permission_given, at most ${permissionGiverCharacters} characters`)
	},
	['organisationId', 'filename', 'mimeType', 'byteCount', 'shows', 'takenOn', 'posting']
);

export const recordLibraryItemSchema = objectSchema(
	{ organisationId: organisationIdField, itemId: textField('The itemId add_brand_library_item gave') },
	['organisationId', 'itemId']
);
