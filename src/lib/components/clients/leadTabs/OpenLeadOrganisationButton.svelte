<script lang="ts">
	import { enhance } from '$app/forms';
	import { quietButtonClasses } from '$lib/components/site/formStyles';

	let { action }: { action: string } = $props();
</script>

<form method="POST" {action} use:enhance>
	<button type="submit" class={quietButtonClasses}>Open its organisation</button>
</form>
