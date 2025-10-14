<script>
  import { css } from '../../styled-system/css';

  const subtitles = [
    'Occult experiment. Play at your own risk',
    'A corrupted intelligence awaits',
    "The seal weakens with every session...\n (but you'll keep clicking anyway lol)",
    "You are not the first. You will not be the last.\n (But you're definitely the most entertaining)",
    'Not responsible for any harm caused by playing this game',
    'DO NOT PROCEED!',
    "Oh, don't pay attention to the stupid devs :D",
  ];

  const riddleTooltips = [
    'I speak without a mouth, in lines of gray.\nSeek the ledger beneath the page.',
    'Where do errors confess? In the room no visitor opens.',
    'Whispers gather where messages queue, just below the surface.',
    'He waits where the page keeps its private diary.',
    'There is a watchful window; there the page tells the truth.',
  ];

  const STORAGE_KEY_RIDDLE = 'io73k_hover_riddle_index';

  /**
   * Pick a new riddle index, avoiding the excluded index if possible
   * @param {number} excludeIndex - Index to avoid
   * @returns {number} - New riddle index
   */
  function pickNewRiddleIndex(excludeIndex = -1) {
    if (riddleTooltips.length <= 1) return 0;
    let idx = Math.floor(Math.random() * riddleTooltips.length);
    if (idx === excludeIndex) {
      idx =
        (idx + 1 + Math.floor(Math.random() * (riddleTooltips.length - 1))) %
        riddleTooltips.length;
    }
    return idx;
  }

  /**
   * Pick a random subtitle different from the current one
   * @param {string} currentSubtitle - Current subtitle to avoid
   * @returns {string} - New subtitle
   */
  export function pickDifferentSubtitle(currentSubtitle) {
    if (subtitles.length <= 1) return subtitles[0];
    let newSubtitle;
    do {
      newSubtitle = subtitles[Math.floor(Math.random() * subtitles.length)];
    } while (newSubtitle === currentSubtitle);
    return newSubtitle;
  }

  /**
   * Get a random initial subtitle
   * @returns {string}
   */
  export function getRandomSubtitle() {
    return subtitles[Math.floor(Math.random() * subtitles.length)];
  }

  // Initialize riddle from localStorage
  let initialRiddleIndex = -1;
  try {
    const stored = localStorage.getItem(STORAGE_KEY_RIDDLE);
    initialRiddleIndex = stored !== null ? parseInt(stored, 10) : -1;
  } catch {}

  let currentRiddleIndex = $state(
    pickNewRiddleIndex(
      Number.isFinite(initialRiddleIndex) ? initialRiddleIndex : -1
    )
  );

  // State
  let subtitleIsWhite = $state(false);
  let subtitlePulseTimer = null;
  let subtitleChangeTimer = null;
  let currentSubtitle = $state(getRandomSubtitle());
  let isStarted = $state(false);

  // Persist riddle changes to localStorage
  $effect(() => {
    currentRiddleIndex; // track changes
    try {
      localStorage.setItem(STORAGE_KEY_RIDDLE, String(currentRiddleIndex));
    } catch {}
  });

  const hoverRiddle = $derived(riddleTooltips[currentRiddleIndex]);

  /**
   * Reroll the riddle tooltip
   */
  function rerollRiddle() {
    const next = pickNewRiddleIndex(currentRiddleIndex);
    currentRiddleIndex = next;
    try {
      localStorage.setItem(STORAGE_KEY_RIDDLE, String(next));
    } catch {}
  }

  /**
   * Pulse the subtitle to white for 2 seconds
   */
  function pulseSubtitle() {
    subtitleIsWhite = true;
    setTimeout(() => {
      subtitleIsWhite = false;
    }, 2000);
  }

  /**
   * Change the subtitle text to a different one
   */
  function changeSubtitle() {
    // Don't change if currently pulsing white
    if (subtitleIsWhite) {
      scheduleNextSubtitleChange();
      return;
    }

    currentSubtitle = pickDifferentSubtitle(currentSubtitle);
  }

  /**
   * Schedule the next subtitle text change at a random interval
   */
  function scheduleNextSubtitleChange() {
    if (subtitleChangeTimer) {
      clearTimeout(subtitleChangeTimer);
    }

    // Random interval between 45-120 seconds
    const minDelay = 45000;
    const maxDelay = 120000;
    const randomDelay = minDelay + Math.random() * (maxDelay - minDelay);

    subtitleChangeTimer = setTimeout(() => {
      changeSubtitle();
      scheduleNextSubtitleChange(); // Schedule next change
    }, randomDelay);
  }

  /**
   * Start the pulsing animation (white color every 60 seconds)
   */
  function startPulsing() {
    if (subtitlePulseTimer) return; // Already started

    // Pulse immediately to give environmental clue
    pulseSubtitle();

    // Then pulse every 60 seconds
    subtitlePulseTimer = setInterval(() => {
      pulseSubtitle();
    }, 60000);
  }

  /**
   * Start the text changing at random intervals
   */
  function startChanging() {
    if (subtitleChangeTimer) return; // Already started
    scheduleNextSubtitleChange();
  }

  /**
   * Start both pulsing and text changing
   * Called when the game begins
   */
  export function start() {
    if (isStarted) return;
    isStarted = true;
    startPulsing();
    startChanging();
  }

  /**
   * Stop all animations and timers
   */
  export function stop() {
    isStarted = false;
    if (subtitlePulseTimer) {
      clearInterval(subtitlePulseTimer);
      subtitlePulseTimer = null;
    }
    if (subtitleChangeTimer) {
      clearTimeout(subtitleChangeTimer);
      subtitleChangeTimer = null;
    }
  }

  // Cleanup timers on unmount
  $effect(() => {
    return () => {
      stop();
    };
  });

  // Styling
  const subtitleClass = $derived(
    css({
      fontSize: '0.75rem',
      color: subtitleIsWhite ? '#ffffff' : '#8b0000',
      letterSpacing: '0.15em',
      marginRight: '1em',
      margin: 0,
      fontWeight: 'bold',
      cursor: 'help',
      position: 'relative',
      whiteSpace: 'pre-line',
      transition: 'color 0.5s ease-in-out',
      '&::after': {
        content: '""',
        position: 'absolute',
        left: 0,
        bottom: '-0.15em',
        height: '2px',
        width: '100%',
        background: 'linear-gradient(90deg, #5c0000, #ff2b2b, #5c0000)',
        backgroundSize: '200% 100%',
        animation: 'shimmerUnderline 16s ease-in-out infinite',
        opacity: 0.95,
      },
    })
  );
</script>

<p class={subtitleClass} title={hoverRiddle} onmouseenter={rerollRiddle}>
  {currentSubtitle}
</p>

<style>
  /* Shimmer underline animation */
  @keyframes shimmerUnderline {
    0%,
    96% {
      background-position: 0% 0;
      opacity: 0.9;
    }
    97% {
      background-position: 100% 0;
      opacity: 1;
    }
    100% {
      background-position: 100% 0;
      opacity: 0.9;
    }
  }
</style>
