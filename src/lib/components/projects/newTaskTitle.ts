import { bugFixTitlePrefix } from '$lib/data/userStoryRule';
import { developmentKinds, titleForDevelopmentKind, type DevelopmentKind } from '$lib/data/developmentKind';

/** What the new-task form asks for and raises: on the Bugs tab a top level task is a bug, titled "FIX:" for the asker. */
export function newTaskTitle(
	typedTitle: string,
	parentTaskId: string | null,
	developmentKind: DevelopmentKind | null
) {
	const isSubtask = parentTaskId !== null;
	const isBug = !isSubtask && developmentKind === developmentKinds.bug;
	return {
		raisedTitle: titleForDevelopmentKind(typedTitle, isBug ? developmentKind : null),
		placeholder: titlePlaceholder(isSubtask, isBug)
	};
}

function titlePlaceholder(isSubtask: boolean, isBug: boolean): string {
	if (isSubtask) return 'What needs doing';
	if (isBug) return 'What is not working — it is raised as a bug';
	return `The story, or ${bugFixTitlePrefix} what is wrong`;
}
