import { McpErrorCode, McpRequestRefusal } from './mcpErrors';
import { uploadBoxResource } from './uploadBox/uploadBoxResource';

/** Something a host fetches by address rather than by calling a tool — here, the pages it draws in a conversation. */
export type McpResource = {
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
	const resource = everyResource.find((candidate) => candidate.uri === uri);
	if (resource === undefined) {
		throw new McpRequestRefusal(McpErrorCode.InvalidParams, `No resource has the uri ${String(uri)}`);
	}
	return { contents: [contentsOf(resource)] };
}

function contentsOf(resource: McpResource): Record<string, unknown> {
	return {
		uri: resource.uri,
		mimeType: resource.mimeType,
		text: resource.text,
		_meta: resource.meta
	};
}
