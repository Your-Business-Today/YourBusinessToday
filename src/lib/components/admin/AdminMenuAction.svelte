<script lang="ts">
	import { enhance } from '$app/forms';
	import { FormTracker } from '$lib/client/formTracker.svelte';
	import type { SubmitFunction } from '@sveltejs/kit';

	let {
		action,
		fields,
		label,
		isDestructive = false,
		confirmMessage,
		onDone
	}: {
		action: string;
		fields: Record<string, string>;
		label: string;
		isDestructive?: boolean;
		confirmMessage?: string;
		onDone: () => void;
	} = $props();

	const tracker = new FormTracker();

	const confirmThenSubmit: SubmitFunction = (submitEvent) => {
		const isConfirmed = confirmMessage === undefined || confirm(confirmMessage);
		if (!isConfirmed) {
			submitEvent.cancel();
			onDone();
			return;
		}
		return tracker.submit(onDone)(submitEvent);
	};

	const toneClasses = $derived(
		isDestructive
			? 'text-signal/80 hover:bg-signal/10 hover:text-signal'
			: 'text-chalk/80 hover:bg-hairline/40 hover:text-chalk'
	);
</script>

<form method="POST" {action} use:enhance={confirmThenSubmit}>
	{#each Object.entries(fields) as [name, value] (name)}
		<input type="hidden" {name} {value} />
	{/each}
	<button
		type="submit"
		disabled={tracker.isSaving}
		class={`w-full rounded px-3 py-2 text-left font-display text-sm transition
			disabled:opacity-50 ${tracker.isSaving ? 'animate-pulse' : ''} ${toneClasses}`}
	>
		{tracker.isSaving ? 'Working…' : label}
	</button>
</form>
