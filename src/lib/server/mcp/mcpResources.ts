import { McpErrorCode, McpRequestRefusal } from './mcpErrors';
import { uploadBoxResource } from './uploadBox/uploadBoxResource';

/** Something a host fetches by address rather than by calling a tool — here, the pages it draws in a conversation. */
export type McpResource = {
	home: string;
	uri: string;
	name: string;
	title: string;
	description: string;
	mimeType: string;
	meta: Record<string, unknown>;
	text: string;
};

const everyResource: McpResource[] = [uploadBoxResource];

export function describeMcpResources(): Record<string, unknown>[] {
	return everyResource.map((resource) => ({
		uri: resource.uri,
		name: resource.name,
		title: resource.title,
		description: resource.description,
		mimeType: resource.mimeType,
		_meta: resource.meta
	}));
}

export function readMcpResource(uri: unknown): Record<string, unknown> {
	const address = typeof uri === 'string' ? uri : '';
	const resource = everyResource.find((candidate) => isKeptAt(candidate, address));
	if (resource === undefined) {
		throw new McpRequestRefusal(McpErrorCode.InvalidParams, `No resource has the uri ${String(uri)}`);
	}
	return { contents: [contentsOf(resource, address)] };
}

/**
 * A page answers to its home and to every address under it: the one a host was given before the
 * page last changed still finds the page as it is now.
 */
function isKeptAt(resource: McpResource, address: string): boolean {
	return address === resource.home || address.startsWith(`${resource.home}/`);
}

function contentsOf(resource: McpResource, address: string): Record<string, unknown> {
	return {
		uri: address,
		mimeType: resource.mimeType,
		text: resource.text,
		_meta: resource.meta
	};
}
