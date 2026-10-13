import { sectionOfRoute, type Screen, type SiteMap } from '$lib/data/blueprint/siteMap';

const routeHeading = /^### `([^`]+)`\s*$/;
const viewFileLine = /^`([^`]+)`\s*$/;
const codeFence = '```';
const routesHeading = '## Routes';
const routeSeparator = '/';

type ScreenDraft = { route: string; viewFile: string; layoutLines: string[]; isInLayout: boolean };

/**
 * The screens of the kit's site definition (tools/refactor/site-definition.md): under its Routes heading, each
 * route's heading, the view file named beneath it and the widget notation in its code block. Entities are
 * matched to a screen by the longest entity route its route starts with.
 */
export function parseSiteDefinition(markdown: string, entityRoutes: Record<string, string>): SiteMap | null {
	const routeLines = linesAfterRoutesHeading(markdown);
	if (routeLines === null) return null;
	const drafts = draftScreens(routeLines);
	const screens = drafts.map((draft) => screenOf(draft, entityRoutes));
	if (screens.length === 0) return null;
	return { screens };
}

function linesAfterRoutesHeading(markdown: string): string[] | null {
	const lines = markdown.split('\n');
	const headingIndex = lines.findIndex((line) => line.trim() === routesHeading);
	if (headingIndex === -1) return null;
	return lines.slice(headingIndex + 1);
}

function draftScreens(lines: string[]): ScreenDraft[] {
	const drafts: ScreenDraft[] = [];
	for (const line of lines) readLine(line, drafts);
	return drafts;
}

function readLine(line: string, drafts: ScreenDraft[]): void {
	const heading = routeHeading.exec(line);
	if (heading !== null) {
		drafts.push({ route: heading[1], viewFile: '', layoutLines: [], isInLayout: false });
		return;
	}
	const draft = drafts.at(-1);
	if (draft === undefined) return;
	if (line.startsWith(codeFence)) {
		draft.isInLayout = !draft.isInLayout;
		return;
	}
	if (draft.isInLayout) {
		draft.layoutLines.push(line);
		return;
	}
	const viewFile = viewFileLine.exec(line);
	if (viewFile !== null && draft.viewFile === '') draft.viewFile = viewFile[1];
}

function screenOf(draft: ScreenDraft, entityRoutes: Record<string, string>): Screen {
	return {
		route: draft.route,
		viewFile: draft.viewFile,
		layout: draft.layoutLines.join('\n').trim(),
		section: sectionOfRoute(draft.route),
		entityName: entityOfRoute(draft.route, entityRoutes)
	};
}

/** The entity whose route is the longest whole-segment start of this one: /people/staff/{Id} is the StaffProfile's. */
export function entityOfRoute(route: string, entityRoutes: Record<string, string>): string | null {
	const matches = Object.entries(entityRoutes).filter(([, entityRoute]) => isRouteWithin(route, entityRoute));
	const longestFirst = matches.sort(([, first], [, second]) => second.length - first.length);
	return longestFirst[0]?.[0] ?? null;
}

function isRouteWithin(route: string, entityRoute: string): boolean {
	if (route === entityRoute) return true;
	return route.startsWith(`${entityRoute}${routeSeparator}`);
}
