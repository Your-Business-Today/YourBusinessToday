<script lang="ts">
	let { item, note, goesWrong = null }: { item: string; note: string | null; goesWrong?: string | null } = $props();

	const goesWrongLead = 'Goes wrong today.';
</script>

<li class="flex flex-col gap-0.5">
	<span class="text-chalk">{item}</span>
	{#if note !== null}
		<span class="text-sm text-chalk-faint">{note}</span>
	{/if}
	{#if goesWrong !== null}
		<span class="text-sm text-chalk-faint"><b class="font-semibold text-signal">{goesWrongLead}</b> {goesWrong}</span>
	{/if}
</li>
