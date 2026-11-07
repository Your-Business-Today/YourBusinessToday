<script lang="ts">
	import { clampToUnit } from '$lib/promo/promoMotion';
	import { promoChapters, type PromoChapter } from '$lib/promo/promoTimeline';

	let { seconds, onseek }: { seconds: number; onseek: (seconds: number) => void } = $props();

	function filledShare(chapter: PromoChapter): string {
		const played = clampToUnit((seconds - chapter.startSeconds) / (chapter.endSeconds - chapter.startSeconds));
		return `${played * 100}%`;
	}
</script>

<div class="flex min-w-0 flex-1 gap-1">
	{#each promoChapters as chapter (chapter.id)}
		<button
			type="button"
			class="group/chapter relative h-8 min-w-0 cursor-pointer"
			style:flex-grow={chapter.bars}
			onclick={() => onseek(chapter.startSeconds)}
			aria-label={`Jump to ${chapter.title}`}
		>
			<span class="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 overflow-hidden rounded-full bg-chalk/20">
				<span class="block h-full bg-signal" style:width={filledShare(chapter)}></span>
			</span>
			<span
				class="pointer-events-none absolute bottom-full left-0 mb-1 rounded-md bg-night/90 px-2 py-1 text-xs whitespace-nowrap text-chalk opacity-0 transition group-hover/chapter:opacity-100"
			>
				{chapter.title}
			</span>
		</button>
	{/each}
</div>
