<script lang="ts">
	import Badge from '$lib/components/site/Badge.svelte';
	import RecordsCell from '$lib/components/workspace/RecordsCell.svelte';
	import { chatRoomPath } from '$lib/data/chat/chatPaths';
	import { decisionAnchor } from '$lib/data/chat/chatDecisionWords';
	import { decisionStatusBadges } from './chatPageWords';
	import type { ListedChatDecision } from '$lib/data/chat/chatDecisionRules';

	let { organisationId, decision }: { organisationId: string; decision: ListedChatDecision } = $props();

	const roomPath = $derived(chatRoomPath(organisationId, decision.roomId));
	const badge = $derived(decisionStatusBadges[decision.status]);
</script>

<RecordsCell kind="link" href={`${roomPath}#${decisionAnchor(decision.id)}`}>{decision.wording}</RecordsCell>
<RecordsCell label="Room" href={roomPath}>{decision.roomName}</RecordsCell>
<RecordsCell label="Waiting on">{decision.waitingOnName}</RecordsCell>
<RecordsCell label="Raised by">{decision.raiserName}</RecordsCell>
<RecordsCell kind="status" label="Status">
	<Badge label={badge.label} tone={badge.tone} />
</RecordsCell>
<RecordsCell label="Outcome">{decision.outcome ?? ''}</RecordsCell>
