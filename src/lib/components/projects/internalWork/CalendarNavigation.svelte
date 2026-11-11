<script lang="ts">
	import Button from '$lib/components/site/Button.svelte';

	let {
		title,
		stepName,
		onPrevious,
		onToday,
		onNext
	}: { title: string; stepName: string; onPrevious: () => void; onToday: () => void; onNext: () => void } = $props();
</script>

<div class="flex flex-wrap items-center justify-between gap-2 px-4 py-3 md:px-6">
	<h3 class="font-display text-base font-semibold text-chalk">{title}</h3>
	<div class="flex items-center gap-1">
		<Button label={`Previous ${stepName}`} isIconOnly onclick={onPrevious}>‹</Button>
		<Button onclick={onToday}>Today</Button>
		<Button label={`Next ${stepName}`} isIconOnly onclick={onNext}>›</Button>
	</div>
</div>
