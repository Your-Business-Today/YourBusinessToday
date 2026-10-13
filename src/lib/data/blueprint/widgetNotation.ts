import { NotationReader } from './notationReader';
import { blankNode, branchesAsChildren, widgetNodeKinds, type WidgetNode } from './widgetNode';
import { tokeniseNotation } from './widgetNotationTokens';

/** The tree a screen's layout line describes; anything the notation does not say is left out rather than guessed. */
export function parseWidgetNotation(notation: string): WidgetNode {
	const reader = new NotationReader(tokeniseNotation(notation));
	return { ...blankNode(widgetNodeKinds.stack, ''), children: branchesAsChildren(reader.readBranches(null)) };
}


