<script lang="ts">
	import Button from '$lib/components/site/Button.svelte';

	let { closedInWords, lastClosableMonth, message }: { closedInWords: string; lastClosableMonth: string; message: string } = $props();

	const wordClasses = 'text-xs text-chalk-subtle';
	const monthClasses =
		'h-11 min-w-0 flex-1 rounded border border-hairline-strong bg-carriage-raised px-3 text-sm text-chalk outline-none focus:border-go md:h-8 md:flex-none';
</script>

<form method="POST" action="?/closeMonth" class="flex w-full flex-wrap items-center gap-2 md:w-auto">
	<span class={wordClasses}>{closedInWords}</span>
	<input type="month" name="month" max={lastClosableMonth} value={lastClosableMonth} required aria-label="Last month to close" class={monthClasses} />
	<Button type="submit">Close the books</Button>
	{#if message !== ''}
		<span role="status" class={wordClasses}>{message}</span>
	{/if}
</form>
