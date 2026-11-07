<script lang="ts">
	import type { ShownLine } from '$lib/promo/promoCaptionTiming';
	import { riseOf } from './captionRise';

	let { line, isBeneathMark }: { line: ShownLine; isBeneathMark: boolean } = $props();
</script>

<p
	class={[
		'col-start-1 row-start-1 font-display leading-[1.08] font-semibold tracking-[-0.02em] text-chalk',
		isBeneathMark ? 'text-[2.7cqw]' : 'text-[3.5cqw]'
	]}
	aria-hidden={line.presence === 0}
>
	{#each line.words as word, index (index)}
		<span class="inline-block whitespace-pre" style:opacity={word.presence} style:transform={riseOf(word.presence)}
			>{word.text}{' '}</span
		>
	{/each}
</p>
