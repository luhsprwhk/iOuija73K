<script>
  import ChatInterface from './lib/ChatInterface.svelte'
  import Footer from './lib/Footer.svelte'
  
  let showFooter = $state(false)
  
  function handleGameStateChange(state) {
    // Show footer when Paimon reveals himself (name_exchange state)
    if (state === 'name_exchange') {
      showFooter = true
    }
  }
</script>

<div style="display: flex; flex-direction: column; height: 100vh; overflow: hidden;">
  <div style="flex: 1; overflow: hidden;">
    <ChatInterface onGameStateChange={handleGameStateChange} />
  </div>
  {#if showFooter}
    <Footer />
  {/if}
</div>