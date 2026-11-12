<script lang="ts">
	import Button from '$lib/components/site/Button.svelte';
	import { PeriodFieldNames } from '$lib/data/books/page/booksPeriodQuery';

	let { start, end }: { start: string; end: string } = $props();

	const wordClasses = 'text-xs text-chalk-subtle';
	const dayClasses =
		'h-11 min-w-0 flex-1 rounded border border-hairline-strong bg-carriage-raised px-3 text-sm text-chalk outline-none focus:border-go md:h-8 md:flex-none';
</script>

<form method="GET" class="flex w-full items-center gap-2 md:w-auto">
	<span class={`hidden md:inline ${wordClasses}`}>From</span>
	<input type="date" name={PeriodFieldNames.start} value={start} aria-label="First day" class={dayClasses} />
	<span class={wordClasses}>to</span>
	<input type="date" name={PeriodFieldNames.end} value={end} aria-label="Last day" required class={dayClasses} />
	<Button type="submit">Show</Button>
</form>
