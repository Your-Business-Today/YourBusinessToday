import { createHash } from 'node:crypto';
import { storageOrigin } from '$lib/server/storage/storageOrigin';
import { uploadBoxDocument } from './uploadBoxDocument';
import { uploadBoxResourceHome } from './uploadBoxNames';
import type { McpResource } from '../mcpResources';

const mcpAppMimeType = 'text/html;profile=mcp-app';
const fingerprintLength = 8;

/** A host may keep a page it has fetched, by address — so a changed page takes a new address, drawn from what it says. */
function fingerprintOf(page: string): string {
	const digest = createHash('sha256').update(page).digest('hex');
	return digest.slice(0, fingerprintLength);
}

/**
 * The page a host draws for the upload box. It asks to reach one address beyond the host, the
 * file store, so a file can go there straight from the person's browser; a host that will not
 * allow that still carries smaller files through the connector.
 */
export const uploadBoxResource: McpResource = {
	home: uploadBoxResourceHome,
	uri: `${uploadBoxResourceHome}/${fingerprintOf(uploadBoxDocument)}`,
	name: 'task-upload-box',
	title: 'Upload box',
	description: 'The box where a person adds files to a task from inside the conversation.',
	mimeType: mcpAppMimeType,
	meta: { ui: { csp: { connectDomains: [storageOrigin] }, prefersBorder: true } },
	text: uploadBoxDocument
};
