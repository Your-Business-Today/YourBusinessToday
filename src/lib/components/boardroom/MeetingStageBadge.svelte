<script lang="ts">
	import Badge from '$lib/components/site/Badge.svelte';
	import { meetingStageBadges } from './meetingStageBadges';
	import type { MeetingStage } from '$lib/data/boardroomMeeting';

	let { stage }: { stage: MeetingStage } = $props();

	const badge = $derived(meetingStageBadges[stage]);
</script>

<Badge label={badge.label} tone={badge.tone} hasDot />
