<script lang="ts">
	import { enhance } from '$app/forms';
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
</script>

<li class="flex items-center gap-3 px-4 py-2">
	<span class="min-w-0 flex-1 truncate font-display text-sm">{organisationModuleLabels[module]}</span>
	<span class={`shrink-0 rounded-full px-2 py-0.5 text-[0.7rem] ${isOn ? 'bg-go/15 text-go' : 'bg-chalk/10 text-chalk/50'}`}>
		{stateLabel}
	</span>
	{#if canSwitch}
		<form method="POST" action="?/setModule" use:enhance={tracker.submit()}>
			<input type="hidden" name="module" value={module} />
			<input type="hidden" name="isOn" value={isOn ? 'false' : 'true'} />
			<button
				type="submit"
				disabled={tracker.isSaving}
				class="shrink-0 rounded-full border border-hairline px-2.5 py-0.5 font-display text-xs text-chalk/60 transition hover:border-go hover:text-go disabled:opacity-60"
			>
				{switchLabel}
			</button>
		</form>
	{/if}
</li>
