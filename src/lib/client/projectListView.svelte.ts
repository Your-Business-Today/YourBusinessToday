import { ProjectFilterChoices } from './projectFilterChoices.svelte';
import { matchesProjectListFilters, type ProjectListFilters } from '$lib/data/projectListFilter';
import { projectCountLabel } from '$lib/data/projectCountLabel';
import { countByStatusFilter } from '$lib/data/projectStatusCounts';
import type { ProjectStatusFilter } from '$lib/data/projectStatusFilter';
import { statusOnFirstVisit } from '$lib/data/projectsTab';
import { topRank } from '$lib/data/topRank';
import { writeShownIds, type ShownPosition } from '$lib/data/shownIds';
import { boardEdgesOf, type BoardEdges } from '$lib/data/projectBoardEdges';
import type { ListedProject } from '$lib/server/projects/getProjectsForUser';

/** One row of the shown page: the project, its number on the list, and whether it ends its board. */
export type ProjectListRow = BoardEdges & { id: string; project: ListedProject; position: number };

const projectsPerPage = 20;

/** The projects list as one person has narrowed and paged it; changing a filter returns to the first page. */
export class ProjectListView extends ProjectFilterChoices {
	#pageNumber = $state(1);
	#allProjects: () => ListedProject[];

	constructor(allProjects: () => ListedProject[], rememberedTab: string | null) {
		super(rememberedTab, statusOnFirstVisit(allProjects()));
		this.#allProjects = allProjects;
	}

	get pageNumber(): number {
		return Math.min(this.#pageNumber, this.pageCount);
	}

	set pageNumber(value: number) {
		this.#pageNumber = Math.max(1, Math.min(value, this.pageCount));
	}

	get filteredProjects(): ListedProject[] {
		return this.#projectsMatching(this.filters);
	}

	get matchCount(): number {
		return this.filteredProjects.length;
	}

	/** Finished projects the other filters would show, whether or not they are hidden. */
	get finishedCount(): number {
		const withFinished = this.#projectsMatching({ ...this.filters, isShowingFinished: true });
		const withoutFinished = this.#projectsMatching({ ...this.filters, isShowingFinished: false });
		return withFinished.length - withoutFinished.length;
	}

	get statusCounts(): Map<ProjectStatusFilter, number> {
		return countByStatusFilter(this.#allProjects(), this.filters);
	}

	/** The shown projects' ids in order, as the board's arrows and priority box send them. */
	get shownIds(): string {
		return writeShownIds(this.filteredProjects.map((project) => project.id));
	}

	/** A project's number on the board as shown, 1 at the top. */
	placeOf(projectId: string): ShownPosition {
		const position = this.filteredProjects.findIndex((project) => project.id === projectId) + topRank;
		return { position, shownIds: this.shownIds };
	}

	get pageCount(): number {
		return Math.max(1, Math.ceil(this.matchCount / projectsPerPage));
	}

	get firstPositionNumber(): number {
		return (this.pageNumber - 1) * projectsPerPage + 1;
	}

	get pagedProjects(): ListedProject[] {
		const firstProjectIndex = this.firstPositionNumber - 1;
		return this.filteredProjects.slice(firstProjectIndex, firstProjectIndex + projectsPerPage);
	}

	get pagedRows(): ProjectListRow[] {
		const shownProjects = this.filteredProjects;
		return this.pagedProjects.map((project, pageIndex) => ({
			id: project.id,
			project,
			position: this.firstPositionNumber + pageIndex,
			...boardEdgesOf(project, shownProjects)
		}));
	}

	get countLabel(): string {
		return projectCountLabel(this.#allProjects().length, this.matchCount);
	}

	protected onRefilter(): void {
		this.#pageNumber = 1;
	}

	#projectsMatching(filters: ProjectListFilters): ListedProject[] {
		return this.#allProjects().filter((project) => matchesProjectListFilters(project, filters));
	}
}
