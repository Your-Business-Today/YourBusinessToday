import { claimLeaseMinutes } from '$lib/data/lifecycleClaim';

/** Rule 10 of the working doctrine: the lifecycle every AI records, so several can share a board. */
export const lifecycleDoctrine = [
	'10. Every AI records its steps on the lifecycle, so several can work one board without doing',
	'    the same work twice. Before touching a goal or task, record it considering with',
	'    record_lifecycle_step: that claims it for you, and if it is refused another AI holds it, so',
	'    leave it. Name yourself alone as the agent, with your session or machine. Record each step',
	'    after it: considered with its outcome (buildable, waiting on a person, needs splitting, needs',
	'    an infrastructure change), building, built, reviewing, pull request open; released gives',
	`    the work up. A claim runs out ${claimLeaseMinutes} minutes after your last step. Considering a goal ends`,
	'    with a step on every open task under it, even one that only says what it still waits for.',
	'    Size a coding task with record_complexity, as the kit’s task-sizing skill says; the model it',
	'    needs follows from its points (read_model_settings). Running on a schedule, take work only',
	'    through next_buildable_task for your model, which gives buildable, autocomplete work in',
	'    queue order and claims it, never by picking from the queue yourself. The local model hands',
	'    a pushed branch to review with submit_local_build and never opens a pull request; the',
	'    review model reviews it as the kit’s review-local-build skill says. One task is still one',
	'    session’s work and one pull request.'
];
