/** What one run of a screen is given: the companies in order, where the screen got to, and how to read and record each one. */
export type ScreenTurn = {
	companyNumbers: string[];
	resumeAfter: string;
	companiesDone: number;
	/** Answers false when the company could not be finished in this turn, so it is left whole for the next one. */
	screenOne: (companyNumber: string) => Promise<boolean>;
	markDone: (companyNumber: string, companiesDone: number) => Promise<void>;
	isOutOfTime: () => boolean;
};

export type TurnResult = { lastDone: string; screenedThisRun: number; isFinished: boolean };

/** Works through the companies after the one the screen last finished, recording each, until they run out, the time does, or one cannot be finished. */
export async function screenInTurn(turn: ScreenTurn): Promise<TurnResult> {
	const waiting = turn.companyNumbers.filter((companyNumber) => companyNumber > turn.resumeAfter);
	let lastDone = turn.resumeAfter;
	let screenedThisRun = 0;
	for (const companyNumber of waiting) {
		if (turn.isOutOfTime()) return { lastDone, screenedThisRun, isFinished: false };
		const wasScreened = await turn.screenOne(companyNumber);
		if (!wasScreened) return { lastDone, screenedThisRun, isFinished: false };
		screenedThisRun += 1;
		lastDone = companyNumber;
		await turn.markDone(companyNumber, turn.companiesDone + screenedThisRun);
	}
	return { lastDone, screenedThisRun, isFinished: true };
}
