import { listLibrary, readLibraryItem } from './brandLibraryRuns';
import { moduleAction } from '../organisationModuleGate';
import { addLibraryItem, recordLibraryItem } from './brandLibraryAddRuns';
import { addLibraryItemSchema, listBrandLibrarySchema, readLibraryItemSchema, recordLibraryItemSchema } from './brandLibrarySchemas';
import { recordLibraryItemAction } from './describeLibraryUpload';
import { readLibraryItemAction } from './describeLibraryItem';
import { LibraryLimits, libraryUploadLinkLifetimeHours } from '$lib/brand/library/libraryLimits';
import type { McpAction } from '../actionTypes';

const brandModule = 'brand';
const brandArea = 'brand';
const { largestMegabytes } = LibraryLimits;

/** The connector actions on a brand's own photos, videos and music: list the library, read one item, and add one by sending its file. */
export const brandLibraryActions: McpAction[] = [
	moduleAction(brandModule, {
		name: 'list_brand_library',
		area: brandArea,
		audience: 'everyone',
		isWrite: false,
		summary: 'the brand’s own photos, videos and music, each with what it shows, when it was made and whether it may be posted',
		guidance:
			'Use the brand’s own photos and videos before stock pictures, and only those that may be posted. Music is the soundtrack ' +
			'of a video, never a post’s picture. ' +
			'Add more with add_brand_library_item, one call for each file of a folder.',
		inputSchema: listBrandLibrarySchema,
		run: listLibrary
	}),
	moduleAction(brandModule, {
		name: readLibraryItemAction,
		area: brandArea,
		audience: 'everyone',
		isWrite: false,
		summary: 'one of the brand’s photos or videos: what it shows, who gave permission to post it, and a link to look at it',
		guidance:
			'The link lasts a few minutes, for you to look at the file now; do not pass it on. A file marked not to be posted ' +
			'is never put in a post, however well it fits.',
		inputSchema: readLibraryItemSchema,
		run: readLibraryItem
	}),
	moduleAction(brandModule, {
		name: 'add_brand_library_item',
		area: brandArea,
		audience: 'everyone',
		isWrite: true,
		summary: 'add a photo, video or piece of music to the brand’s library: describe it, then send its file to the link given',
		guidance:
			'One call for each file, so a folder goes in file by file. Say truly what it shows, the day it was taken or made, ' +
			'and whether it may be posted; ask the person when you do not know. Each value is checked against its column, and ' +
			'one that does not fit is refused by name. The answer gives a link for one HTTP PUT of the file, up to ' +
			`${largestMegabytes} MB, open for ${libraryUploadLinkLifetimeHours} hours; then call ${recordLibraryItemAction}. The item is kept under the signed-in person, as if they added it on the site.`,
		inputSchema: addLibraryItemSchema,
		run: addLibraryItem
	}),
	moduleAction(brandModule, {
		name: recordLibraryItemAction,
		area: brandArea,
		audience: 'everyone',
		isWrite: true,
		summary: 'record that a file sent to a link from add_brand_library_item arrived, so it shows in the library',
		guidance: 'Call this once the PUT has succeeded. The file is kept at the size that actually arrived.',
		inputSchema: recordLibraryItemSchema,
		run: recordLibraryItem
	})
];
