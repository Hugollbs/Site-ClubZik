<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();

	// On compare à route.id (sans préfixe de langue) et non à l'URL, comme dans guards.ts
	const isMembers = $derived(page.route.id === '/(app)/admin-params/members');
	const isSlots = $derived(page.route.id === '/(app)/admin-params/slots');


	const tabClass = (active: boolean) => (active ? 'font-bold' : 'text-gray-500 hover:text-gray-800');
</script>

<h1 class="text-2xl font-bold">Administration</h1>

<nav class="mt-2 flex gap-4">
	<a href={resolve('/(app)/admin-params/members')} class={tabClass(isMembers)}>Membres</a>
	<a href={resolve('/(app)/admin-params/slots')} class={tabClass(isSlots)}>Créneaux réguliers</a>
</nav>

<div class="mt-6">
	{@render children()}
</div>
