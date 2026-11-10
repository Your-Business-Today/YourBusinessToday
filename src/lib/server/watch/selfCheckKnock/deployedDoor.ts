import { failedVerdict, passedVerdict, type KnockVerdict } from './knockVerdict';
import { minutesBeforeGivingUp, pauseBetweenLooks, type Waiting } from './waiting';

export type DoorAnswer = { status: number; commit: string | null; body: string };
export type DoorKnocker = () => Promise<DoorAnswer>;

const passedStatus = 200;

/** Knocks until the deployment built from the commit answers, and reads that answer as the self-check's verdict. */
export async function knockUntilDeployed(commit: string, knockDoor: DoorKnocker, waiting: Waiting): Promise<KnockVerdict> {
	let answer = await knockDoor();
	while (answer.commit !== commit) {
		const hasGivenUp = waiting.hasRunOutOfTime();
		if (hasGivenUp) return stillServingVerdict(commit, answer);
		waiting.say(`${describeAnswerer(answer)} answered ${answer.status}, not ${commit} yet: knocking again shortly.`);
		await waiting.clock.pause(pauseBetweenLooks);
		answer = await knockDoor();
	}
	waiting.say(answer.body);
	return verdictOfDeployedAnswer(commit, answer);
}

function verdictOfDeployedAnswer(commit: string, answer: DoorAnswer): KnockVerdict {
	if (answer.status === passedStatus) return passedVerdict(`The site answered from ${commit}, the commit this deploy was for, and its self-check passed.`);
	return failedVerdict(`The connector self-check of ${commit} answered ${answer.status}. The answer above says what failed; the site's logs have the cause.`);
}

function describeAnswerer(answer: DoorAnswer): string {
	if (answer.commit === null) return 'A deployment that names no commit';
	return `The deployment of ${answer.commit}`;
}

function stillServingVerdict(commit: string, answer: DoorAnswer): KnockVerdict {
	const answerer = describeAnswerer(answer).toLowerCase();
	return failedVerdict(`Gave up after ${minutesBeforeGivingUp} minutes: the site was still served by ${answerer}, not ${commit}, so the self-check of this deploy never ran.`);
}
