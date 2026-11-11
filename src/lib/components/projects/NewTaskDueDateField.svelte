<script lang="ts">
	import { fieldClasses } from '$lib/components/site/formStyles';
	import SmallCapsField from '$lib/components/site/SmallCapsField.svelte';
</script>

<SmallCapsField label="Due date">
	<input name="dueDate" type="date" class={fieldClasses} />
</SmallCapsField>
