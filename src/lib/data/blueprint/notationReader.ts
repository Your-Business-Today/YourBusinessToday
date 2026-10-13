import { blankNode, branchesAsChildren, widgetNodeKinds, type WidgetNode, type WidgetNodeKind } from './widgetNode';
import {
	closerOfOpener,
	isCloserOrSeparator,
	isMark,
	isOpener,
	isPrefix,
	tokenKinds,
	type MarkToken,
	type NotationToken
} from './widgetNotationTokens';

type NameToken = Extract<NotationToken, { kind: 'name' }>;
type Prefixes = { repeat: string | null; condition: string | null };

const kindOfOpener: Record<string, WidgetNodeKind> = { '(': widgetNodeKinds.stack, '[': widgetNodeKinds.row };
const branchSeparator = '|';

/** Reads the notation's tokens in order, one widget, arrangement or branch at a time. */
export class NotationReader {
	private position = 0;
	constructor(private readonly tokens: NotationToken[]) {}

	readBranches(closer: string | null): WidgetNode[][] {
		const branches: WidgetNode[][] = [[]];
		while (this.position < this.tokens.length) {
			const token = this.tokens[this.position];
			if (isMark(token, closer)) {
				this.position += 1;
				return branches;
			}
			if (isMark(token, branchSeparator)) branches.push([]);
			if (isCloserOrSeparator(token)) {
				this.position += 1;
				continue;
			}
			this.readItemInto(branches[branches.length - 1]);
		}
		return branches;
	}

	private readItemInto(branch: WidgetNode[]): void {
		const node = this.readItem();
		if (node === null) return;
		branch.push(node);
	}

	private readItem(): WidgetNode | null {
		const prefixes = this.readPrefixes();
		const token = this.tokens[this.position];
		if (token === undefined || isCloserOrSeparator(token)) return null;
		this.position += 1;
		const node = token.kind === tokenKinds.name ? this.readNamed(token) : this.readArrangement(token);
		return node === null ? null : { ...node, ...prefixes };
	}

	private readPrefixes(): Prefixes {
		const prefixes: Prefixes = { repeat: null, condition: null };
		let token = this.tokens[this.position];
		while (token !== undefined && isPrefix(token)) {
			if (token.kind === tokenKinds.repeat) prefixes.repeat = token.count;
			if (token.kind === tokenKinds.condition) prefixes.condition = token.text;
			this.position += 1;
			token = this.tokens[this.position];
		}
		return prefixes;
	}

	private readNamed(token: NameToken): WidgetNode {
		const children: WidgetNode[] = [];
		while (this.isAtOpener()) {
			children.push(...this.readOpened());
		}
		return { ...blankNode(widgetNodeKinds.widget, token.name), children, isPart: token.isPart, isHandWritten: token.isHandWritten };
	}

	private readArrangement(token: NotationToken): WidgetNode | null {
		if (!isOpener(token)) return null;
		this.position -= 1;
		const kind = kindOfOpener[token.mark] ?? widgetNodeKinds.stack;
		return { ...blankNode(kind, ''), children: this.readOpened() };
	}

	private isAtOpener(): boolean {
		const token = this.tokens[this.position];
		return token !== undefined && isOpener(token);
	}

	private readOpened(): WidgetNode[] {
		const opener = this.tokens[this.position] as MarkToken;
		this.position += 1;
		return branchesAsChildren(this.readBranches(closerOfOpener[opener.mark]));
	}
}
