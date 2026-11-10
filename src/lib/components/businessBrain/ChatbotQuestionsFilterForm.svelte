<script lang="ts">
	import Button from '$lib/components/site/Button.svelte';
	import FormField from '$lib/components/site/FormField.svelte';
	import { businessBrainChatbotLimits } from '$lib/data/businessBrainChatbotRules';
	import { chatbotTrailFieldNames, type AskedChatbotTrail } from '$lib/data/businessBrainChatbotTrailQuery';

	let {
		asked,
		people,
		clearHref,
		downloadHref
	}: { asked: AskedChatbotTrail; people: string[]; clearHref: string; downloadHref: string } = $props();

	const peopleListId = 'chatbot-trail-people';
	const { longestEmail } = businessBrainChatbotLimits;
	const latestFromDay = $derived(asked.toDay === '' ? undefined : asked.toDay);
	const earliestToDay = $derived(asked.fromDay === '' ? undefined : asked.fromDay);
</script>

<form method="GET" class="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
	<FormField label="Person" class="sm:min-w-64 sm:flex-1">
		<input
			type="email"
			name={chatbotTrailFieldNames.person}
			value={asked.person}
			maxlength={longestEmail}
			list={peopleListId}
			placeholder="Everyone"
		/>
	</FormField>
	<datalist id={peopleListId}>
		{#each people as person (person)}
			<option value={person}></option>
		{/each}
	</datalist>
	<FormField label="From">
		<input type="date" name={chatbotTrailFieldNames.fromDay} value={asked.fromDay} max={latestFromDay} />
	</FormField>
	<FormField label="To">
		<input type="date" name={chatbotTrailFieldNames.toDay} value={asked.toDay} min={earliestToDay} />
	</FormField>
	<div class="flex flex-wrap gap-2">
		<Button type="submit" look="primary">Search</Button>
		<Button href={clearHref}>Clear</Button>
		<span class="contents" data-sveltekit-reload><Button href={downloadHref}>Download CSV</Button></span>
	</div>
</form>
