<script lang="ts">
	import { fieldClasses } from '$lib/components/site/formStyles';
	import SmallCapsField from '$lib/components/site/SmallCapsField.svelte';
</script>

<SmallCapsField label="Details">
	<textarea
		name="details"
		rows="3"
		placeholder="Context, links, acceptance criteria (optional)"
		class={fieldClasses}
	></textarea>
</SmallCapsField>
