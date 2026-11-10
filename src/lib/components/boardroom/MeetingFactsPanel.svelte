<script lang="ts">
	import DashboardPanel from '$lib/components/workspace/DashboardPanel.svelte';
	import type { BoardMeetingView } from '$lib/data/boardMeetingView';

	let { meeting }: { meeting: BoardMeetingView } = $props();

	const facts = $derived([
		{ label: 'Meets (UK time)', value: meeting.when },
		{ label: 'Chair', value: meeting.chairName },
		{ label: 'Called by', value: `${meeting.calledByName} on ${meeting.calledWhen}` },
		{ label: 'Directors on it', value: meeting.directorNames.join(', ') }
	]);
</script>

<DashboardPanel title="The meeting" isPadded>
	<dl class="flex flex-col gap-3 text-sm">
		{#each facts as fact (fact.label)}
			<div class="flex flex-col gap-0.5">
				<dt class="text-chalk-subtle">{fact.label}</dt>
				<dd class="break-words text-chalk">{fact.value}</dd>
			</div>
		{/each}
	</dl>
</DashboardPanel>
