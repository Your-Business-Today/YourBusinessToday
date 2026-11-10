<script lang="ts">
	let { comparisonCount }: { comparisonCount: number } = $props();

	const linkClasses = `flex min-h-12 shrink-0 items-center gap-2 border-b-2 px-1 text-sm transition hover:text-chalk`;
	const quietLinkClasses = `${linkClasses} border-transparent text-chalk/70`;
</script>

<nav
	aria-label="Calculator sections"
	class="sticky top-0 z-30 border-b border-hairline bg-night/85 backdrop-blur supports-[backdrop-filter]:bg-night/70"
>
	<div class="scrollbar-hidden mx-auto flex max-w-6xl items-center gap-6 overflow-x-auto px-4 sm:px-6">
		<a href="#calculator" class={`${linkClasses} border-signal text-chalk`} aria-current="page"><span class="sm:hidden">Calculator</span><span class="hidden sm:inline">Take-home calculator</span></a>
		<a href="#my-comparisons" class={quietLinkClasses}>
			<span class="hidden sm:inline">My</span> comparisons
			<span class="grid min-w-6 place-items-center rounded-full bg-hairline px-1.5 font-mono text-xs text-chalk">
				{comparisonCount}
			</span>
		</a>
		<a href="#how-it-works" class={`${quietLinkClasses} sm:ml-auto`}>
			How it works
			<span class="grid size-5 place-items-center rounded-full border border-hairline text-xs" aria-hidden="true">?</span>
		</a>
	</div>
</nav>
