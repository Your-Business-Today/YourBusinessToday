import { textField } from '../actionTypes';
import { defaultDepartment, isDevelopment, type Department } from '$lib/data/department';
import {
	developmentKindOrder,
	developmentKindRefusal,
	developmentKinds,
	isBugTitle,
	parseDevelopmentKind,
	titleForDevelopmentKind
} from '$lib/data/developmentKind';

export const developmentKindField = textField(
	`${developmentKindOrder.join(' or ')} — for a development task, say which, every time. A bug is ` +
		'something already built that is not working: it is titled "FIX: <what is wrong>" (added when ' +
		'missing), shows on the project’s Bugs tab and is built before any feature. A feature is ' +
		'anything new, a user story, on the Features tab. Ask the person when you cannot tell.'
);

type TitleChoice = { title: string } | { refusal: string };

/**
 * The title a development task is raised with once its kind is said: a bug takes the FIX: prefix,
 * a feature titled as a bug is refused. A subtask and a task of another department keep their title.
 */
export function validateDevelopmentKind(
	input: Record<string, unknown>,
	title: string,
	department: Department | undefined,
	fieldName = 'developmentKind'
): TitleChoice {
	const named = input[fieldName] ?? tabNamedAsDepartment(input);
	const isNamed = named !== undefined && named !== null && String(named).trim() !== '';
	if (!isNamed) return { title };
	const kind = parseDevelopmentKind(named);
	if (kind === null) return { refusal: `${developmentKindRefusal} Nothing was raised.` };
	const isTopLevelDevelopment = isDevelopment(department ?? defaultDepartment) && !input.parentTaskId;
	if (!isTopLevelDevelopment) return { title };
	if (kind === developmentKinds.feature && isBugTitle(title)) {
		return {
			refusal:
				'A feature is not titled "FIX:": that title is a bug. Give developmentKind bug if something ' +
				'built is not working, or title the feature with its story. Nothing was raised.'
		};
	}
	return { title: titleForDevelopmentKind(title, kind) };
}

export function isTitleRefused(choice: TitleChoice): choice is { refusal: string } {
	return 'refusal' in choice;
}

/** "bugs" or "features" given as the department names the kind as well. */
function tabNamedAsDepartment(input: Record<string, unknown>): unknown {
	const kind = parseDevelopmentKind(input.department);
	return kind ?? undefined;
}
