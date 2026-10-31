import { testOutcomeOrder, testOutcomes, testResultLimits, type TestOutcome, type TestResult } from './testResult';

const { longestProof, longestFault, mostResults } = testResultLimits;

export const resultsRefusal = `Give results as a list of 1 to ${mostResults} results.`;
const taskRefusal = 'Each result names the taskId of the feature it tried.';
const outcomeRefusal = `Each result's outcome is ${testOutcomeOrder.join(' or ')}.`;
const proofRefusal = `Each result's proof says what was tried and seen, in 1 to ${longestProof} characters.`;
const faultRefusal = `A failed result says what is wrong as fault, in 1 to ${longestFault} characters.`;

/** The results as given, each checked against the message and task it becomes, or a sentence naming what does not fit. */
export function validateTestResults(value: unknown): TestResult[] | string {
	if (!Array.isArray(value) || value.length === 0 || value.length > mostResults) return resultsRefusal;
	const results: TestResult[] = [];
	for (const [index, entry] of value.entries()) {
		const result = validateTestResult(entry);
		if (typeof result === 'string') return `Result ${index + 1}: ${result}`;
		results.push(result);
	}
	return results;
}

function validateTestResult(entry: unknown): TestResult | string {
	const fields = (entry ?? {}) as Record<string, unknown>;
	const taskId = textOf(fields.taskId);
	if (taskId === '') return taskRefusal;
	const outcome = parseOutcome(fields.outcome);
	if (outcome === null) return outcomeRefusal;
	const proof = textOf(fields.proof);
	if (proof === '' || proof.length > longestProof) return proofRefusal;
	const fault = readFault(fields.fault, outcome);
	if (fault === undefined) return faultRefusal;
	return { taskId, outcome, proof, fault };
}

function readFault(value: unknown, outcome: TestOutcome): string | null | undefined {
	if (outcome === testOutcomes.confirmed) return null;
	const fault = textOf(value);
	if (fault === '' || fault.length > longestFault) return undefined;
	return fault;
}

function parseOutcome(value: unknown): TestOutcome | null {
	const outcome = textOf(value) as TestOutcome;
	return testOutcomeOrder.includes(outcome) ? outcome : null;
}

function textOf(value: unknown): string {
	return String(value ?? '').trim();
}
