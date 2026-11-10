import { validateIsoDate } from './books/isoDate';
import { validateRecordId } from './isUuid';
import { boardPaperLimits, boardPaperRefusals, isFittingPaperText } from './boardroomPaperRules';
import { isGiven, readTrimmed, validateItemNumber } from './boardPaperInput';
import {
	boardRecordPaperRefusals,
	boardRecordSourceFields,
	everyBoardRecordField,
	fieldNeededForSource,
	fieldNotForSource
} from './boardroomRecordPaperRules';
import { isBoardRecordSource, type BoardRecordAsked, type BoardRecordPaperDraft, type BoardRecordSource } from './boardroomRecordPaper';

const dayFields = ['asAt', 'periodStart', 'periodEnd'];

function validateField(input: Record<string, unknown>, field: string): string | null {
	if (dayFields.includes(field)) return validateIsoDate(field, input[field]);
	return validateRecordId(field, readTrimmed(input, field));
}

function validateFieldsOfSource(input: Record<string, unknown>, source: BoardRecordSource): string | null {
	const { needed, optional } = boardRecordSourceFields[source];
	const allowed = [...needed, ...optional];
	const stray = everyBoardRecordField.find((field) => isGiven(input, field) && !allowed.includes(field));
	if (stray !== undefined) return fieldNotForSource(stray, source);
	const missing = needed.find((field) => !isGiven(input, field));
	if (missing !== undefined) return fieldNeededForSource(missing, source);
	const given = allowed.filter((field) => isGiven(input, field));
	return given.map((field) => validateField(input, field)).find((refusal) => refusal !== null) ?? null;
}

function givenOrNull(input: Record<string, unknown>, field: string): string | null {
	if (!isGiven(input, field)) return null;
	return readTrimmed(input, field);
}

function askedOf(input: Record<string, unknown>, source: BoardRecordSource): BoardRecordAsked {
	return {
		source,
		periodStart: givenOrNull(input, 'periodStart'),
		periodEnd: givenOrNull(input, 'asAt') ?? givenOrNull(input, 'periodEnd'),
		costCentreId: givenOrNull(input, 'costCentreId'),
		recordId: givenOrNull(input, 'projectId') ?? givenOrNull(input, 'pageId')
	};
}

/** A paper from the records as given, checked against the columns it goes to, or the sentence naming what does not fit. */
export function validateBoardroomRecordPaper(input: Record<string, unknown>): BoardRecordPaperDraft | string {
	const itemNumber = validateItemNumber(input.itemNumber);
	if (itemNumber === null) return boardPaperRefusals.itemNumberNotANumber;
	const title = readTrimmed(input, 'title');
	if (!isFittingPaperText(title, boardPaperLimits.longestTitle)) return boardPaperRefusals.titleMissing;
	const source = input.source;
	if (!isBoardRecordSource(source)) return boardRecordPaperRefusals.sourceNotKnown;
	const refusal = validateFieldsOfSource(input, source);
	if (refusal !== null) return refusal;
	return { itemNumber, title, asked: askedOf(input, source) };
}
