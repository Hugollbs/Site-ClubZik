<script lang="ts">
  import { Frame, Flex, Button } from 'azucar-ui';
  import { resolve } from '$app/paths';
  import bgImage from '#lib/assets/bg-exemple.JPG';
  import type { LayoutProps } from './$types';
  import { page } from '$app/state';

  let { data, children }: LayoutProps = $props();

  // $derived = réactif, évite le warning "state_referenced_locally"
  const showSidebar = $derived(data.user?.isApproved === true);
  const displayName = $derived(data.user?.displayName ?? '');
  const isStaff = $derived(data.user?.isStaff ?? false);

  const navLinks = [
    { href: resolve('/(app)/booking'), label: 'Réservations' },
    { href: resolve('/(app)/bands'), label: 'Groupes' },
    { href: resolve('/(app)/events'), label: 'Événements' },
    { href: resolve('/(app)/profile'), label: 'Profil' },
  ];
  const adminLinks = $derived(isStaff
    ? [{ href: resolve('/(app)/admin-params'), label: 'Admin' }]
    : []);

    // Sidebar escalier

  const allLinks = [...navLinks, ...adminLinks];

  // Niveau d'indentation
  function getIndentLevel(index: number, total: number): number {
    const mid = Math.floor(total / 2);
    if (index <= mid) return mid - index;
    return index - mid;
  }

</script>

<Flex direction="column" align="center" justify="center"
    class="h-dvh w-full overflow-hidden px-4" gap="md" style={`background-image: url(${bgImage}); background-size: cover; background-position: center; `}>
    {#if showSidebar}
        <div class="flex h-full min-h-0 w-full gap-4">
          <main class="flex-1 min-w-0 min-h-0 overflow-y-auto">
            <div class="flex h-full min-h-0 items-center justify-center">
              <Frame border transparent style="padding: 1.3rem var(--size-xl); min-width: 0; width: 90%; height: 90%; flex: none; max-width: 100%; overflow-y: auto;">
                <a href="/" class="mb-4 text-xl font-bold text-right self-start w-[150px]">ClubZik</a>
                {@render children()}
              </Frame>
            </div>
          </main>

          <!-- Sidebar -->
          <aside class="flex h-full w-56 shrink-0 flex-col p-4">
            <div class="text-sm profile-container">
              <p class="pl-3 pr-6 text-gray-600 text-right">{displayName}</p>
              <form method="post" action={resolve('/(public)/logout')}>
                <Button type="submit" variant="outline">Se déconnecter</Button>
              </form>
            </div>
            <nav class="flex flex-1 flex-col justify-center gap-2 sidebar-container">
              {#each allLinks as link, index (link.href)}
                <Button
                  href={link.href}
                  variant={page.url.pathname === link.href ? 'outline' : 'default'}
                  class="justify-center"
                  style="font-size: 18px; width: auto; max-width: 180px; text-align: center; padding: 8px 12px; margin-left: {getIndentLevel(index, allLinks.length)}rem;
                        width: 100%; text-align: center; justify-self: stretch;"
                >
                  {link.label}
                </Button>
              {/each}
            </nav>
          </aside>
        </div>
  {/if}
</Flex>

<style>
  .profile-container {
    position: absolute;
    right: 10px;
    top: 5px;
  }
</style>