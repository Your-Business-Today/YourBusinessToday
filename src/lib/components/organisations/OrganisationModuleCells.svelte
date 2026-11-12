<script lang="ts">
	import { enhance } from '$app/forms';
	import Badge from '$lib/components/site/Badge.svelte';
	import Button from '$lib/components/site/Button.svelte';
	import RecordsCell from '$lib/components/workspace/RecordsCell.svelte';
	import { FormTracker } from '$lib/client/formTracker.svelte';
	import { organisationModuleLabels, type OrganisationModule } from '$lib/data/organisationModules';

	let {
		module,
		isOn,
		canSwitch
	}: { module: OrganisationModule; isOn: boolean; canSwitch: boolean } = $props();

	const tracker = new FormTracker();
	const switchLabel = $derived(isOn ? 'Switch off' : 'Switch on');
	const stateLabel = $derived(isOn ? 'On' : 'Off');
	const stateTone = $derived(isOn ? 'positive' : 'neutral');
	const isOnAfterSwitch = $derived(String(!isOn));
</script>

<RecordsCell kind="link">{organisationModuleLabels[module]}</RecordsCell>
<RecordsCell kind="status" label="Status"><Badge label={stateLabel} tone={stateTone} /></RecordsCell>
{#if canSwitch}
	<RecordsCell kind="actions">
		<form method="POST" action="?/setModule" use:enhance={tracker.submit()} class="inline-flex">
			<input type="hidden" name="module" value={module} />
			<input type="hidden" name="isOn" value={isOnAfterSwitch} />
			<Button type="submit" isSaving={tracker.isSaving}>{switchLabel}</Button>
		</form>
	</RecordsCell>
{/if}
