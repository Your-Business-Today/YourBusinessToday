import { formatBritishDate } from './britishDate';
import { isSitting, type BoardroomDirector } from './boardroomDirector';

function sittingLine(director: BoardroomDirector): string {
	return `- ${director.name}, director since ${formatBritishDate(director.namedAt)}`;
}

function stoodDownLine(director: BoardroomDirector, stoodDownAt: string): string {
	return `- ${director.name}, director from ${formatBritishDate(director.namedAt)} to ${formatBritishDate(stoodDownAt)}`;
}

function formerLines(directors: BoardroomDirector[]): string[] {
	return directors.flatMap((director) => (director.stoodDownAt === null ? [] : [stoodDownLine(director, director.stoodDownAt)]));
}

/** What a director is told on entering an organisation's boardroom: who sits on its board, and who once did. */
export function describeBoardroom(organisationName: string, directors: BoardroomDirector[]): string {
	const sitting = directors.filter(isSitting).map(sittingLine);
	const former = formerLines(directors);
	const formerSection = former.length === 0 ? [] : ['', 'Stood down:', ...former];
	return [`The boardroom of ${organisationName}.`, '', 'Directors:', ...sitting, ...formerSection].join('\n');
}
