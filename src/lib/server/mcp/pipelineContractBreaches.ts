import { readActionToolName, writeActionToolName } from './actionToolNames';

export type ContractedCall = {
	inputs: Record<string, string>;
	required: string[];
	values?: Record<string, string[]>;
};

export type ContractedAction = ContractedCall & { isWrite: boolean };

export type OfferedCall = { name: string; inputSchema: Record<string, unknown> };

export type OfferedAction = OfferedCall & { isWrite: boolean };

type OfferedInput = { type?: string; description?: string; enum?: string[] };

const wordsOfADescription = /[A-Za-z_]+/g;

/**
 * Every way the connector no longer honours a call the build pipeline was promised, one sentence
 * each. A call or an input the contract does not name is never a breach, so the connector may grow.
 */
export function breachesOf(contracted: Record<string, ContractedCall>, offered: OfferedCall[]): string[] {
	return Object.entries(contracted).flatMap(([name, promised]) => {
		const call = offered.find((candidate) => candidate.name === name);
		if (call === undefined) return [`${name} is no longer offered`];
		return brokenPromises(name, promised, call.inputSchema);
	});
}

/** Every promised action that has moved between the tool that reads and the tool that writes. */
export function reroutedActionsOf(
	contracted: Record<string, ContractedAction>,
	offered: OfferedAction[]
): string[] {
	return offered
		.filter((action) => hasMovedTool(action, contracted[action.name]))
		.map((action) => `${action.name} ${refusalAfterMoving(action.isWrite)}`);
}

function hasMovedTool(action: OfferedAction, promised: ContractedAction | undefined): boolean {
	if (promised === undefined) return false;
	return promised.isWrite !== action.isWrite;
}

function refusalAfterMoving(isWriteNow: boolean): string {
	if (isWriteNow) return `now writes, so ${readActionToolName} refuses it`;
	return `now only reads, so ${writeActionToolName} refuses it`;
}

function brokenPromises(name: string, promised: ContractedCall, inputSchema: Record<string, unknown>): string[] {
	const offeredInputs = (inputSchema.properties ?? {}) as Record<string, OfferedInput>;
	const requiredNow = (inputSchema.required ?? []) as string[];
	return [
		...changedInputs(name, promised.inputs, offeredInputs),
		...newlyRequiredInputs(name, promised.required, requiredNow),
		...droppedValues(name, promised.values ?? {}, offeredInputs)
	];
}

function changedInputs(
	name: string,
	promisedInputs: Record<string, string>,
	offeredInputs: Record<string, OfferedInput>
): string[] {
	return Object.entries(promisedInputs).flatMap(([input, promisedType]) => {
		const offeredInput: OfferedInput | undefined = offeredInputs[input];
		if (offeredInput === undefined) return [`${name} no longer takes ${input}`];
		if (offeredInput.type === promisedType) return [];
		return [`${name} now takes ${input} as ${offeredInput.type}, no longer as ${promisedType}`];
	});
}

function newlyRequiredInputs(name: string, promisedRequired: string[], requiredNow: string[]): string[] {
	return requiredNow
		.filter((input) => !promisedRequired.includes(input))
		.map((input) => `${name} now requires ${input}`);
}

function droppedValues(
	name: string,
	promisedValues: Record<string, string[]>,
	offeredInputs: Record<string, OfferedInput>
): string[] {
	return Object.entries(promisedValues).flatMap(([input, values]) => {
		const choices = choicesOf(offeredInputs[input]);
		return values
			.filter((value) => !choices.includes(value))
			.map((value) => `${name} no longer names "${value}" as a value of ${input}`);
	});
}

function choicesOf(offeredInput: OfferedInput | undefined): string[] {
	if (offeredInput === undefined) return [];
	const description = offeredInput.description ?? '';
	return offeredInput.enum ?? description.match(wordsOfADescription) ?? [];
}
