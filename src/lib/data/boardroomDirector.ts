/** One directorship of an organisation: named by an administrator, and stood down with a date, never deleted. */
export type BoardroomDirector = {
	id: string;
	organisationId: string;
	accountId: string | null;
	name: string;
	namedAt: string;
	stoodDownAt: string | null;
};

export function isSitting(director: BoardroomDirector): boolean {
	return director.stoodDownAt === null;
}

export function sittingDirectors(directors: BoardroomDirector[]): BoardroomDirector[] {
	return directors.filter(isSitting);
}

export function sittingSeatOf(directors: BoardroomDirector[], accountId: string): BoardroomDirector | null {
	return sittingDirectors(directors).find((director) => director.accountId === accountId) ?? null;
}

export function directorListSentence(directors: BoardroomDirector[]): string {
	const sitting = sittingDirectors(directors);
	if (sitting.length === 0) return 'none named yet';
	return sitting.map((director) => director.name).join(', ');
}
