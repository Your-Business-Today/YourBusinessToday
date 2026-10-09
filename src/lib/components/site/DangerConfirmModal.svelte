<script lang="ts">
	import DangerConfirmForm from './DangerConfirmForm.svelte';
	import { keyboardKeys } from '$lib/client/keyboardKeys';

	let {
		title,
		description,
		action,
		fields,
		submitLabel,
		confirmWord = null,
		isOpen = $bindable()
	}: {
		title: string;
		description: string;
		action: string;
		fields: Record<string, string>;
		submitLabel: string;
		confirmWord?: string | null;
		isOpen: boolean;
	} = $props();

	function close() {
		isOpen = false;
	}

	function closeOnEscape(event: KeyboardEvent) {
		if (!isOpen || event.key !== keyboardKeys.escape) return;
		event.preventDefault();
		close();
	}
</script>

<svelte:window onkeydown={closeOnEscape} />

{#if isOpen}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-night/80 p-6">
		<div
			role="alertdialog"
			aria-modal="true"
			aria-label={title}
			class="w-full max-w-md rounded-2xl border border-signal/40 bg-carriage p-6 shadow-2xl"
		>
			<h2 class="font-display text-xl font-medium text-signal">{title}</h2>
			<p class="mt-3 text-sm text-chalk/70">{description}</p>
			<DangerConfirmForm {action} {fields} {submitLabel} {confirmWord} onClose={close} />
		</div>
	</div>
{/if}
