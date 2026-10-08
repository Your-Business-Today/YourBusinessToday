export const jsonRpcVersion = '2.0';

export const McpErrorCode = {
	ParseError: -32700,
	InvalidRequest: -32600,
	MethodNotFound: -32601,
	InvalidParams: -32602,
	InternalError: -32603
} as const;

export type McpFailure = {
	jsonrpc: typeof jsonRpcVersion;
	id: string | number | null;
	error: { code: number; message: string };
};

/** A request that cannot be answered for a reason the caller can act on, with the code that says which. */
export class McpRequestRefusal extends Error {
	constructor(
		readonly code: number,
		message: string
	) {
		super(message);
	}
}

export function mcpFailure(
	id: string | number | null,
	code: number,
	message: string
): McpFailure {
	return { jsonrpc: jsonRpcVersion, id, error: { code, message } };
}
