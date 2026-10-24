<script lang="ts">
	import DiscoveryCallButton from '../site/DiscoveryCallButton.svelte';
</script>

<section class="mx-auto max-w-6xl px-6 py-20 md:py-24">
	<div class="grid gap-10 md:grid-cols-2 md:gap-16">
		<div class="flex flex-col gap-4">
			<h2 class="font-display text-2xl font-medium">What it costs</h2>
			<p class="max-w-prose text-chalk/70">
				The build is one fixed price, agreed before it starts: the map, the harness, your web
				app and your AI connector. After launch it is one monthly fee for hosting, backups,
				support and the changes you ask for, and you can cancel on a month’s notice. Nothing
				is added on top. Book a discovery call and we send you the written offer with the
				figures on it. There is nothing to negotiate your way into.
			</p>
			<DiscoveryCallButton class="self-start" />
		</div>
		<div class="flex flex-col gap-4">
			<h2 class="font-display text-2xl font-medium">What we ask of you</h2>
			<ul class="flex max-w-prose flex-col gap-3 text-chalk/70">
				<li>
					<span class="font-display text-chalk">The first week with the people who do the work,</span>
					rather than their managers’ account of them.
				</li>
				<li>
					<span class="font-display text-chalk">One person who can decide.</span> Not a
					committee. The work moves at the speed of the slowest approval.
				</li>
				<li>
					<span class="font-display text-chalk">Honesty about a bad week.</span> We are no use
					to you if we are shown the tidy version.
				</li>
			</ul>
		</div>
	</div>
</section>
