import { boardColumns } from './promoBoard';
import { boardStory, liveColumn } from './boardStory';

export type CardPlacement = { beat: number; column: number; slot: number; isColumnChange: boolean };

type BoardMove = { beat: number; card: number; column: number };

type Place = { column: number; slot: number };

function boardMoves(): BoardMove[] {
	const moves = boardStory.flatMap((story, card) =>
		story.advances.map((beat, step) => ({ beat, card, column: story.startColumn + step + 1 }))
	);
	return moves.sort((first, second) => first.beat - second.beat);
}

function startingColumns(): number[][] {
	const columns = boardColumns.map((): number[] => []);
	boardStory.forEach((story, card) => {
		const column = columns[story.startColumn];
		column.push(card);
	});
	return columns;
}

function placeOf(columns: number[][], card: number): Place {
	const column = columns.findIndex((cards) => cards.includes(card));
	const cardsInColumn = columns[column];
	return { column, slot: cardsInColumn.indexOf(card) };
}

function moveCard(columns: number[][], move: BoardMove): void {
	const from = placeOf(columns, move.card);
	const leaving = columns[from.column];
	const arriving = columns[move.column];
	leaving.splice(from.slot, 1);
	arriving.unshift(move.card);
}

function recordChanges(placements: CardPlacement[][], columns: number[][], beat: number): void {
	placements.forEach((history, card) => {
		const latest = history[history.length - 1];
		const place = placeOf(columns, card);
		const isColumnChange = place.column !== latest.column;
		const isUnmoved = !isColumnChange && place.slot === latest.slot;
		if (isUnmoved) return;
		history.push({ beat, ...place, isColumnChange });
	});
}

function placeCards(): CardPlacement[][] {
	const columns = startingColumns();
	const placements = boardStory.map((_, card) => [
		{ beat: -Infinity, ...placeOf(columns, card), isColumnChange: false }
	]);
	boardMoves().forEach((move) => {
		moveCard(columns, move);
		recordChanges(placements, columns, move.beat);
	});
	return placements;
}

/** Every place each card takes on the board, and the board beat it moves there: newcomers go to the top of a column. */
export const cardPlacements = placeCards();

/** The board beats at which a task sets off for Live, in order. */
export const liveMoveBeats = boardMoves()
	.filter((move) => move.column === liveColumn)
	.map((move) => move.beat);

export const tasksGoingLive = liveMoveBeats.length;

export function tasksGoneLiveBy(boardBeats: number): number {
	return liveMoveBeats.filter((beat) => beat <= boardBeats).length;
}

function placementAt(placements: CardPlacement[], boardBeats: number): CardPlacement {
	const reached = placements.filter((placement) => placement.beat <= boardBeats);
	return reached[reached.length - 1];
}

export function cardsInColumnAt(column: number, boardBeats: number): number {
	const current = cardPlacements.map((placements) => placementAt(placements, boardBeats));
	return current.filter((placement) => placement.column === column).length;
}
