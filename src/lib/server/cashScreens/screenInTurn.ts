/** What one run of a screen is given: the companies in order, where the screen got to, and how to read and record each one. */
export type ScreenTurn = {
	companyNumbers: string[];
	resumeAfter: string;
	companiesDone: number;
	screenOne: (companyNumber: string) => Promise<void>;
	markDone: (companyNumber: string, companiesDone: number) => Promise<void>;
	isOutOfTime: () => boolean;
};

export type TurnResult = { lastDone: string; screenedThisRun: number; isFinished: boolean };

/** Works through the companies after the one the screen last finished, recording each, until they run out or the time does. */
export async function screenInTurn(turn: ScreenTurn): Promise<TurnResult> {
	const waiting = turn.companyNumbers.filter((companyNumber) => companyNumber > turn.resumeAfter);
	let lastDone = turn.resumeAfter;
	let screenedThisRun = 0;
	for (const companyNumber of waiting) {
		if (turn.isOutOfTime()) return { lastDone, screenedThisRun, isFinished: false };
		await turn.screenOne(companyNumber);
		screenedThisRun += 1;
		lastDone = companyNumber;
		await turn.markDone(companyNumber, turn.companiesDone + screenedThisRun);
	}
	return { lastDone, screenedThisRun, isFinished: true };
}
