<script>
  import { css } from '../../../styled-system/css';
  import TipButton from './TipButton.svelte';
  import GitHubLink from './GitHubLink.svelte';

  const footerClass = css({
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '1rem',
    padding: '2rem',
    animation: 'fadeIn 1s ease-in',
    position: 'relative',
  });

  const separatorClass = css({
    content: '"|"',
    color: 'white',
  });

  const footerLinkClass = css({
    color: '#8b0000',
    textDecoration: 'none',
    transition: 'color 0.2s',
    '&:hover': {
      color: '#a00000',
    },
    textDecorationLine: 'underline',
  });
</script>

<footer class={footerClass}>
  <span>A game by <a class={footerLinkClass} href="https://luhsprwhk.xyz">Luh Sprwhk</a></span>
  <span class={separatorClass}></span>
  <GitHubLink />
  <span class={separatorClass}></span>
  <TipButton />
</footer>

<style>
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
</style>
