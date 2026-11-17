<script lang="ts">
	import type { Path } from '$app/types';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { locales, localizeHref } from '#lib/paraglide/runtime.js';
	import './layout.css';
	import favicon from '#lib/assets/favicon.svg';
	import type { LayoutProps } from './$types';

	let { data, children }: LayoutProps = $props();

	// La barre latérale n'apparaît que pour un membre connecté ET approuvé
	const showSidebar = $derived(data.user?.isApproved === true);

	const linkClass = 'rounded-md px-3 py-2 hover:bg-gray-200';
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{#if showSidebar}
	<div class="flex min-h-screen">
		<nav class="flex w-56 shrink-0 flex-col gap-1 border-r border-gray-200 bg-gray-50 p-4">
			<a href={resolve('/')} class="mb-4 text-xl font-bold">ClubZik</a>
			<a href={resolve('/booking')} class={linkClass}>Réservations</a>
			<a href={resolve('/bands')} class={linkClass}>Groupes</a>
			<a href={resolve('/events')} class={linkClass}>Événements</a>
			<a href={resolve('/profile')} class={linkClass}>Profil</a>
			{#if data.user?.isStaff}
				<a href={resolve('/admin-params')} class={linkClass}>Admin</a>
			{/if}

			<div class="mt-auto text-sm">
				<p class="px-3 text-gray-600">{data.user?.displayName}</p>
				<!-- Déconnexion en POST (pas un simple lien) : un lien GET pourrait être déclenché à l'insu de l'utilisateur -->
				<form method="post" action={resolve('/logout')}>
					<button class="{linkClass} w-full text-left">Se déconnecter</button>
				</form>
			</div>
		</nav>
		<main class="flex-1 p-6">
			{@render children()}
		</main>
	</div>
{:else}
	<main class="p-6">
		{@render children()}
	</main>
{/if}

<div style="display:none">
	{#each locales as locale (locale)}
		<a href={resolve(localizeHref(page.url.pathname, { locale }) as Path)}>{locale}</a>
	{/each}
</div>
