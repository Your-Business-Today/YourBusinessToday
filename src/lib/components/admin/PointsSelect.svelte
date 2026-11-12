<script lang="ts">
	import InlineField from '$lib/components/site/InlineField.svelte';
	import { fibonacciStoryPoints } from '$lib/data/storyPoints';

	let { name, label, value }: { name: string; label: string; value: number } = $props();
</script>

<InlineField {label}>
	<select
		{name}
		{value}
		class="rounded-full border border-hairline bg-night px-3 py-1.5 text-sm text-chalk outline-none
			focus:border-go"
	>
		{#each fibonacciStoryPoints as points (points)}
			<option value={points}>{points}</option>
		{/each}
	</select>
</InlineField>
