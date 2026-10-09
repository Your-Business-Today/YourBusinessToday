<script lang="ts">
	import { panelButtonClasses } from '$lib/components/workspace/workspaceStyles';

	let { text, label }: { text: string; label: string } = $props();

	let hasCopied = $state(false);

	const copiedShownFor = 1500;

	async function copy(): Promise<void> {
		await navigator.clipboard.writeText(text);
		hasCopied = true;
		setTimeout(() => (hasCopied = false), copiedShownFor);
	}
</script>

<button type="button" onclick={copy} class={`shrink-0 ${panelButtonClasses}`}>
	{hasCopied ? 'Copied' : label}
</button>
