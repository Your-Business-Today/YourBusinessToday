import { cookieRememberingTab, statusFilterOfTab } from '$lib/data/projectsTab';
import type { ProjectListFilters } from '$lib/data/projectListFilter';
import type { ProjectStatus } from '$lib/data/projectStatus';
import type { ProjectStatusFilter } from '$lib/data/projectStatusFilter';

type ProjectNarrowing = Omit<ProjectListFilters, 'status'>;

/** What one person has chosen on the projects page: its tab, the search words and whether finished projects show. */
export abstract class ProjectFilterChoices {
	#selectedTab = $state('');
	#statusOnFirstVisit: ProjectStatus;
	#narrowing = $state<ProjectNarrowing>({ searchText: '', isShowingFinished: false });

	/** The page opens on the tab the person last had it on, and the first time on the first visit's status. */
	constructor(rememberedTab: string | null, statusOnFirstVisit: ProjectStatus) {
		this.#statusOnFirstVisit = statusOnFirstVisit;
		this.#selectedTab = rememberedTab ?? statusOnFirstVisit;
	}

	/** Priority tasks, or the status the list is narrowed to. */
	get selectedTab(): string {
		return this.#selectedTab;
	}

	set selectedTab(tab: string) {
		this.#selectedTab = tab;
		document.cookie = cookieRememberingTab(tab);
		this.onRefilter();
	}

	/** The status the list is narrowed to; behind Priority tasks it is the first visit's. */
	get selectedStatus(): ProjectStatusFilter {
		return statusFilterOfTab(this.#selectedTab) ?? this.#statusOnFirstVisit;
	}

	get searchText(): string {
		return this.#narrowing.searchText;
	}

	set searchText(searchText: string) {
		this.#narrow({ searchText });
	}

	get isShowingFinished(): boolean {
		return this.#narrowing.isShowingFinished;
	}

	set isShowingFinished(isShowingFinished: boolean) {
		this.#narrow({ isShowingFinished });
	}

	protected get filters(): ProjectListFilters {
		return { ...this.#narrowing, status: this.selectedStatus };
	}

	protected abstract onRefilter(): void;

	#narrow(change: Partial<ProjectNarrowing>): void {
		this.#narrowing = { ...this.#narrowing, ...change };
		this.onRefilter();
	}
}
