import { readText, textField } from '../actionTypes';
import { parseMoveDirection, parseRank } from '$lib/server/ordering/rankInput';
import { dropPlacements, type BesidePlacement, type MoveDirection } from '$lib/server/ordering/rankedSet';

export type { BesidePlacement };

export const directionField = textField('up or down');
export const besidePlacementField = textField('before or after');
export const priorityField = (whatItRanks: string) => ({
	type: 'integer',
	description: `The priority number to give it: 1 is the top ${whatItRanks}; a number past the end means last. The others shift to make room.`
});

export const sayWhichDirection = 'It moves up or down. Say which.';
export const sayWhichPlacement = 'It goes before or after the other. Say which.';
export const sayWhichPriority = 'Priority is a whole number, 1 for the top. Say which.';

export const joinTargetGoalField = {
	type: 'boolean',
	description:
		'true to move the task into the goal of the top level task it is placed beside as well — ' +
		'leave out to keep its own goal'
};
export const sayWhetherToJoinGoal = 'shouldJoinTargetGoal is true or false.';

export function readMoveDirection(input: Record<string, unknown>): MoveDirection | null {
	return parseMoveDirection(readText(input, 'direction'));
}

export function readBesidePlacement(input: Record<string, unknown>): BesidePlacement | null {
	const placement = readText(input, 'placement');
	if (placement === dropPlacements.before || placement === dropPlacements.after) return placement;
	return null;
}

export function readPriority(input: Record<string, unknown>): number | null {
	return parseRank(input.priority);
}

/** Whether the caller asked to join the target's goal: true, false, or null when it is neither. */
export function readShouldJoinTargetGoal(input: Record<string, unknown>): boolean | null {
	const shouldJoinTargetGoal = input.shouldJoinTargetGoal;
	if (shouldJoinTargetGoal === undefined) return false;
	if (typeof shouldJoinTargetGoal === 'boolean') return shouldJoinTargetGoal;
	return null;
}
