import { actionDepartments, boardActionRefusals, isFittingWhat } from './boardroomActionRules';
import { readTrimmed, validateItemNumber } from './boardPaperInput';
import { parseDepartment, type Department } from './department';
import { isUuid } from './isUuid';

/** An action as given: the item by its number on the agenda now, and where it goes as named, not yet looked up. */
export type BoardActionDraft = {
	itemNumber: number;
	what: string;
	owner: string;
	dueOn: string | null;
	projectId: string | null;
	department: Department | null;
};

const calendarDatePattern = /^\d{4}-\d{2}-\d{2}$/;
const dateLength = 10;

function isCalendarDate(text: string): boolean {
	if (!calendarDatePattern.test(text)) return false;
	const day = new Date(`${text}T00:00:00.000Z`);
	return !Number.isNaN(day.getTime()) && day.toISOString().slice(0, dateLength) === text;
}

/** The project and department as given, checked together: both or neither, and never development. */
function validatePlace(input: Record<string, unknown>): Pick<BoardActionDraft, 'projectId' | 'department'> | string {
	const projectId = readTrimmed(input, 'projectId');
	const named = readTrimmed(input, 'department');
	if (projectId === '' && named !== '') return boardActionRefusals.departmentWithoutProject;
	if (projectId === '') return { projectId: null, department: null };
	if (!isUuid(projectId)) return boardActionRefusals.projectNotAnId;
	const department = parseDepartment(named);
	if (department === null) return boardActionRefusals.departmentUnknown;
	if (!actionDepartments.includes(department)) return boardActionRefusals.developmentNotAsked;
	return { projectId, department };
}

/** An action as given, checked against the columns it goes to, or the sentence naming what does not fit. */
export function validateBoardAction(input: Record<string, unknown>): BoardActionDraft | string {
	const itemNumber = validateItemNumber(input.itemNumber);
	if (itemNumber === null) return boardActionRefusals.itemNotOnAgenda;
	const what = readTrimmed(input, 'what');
	if (!isFittingWhat(what)) return boardActionRefusals.whatMissing;
	const owner = readTrimmed(input, 'owner');
	if (owner === '') return boardActionRefusals.ownerMissing;
	const dueOn = readTrimmed(input, 'dueOn');
	if (dueOn !== '' && !isCalendarDate(dueOn)) return boardActionRefusals.dueOnNotADate;
	const place = validatePlace(input);
	if (typeof place === 'string') return place;
	return { itemNumber, what, owner, dueOn: dueOn === '' ? null : dueOn, ...place };
}
