import { everySection } from './siteMapSections';
import type { McpEntry } from '$lib/data/blueprint/mcpEntries';

/** One crate per workflow, then the skills and the agents, the whole map first, each with how many it holds. */
export function mcpCratesOf(entries: McpEntry[]): { section: string; count: number }[] {
	const sections = [...new Set(entries.map((entry) => entry.section))];
	const crates = sections.map((section) => ({ section, count: entriesInCrate(entries, section).length }));
	return [{ section: everySection, count: entries.length }, ...crates];
}

export function entriesInCrate(entries: McpEntry[], section: string): McpEntry[] {
	if (section === everySection) return entries;
	return entries.filter((entry) => entry.section === section);
}

/** Where a named entry sits, or the first entry when the name is not one of them. */
export function indexOfEntry(entries: McpEntry[], name: string | null): number {
	const index = entries.findIndex((entry) => entry.name === name);
	return Math.max(index, 0);
}
