import type { StoryDoors } from '$lib/data/blueprint/mcpMap';

const workflowHeading = /^## (\d+[\w-]*)(?:\.md)?\s*$/;
const storyRow = /^\|\s*(US-[\w-]+)\s*\|/;
const backticked = /`([^`]+)`/g;
const cellSeparator = '|';
const noDoor = '—';
const columns = { story: 2, connector: 6, portal: 7 } as const;
const toolName = /^[a-z][a-z0-9_]*$/;
const routeStart = '/';

/**
 * The stories of the parity audit the portal-from-folders kit writes (docs/ai/parity-audit.md): under each
 * workflow's heading, a row per story naming its connector tool and its pages.
 */
export function parseParityAudit(markdown: string): StoryDoors[] {
	let workflow = '';
	const stories: StoryDoors[] = [];
	for (const line of markdown.split('\n')) {
		const heading = workflowHeading.exec(line);
		if (heading !== null) workflow = heading[1];
		const isStoryRow = storyRow.test(line);
		if (!isStoryRow) continue;
		stories.push(storyOfRow(line, workflow));
	}
	return stories;
}

function storyOfRow(line: string, workflow: string): StoryDoors {
	const cells = line.split(cellSeparator).map((cell) => cell.trim());
	const id = cells[1];
	return {
		id,
		workflow,
		story: cells[columns.story] ?? '',
		toolNames: toolNamesIn(cells[columns.connector] ?? ''),
		routes: routesIn(cells[columns.portal] ?? '')
	};
}

function toolNamesIn(cell: string): string[] {
	if (cell === noDoor) return [];
	const words = backtickedIn(cell).flatMap((text) => text.split(/\s+/));
	return words.filter((word) => toolName.test(word));
}

function routesIn(cell: string): string[] {
	return backtickedIn(cell).filter((text) => text.startsWith(routeStart));
}

function backtickedIn(cell: string): string[] {
	return [...cell.matchAll(backticked)].map((match) => match[1]);
}
