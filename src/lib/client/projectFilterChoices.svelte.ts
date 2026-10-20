import { filterWhenProjectsOpen, type ProjectStatusFilter } from '$lib/data/projectStatusFilter';
import { everyOrganisationFilter, type OrganisationFilter } from '$lib/data/organisationFilter';
import type { ProjectListFilters } from '$lib/data/projectListFilter';

/** The filters one person has chosen on the projects page; finished projects start hidden. */
export abstract class ProjectFilterChoices {
	protected filters = $state<ProjectListFilters>({
		status: filterWhenProjectsOpen,
		organisation: everyOrganisationFilter,
		searchText: '',
		isShowingFinished: false
	});

	get searchText(): string {
		return this.filters.searchText;
	}

	set searchText(searchText: string) {
		this.#refilter({ searchText });
	}

	get selectedStatus(): ProjectStatusFilter {
		return this.filters.status;
	}

	set selectedStatus(status: ProjectStatusFilter) {
		this.#refilter({ status });
	}

	get selectedOrganisation(): OrganisationFilter {
		return this.filters.organisation;
	}

	set selectedOrganisation(organisation: OrganisationFilter) {
		this.#refilter({ organisation });
	}

	get isShowingFinished(): boolean {
		return this.filters.isShowingFinished;
	}

	set isShowingFinished(isShowingFinished: boolean) {
		this.#refilter({ isShowingFinished });
	}

	protected abstract onRefilter(): void;

	#refilter(change: Partial<ProjectListFilters>): void {
		this.filters = { ...this.filters, ...change };
		this.onRefilter();
	}
}
