/** How a widget is sketched on a screen's wireframe, read from the ending of its name. */
export const wireframeShapes = {
	title: 'title',
	table: 'table',
	field: 'field',
	button: 'button',
	box: 'box',
	notice: 'notice',
	chips: 'chips',
	pager: 'pager',
	empty: 'empty',
	tabs: 'tabs',
	icon: 'icon',
	lines: 'lines',
	block: 'block'
} as const;

export type WireframeShape = (typeof wireframeShapes)[keyof typeof wireframeShapes];

const shapeRules: [RegExp, WireframeShape][] = [
	[/(Header|Title|Heading)$/, 'title'],
	[/(Table|Grid)$/, 'table'],
	[/(Field|Input|Select|Picker|Checkbox|Editor|InputFile)$/, 'field'],
	[/Button$/, 'button'],
	[/(Notice|Alert|Banner)$/, 'notice'],
	[/(Chips?|Pills?|Badge)$/, 'chips'],
	[/Pagination$/, 'pager'],
	[/EmptyState$/, 'empty'],
	[/(Nav|Tabs|Strip)$/, 'tabs'],
	[/Icon$/, 'icon'],
	[/(List|KeyValue|Note|Text|Totals)$/, 'lines'],
	[/(Page|Panel|Modal|Dialog|Card|Shell|Frame|Gate|Form)$/, 'box']
];

export function wireframeShapeOf(widgetName: string, hasChildren: boolean): WireframeShape {
	const rule = shapeRules.find(([pattern]) => pattern.test(widgetName));
	if (rule !== undefined) return rule[1];
	return hasChildren ? 'box' : 'block';
}

const repeatShownForEach = 3;
const repeatShownAtMost = 4;
const eachItemCount = 'n';

/** How many copies a repeat draws: (n) is a few, (7) is capped so a long table header still fits. */
export function copiesOfRepeat(repeat: string | null): number {
	if (repeat === null) return 1;
	if (repeat === eachItemCount) return repeatShownForEach;
	return Math.min(Number(repeat) || 1, repeatShownAtMost);
}
