<script lang="ts">
	import FormField from '$lib/components/site/FormField.svelte';
	import FoundLinkChoices from './FoundLinkChoices.svelte';
	import FoundRoleList from './FoundRoleList.svelte';
	import SubmitButton from '$lib/components/site/SubmitButton.svelte';
	import { inputClasses } from '$lib/components/site/formStyles';
	import type { PersonFindings } from '$lib/server/people/research/personFindings';

	let { findings }: { findings: PersonFindings } = $props();

	const roles = $derived(findings.roles);
	const sources = $derived(findings.sources);
</script>

<form method="POST" action="?/saveFindings" class="flex flex-col gap-4">
	<input type="hidden" name="personId" value={findings.personId} />
	<p class="text-sm text-chalk/60">
		What the open web says about {findings.personName} in a business capacity, from
		{sources.length} page{sources.length === 1 ? '' : 's'}. Nothing is kept until you save.
	</p>
	<FormField label="Summary">
		<textarea name="summary" rows="5" value={findings.summary} class={inputClasses}></textarea>
	</FormField>
	{#if roles.length > 0}
		<FoundRoleList {roles} />
	{/if}
	<FoundLinkChoices links={findings.links} />
	<div class="flex flex-col gap-1 text-xs text-chalk/40">
		<p>Pages read</p>
		{#each sources as source (source.url)}
			<a href={source.url} target="_blank" rel="noreferrer" class="truncate hover:text-signal">{source.title}</a>
			<input type="hidden" name="sourceUrl" value={source.url} />
		{/each}
	</div>
	<SubmitButton>Save to the record</SubmitButton>
</form>
