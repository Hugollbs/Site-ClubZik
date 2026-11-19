<script lang="ts">
  import { resolve } from '$app/paths';
  import type { LayoutProps } from './$types';

  let { data, children }: LayoutProps = $props();

  // $derived = réactif, évite le warning "state_referenced_locally"
  const showSidebar = $derived(data.user?.isApproved === true);
  const displayName = $derived(data.user?.displayName ?? '');
  const isStaff = $derived(data.user?.isStaff ?? false);

  const navLinks = [
    { href: resolve('/booking'), label: 'Réservations' },
    { href: resolve('/bands'), label: 'Groupes' },
    { href: resolve('/events'), label: 'Événements' },
    { href: resolve('/profile'), label: 'Profil' },
  ];
  const adminLinks = $derived(isStaff
    ? [{ href: resolve('/admin-params'), label: 'Admin' }]
    : []);
</script>

{#if showSidebar}
  <div class="flex min-h-screen">
    <nav class="flex w-56 shrink-0 flex-col gap-1 border-r border-gray-200 bg-gray-50 p-4">
      <a href={resolve('/')} class="mb-4 text-xl font-bold">ClubZik</a>
      {#each navLinks as link}
        <a href={link.href} class="rounded-md px-3 py-2 hover:bg-gray-200">{link.label}</a>
      {/each}
      {#each adminLinks as link}
        <a href={link.href} class="rounded-md px-3 py-2 hover:bg-gray-200">{link.label}</a>
      {/each}

      <div class="mt-auto text-sm">
        <p class="px-3 text-gray-600">{displayName}</p>
        <form method="post" action={resolve('/logout')}>
          <button class="rounded-md px-3 py-2 hover:bg-gray-200 w-full text-left">Se déconnecter</button>
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