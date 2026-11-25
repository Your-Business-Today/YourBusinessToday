<script lang="ts">
	import { deletionLine } from '$lib/data/chatbotRecordKeepingWording';
	import { panelEmptyClasses, panelListClasses } from '$lib/components/workspace/workspaceStyles';
	import type { ChatbotRecordDeletion } from '$lib/data/chatbotRecordKeepingRules';

	let { deletions }: { deletions: ChatbotRecordDeletion[] } = $props();
</script>

<ul class={panelListClasses}>
	{#each deletions as deletion (deletion.questionId)}
		<li class="px-6 py-3 text-sm text-chalk-muted">{deletionLine(deletion)}</li>
	{:else}
		<li class={panelEmptyClasses}>Nothing has been deleted from this chatbot's record.</li>
	{/each}
</ul>
