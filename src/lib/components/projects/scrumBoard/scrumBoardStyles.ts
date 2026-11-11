import type { BadgeTone } from '$lib/components/site/badgeTones';
import type { BuildStage } from '$lib/data/buildStage';
import type { WorkKind } from '$lib/data/scrumBoard';

export const buildStageTones: Record<BuildStage, BadgeTone> = {
	backlog: 'notStarted',
	ready: 'neutral',
	building: 'progress',
	inReview: 'warning',
	staged: 'progress',
	live: 'positive'
};

export const workKindClasses: Record<WorkKind, string> = {
	bug: 'border-signal/50 text-signal',
	feature: 'border-go/40 text-go',
	infrastructure: 'border-daylight/40 text-daylight'
};

export const cardChipClasses = 'whitespace-nowrap rounded-full border px-2 py-0.5 font-display text-xs';
