<script lang="ts">
	import FormField from '$lib/components/site/FormField.svelte';
	import { detailKinds } from '$lib/data/organisationDetailField';
	import type { DetailField } from '$lib/data/organisationDetailGroups';

	let { field, value }: { field: DetailField; value: string } = $props();

	const isOverSeveralLines = $derived(field.kind === detailKinds.lines);
	const isEmail = $derived(field.kind === detailKinds.email);
</script>

<FormField label={field.label} class={isOverSeveralLines ? 'sm:col-span-2' : ''}>
	{#if isOverSeveralLines}
		<textarea name={field.key} rows="3" {value} title={field.meaning} maxlength={field.longest}></textarea>
	{:else}
		<input name={field.key} type={isEmail ? 'email' : 'text'} {value} title={field.meaning} maxlength={field.longest} />
	{/if}
</FormField>
