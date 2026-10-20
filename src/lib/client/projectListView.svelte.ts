import { ProjectFilterChoices } from './projectFilterChoices.svelte';
import { matchesProjectListFilters, type ProjectListFilters } from '$lib/data/projectListFilter';
import { projectCountLabel } from '$lib/data/projectCountLabel';
import { topRank } from '$lib/data/topRank';
import { writeShownIds, type ShownPosition } from '$lib/data/shownIds';
import type { OrganisationPlace } from '$lib/data/organisationAccess';
import type { ProjectSummary } from '$lib/server/projects/getProjectsForOwner';

const projectsPerPage = 12;

/** The projects list as one person has narrowed and paged it; changing a filter returns to the first page. */
export class ProjectListView extends ProjectFilterChoices {
	#pageNumber = $state(1);
	#allProjects: () => ProjectSummary[];
	#organisations: () => OrganisationPlace[];

	constructor(allProjects: () => ProjectSummary[], organisations: () => OrganisationPlace[]) {
		super();
		this.#allProjects = allProjects;
		this.#organisations = organisations;
	}

	get pageNumber(): number {
		return Math.min(this.#pageNumber, this.pageCount);
	}

	set pageNumber(value: number) {
		this.#pageNumber = Math.max(1, Math.min(value, this.pageCount));
	}

	get filteredProjects(): ProjectSummary[] {
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

	get pagedProjects(): ProjectSummary[] {
		const firstProjectIndex = this.firstPositionNumber - 1;
		return this.filteredProjects.slice(firstProjectIndex, firstProjectIndex + projectsPerPage);
	}

	get projectCount(): number {
		return this.#allProjects().length;
	}

	get countLabel(): string {
		return projectCountLabel(this.projectCount, this.matchCount);
	}

	protected onRefilter(): void {
		this.#pageNumber = 1;
	}

	#projectsMatching(filters: ProjectListFilters): ProjectSummary[] {
		const organisations = this.#organisations();
		return this.#allProjects().filter((project) => matchesProjectListFilters(project, filters, organisations));
	}
}
