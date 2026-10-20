import type { DemoBusiness } from '$lib/data/demo/demoBusiness';

/** What a tool hands back: the sentence for Claude and, when it wrote, the copy to save. */
export type DemoToolOutcome = { answer: string; changed?: DemoBusiness };

export type DemoTool = {
	name: string;
	title: string;
	description: string;
	inputSchema: Record<string, unknown>;
	annotations: Record<string, boolean>;
	run: (business: DemoBusiness, today: string, input: Record<string, unknown>) => DemoToolOutcome;
};

export const noInput = { type: 'object', properties: {}, additionalProperties: false } as const;

export const readsOnly = { readOnlyHint: true } as const;
export const writes = { readOnlyHint: false } as const;

export function oneField(name: string, description: string): Record<string, unknown> {
	return {
		type: 'object',
		properties: { [name]: { type: 'string', description } },
		required: [name],
		additionalProperties: false
	};
}

export function readString(input: Record<string, unknown>, name: string): string {
	return String(input[name] ?? '').trim();
}
