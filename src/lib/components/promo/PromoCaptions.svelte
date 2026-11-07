<script lang="ts">
	import { captionsAt } from '$lib/promo/promoCaptionTiming';
	import PromoCaptionHeadline from './PromoCaptionHeadline.svelte';
	import { riseOf } from './captionRise';

	let { seconds }: { seconds: number } = $props();

	const captions = $derived(captionsAt(seconds));
</script>

{#each captions as caption (caption.chapterId)}
	<div
		class={[
			'pointer-events-none absolute flex flex-col gap-[1cqw] [text-shadow:0_0.15cqw_1.2cqw_rgb(0_0_0/0.65)]',
			caption.isBeneathMark
				? 'inset-x-[6cqw] top-[64%] items-center text-center'
				: 'bottom-[6cqw] left-[6cqw] max-w-[62cqw]'
		]}
	>
		{#if caption.kicker}
			<p
				class="flex items-center gap-[0.8cqw] font-display text-[1.1cqw] font-medium tracking-[0.22em] text-chalk/70 uppercase"
				style:opacity={caption.presence}
			>
				<span class="h-[0.55cqw] w-[0.55cqw] rounded-full bg-signal"></span>
				{caption.kicker}
			</p>
		{/if}
		<div class="grid">
			{#each caption.headlines as line (line.text)}
				<PromoCaptionHeadline {line} isBeneathMark={caption.isBeneathMark} />
			{/each}
		</div>
		{#each caption.asides as line (line.text)}
			<p class="text-[1.55cqw] text-chalk/75" style:opacity={line.presence} style:transform={riseOf(line.presence)}>
				{line.text}
			</p>
		{/each}
	</div>
{/each}
