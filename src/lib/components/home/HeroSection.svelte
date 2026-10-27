<script lang="ts">
	import BrandWordmark from '../site/BrandWordmark.svelte';
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
	</div>
	<div class="hidden items-center justify-center md:flex" aria-hidden="true">
		<BrandWordmark fontSize={150} />
	</div>
</section>
