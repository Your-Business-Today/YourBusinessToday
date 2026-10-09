import type { AcceptanceCriterion } from '$lib/server/projects/criterionRecord';
import type { ChecklistItem, TaskChecklist } from '$lib/server/projects/checklistRecord';

export function criterionLines(criteria: AcceptanceCriterion[]): string[] {
	if (criteria.length === 0) return ['Acceptance criteria: none yet.'];
	return ['Acceptance criteria:', ...criteria.map(criterionLine)];
}

function criterionLine(criterion: AcceptanceCriterion): string {
	const state = criterion.isMet ? 'met' : 'not met';
	return `- ${criterion.description} (${state}, id: ${criterion.id})`;
}

export function checklistLines(checklists: TaskChecklist[]): string[] {
	return checklists.flatMap((checklist) => [
		`Checklist "${checklist.title}" (id: ${checklist.id}):`,
		...checklist.items.map(checklistItemLine)
	]);
}

function checklistItemLine(item: ChecklistItem): string {
	return `- ${item.description} (${itemState(item.isDone)}, id: ${item.id})`;
}

function itemState(isDone: boolean): string {
	if (isDone) return 'done';
	return 'to do';
}
