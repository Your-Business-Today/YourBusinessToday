import { storageOrigin } from '$lib/server/storage/storageOrigin';
import { uploadBoxDocument } from './uploadBoxDocument';
import { uploadBoxResourceUri } from './uploadBoxNames';
import type { McpResource } from '../mcpResources';

const mcpAppMimeType = 'text/html;profile=mcp-app';

/**
 * The page a host draws for the upload box. It asks to reach one address beyond the host, the
 * file store, so a file can go there straight from the person's browser; a host that will not
 * allow that still carries smaller files through the connector.
 */
export const uploadBoxResource: McpResource = {
	uri: uploadBoxResourceUri,
	name: 'task-upload-box',
	title: 'Upload box',
	description: 'The box where a person adds files to a task from inside the conversation.',
	mimeType: mcpAppMimeType,
	meta: { ui: { csp: { connectDomains: [storageOrigin] }, prefersBorder: true } },
	text: uploadBoxDocument
};
