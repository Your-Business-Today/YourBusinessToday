import { chatDecisionStatuses, type ChatDecisionStatus } from '$lib/data/chat/chatDecisionRules';
import { decisionsTitle } from '$lib/data/chat/chatDecisionWords';
import type { BadgeTone } from '$lib/components/site/badgeTones';
import type { Tab } from '$lib/components/workspace/TabStrip.svelte';

export const chatTitle = 'Chat';

export const noParentRoom = '';

export const noParentRoomLabel = 'None: it sits under no other room';

export const chatRoomViewGridClasses = 'grid grid-cols-1 items-start gap-4 lg:grid-cols-[18rem_minmax(0,1fr)]';

export const subroomIndent = '   ↳ ';

export const roomsTab = 'rooms';

export const decisionsTab = 'decisions';

/** The tabs of chat home: the rooms, and the decisions raised across them with how many are open. */
export function chatHomeTabs(roomCount: number, openDecisionCount: number): Tab[] {
	return [
		{ key: roomsTab, label: 'Rooms', count: roomCount },
		{ key: decisionsTab, label: decisionsTitle, count: openDecisionCount, countTone: 'warning' }
	];
}

/** How each status of a decision shows on its Badge. */
export const decisionStatusBadges: Record<ChatDecisionStatus, { label: string; tone: BadgeTone }> = {
	[chatDecisionStatuses.open]: { label: 'Open', tone: 'warning' },
	[chatDecisionStatuses.closed]: { label: 'Closed', tone: 'positive' }
};
