import { labelRoles, type LabelRole } from './labelChoice';
import type { ConstellationScene } from './constellationSceneAssembly';
import type { ConstellationCallbacks } from './constellationTypes';
import type { FocusDirector } from './focusDirector';

/** What a person can do with a label: open its area or its page, and point at an area to see where it lies. */
export type LabelActions = {
	openArea: (contextSlug: string) => void;
	openPage: (slug: string) => void;
	pointAtArea: (contextSlug: string | null) => void;
};

/** A label does what clicking its cell does; pointing at an area's name lights that area alone until the pointer leaves. */
export function labelActionsFor(director: () => FocusDirector, view: ConstellationScene, callbacks: ConstellationCallbacks): LabelActions {
	return {
		openArea: (contextSlug) => {
			director().focusContext(contextSlug);
			callbacks.onFocusContext(contextSlug);
		},
		openPage: (slug) => {
			director().focusNeuron(slug);
			callbacks.onSelectNeuron(slug);
		},
		pointAtArea: (contextSlug) => view.setFocus(contextSlug ?? director().focusKeyHeld)
	};
}

/** Clicking a label opens what it names: an area's name its area, a page's title its page; the open page's title does nothing. */
export function openLabelled(actions: LabelActions, slug: string, role: LabelRole): void {
	if (role === labelRoles.area) actions.openArea(slug);
	if (role === labelRoles.page) actions.openPage(slug);
}

/** Pointing at an area's name over the whole brain lights that area; pointing away (slug null) lights them all again. */
export function pointAtLabelled(actions: LabelActions, slug: string | null, role: LabelRole, isWholeBrain: boolean): void {
	if (role === labelRoles.area && isWholeBrain) actions.pointAtArea(slug);
}
