export type TestOutcome = 'confirmed' | 'failed';

export const testOutcomes = { confirmed: 'confirmed', failed: 'failed' } as const;

export const testOutcomeOrder: TestOutcome[] = [testOutcomes.confirmed, testOutcomes.failed];

export const testResultLimits = { longestProof: 3800, longestFault: 190, mostResults: 50 } as const;

export const fixTitlePrefix = 'FIX: ';

/** One feature tried: the task it was built on, whether it worked, the proof, and for a failure what is wrong. */
export type TestResult = {
	taskId: string;
	outcome: TestOutcome;
	proof: string;
	fault: string | null;
};
