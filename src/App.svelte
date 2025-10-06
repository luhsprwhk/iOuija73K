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

<div>
  <ChatInterface onGameStateChange={handleGameStateChange} />
  {#if showFooter}
    <div style="height: 2rem"></div>
    <Footer />
  {/if}
</div>