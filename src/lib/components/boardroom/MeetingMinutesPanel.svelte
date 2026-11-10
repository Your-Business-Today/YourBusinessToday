<script lang="ts">
	import DashboardPanel from '$lib/components/workspace/DashboardPanel.svelte';
	import Badge from '$lib/components/site/Badge.svelte';
	import CopyTextButton from '$lib/components/site/CopyTextButton.svelte';
	import MinutesAnswerForm from './MinutesAnswerForm.svelte';
	import MinutesVersionEntry from './MinutesVersionEntry.svelte';
	import { approvedBadge, awaitingApprovalBadge } from './minutesBadges';
	import { panelListClasses } from '$lib/components/workspace/workspaceStyles';
	import type { MeetingMinutesView } from '$lib/data/boardMinutesViews';

	let { minutes }: { minutes: MeetingMinutesView } = $props();

	const badge = $derived(minutes.isApproved ? approvedBadge : awaitingApprovalBadge);
	const versions = $derived(minutes.versions);
</script>

<DashboardPanel title="Minutes" count={versions.length}>
	<div class="flex flex-col gap-3 px-4 py-3">
		<div class="flex flex-wrap items-center gap-2">
			{#if minutes.latestVersion !== null}
				<Badge label={badge.label} tone={badge.tone} />
			{/if}
			<p class="text-sm break-words text-chalk-muted">{minutes.standingWords}</p>
		</div>
		{#if minutes.prompt !== null}
			<p class="text-sm text-chalk-muted">
				You write these minutes. Paste this into your own Claude: it reads the room's record and keeps its words as the next version.
			</p>
			<p class="font-mono text-sm break-words whitespace-pre-wrap text-chalk">{minutes.prompt}</p>
			<div><CopyTextButton text={minutes.prompt} label="Copy" /></div>
		{/if}
		{#if minutes.canAnswer && minutes.latestVersion !== null}
			<MinutesAnswerForm version={minutes.latestVersion} />
		{/if}
	</div>
	<ol class={panelListClasses}>
		{#each versions as version, index (version.number)}
			<MinutesVersionEntry {version} isLatest={index === 0} />
		{/each}
	</ol>
</DashboardPanel>
