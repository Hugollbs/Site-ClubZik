<script lang="ts">
  import 'azucar-ui/tokens.css';
  import 'azucar-ui/base.css';
  import './layout.css';
  import { locales, localizeHref } from '#lib/paraglide/runtime.js';
  import { page } from '$app/state';
  import { resolve } from '$app/paths';
  import type { LayoutProps } from './$types';

  let { data, children }: LayoutProps = $props();
</script>

<svelte:head>
  <link rel="icon" href="/favicon.svg" />
</svelte:head>

<div class="app-wrapper min-h-screen">
  {@render children()}
</div>

<div style="display:none">
  {#each locales as locale (locale)}
    <a href={resolve(localizeHref(page.url.pathname, { locale }) as Path)}>{locale}</a>
  {/each}
</div>