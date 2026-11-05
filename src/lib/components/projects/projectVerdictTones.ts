import type { ProjectVerdict } from '$lib/data/projectVerdict';

/** The colour each verdict is shown in: a bug in the alarm colour, a wait in caution, a stall quiet, on track in go. */
export const projectVerdictTones: Record<ProjectVerdict, string> = {
	bugsOpen: 'border-signal text-signal',
	waitingOnPeople: 'border-caution text-caution',
	stalled: 'border-chalk/40 text-chalk/70',
	onTrack: 'border-go text-go'
};
