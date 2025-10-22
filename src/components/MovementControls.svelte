<script>
  import { css } from '../../styled-system/css';
  let { showInput = false, onMove = undefined } = $props();
  const containerClass = $derived(
    css({
      position: 'absolute',
      bottom: showInput ? '13rem' : '5rem',
      right: '1rem',
      zIndex: 10,
      backgroundColor: 'rgba(22, 22, 31, 0.9)',
      border: '1px solid #8b0000',
      borderRadius: '0.375rem',
      padding: '0.25rem',
      fontFamily: 'monospace',
      animation: 'fadeIn 0.75s ease-in',
    })
  );
  const gridClass = css({
    display: 'grid',
    gridTemplateColumns: '1.2rem 1.2rem 1.2rem',
    gridTemplateRows: '1.2rem 1.2rem 1.2rem',
    gap: '0.2rem',
    alignItems: 'center',
    justifyItems: 'center',
  });
  const btnClass = css({
    width: '1.2rem',
    height: '1.2rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1a1a2e',
    color: '#e0e0e0',
    border: '1px solid #2a2a3e',
    borderRadius: '0.25rem',
    cursor: 'pointer',
    userSelect: 'none',
    fontSize: '0.75rem',
    transition: 'background-color 0.15s, transform 0.05s',
    '&:hover': { backgroundColor: '#23233b' },
    '&:active': { backgroundColor: '#2b2b45', transform: 'translateY(1px)' },
  });
  function clickDir(dir) {
    if (!onMove) return;
    onMove(dir);
  }
</script>

<div class={containerClass} role="group" aria-label="Movement controls">
  <div class={gridClass}>
    <div></div>
    <button class={btnClass} aria-label="Move up" onclick={() => clickDir('north')}>↑</button>
    <div></div>

    <button class={btnClass} aria-label="Move left" onclick={() => clickDir('west')}>←</button>
    <div></div>
    <button class={btnClass} aria-label="Move right" onclick={() => clickDir('east')}>→</button>

    <div></div>
    <button class={btnClass} aria-label="Move down" onclick={() => clickDir('south')}>↓</button>
    <div></div>
  </div>
</div>

<style>
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
</style>
