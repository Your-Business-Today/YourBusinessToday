<script lang="ts">
	import { connectionDirectionWords, type NeuronConnection } from './neuronConnections';

	let { connection, onOpen }: { connection: NeuronConnection; onOpen: (slug: string) => void } = $props();
</script>

<button type="button" onclick={() => onOpen(connection.slug)} class="group flex w-full min-w-0 items-center justify-between gap-3 py-2.5 text-left">
	<span class="flex min-w-0 flex-col">
		<span class="truncate font-display text-sm text-chalk transition group-hover:text-go">{connection.title}</span>
		<span class="text-xs text-chalk-subtle">{connectionDirectionWords[connection.direction]} · {connection.kindLabel}</span>
	</span>
	<span aria-hidden="true" class="text-chalk/40 transition group-hover:text-go">→</span>
</button>
