<script lang="ts">
	import Button from '$lib/components/site/Button.svelte';
	import { chosenFileStates, type ChosenFile } from './chatAttachments.svelte';

	let { chosen, onTakeOff }: { chosen: ChosenFile[]; onTakeOff: (key: number) => void } = $props();

	const stateLabels = {
		[chosenFileStates.sending]: 'Sending…',
		[chosenFileStates.arrived]: 'Ready to send',
		[chosenFileStates.refused]: 'Not sent'
	};

	const stateClasses = {
		[chosenFileStates.sending]: 'text-chalk-subtle',
		[chosenFileStates.arrived]: 'text-go',
		[chosenFileStates.refused]: 'text-caution'
	};
</script>

{#if chosen.length > 0}
	<ul class="flex flex-col gap-1" aria-label="Files chosen for this message" aria-live="polite">
		{#each chosen as file (file.key)}
			<li class="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
				<span class="min-w-0 truncate font-display text-chalk">{file.fileName}</span>
				<span class={stateClasses[file.state]}>{stateLabels[file.state]}</span>
				<Button onclick={() => onTakeOff(file.key)} label={`Take ${file.fileName} off`}>Take off</Button>
				{#if file.problem !== null}
					<p class="basis-full text-caution">{file.problem}</p>
				{/if}
			</li>
		{/each}
	</ul>
{/if}
