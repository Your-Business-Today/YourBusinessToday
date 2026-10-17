<script lang="ts">
	let {
		href,
		title,
		kindLabel,
		isAutocomplete
	}: { href: string; title: string; kindLabel: string; isAutocomplete: boolean } = $props();

	const stateClasses = $derived(isAutocomplete ? 'border-go/50 text-go' : 'border-hairline text-chalk/60');
</script>

<li class="flex items-center gap-3 px-4 py-2.5 text-sm">
	<span class="w-28 shrink-0 font-display text-xs text-chalk/50">{kindLabel}</span>
	<a {href} class="min-w-0 flex-1 truncate font-display hover:text-go">{title}</a>
	<span class={`shrink-0 rounded-full border px-2 py-0.5 font-display text-xs ${stateClasses}`}>
		{isAutocomplete ? 'On' : 'Off'}
	</span>
</li>
