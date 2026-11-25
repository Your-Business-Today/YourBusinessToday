<script lang="ts">
	import type { PackChoice } from './packChoice';

	let { heading, fieldName, choices }: { heading: string; fieldName: string; choices: PackChoice[] } = $props();
</script>

<fieldset class="flex flex-col gap-2">
	<legend class="font-display text-base text-chalk">{heading}</legend>
	{#each choices as choice (choice.slug)}
		<label class="flex items-start gap-2 text-sm text-chalk/80">
			<input type="checkbox" name={fieldName} value={choice.slug} checked={choice.isTicked} />
			<span><span class="text-chalk">{choice.title}</span> <span class="text-chalk/50">— {choice.summary}</span></span>
		</label>
	{/each}
</fieldset>
