import { isBugTitle } from './developmentKind';

/** The items with every bug ahead of everything else, each group kept in the order it came. */
export function bugsFirst<Item>(items: Item[], titleOf: (item: Item) => string): Item[] {
	const bugs = items.filter((item) => isBugTitle(titleOf(item)));
	const others = items.filter((item) => !isBugTitle(titleOf(item)));
	return [...bugs, ...others];
}
