import { listLibrary, readLibraryItem } from './brandLibraryRuns';
import { moduleAction } from '../organisationModuleGate';
import { objectSchema, textField } from '../actionTypes';
import { readLibraryItemAction } from './describeLibraryItem';
import type { McpAction } from '../actionTypes';

const brandModule = 'brand';
const brandArea = 'brand';
const organisationField = textField('The organisation whose brand it is, as list_organisations gives it');

/** The connector actions on a brand's own photos and videos: list the library, and read one item. Adding stays on the site. */
export const brandLibraryActions: McpAction[] = [
	moduleAction(brandModule, {
		name: 'list_brand_library',
		area: brandArea,
		audience: 'everyone',
		isWrite: false,
		summary: 'the brand’s own photos and videos, each with what it shows, when it was taken and whether it may be posted',
		guidance:
			'Use the brand’s own photos and videos before stock pictures, and only those that may be posted. ' +
			'People add them on the site; the connector reads them and changes nothing.',
		inputSchema: objectSchema({ organisationId: organisationField }, ['organisationId']),
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
		inputSchema: objectSchema(
			{ organisationId: organisationField, itemId: textField('The item, as list_brand_library gives its id') },
			['organisationId', 'itemId']
		),
		run: readLibraryItem
	})
];
