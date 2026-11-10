import type { BusinessBrainPageRead, BusinessBrainSourceRead } from '$lib/server/businessBrain/readBusinessBrainPageWhole';
import type { BusinessBrainRevisionRead } from '$lib/server/businessBrain/readBusinessBrainPageHistory';

/** A page's words as the reader sees them: as it now reads, or as an earlier version read. */
export type PageShown = {
	title: string;
	summary: string;
	body: string;
	kind: string;
	facts: FactLine[];
	source: BusinessBrainSourceRead | null;
	revisedAt: string | null;
};

/** One fact a page states, by its name. */
export type FactLine = { name: string; value: string };

const noFacts: FactLine[] = [];

/** The page as it now reads, or the earlier version asked for; an earlier version kept no facts. */
export function pageAsShown(page: BusinessBrainPageRead, revision: BusinessBrainRevisionRead | null): PageShown {
	if (revision === null) {
		const { title, summary, body, kind, source } = page;
		return { title, summary, body, kind, source, facts: factLinesOf(page.facts), revisedAt: null };
	}
	const { title, summary, body, kind, source, revisedAt } = revision;
	return { title, summary, body, kind, source, facts: noFacts, revisedAt };
}

function factLinesOf(facts: Record<string, unknown>): FactLine[] {
	return Object.entries(facts).map(([name, value]) => ({ name, value: factValueText(value) }));
}

function factValueText(value: unknown): string {
	if (typeof value === 'string') return value;
	return JSON.stringify(value);
}
