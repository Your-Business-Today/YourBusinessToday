import { type AreaEventKind } from './areaEventKind';
import { areaEventKindOrder, parseAreaEventKind } from './areaEventKindOrder';
import { areaEventLabels } from './areaEventLabels';
import { areaFeedScopes, parseAreaFeedScope, type AreaFeedScope } from './areaEvent';
import { filingFeedKinds, filingsGroup } from './filingFeedKinds';
import type { ScopeChoice } from './feedScopeChoice';

export const areaFeedPath = '/clients/feed';

/** How the feed is narrowed, read from the address and written back into every chip. */
export type AreaFeedView = { scope: AreaFeedScope; patchId: string | null; kind: AreaEventKind | null; isFilings: boolean; since: string | null };

const everyKind = 'every';

export function readAreaFeedView(searchParams: URLSearchParams): AreaFeedView {
	return {
		scope: parseAreaFeedScope(searchParams.get('scope')),
		patchId: searchParams.get('patch'),
		kind: parseAreaEventKind(searchParams.get('kind')),
		isFilings: searchParams.get('kind') === filingsGroup,
		since: sinceOrNull(searchParams.get('since'))
	};
}

/** The kinds the view narrows to: one kind, the filings group, or every kind. */
export function kindsInView(view: AreaFeedView): AreaEventKind[] | null {
	if (view.kind !== null) return [view.kind];
	if (view.isFilings) return filingFeedKinds;
	return null;
}

const isoDateShape = /^\d{4}-\d{2}-\d{2}$/;

export const feedSinceRefusal = 'A date to start from is written YYYY-MM-DD.';

/** Why the date cannot be used, or null when it reads as a date; the query never sees anything else. */
export function validateFeedSince(since: string | null): string | null {
	if (since === null || isoDateShape.test(since)) return null;
	return feedSinceRefusal;
}

function sinceOrNull(since: string | null): string | null {
	if (since === null || validateFeedSince(since) !== null) return null;
	return since;
}

export function areaFeedHref(view: AreaFeedView): string {
	const query = new URLSearchParams();
	if (view.scope === areaFeedScopes.mine) query.set('scope', view.scope);
	if (view.patchId !== null) query.set('patch', view.patchId);
	if (view.kind !== null) query.set('kind', view.kind);
	if (view.isFilings) query.set('kind', filingsGroup);
	if (view.since !== null) query.set('since', view.since);
	const text = query.toString();
	return text === '' ? areaFeedPath : `${areaFeedPath}?${text}`;
}

/** Everything, my patches, then one chip per patch. */
export function scopeChoicesFor(view: AreaFeedView, patches: { id: string; name: string }[]): ScopeChoice[] {
	return [
		{ scope: areaFeedScopes.everything, label: 'Everything', href: areaFeedHref({ ...view, scope: areaFeedScopes.everything, patchId: null }), title: 'Every patch' },
		{ scope: areaFeedScopes.mine, label: 'My patches', href: areaFeedHref({ ...view, scope: areaFeedScopes.mine, patchId: null }), title: 'Only the patches you work' },
		...patches.map((patch) => ({
			scope: patch.id,
			label: patch.name,
			href: areaFeedHref({ ...view, scope: areaFeedScopes.everything, patchId: patch.id }),
			title: `Only ${patch.name}`
		}))
	];
}

export function chosenScopeOf(view: AreaFeedView): string {
	return view.patchId ?? view.scope;
}

/** Every kind, then one chip per kind. */
export function kindChoicesFor(view: AreaFeedView): ScopeChoice[] {
	return [
		{ scope: everyKind, label: 'Every kind', href: areaFeedHref({ ...view, kind: null, isFilings: false }), title: 'Everything that happened' },
		{ scope: filingsGroup, label: 'Filings', href: areaFeedHref({ ...view, kind: null, isFilings: true }), title: "Everything Companies House's records say" },
		...areaEventKindOrder.map((kind) => kindChoiceFor(view, kind))
	];
}

function kindChoiceFor(view: AreaFeedView, kind: AreaEventKind): ScopeChoice {
	const label = areaEventLabels[kind];
	const title = `Only ${label.toLowerCase()} events`;
	return { scope: kind, label, href: areaFeedHref({ ...view, kind, isFilings: false }), title };
}

export function chosenKindOf(view: AreaFeedView): string {
	if (view.isFilings) return filingsGroup;
	return view.kind ?? everyKind;
}
