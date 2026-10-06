import type { McpCaller } from './resolveMcpCaller';
import type { McpToolAnswer } from './mcpContent';

export type ActionArea =
	'account' | 'clients' | 'projects' | 'goals' | 'support' | 'conversations' | 'tasks';

export type ActionAudience = 'everyone' | 'staff' | 'admin';

export const actionAudiences = { everyone: 'everyone', staff: 'staff', admin: 'admin' } as const;

export type McpAction = {
	name: string;
	area: ActionArea;
	audience: ActionAudience;
	isWrite: boolean;
	summary: string;
	guidance?: string;
	inputSchema: Record<string, unknown>;
	run: (caller: McpCaller, input: Record<string, unknown>) => Promise<McpToolAnswer>;
};

export function readText(input: Record<string, unknown>, field: string): string {
	return String(input[field] ?? '').trim();
}

export function readOptionalText(input: Record<string, unknown>, field: string): string | null {
	const value = readText(input, field);
	if (value === '') return null;
	return value;
}

export function objectSchema(
	properties: Record<string, unknown>,
	required: string[] = []
): Record<string, unknown> {
	return { type: 'object', properties, required, additionalProperties: false };
}

export const textField = (description: string) => ({ type: 'string', description });

const shownAsMarkdown =
	' — shown as Markdown: put each point of a list on its own line, as "1." or "-", never ' +
	'as an inline (1) (2) (3) run';

/** A text field whose words are read on the site as Markdown. */
export const proseField = (description: string) => textField(`${description}${shownAsMarkdown}`);
