/** The form fields the Billing tab posts: the schedule's settings and lines as one, and which schedule a change is to. */
export const billingFormFields = { schedule: 'schedule', scheduleId: 'scheduleId', isPaused: 'isPaused' } as const;

/** How the Pause and Resume items post whether the schedule is to be paused. */
export const pauseStates = { pause: 'true', resume: 'false' } as const;

const unreadableSchedule = 'The form sent no schedule to save; reload the page and try again.';

/** The settings and lines the form posted, as the schedule actions take them, or why they could not be read. */
export function readPostedSchedule(posted: FormDataEntryValue | null): Record<string, unknown> | string {
	if (typeof posted !== 'string') return unreadableSchedule;
	try {
		const fields: unknown = JSON.parse(posted);
		const isFieldsObject = typeof fields === 'object' && fields !== null && !Array.isArray(fields);
		return isFieldsObject ? (fields as Record<string, unknown>) : unreadableSchedule;
	} catch {
		return unreadableSchedule;
	}
}

/** Whether the posted pause state asks to pause, or why it is neither pause nor resume. */
export function readPostedPause(posted: FormDataEntryValue | null): boolean | string {
	if (posted === pauseStates.pause) return true;
	if (posted === pauseStates.resume) return false;
	return 'isPaused must be true or false.';
}
