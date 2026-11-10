import { sittingDirectors, type BoardroomDirector } from './boardroomDirector';

/** A director who may be put in the chair, by the value the meeting call names them with. */
export type ChairChoice = { value: string; name: string };

function chairChoiceOf(director: BoardroomDirector): ChairChoice {
	return { value: director.accountId ?? director.name, name: director.name };
}

/** The other sitting directors the caller may put in the chair; leaving it empty puts the caller there. */
export function chairChoicesOf(directors: BoardroomDirector[], callerAccountId: string): ChairChoice[] {
	const others = sittingDirectors(directors).filter((director) => director.accountId !== callerAccountId);
	return others.map(chairChoiceOf);
}
