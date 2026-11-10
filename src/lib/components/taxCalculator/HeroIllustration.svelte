<script lang="ts">
	const barHeights = [26, 40, 34, 58, 82];
	const barWidth = 18;
	const barGap = 8;
	const chartBottom = 172;
	const chartLeft = 84;
</script>

<figure class="mx-auto flex w-full max-w-72 flex-col items-center gap-3 sm:max-w-80" aria-hidden="true">
	<svg viewBox="0 0 280 240" class="w-full">
		<circle cx="140" cy="120" r="112" class="fill-none stroke-hairline" />
		<circle cx="140" cy="120" r="84" class="fill-none stroke-hairline/70" />
		<g transform="rotate(-8 140 120)">
			<rect x="62" y="44" width="156" height="150" rx="22" class="fill-carriage stroke-signal/30" />
			<text x="84" y="76" class="fill-chalk/60 font-mono text-[9px] tracking-[0.2em]">A LITTLE CLARITY</text>
			{#each barHeights as barHeight, barIndex (barIndex)}
				<rect
					x={chartLeft + barIndex * (barWidth + barGap)}
					y={chartBottom - barHeight}
					width={barWidth}
					height={barHeight}
					rx="4"
					class={barIndex === barHeights.length - 1 ? 'fill-signal' : 'fill-go/40'}
				/>
			{/each}
			<line x1="80" y1="174" x2="202" y2="174" class="stroke-chalk/20" />
		</g>
		<circle cx="214" cy="52" r="20" class="fill-go" />
		<path d="M205 52 l6 6 l12 -13" class="fill-none stroke-night" stroke-width="3" stroke-linecap="round" />
		<path d="M44 186 v22 M33 197 h22 M36 189 l16 16 M52 189 l-16 16" class="stroke-signal" stroke-width="1.5" />
	</svg>
	<figcaption class="text-xs tracking-wide text-chalk/50">A clearer picture. A calmer you.</figcaption>
</figure>
