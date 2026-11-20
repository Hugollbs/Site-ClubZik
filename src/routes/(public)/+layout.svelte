<script lang="ts">
  import { Frame, Flex, Button } from 'azucar-ui';
  import type { LayoutProps } from './$types';

  import bgImage from '#lib/assets/bg-exemple.JPG';

  let { children }: LayoutProps = $props();
</script>


<Flex direction="column" align="center" justify="center"
      class="min-h-screen px-4 py-12" gap="md" style={`background-image: url(${bgImage}); background-size: cover; background-position: center; `}>
  <Frame border transparent style="padding: var(--size-xl); width: fit-content;">
    {@render children()}
  </Frame>
  <!-- Boutons se connecter et s'inscrire pas utiles ?
  <Flex justify="center" gap="sm" wrap>
    <Button href={resolve('/(public)/login')}>Se connecter</Button>
    <Button variant="outline" href={resolve('/(public)/register')}>S'inscrire</Button>
  </Flex>
  -->
</Flex>

<style>
@import '../layout.css';
</style>