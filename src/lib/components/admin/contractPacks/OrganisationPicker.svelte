<script lang="ts">
	import Button from '$lib/components/site/Button.svelte';
	import FormField from '$lib/components/site/FormField.svelte';

	type Choice = { id: string; name: string };

	let { organisations, pickedId }: { organisations: Choice[]; pickedId: string | null } = $props();
</script>

<form method="get" class="flex flex-wrap items-end gap-3">
	<FormField label="Client organisation">
		<select name="organisationId" required value={pickedId ?? ''}>
			<option value="" disabled>Choose the client</option>
			{#each organisations as organisation (organisation.id)}
				<option value={organisation.id}>{organisation.name}</option>
			{/each}
		</select>
	</FormField>
	<Button type="submit">Open its pack</Button>
</form>
