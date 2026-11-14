import type { BrainPageSummary } from '$lib/data/brainTypes';
import type { ConstellationExperience } from './createConstellationExperience';
import type { ConstellationCallbacks, ConstellationHover } from './constellationTypes';

type ExplorationDependencies = {
	pageIndex: () => BrainPageSummary[];
	experience: () => ConstellationExperience | undefined;
};

/** Where the person is in the brain: what the pointer is over, the area in focus and the page opened. */
export class ConstellationExploration {
	hover = $state<ConstellationHover | null>(null);
	focusedContextSlug = $state<string | null>(null);
	selectedSlug = $state<string | null>(null);

	readonly callbacks: ConstellationCallbacks = {
		onHover: (candidate) => (this.hover = candidate),
		onSelectNeuron: (slug) => this.rememberSelection(slug),
		onFocusContext: (contextSlug) => (this.focusedContextSlug = contextSlug)
	};

	constructor(private readonly dependencies: ExplorationDependencies) {}

	rememberSelection = (slug: string): void => {
		this.selectedSlug = slug;
		const page = this.dependencies.pageIndex().find((candidate) => candidate.slug === slug);
		this.focusedContextSlug = page?.contextSlug ?? this.focusedContextSlug;
	};

	/** Opens a page as if its neuron were clicked: flies to it and shows it in the panel. */
	openNeuron = (slug: string): void => {
		this.rememberSelection(slug);
		this.dependencies.experience()?.focusNeuron(slug);
	};

	returnToModel = (): void => {
		this.selectedSlug = null;
		this.focusedContextSlug = null;
		this.dependencies.experience()?.resetView();
	};

	returnToContext = (): void => {
		this.selectedSlug = null;
		this.dependencies.experience()?.focusContext(this.focusedContextSlug);
	};
}
