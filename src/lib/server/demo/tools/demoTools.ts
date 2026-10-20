import { actionTools } from './actionTools';
import { readTools } from './readTools';
import type { DemoTool } from './demoTool';

const everyTool: DemoTool[] = [...readTools, ...actionTools];

export function findDemoTool(name: unknown): DemoTool | null {
	return everyTool.find((tool) => tool.name === name) ?? null;
}

export function describeDemoTools(): Record<string, unknown>[] {
	return everyTool.map((tool) => ({
		name: tool.name,
		title: tool.title,
		description: tool.description,
		inputSchema: tool.inputSchema,
		annotations: tool.annotations
	}));
}
