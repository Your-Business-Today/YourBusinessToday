import { describe, expect, it } from 'vitest';
import { objectSchema, textField } from './actionTypes';
import { readActionToolName, writeActionToolName } from './actionToolNames';
import { breachesOf, reroutedActionsOf } from './pipelineContractBreaches';

const projectId = textField('The project id');
const words = textField('A few words from the task you have in mind');
const promisedFindTasks = {
	find_tasks: { inputs: { projectId: 'string', words: 'string' }, required: ['projectId'] }
};
const promisedStep = {
	record_step: { inputs: { step: 'string' }, required: ['step'], values: { step: ['building', 'built'] } }
};

function findTasks(inputs: Record<string, unknown>, required: string[] = ['projectId']) {
	return [{ name: 'find_tasks', inputSchema: objectSchema(inputs, required) }];
}

function recordStep(step: Record<string, unknown>) {
	return [{ name: 'record_step', inputSchema: objectSchema({ step }, ['step']) }];
}

describe('breachesOf', () => {
	it('finds nothing broken while the connector offers what was promised', () => {
		expect(breachesOf(promisedFindTasks, findTasks({ projectId, words }))).toEqual([]);
	});

	it('lets the connector grow by a call or by an input nobody has to give', () => {
		const grown = [
			...findTasks({ projectId, words, goalId: textField('The goal to look under') }),
			{ name: 'find_goals', inputSchema: objectSchema({ projectId }, ['projectId']) }
		];
		expect(breachesOf(promisedFindTasks, grown)).toEqual([]);
	});

	it('lets an input the pipeline had to give become one it may leave out', () => {
		expect(breachesOf(promisedFindTasks, findTasks({ projectId, words }, []))).toEqual([]);
	});

	it('names a call that was renamed or removed', () => {
		const renamed = [{ name: 'search_tasks', inputSchema: objectSchema({ projectId, words }, ['projectId']) }];
		expect(breachesOf(promisedFindTasks, renamed)).toEqual(['find_tasks is no longer offered']);
	});

	it('names an input the call no longer takes', () => {
		const breaches = breachesOf(promisedFindTasks, findTasks({ projectId, text: words }));
		expect(breaches).toEqual(['find_tasks no longer takes words']);
	});

	it('names an input whose type changed', () => {
		const breaches = breachesOf(promisedFindTasks, findTasks({ projectId, words: { type: 'array' } }));
		expect(breaches).toEqual(['find_tasks now takes words as array, no longer as string']);
	});

	it('names an input that became required', () => {
		const breaches = breachesOf(promisedFindTasks, findTasks({ projectId, words }, ['projectId', 'words']));
		expect(breaches).toEqual(['find_tasks now requires words']);
	});

	it('finds a promised value among the choices an input describes or lists', () => {
		const described = recordStep(textField('One of considering, building, built'));
		const listed = recordStep({ type: 'string', enum: ['considering', 'building', 'built'] });
		expect(breachesOf(promisedStep, described)).toEqual([]);
		expect(breachesOf(promisedStep, listed)).toEqual([]);
	});

	it('names a promised value an input no longer names', () => {
		const described = recordStep(textField('One of considering, building, rebuilt'));
		const listed = recordStep({ type: 'string', enum: ['considering', 'building'] });
		const breach = 'record_step no longer names "built" as a value of step';
		expect(breachesOf(promisedStep, described)).toEqual([breach]);
		expect(breachesOf(promisedStep, listed)).toEqual([breach]);
	});
});

describe('reroutedActionsOf', () => {
	const promised = {
		read_task: { isWrite: false, inputs: {}, required: [] },
		rename_task: { isWrite: true, inputs: {}, required: [] }
	};
	const readTask = { name: 'read_task', isWrite: false, inputSchema: objectSchema({}) };
	const renameTask = { name: 'rename_task', isWrite: true, inputSchema: objectSchema({}) };
	const archiveTask = { name: 'archive_task', isWrite: true, inputSchema: objectSchema({}) };

	it('finds nothing moved while each action runs through the tool it was promised on', () => {
		expect(reroutedActionsOf(promised, [readTask, renameTask, archiveTask])).toEqual([]);
	});

	it('names an action that moved between the tool that reads and the tool that writes', () => {
		const moved = [
			{ ...readTask, isWrite: true },
			{ ...renameTask, isWrite: false }
		];
		expect(reroutedActionsOf(promised, moved)).toEqual([
			`read_task now writes, so ${readActionToolName} refuses it`,
			`rename_task now only reads, so ${writeActionToolName} refuses it`
		]);
	});
});
