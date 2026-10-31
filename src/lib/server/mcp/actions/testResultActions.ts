import { fixTitlePrefix, testOutcomeOrder, testResultLimits, type TestResult } from '$lib/data/testResult';
import { validateTestResults } from '$lib/data/validateTestResults';
import { newTaskRefusal } from '$lib/server/projects/newTaskRefusal';
import { fixSeed, recordTestResult } from '$lib/server/testing/recordTestResult';
import { objectSchema, textField } from '../actionTypes';
import { reachableTask } from '../projectAccess';
import { noSuchTask } from './describeTask';
import type { ProjectTask } from '$lib/server/projects/taskRecord';
import type { McpAction } from '../actionTypes';
import type { McpCaller } from '../resolveMcpCaller';

type TriedFeature = { task: ProjectTask; result: TestResult };

const resultSchema = objectSchema(
	{
		taskId: textField('The task the feature was built on'),
		outcome: textField(`${testOutcomeOrder.join(' or ')}`),
		proof: textField('What was tried and what was seen: the screenshot, the page, or the person’s yes'),
		fault: textField(`For a failure: what is wrong, in ${testResultLimits.longestFault} characters or fewer`)
	},
	['taskId', 'outcome', 'proof']
);

export const testResultActions: McpAction[] = [
	{
		name: 'record_test_results',
		area: 'conversations',
		audience: 'everyone',
		isWrite: true,
		summary: 'record a bulk testing pass: each feature tried, confirmed or failed, with its proof',
		guidance:
			'Use it after the testing pass of the YBT summary: take every testing ask together, try ' +
			'each feature yourself where you can reach it, otherwise get the proof the ask names from ' +
			'the person, then record them all in one call. Each result is posted on its task, which ' +
			'answers the testing ask waiting on you there. A failure also raises "FIX: <fault>" on the ' +
			'same project and goal, for Claude to build — a test never holds its task open, and never ' +
			'reopens it.',
		inputSchema: objectSchema(
			{ results: { type: 'array', items: resultSchema, description: 'One result per feature tried' } },
			['results']
		),
		run: async (caller, input) => {
			const results = validateTestResults(input.results);
			if (typeof results === 'string') return results;
			const tried = await findTriedFeatures(caller, results);
			if (typeof tried === 'string') return tried;
			const refusal = await firstFixRefusal(caller, tried);
			if (refusal !== null) return refusal;
			const lines = await recordEveryFeature(caller, tried);
			return [`Recorded ${tried.length} test results.`, ...lines].join('\n');
		}
	}
];

async function findTriedFeatures(caller: McpCaller, results: TestResult[]): Promise<TriedFeature[] | string> {
	const tried: TriedFeature[] = [];
	for (const result of results) {
		const task = await reachableTask(caller, result.taskId);
		if (task === null) return `${noSuchTask} (${result.taskId})`;
		tried.push({ task, result });
	}
	return tried;
}

async function firstFixRefusal(caller: McpCaller, tried: TriedFeature[]): Promise<string | null> {
	for (const { task, result } of tried) {
		if (result.fault === null) continue;
		const seed = fixSeed(task, result.fault, result.proof);
		const refusal = await newTaskRefusal(caller.supabase, task.projectId, seed);
		if (refusal !== null) return `"${task.title}": ${refusal}`;
	}
	return null;
}

async function recordEveryFeature(caller: McpCaller, tried: TriedFeature[]): Promise<string[]> {
	const lines: string[] = [];
	for (const feature of tried) lines.push(await recordFeature(caller, feature));
	return lines;
}

async function recordFeature(caller: McpCaller, { task, result }: TriedFeature): Promise<string> {
	const fixId = await recordTestResult(caller, task, result);
	if (fixId === null) return `- "${task.title}": confirmed.`;
	return `- "${task.title}": failed, raised "${fixTitlePrefix}${result.fault}" (task id: ${fixId}).`;
}
