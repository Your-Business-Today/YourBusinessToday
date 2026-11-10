<script lang="ts">
	let { onSave, onExport }: { onSave: () => void; onExport: () => void } = $props();

	const confirmationMilliseconds = 2400;
	let hasJustSaved = $state(false);

	function save() {
		onSave();
		hasJustSaved = true;
		setTimeout(() => (hasJustSaved = false), confirmationMilliseconds);
	}

	const buttonClasses = `inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-chalk/15
		px-3 text-sm whitespace-nowrap text-chalk transition hover:border-go hover:text-go`;
</script>

<div class="grid grid-cols-2 gap-3">
	<button type="button" onclick={save} class={buttonClasses}>
		<span aria-hidden="true">{hasJustSaved ? '✓' : '+'}</span>
		<span>{#if hasJustSaved}Saved{:else}Save<span class="hidden @sm:inline">{' comparison'}</span>{/if}</span>
	</button>
	<button type="button" onclick={onExport} class={buttonClasses}>
		<span aria-hidden="true">↓</span> Export
	</button>
</div>
<p class="sr-only" aria-live="polite">{hasJustSaved ? 'Saved to My comparisons' : ''}</p>
