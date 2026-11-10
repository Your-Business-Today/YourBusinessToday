<script lang="ts">
	import { enhance } from '$app/forms';
	import Button from '$lib/components/site/Button.svelte';
	import { FormTracker } from '$lib/client/formTracker.svelte';
	import { seatControlFields } from '$lib/data/boardSeatControlForm';
	import type { SeatSetting } from '$lib/data/boardroomSeatControls';

	let { setting, isOn, label }: { setting: SeatSetting; isOn: boolean; label: string } = $props();

	const tracker = new FormTracker();
	const turnsOn = $derived(String(!isOn));
</script>

<form method="POST" action="?/changeSetting" use:enhance={tracker.submit()} class="flex flex-col gap-1">
	<input type="hidden" name={seatControlFields.setting} value={setting} />
	<input type="hidden" name={seatControlFields.isOn} value={turnsOn} />
	<Button type="submit" isSaving={tracker.isSaving}>{label}</Button>
	{#if tracker.errorMessage !== null}
		<p class="text-sm font-medium text-signal">{tracker.errorMessage}</p>
	{/if}
</form>
