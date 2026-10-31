<script lang="ts">
	import { taskPagePath, taskSheet, type TaskReference } from '$lib/client/taskSheet.svelte';
	import type { Snippet } from 'svelte';
	import type { HTMLAnchorAttributes } from 'svelte/elements';

	let {
		reference,
		children,
		...attributes
	}: { reference: TaskReference; children: Snippet } & Omit<HTMLAnchorAttributes, 'href'> = $props();
</script>

<a
	{...attributes}
	href={taskPagePath(reference)}
	onclick={(event) => taskSheet.openReferenceOnPlainClick(event, reference)}
>
	{@render children()}
</a>
