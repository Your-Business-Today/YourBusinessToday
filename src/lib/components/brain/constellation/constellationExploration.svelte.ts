import type { BrainPageSummary } from '$lib/data/brainTypes';
import type { ConstellationExperience } from './createConstellationExperience';
import type { ConstellationCallbacks, ConstellationHover } from './constellationTypes';

export type ConstellationExploration = {
	readonly hover: ConstellationHover | null;
	readonly focusedContextSlug: string | null;
	readonly selectedSlug: string | null;
	callbacks: ConstellationCallbacks;
	rememberSelection: (slug: string) => void;
	returnToModel: () => void;
	returnToContext: () => void;
};

export function createConstellationExploration(dependencies: {
	pageIndex: () => BrainPageSummary[];
	experience: () => ConstellationExperience | undefined;
}): ConstellationExploration {
	const { pageIndex, experience } = dependencies;
	let hover = $state<ConstellationHover | null>(null);
	let focusedContextSlug = $state<string | null>(null);
	let selectedSlug = $state<string | null>(null);

	function rememberSelection(slug: string): void {
		selectedSlug = slug;
		const page = pageIndex().find((candidate) => candidate.slug === slug);
		focusedContextSlug = page?.contextSlug ?? focusedContextSlug;
	}

	function returnToModel(): void {
		selectedSlug = null;
		focusedContextSlug = null;
		experience()?.resetView();
	}

	function returnToContext(): void {
		selectedSlug = null;
		experience()?.focusContext(focusedContextSlug);
	}

	return {
		get hover() {
			return hover;
		},
		get focusedContextSlug() {
			return focusedContextSlug;
		},
		get selectedSlug() {
			return selectedSlug;
		},
		callbacks: {
			onHover: (candidate) => (hover = candidate),
			onSelectNeuron: rememberSelection,
			onFocusContext: (contextSlug) => (focusedContextSlug = contextSlug)
		},
		rememberSelection,
		returnToModel,
		returnToContext
	};
}
