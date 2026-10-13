/**
 * What a Claude can do with a project's product, read from its repository: every story with the connector tool
 * that serves it and the screens that serve it to a person, and the skills and agents the repository teaches.
 */
export type McpMap = {
	stories: StoryDoors[];
	skills: AgentGuide[];
	agents: AgentGuide[];
};

/** One user story with its two doors: the connector tool a Claude uses and the screens a person uses. */
export type StoryDoors = {
	id: string;
	workflow: string;
	story: string;
	toolNames: string[];
	routes: string[];
};

/** A skill or an agent: its name, what it is for, and the file that defines it. */
export type AgentGuide = { name: string; description: string; path: string };

/** A connector tool, gathered from every story it serves, with the screens of those stories. */
export type McpTool = { name: string; workflow: string; stories: StoryDoors[]; routes: string[] };

export function toolsOf(map: McpMap): McpTool[] {
	const toolNames = [...new Set(map.stories.flatMap((story) => story.toolNames))];
	return toolNames.map((name) => toolNamed(map, name));
}

function toolNamed(map: McpMap, name: string): McpTool {
	const stories = map.stories.filter((story) => story.toolNames.includes(name));
	const routes = [...new Set(stories.flatMap((story) => story.routes))];
	return { name, workflow: stories[0]?.workflow ?? '', stories, routes };
}

/** The stories with no connector tool or no screen: where a person and a Claude cannot do the same thing. */
export function parityGapsOf(map: McpMap): StoryDoors[] {
	return map.stories.filter((story) => !hasConnectorTool(story) || !hasScreen(story));
}

export function hasConnectorTool({ toolNames }: StoryDoors): boolean {
	return toolNames.length > 0;
}

export function hasScreen({ routes }: StoryDoors): boolean {
	return routes.length > 0;
}

const routeParameter = /\{[^}]*\}/g;
const anyParameter = '{}';

/** A route with its parameters' names set aside, so /jobs/{id} and /jobs/{Id} are the same screen. */
export function routeShape(route: string): string {
	return route.replace(routeParameter, anyParameter).toLowerCase();
}

export function toolsServingRoute(map: McpMap, route: string): string[] {
	const shape = routeShape(route);
	const serving = map.stories.filter((story) => story.routes.some((storyRoute) => routeShape(storyRoute) === shape));
	return [...new Set(serving.flatMap((story) => story.toolNames))];
}
