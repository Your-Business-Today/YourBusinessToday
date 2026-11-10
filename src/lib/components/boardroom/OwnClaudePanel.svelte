<script lang="ts">
	import DashboardPanel from '$lib/components/workspace/DashboardPanel.svelte';
	import Badge from '$lib/components/site/Badge.svelte';
	import SeatSettingForm from './SeatSettingForm.svelte';
	import SteerNoteForm from './SteerNoteForm.svelte';
	import SteerNotesList from './SteerNotesList.svelte';
	import { seatSettings } from '$lib/data/boardroomSeatControls';
	import type { OwnClaudeView } from '$lib/data/boardSeatControlViews';

	let { ownClaude }: { ownClaude: OwnClaudeView } = $props();

	const pauseLabel = $derived(ownClaude.isPaused ? 'Let it go on' : 'Pause my Claude');
	const askFirstLabel = $derived(ownClaude.isAskingFirst ? 'Stop asking me first' : 'Ask me first');
</script>

<DashboardPanel title="Your Claude" isPadded>
	<div class="flex flex-col gap-4">
		<div class="flex flex-wrap gap-2">
			<Badge label={ownClaude.isPaused ? 'Paused' : 'Speaks in its turn'} tone={ownClaude.isPaused ? 'warning' : 'positive'} hasDot />
			{#if ownClaude.isAskingFirst}
				<Badge label="Asks you first" tone="progress" />
			{/if}
		</div>
		<p class="text-xs text-chalk-subtle">Only you see this panel, and only you steer or pause your own Claude.</p>
		{#if ownClaude.canChange}
			<div class="flex flex-wrap gap-2">
				<SeatSettingForm setting={seatSettings.paused} isOn={ownClaude.isPaused} label={pauseLabel} />
				<SeatSettingForm setting={seatSettings.askMeFirst} isOn={ownClaude.isAskingFirst} label={askFirstLabel} />
			</div>
			<SteerNoteForm />
		{/if}
		<SteerNotesList notes={ownClaude.steerNotes} />
	</div>
</DashboardPanel>
