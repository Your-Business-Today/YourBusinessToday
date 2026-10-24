<script lang="ts">
	import { portalScreenSize, type PortalScreen } from '$lib/data/portalScreens';

	let { screen }: { screen: PortalScreen } = $props();
</script>

<figure class="flex flex-col gap-4">
	<a href={screen.imageUrl} target="_blank" rel="noreferrer" class="block">
		<img
			src={screen.imageUrl}
			alt="The {screen.title} screen of the construction company's portal, on invented data"
			width={portalScreenSize.width}
			height={portalScreenSize.height}
			loading="lazy"
			class="w-full rounded-xl border border-hairline transition hover:border-chalk/40"
		/>
	</a>
	<figcaption>
		<h3 class="font-display text-lg font-medium">{screen.title}</h3>
		<p class="mt-1 text-chalk/70">{screen.description}</p>
	</figcaption>
</figure>
