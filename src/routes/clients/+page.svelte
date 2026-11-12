<script lang="ts">
	import SalesRegisterPage from '$lib/components/salesRegisters/SalesRegisterPage.svelte';
	import { clientsRegister } from '$lib/data/salesRegisters';

	let { data, form } = $props();
</script>

<SalesRegisterPage register={clientsRegister} reading={data} message={form?.message ?? null} />
