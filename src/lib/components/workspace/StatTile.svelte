<script lang="ts">
	let {
		label,
		value,
		caption = '',
		tone = 'plain'
	}: { label: string; value: string; caption?: string; tone?: 'plain' | 'go' | 'attention' } =
		$props();

	const valueTones = { plain: 'text-chalk', go: 'text-go', attention: 'text-signal' };
</script>

<div class="flex min-w-0 flex-col gap-0.5 rounded-xl border border-hairline bg-carriage px-3 py-2 sm:px-4 sm:py-3">
	<span class="truncate font-display text-[0.7rem] tracking-widest text-chalk/50 uppercase">
		{label}
	</span>
	<span class={`font-display text-lg font-medium tabular-nums sm:text-xl ${valueTones[tone]}`}>{value}</span>
	{#if caption !== ''}
		<span class="truncate text-xs text-chalk/50">{caption}</span>
	{/if}
</div>
