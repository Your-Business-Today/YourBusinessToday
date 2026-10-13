import { toolsOf, type AgentGuide, type McpMap, type McpTool } from './mcpMap';

export const mcpEntryKinds = { tool: 'tool', skill: 'skill', agent: 'agent' } as const;

export type McpEntryKind = (typeof mcpEntryKinds)[keyof typeof mcpEntryKinds];

/** One cover in the MCP map's album: a connector tool, a skill or an agent, filed in its section. */
export type McpEntry =
	| { kind: typeof mcpEntryKinds.tool; key: string; name: string; section: string; tool: McpTool }
	| { kind: typeof mcpEntryKinds.skill | typeof mcpEntryKinds.agent; key: string; name: string; section: string; guide: AgentGuide };

const guideSections = { skill: 'skills', agent: 'agents' } as const;

/** Every tool in the order its workflows come, then the skills, then the agents. */
export function mcpEntriesOf(map: McpMap): McpEntry[] {
	const tools = toolsOf(map).map(toolEntry);
	const skills = map.skills.map((guide) => guideEntry(guide, mcpEntryKinds.skill));
	const agents = map.agents.map((guide) => guideEntry(guide, mcpEntryKinds.agent));
	return [...tools, ...skills, ...agents];
}

function toolEntry(tool: McpTool): McpEntry {
	return { kind: mcpEntryKinds.tool, key: `tool:${tool.name}`, name: tool.name, section: tool.workflow, tool };
}

function guideEntry(guide: AgentGuide, kind: typeof mcpEntryKinds.skill | typeof mcpEntryKinds.agent): McpEntry {
	return { kind, key: `${kind}:${guide.path}`, name: guide.name, section: guideSections[kind], guide };
}

const writingVerbs = ['upsert', 'create', 'delete', 'update', 'add', 'complete', 'send', 'file', 'log', 'save', 'set', 'remove', 'restore', 'discard'];
const wordSeparator = '_';

/** Whether a tool changes records, read from the verb its name starts with. */
export function isWritingTool(toolName: string): boolean {
	const verb = toolName.split(wordSeparator)[0];
	return writingVerbs.includes(verb);
}
