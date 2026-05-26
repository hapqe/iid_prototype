<script>
  import { onMount, onDestroy } from 'svelte';

  // Dynamic protocol detection to cleanly handle ngrok's secure proxy setup
  const isSecure = window.location.protocol === 'https:';
  const WS_PROTOCOL = isSecure ? 'wss://' : 'ws://';
  const NGROK_WS_URL = `${WS_PROTOCOL}${window.location.host}/ws-hub`;

  let isShift = $state(false);
  let isCaps = $state(false);
  
  // Background orientation trackers for toggle checks
  let currentBeta = 0;
  let currentGamma = 0;
  
  let isUpsideDown = false;
  let socket;

  // Global WebSocket event sender
  function sendEvent(type, value) {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ type, value }));
    } else {
      console.warn("WebSocket not ready. Dropping packet:", type, value);
    }
  }

  function handleKey(key) {
    let actionValue = key;

    if (key === "Shift") {
      isShift = !isShift;
      return;
    } else if (key === "Caps Lock") {
      isCaps = !isCaps;
      return;
    } else if (key === "Space") {
      actionValue = " ";
    } else if (key !== "Backspace" && key !== "Enter") {
      const shouldUppercase = isShift || isCaps;
      actionValue = shouldUppercase ? key.toUpperCase() : key.toLowerCase();
      if (isShift) isShift = false;
    }

    sendEvent("keypress", actionValue);
  }

  function handleOrientation(event) {
    currentBeta = event.beta !== null ? Math.round(event.beta * 10) / 10 : 0;
    currentGamma = event.gamma !== null ? Math.round(event.gamma * 10) / 10 : 0;

    const absoluteBeta = Math.abs(currentBeta);
    const absoluteGamma = Math.abs(currentGamma);
    const checkUpsideDown = absoluteBeta > 150 || (absoluteBeta < 30 && absoluteGamma > 75);

    if (checkUpsideDown) {
      if (!isUpsideDown) {
        isUpsideDown = true;
        sendEvent("gyro", "toggleKeyboard");
      }
    } else {
      if (isUpsideDown) {
        isUpsideDown = false;
        sendEvent("gyro", "toggleKeyboard");
      }
    }
  }

  function setupWebSocket() {
    socket = new WebSocket(NGROK_WS_URL);

    socket.onopen = () => {
      console.log("Successfully bridged into the central server hub!");
    };

    socket.onclose = () => {
      setTimeout(setupWebSocket, 3000); // Dynamic auto-reconnect cycle
    };
  }

  function requestGyroPermission() {
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
      DeviceOrientationEvent.requestPermission()
        .then(response => {
          if (response === 'granted') {
            window.addEventListener('deviceorientation', handleOrientation);
          }
        })
        .catch(console.error);
    } else {
      window.addEventListener('deviceorientation', handleOrientation);
    }
  }

  onMount(() => {
    setupWebSocket();
    requestGyroPermission();
  });

  onDestroy(() => {
    window.removeEventListener('deviceorientation', handleOrientation);
    if (socket) socket.close();
  });
</script>

<main class="fullscreen-keyboard">
  {#each [
    ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "Backspace"],
    ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
    ["a", "s", "d", "f", "g", "h", "j", "k", "l", "Enter"],
    ["Shift", "z", "x", "c", "v", "b", "n", "m", "Caps Lock"],
    ["Space"]
  ] as row}
    <div class="row">
      {#each row as key}
        <button 
          type="button"
          class:active-modifier={(key === 'Shift' && isShift) || (key === 'Caps Lock' && isCaps)}
          class:wide-key={["Backspace", "Enter", "Shift", "Caps Lock", "Space"].includes(key)}
          onclick={() => handleKey(key)}
        >
          {key === "Space" ? "Spacebar" : (isShift || isCaps) && key.length === 1 ? key.toUpperCase() : key}
        </button>
      {/each}
    </div>
  {/each}
</main>

<style>
  :global(html, body, #app) {
    margin: 0; 
    padding: 0; 
    width: 100vw; 
    height: 100vh; 
    overflow: hidden;
    background-color: #333; 
    font-family: monospace;
  }

  .fullscreen-keyboard { 
    display: flex; 
    flex-direction: column; 
    width: 100vw; 
    height: 100vh; 
    box-sizing: border-box; 
    padding: 8px; 
    gap: 8px; 
    padding-top: 8px; /* Adjusted to sit cleanly at the top boundary */
  }

  .row { 
    display: flex; 
    flex: 1; 
    gap: 8px; 
    width: 100%; 
  }

  button { 
    background-color: #f5f5f5; 
    color: #333; 
    border: none; 
    font-size: 1.5rem; 
    font-weight: bold; 
    cursor: pointer; 
    flex: 1; 
    display: flex; 
    align-items: center; 
    justify-content: center; 
    user-select: none; 
    transition: background 0.1s; 
  }

  button:active { 
    background-color: #ddd; 
  }

  .wide-key { 
    flex: 2; 
    background-color: #e0e0e0; 
  }

  .row:last-child button { 
    flex: 1; 
  }

  button.active-modifier { 
    background-color: #ff3e00; 
    color: white; 
  }
</style>