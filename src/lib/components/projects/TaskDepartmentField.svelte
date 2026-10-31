<script lang="ts">
	import { fieldClasses } from '$lib/components/site/formStyles';
	import SmallCapsField from '$lib/components/site/SmallCapsField.svelte';
	import { departmentLabels, departmentOrder, type Department } from '$lib/data/department';

	let { department }: { department: Department } = $props();
</script>

<SmallCapsField label="Department">
	<select name="department" value={department} class={fieldClasses}>
		{#each departmentOrder as departmentOption (departmentOption)}
			<option value={departmentOption}>{departmentLabels[departmentOption]}</option>
		{/each}
	</select>
</SmallCapsField>
