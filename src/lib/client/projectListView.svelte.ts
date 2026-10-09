import {
	filterWhenProjectsOpen,
	matchesProjectStatusFilter,
	type ProjectStatusFilter
} from '$lib/data/projectStatusFilter';
import type { ProjectSummary } from '$lib/server/projects/getProjectList';

const projectsPerPage = 12;

/**
 * Client-side view state for the projects list: search and status filtering
 * with instant results, paged into fixed-size chunks. Changing a filter
 * returns to the first page; the page number always stays within range.
 */
export class ProjectListView {
	#searchText = $state('');
	#selectedStatus = $state<ProjectStatusFilter>(filterWhenProjectsOpen);
	#pageNumber = $state(1);
	#allProjects: () => ProjectSummary[];

	constructor(allProjects: () => ProjectSummary[]) {
		this.#allProjects = allProjects;
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

	get pageNumber(): number {
		return Math.min(this.#pageNumber, this.pageCount);
	}

	set pageNumber(value: number) {
		this.#pageNumber = Math.max(1, Math.min(value, this.pageCount));
	}

	get filteredProjects(): ProjectSummary[] {
		return this.#allProjects().filter((project) => this.#matchesFilters(project));
	}

	get pageCount(): number {
		return Math.max(1, Math.ceil(this.filteredProjects.length / projectsPerPage));
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
		const filteredCount = this.filteredProjects.length;
		const noun = totalCount === 1 ? 'project' : 'projects';
		if (filteredCount === totalCount) return `${totalCount} ${noun}`;
		return `${filteredCount} of ${totalCount} ${noun}`;
	}

	#matchesFilters(project: ProjectSummary): boolean {
		const matchesStatus = matchesProjectStatusFilter(project.status, this.#selectedStatus);
		const matchesSearch = project.name
			.toLowerCase()
			.includes(this.#searchText.trim().toLowerCase());
		return matchesStatus && matchesSearch;
	}
}
