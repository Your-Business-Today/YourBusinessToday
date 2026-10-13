<script lang="ts">
	import RaiseChangeModal from './RaiseChangeModal.svelte';
	import { headerPrimaryButtonClasses } from '$lib/components/workspace/workspaceStyles';
	import type { ChangeSubject } from '$lib/data/blueprint/changeSubject';
	import type { Goal } from '$lib/server/goals/goalRecord';

	let { subject, goals }: { subject: ChangeSubject; goals: Goal[] } = $props();

	let isOpen = $state(false);
</script>

<button type="button" onclick={() => (isOpen = true)} class={headerPrimaryButtonClasses}>Raise a change</button>
<RaiseChangeModal {subject} {goals} bind:isOpen />
