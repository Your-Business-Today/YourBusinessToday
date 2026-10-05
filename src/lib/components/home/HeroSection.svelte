<script lang="ts">
	import BrandWordmark from '../site/BrandWordmark.svelte';
	import { jewelBespokeBuildCaseStudy as caseStudy } from '$lib/data/caseStudies';
</script>

<section class="mx-auto grid max-w-6xl items-center gap-12 px-6 py-20 md:grid-cols-2">
	<div class="flex flex-col gap-6">
		<p class="font-display text-sm tracking-widest text-signal uppercase">
			Welcome to Your Business Today
		</p>
		<h1 class="font-display text-4xl leading-tight font-medium md:text-6xl">
			We use AI to streamline your business today.
		</h1>
		<p class="max-w-prose text-lg text-chalk/70">
			Your Business Today identifies how information travels through your company. We harness the
			power of AI to automate the workflows along this information highway. We design, build and
			then give you self-improving tools to ensure you can further automate the automation of your
			business.
		</p>
		<div class="flex flex-wrap items-center gap-4">
			<a
				href={caseStudy.href}
				class="rounded-full border border-hairline px-7 py-3 font-display text-sm text-chalk/80
					transition hover:border-chalk/40 hover:text-chalk"
			>
				View our case study
			</a>
			<a
				href="/contact"
				class="rounded-full bg-signal px-7 py-3 font-display text-sm font-medium text-night
					transition hover:brightness-110"
			>
				Talk to us
			</a>
		</div>
	</div>
	<div class="hidden items-center justify-center md:flex" aria-hidden="true">
		<BrandWordmark fontSize={150} />
	</div>
</section>
