<script>
  import { onMount, onDestroy } from "svelte";

  const SERVER_LAN_IP = window.location.hostname;
  const BACKEND_HUB_URL = `ws://${SERVER_LAN_IP}:7777?from=3001`;

  let wrapperElement; // Reference to bind the main element for fullscreen tracking

  let isShift = $state(false);
  let isCaps = $state(false);
  let currentBeta = 0;
  let currentGamma = 0;
  let isUpsideDown = false;
  let socket;

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
    const checkUpsideDown =
      absoluteBeta > 150 || (absoluteBeta < 30 && absoluteGamma > 75);

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
    if (socket) {
      socket.onopen = null;
      socket.onclose = null;
      socket.onerror = null;
      socket.close();
    }

    console.log("🔄 Connecting to local hub routing node:", BACKEND_HUB_URL);
    socket = new WebSocket(BACKEND_HUB_URL);

    socket.onopen = () => {
      console.log(
        "✅ Successfully bridged into the network routing hub via port 3001!",
      );
    };

    socket.onerror = (error) => {
      console.error("❌ Local connection exception observed:", error);
    };

    socket.onclose = (event) => {
      console.log(`🔌 Hub closed (Code: ${event.code}). Retrying in 3s...`);
      socket = null;
      setTimeout(setupWebSocket, 3000);
    };
  }

  function requestGyroPermission() {
    if (
      typeof DeviceOrientationEvent !== "undefined" &&
      typeof DeviceOrientationEvent.requestPermission === "function"
    ) {
      DeviceOrientationEvent.requestPermission()
        .then((response) => {
          if (response === "granted") {
            window.addEventListener("deviceorientation", handleOrientation);
          }
        })
        .catch(console.error);
    } else {
      window.addEventListener("deviceorientation", handleOrientation);
    }
  }

  // Requests browser fullscreen view mode upon user's initial touch interaction 
  function handleFirstClick() {
    if (wrapperElement && !document.fullscreenElement) {
      wrapperElement.requestFullscreen?.()
        .catch(err => console.error(`Error enabling fullscreen: ${err.message}`));
    }
    window.removeEventListener("click", handleFirstClick);
  }

  onMount(() => {
    setupWebSocket();
    requestGyroPermission();
    window.addEventListener("click", handleFirstClick);
  });

  onDestroy(() => {
    window.removeEventListener("deviceorientation", handleOrientation);
    window.removeEventListener("click", handleFirstClick);
    if (socket) socket.close();
  });
</script>

<main bind:this={wrapperElement} class="fullscreen-keyboard">
  {#each [["1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "Backspace"], ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"], ["a", "s", "d", "f", "g", "h", "j", "k", "l", "Enter"], ["Shift", "z", "x", "c", "v", "b", "n", "m", "Caps Lock"], ["Space"]] as row}
    <div class="row">
      {#each row as key}
        <button
          type="button"
          class:active-modifier={(key === "Shift" && isShift) ||
            (key === "Caps Lock" && isCaps)}
          class:wide-key={[
            "Backspace",
            "Enter",
            "Shift",
            "Caps Lock",
            "Space",
          ].includes(key)}
          onclick={() => handleKey(key)}
        >
          {key === "Space"
            ? "Spacebar"
            : (isShift || isCaps) && key.length === 1
              ? key.toUpperCase()
              : key}
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
  }

  /* Ensures background styling is consistent when the native element goes fullscreen */
  .fullscreen-keyboard:fullscreen {
    background-color: #333333;
    width: 100vw;
    height: 100vh;
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