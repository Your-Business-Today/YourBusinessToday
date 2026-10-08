export type McpTextBlock = { type: 'text'; text: string };
export type McpImageBlock = { type: 'image'; data: string; mimeType: string };
type EmbeddedFile = { uri: string; mimeType: string; blob: string };
type EmbeddedText = { uri: string; mimeType: string; text: string };
export type McpResourceBlock = { type: 'resource'; resource: EmbeddedFile | EmbeddedText };
export type McpContentBlock = McpTextBlock | McpImageBlock | McpResourceBlock;

/** An answer a program reads rather than a model, such as the upload box asking what became of a file. */
export type McpDataAnswer = { data: Record<string, unknown> };

/** What a tool hands back: a sentence or two, content the client renders block by block, or data. */
export type McpToolAnswer = string | McpContentBlock[] | McpDataAnswer;

export function textBlock(text: string): McpTextBlock {
	return { type: 'text', text };
}

export function imageBlock(bytes: Uint8Array, mimeType: string): McpImageBlock {
	return { type: 'image', data: base64Of(bytes), mimeType };
}

export function fileBlock(uri: string, mimeType: string, bytes: Uint8Array): McpResourceBlock {
	return { type: 'resource', resource: { uri, mimeType, blob: base64Of(bytes) } };
}

/** The answer as a tool result: data travels as structured content, and as its own text for a host that drops that. */
export function toolResultOf(answer: McpToolAnswer): Record<string, unknown> {
	if (typeof answer === 'string') return { content: [textBlock(answer)] };
	if (Array.isArray(answer)) return { content: answer };
	const { data } = answer;
	return { content: [textBlock(JSON.stringify(data))], structuredContent: data };
}

function base64Of(bytes: Uint8Array): string {
	return Buffer.from(bytes).toString('base64');
}
