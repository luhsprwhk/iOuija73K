<script>
  import { createEventDispatcher, onMount, onDestroy } from 'svelte';

  export let showModal = false;

  const dispatch = createEventDispatcher();

  function closeModal() {
    dispatch('close');
  }

  function handleKeydown(event) {
    if (event.key === 'Escape') {
      closeModal();
    }
  }

  onMount(() => {
    window.addEventListener('keydown', handleKeydown);
  });

  onDestroy(() => {
    window.removeEventListener('keydown', handleKeydown);
  });
</script>

{#if showModal}
  <div class="modal-backdrop" on:click={closeModal} role="dialog" aria-modal="true" tabindex="-1">
    <div class="modal-content" on:click|stopPropagation role="document">
      <button class="close-button" on:click={closeModal}>X</button>
      <iframe id='kofiframe' src='https://ko-fi.com/luhsprwhk/?hidefeed=true&widget=true&embed=true&preview=true' style='border:none;width:100%;padding:4px;background:#f9f9f9;' height='712' title='luhsprwhk'></iframe>
    </div>
  </div>
{/if}

<style>
  .modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }

  .modal-content {
    background: white;
    padding: 2rem;
    border-radius: 8px;
    position: relative;
    color: black;
  }

  .close-button {
    position: absolute;
    top: 10px;
    right: 10px;
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
  }
</style>
