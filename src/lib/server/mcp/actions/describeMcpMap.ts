import { parityGapsOf, type AgentGuide, type McpMap, type StoryDoors } from '$lib/data/blueprint/mcpMap';

const noDoor = '—';

/** The MCP map as Markdown: every story with its connector tools and its screens, the parity gaps, the skills and agents. */
export function describeMcpMap(mcpMap: McpMap, projectName: string): string {
	const { stories, skills, agents } = mcpMap;
	const gaps = parityGapsOf(mcpMap);
	const counts = `${stories.length} stories, ${skills.length} skills, ${agents.length} agents, ${gaps.length} parity gaps`;
	return [
		`${projectName} MCP map: ${counts}. Each story is one thing a person does on a screen and a Claude does with a connector tool.`,
		['## Stories', ...stories.map(storyLine)].join('\n'),
		['## Skills', ...skills.map(guideLine)].join('\n'),
		['## Agents', ...agents.map(guideLine)].join('\n')
	].join('\n\n');
}

function storyLine(story: StoryDoors): string {
	const tools = story.toolNames.join(', ') || noDoor;
	const screens = story.routes.join(', ') || noDoor;
	return `- ${story.id} (${story.workflow}) ${story.story}. Tools: ${tools}. Screens: ${screens}.`;
}

function guideLine(guide: AgentGuide): string {
	return `- ${guide.name}: ${guide.description} (${guide.path})`;
}
