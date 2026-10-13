/** One thing drawn on a screen: a widget or site part with what it holds, or an arrangement of others. */
export const widgetNodeKinds = { widget: 'widget', row: 'row', stack: 'stack', choice: 'choice' } as const;

export type WidgetNodeKind = (typeof widgetNodeKinds)[keyof typeof widgetNodeKinds];

export type WidgetNode = {
	kind: WidgetNodeKind;
	name: string;
	children: WidgetNode[];
	repeat: string | null;
	condition: string | null;
	isHandWritten: boolean;
	isPart: boolean;
};

export function blankNode(kind: WidgetNodeKind, name: string): WidgetNode {
	return { kind, name, children: [], repeat: null, condition: null, isHandWritten: false, isPart: false };
}


/** Several branches of a ( a | b ) become one choice between them; a single branch is just its nodes. */
export function branchesAsChildren(branches: WidgetNode[][]): WidgetNode[] {
	if (branches.length === 1) return branches[0];
	const options = branches.map((branch) => ({ ...blankNode(widgetNodeKinds.stack, ''), children: branch }));
	return [{ ...blankNode(widgetNodeKinds.choice, ''), children: options }];
}
