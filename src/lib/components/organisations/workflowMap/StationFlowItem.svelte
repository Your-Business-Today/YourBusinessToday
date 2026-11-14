<script lang="ts">
	let {
		item,
		note,
		goesWrong = null,
		isNotWord = false
	}: { item: string; note: string | null; goesWrong?: string | null; isNotWord?: boolean } = $props();

	const goesWrongLead = 'Goes wrong today.';
	const notWordMark = 'Not in the glossary';
</script>

<li class="flex flex-col gap-0.5">
	<span class="text-chalk">{item}</span>
	{#if isNotWord}
		<span class="text-xs text-signal">{notWordMark}</span>
	{/if}
	{#if note !== null}
		<span class="text-sm text-chalk-faint">{note}</span>
	{/if}
	{#if goesWrong !== null}
		<span class="text-sm text-chalk-faint"><b class="font-semibold text-signal">{goesWrongLead}</b> {goesWrong}</span>
	{/if}
</li>
