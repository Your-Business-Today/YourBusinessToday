<script lang="ts">
	import Button from '$lib/components/site/Button.svelte';
	import FormField from '$lib/components/site/FormField.svelte';
	import { PeriodFieldNames } from '$lib/data/books/page/booksPeriodQuery';

	let { start, end }: { start: string; end: string } = $props();
</script>

<form method="GET" class="flex flex-wrap items-end gap-3">
	<FormField label="From"><input type="date" name={PeriodFieldNames.start} value={start} /></FormField>
	<FormField label="To"><input type="date" name={PeriodFieldNames.end} value={end} required /></FormField>
	<Button type="submit" look="primary">Show</Button>
</form>
