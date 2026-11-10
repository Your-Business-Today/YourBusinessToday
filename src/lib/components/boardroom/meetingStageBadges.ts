import type { BadgeTone } from '$lib/components/site/badgeTones';
import type { MeetingStage } from '$lib/data/boardroomMeeting';

/** How each stage of a meeting reads on a badge. */
export const meetingStageBadges: Record<MeetingStage, { label: string; tone: BadgeTone }> = {
	called: { label: 'Called', tone: 'progress' },
	open: { label: 'Open', tone: 'positive' },
	closed: { label: 'Closed', tone: 'neutral' }
};
