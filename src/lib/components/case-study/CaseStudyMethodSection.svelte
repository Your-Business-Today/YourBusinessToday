<script lang="ts">
	import { buildTimeline } from '$lib/data/consultancyOffer';
</script>

<section class="border-y border-hairline bg-carriage/60">
	<div class="mx-auto max-w-4xl px-6 py-20 md:py-24">
		<p class="font-display text-sm tracking-widest text-signal uppercase">How each one was built</p>
		<h2 class="mt-5 font-display text-3xl leading-tight font-medium md:text-4xl">
			The same way every time.
		</h2>
		<p class="mt-8 max-w-3xl text-lg text-chalk/80">
			A week with the people who do the work, mapping what arrives and what goes out. A proof of
			the idea in code before anything is committed to. Then live, and grown a piece at a time,
			each piece in use before the next is started. Their own AI assistant is connected to the
			same roles as the screens, so the team work from the assistant they already use.
		</p>
		<p class="mt-6 max-w-3xl text-chalk/70">
			Today we do it in {buildTimeline}. The seven steps are on the offer page.
		</p>
		<a
			href="/offer"
			class="mt-10 inline-block rounded-full border border-hairline px-6 py-2.5 font-display text-sm
				text-chalk/80 transition hover:border-chalk/40 hover:text-chalk"
		>
			How an engagement works
		</a>
	</div>
</section>
