import { filterWhenProjectsOpen, type ProjectStatusFilter } from '$lib/data/projectStatusFilter';
import { everyOrganisationFilter, type OrganisationFilter } from '$lib/data/organisationFilter';
import { matchesProjectListFilters } from '$lib/data/projectListFilter';
import type { OrganisationPlace } from '$lib/data/organisationAccess';
import type { ProjectSummary } from '$lib/server/projects/getProjectsForOwner';

const projectsPerPage = 12;

/** The projects list as one person has narrowed and paged it; changing a filter returns to the first page. */
export class ProjectListView {
	#searchText = $state('');
	#selectedStatus = $state<ProjectStatusFilter>(filterWhenProjectsOpen);
	#selectedOrganisation = $state<OrganisationFilter>(everyOrganisationFilter);
	#pageNumber = $state(1);
	#allProjects: () => ProjectSummary[];
	#organisations: () => OrganisationPlace[];

	constructor(allProjects: () => ProjectSummary[], organisations: () => OrganisationPlace[]) {
		this.#allProjects = allProjects;
		this.#organisations = organisations;
	}

	get searchText(): string {
		return this.#searchText;
	}

	set searchText(value: string) {
		this.#searchText = value;
		this.#pageNumber = 1;
	}

	get selectedStatus(): ProjectStatusFilter {
		return this.#selectedStatus;
	}

	set selectedStatus(value: ProjectStatusFilter) {
		this.#selectedStatus = value;
		this.#pageNumber = 1;
	}

	get selectedOrganisation(): OrganisationFilter {
		return this.#selectedOrganisation;
	}

	set selectedOrganisation(value: OrganisationFilter) {
		this.#selectedOrganisation = value;
		this.#pageNumber = 1;
	}

	get pageNumber(): number {
		return Math.min(this.#pageNumber, this.pageCount);
	}

	set pageNumber(value: number) {
		this.#pageNumber = Math.max(1, Math.min(value, this.pageCount));
	}

	get filteredProjects(): ProjectSummary[] {
		return this.#allProjects().filter((project) => this.#matchesFilters(project));
	}

	get matchCount(): number {
		return this.filteredProjects.length;
	}

	get pageCount(): number {
		return Math.max(1, Math.ceil(this.matchCount / projectsPerPage));
	}

	get firstPositionNumber(): number {
		return (this.pageNumber - 1) * projectsPerPage + 1;
	}

	get pagedProjects(): ProjectSummary[] {
		const firstProjectIndex = this.firstPositionNumber - 1;
		return this.filteredProjects.slice(firstProjectIndex, firstProjectIndex + projectsPerPage);
	}

	get projectCount(): number {
		return this.#allProjects().length;
	}

	get countLabel(): string {
		const totalCount = this.projectCount;
		const filteredCount = this.matchCount;
		const noun = totalCount === 1 ? 'project' : 'projects';
		if (filteredCount === totalCount) return `${totalCount} ${noun}`;
		return `${filteredCount} of ${totalCount} ${noun}`;
	}

	#matchesFilters(project: ProjectSummary): boolean {
		const filters = {
			status: this.#selectedStatus,
			organisation: this.#selectedOrganisation,
			searchText: this.#searchText
		};
		return matchesProjectListFilters(project, filters, this.#organisations());
	}
}
