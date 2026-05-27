<script>
  import { onMount, onDestroy } from 'svelte';
  import Header from './Header.svelte';
  import MenuScreen from './MenuScreen.svelte';
  import AlertScreen from './AlertScreen.svelte';
  import DetailsScreen from './DetailsScreen.svelte';
  import TasksScreen from './TasksScreen.svelte';
  import MapScreen from './MapScreen.svelte';
  import ChatScreen from './ChatScreen.svelte';

  let wrapperElement;

  let currentScreen = 'menu';
  let previousScreen = 'menu';
  let hasEmergencies = false;
  let sandbagCount = 3;
  let shovelCount = 1;
  let menuSelectedIndex = 0;
  let popupSelectedIndex = 0;
  let tasksSelectedIndex = 2;

  let hasSeenPopup = false;
  let hasSeenDetails = false;

  let chatMessages = [];
  let currentTypedMessage = '';

  let socket;

  // Flashlight state variables
  let videoStream = null;
  let videoTrack = null;

  $: menuItems = hasEmergencies
    ? [
        { type: 'emergency', title: 'Heavy Labor', details: '500 m from your current locaton', time: '12:34' },
        { type: 'nav', title: 'Instruction Manual' },
        { type: 'nav', title: 'Settings' }
      ]
    : [
        { type: 'nav', title: 'Instruction Manual' },
        { type: 'nav', title: 'Settings' }
      ];

  $: totalMenuCount = menuItems.length;

  // Flashlight control functions
  async function turnOnFlashlight() {
    try {
      // Initialize stream if not already active
      if (!videoStream) {
        videoStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' } }
        });
        videoTrack = videoStream.getVideoTracks()[0];
      }

      const capabilities = videoTrack.getCapabilities();
      if ('torch' in capabilities) {
        await videoTrack.applyConstraints({
          advanced: [{ torch: true }]
        });
      } else {
        console.warn('Flashlight (torch) is not supported on this device camera.');
      }
    } catch (err) {
      console.error('Error enabling flashlight:', err);
    }
  }

  async function turnOffFlashlight() {
    try {
      if (videoTrack) {
        await videoTrack.applyConstraints({
          advanced: [{ torch: false }]
        });
      }
    } catch (err) {
      console.error('Error disabling flashlight:', err);
    }
  }

  function navigateUp() {
    if (currentScreen === 'chat') return;
    if (currentScreen === 'menu') {
      menuSelectedIndex = (menuSelectedIndex - 1 + totalMenuCount) % totalMenuCount;
    } else if (currentScreen === 'popup') {
      popupSelectedIndex = 0;
    } else if (currentScreen === 'tasks') {
      tasksSelectedIndex = (tasksSelectedIndex - 1 + 3) % 3;
    } else if (currentScreen === 'map') {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'w' }));
    }
  }

  function navigateDown() {
    if (currentScreen === 'chat') return;
    if (currentScreen === 'menu') {
      menuSelectedIndex = (menuSelectedIndex + 1) % totalMenuCount;
    } else if (currentScreen === 'popup') {
      popupSelectedIndex = 1;
    } else if (currentScreen === 'tasks') {
      tasksSelectedIndex = (tasksSelectedIndex + 1) % 3;
    } else if (currentScreen === 'map') {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 's' }));
    }
  }

  function triggerEmergencyState() {
    hasEmergencies = true;
    popupSelectedIndex = 0;
    hasSeenPopup = false;
    hasSeenDetails = false;
    currentScreen = 'popup';
  }

  function sendChatMessage() {
    if (currentTypedMessage.trim() !== '') {
      chatMessages = [...chatMessages, { author: 'Me', text: currentTypedMessage }];
      currentTypedMessage = '';
    }
  }

  function handleFirstClick() {
    if (wrapperElement && !document.fullscreenElement) {
      wrapperElement.requestFullscreen?.()
        .catch(err => console.error(`Error enabling fullscreen: ${err.message}`));
    }
    window.removeEventListener('click', handleFirstClick);
  }

  function handleKeyDown(event) {
    if (currentScreen === 'chat') {
      const rawKey = event.key;
      if (rawKey === 'Enter') {
        if (event.preventDefault) event.preventDefault();
        sendChatMessage();
      } else if (rawKey === 'Backspace') {
        if (event.preventDefault) event.preventDefault();
        currentTypedMessage = currentTypedMessage.slice(0, -1);
      } else if (rawKey && rawKey.length === 1) {
        if (event.preventDefault) event.preventDefault();
        currentTypedMessage += event.key;
      }
      return;
    }

    const key = event.key.toLowerCase();

    // Global Flashlight assignments
    if (key === 'f') {
      if (event.preventDefault) event.preventDefault();
      turnOnFlashlight();
      return;
    } else if (key === 'g') {
      if (event.preventDefault) event.preventDefault();
      turnOffFlashlight();
      return;
    }

    if (key === 'w') {
      navigateUp();
    } else if (key === 's') {
      navigateDown();
    }
    
    else if (currentScreen === 'menu') { 
      if (key === 'd') {
        if (event.preventDefault) event.preventDefault();
        if (hasEmergencies && menuSelectedIndex === 0) {
          if (hasSeenPopup && hasSeenDetails) {
            currentScreen = 'tasks';
            tasksSelectedIndex = 2;
          } else {
            currentScreen = 'popup';
            popupSelectedIndex = 0;
          }
        }
      }
    }
    
    else if (currentScreen === 'popup') { 
      if (key === 'd') {
        if (event.preventDefault) event.preventDefault();
        hasSeenPopup = true;
        currentScreen = 'details';
      } else if (key === 'a') {
        if (event.preventDefault) event.preventDefault();
        currentScreen = 'menu'; 
        menuSelectedIndex = 0;
      }
    }

    else if (currentScreen === 'exit-confirmation') {
      if (key === 'd' || key === ' ' || key === 'spacebar') {
        if (event.preventDefault) event.preventDefault();
        currentScreen = 'menu';
        menuSelectedIndex = 0;
      } else if (key === 'a' || key === 'escape') {
        if (event.preventDefault) event.preventDefault();
        currentScreen = 'popup';
        popupSelectedIndex = 1;  
      }
    }
    
    else if (currentScreen === 'details') {
      if (key === 'd') {
        if (event.preventDefault) event.preventDefault();
        hasSeenDetails = true;
        currentScreen = 'tasks';
        tasksSelectedIndex = 2;
      } else if (key === 'a' || key === 'escape') {
        if (event.preventDefault) event.preventDefault();
        currentScreen = 'popup'; 
        popupSelectedIndex = 0; 
      }
    }

    else if (currentScreen === 'tasks') {
      if (tasksSelectedIndex === 0) {
        if (key === 'd') sandbagCount += 1;
        if (key === 'a' && sandbagCount > 0) sandbagCount -= 1;
      } 
      else if (tasksSelectedIndex === 1) {
        if (key === 'd') shovelCount += 1;
        if (key === 'a' && shovelCount > 0) shovelCount -= 1;
      } 
      
      else if (tasksSelectedIndex === 2) {
        if (key === 'd') {
          if (event.preventDefault) event.preventDefault();
          currentScreen = 'map';
        } else if (key === 'a') {
          if (event.preventDefault) event.preventDefault();
          if (hasSeenPopup && hasSeenDetails) {
            currentScreen = 'menu';
            menuSelectedIndex = 0;
          } else {
            currentScreen = 'details';
          }
        }
      }
      
      if (key === 'escape') {
        if (event.preventDefault) event.preventDefault();
        currentScreen = 'menu';
        menuSelectedIndex = 0;
      }
    }

    else if (currentScreen === 'map') {
        if (key === 'd') {
            if (event.preventDefault) event.preventDefault();
            window.dispatchEvent(new KeyboardEvent('keydown', { key: 'w' }));
        } else if (key === 'escape' || key === 'a') {
            if (event.preventDefault) event.preventDefault();
            currentScreen = 'tasks';
            tasksSelectedIndex = 2;
        }
    }
  }

  onMount(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('click', handleFirstClick);

    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsHost = window.location.hostname;

    socket = new WebSocket(`${wsProtocol}//${wsHost}:7777`);

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'toggleEmergency') {
          triggerEmergencyState();
          return;
        }

        if (data.value === 'toggleKeyboard') {
          if (currentScreen !== 'chat') {
            previousScreen = currentScreen;
            currentScreen = 'chat';
          } else {
            currentScreen = previousScreen;
          }
          return; 
        }

        if (currentScreen === 'chat' && data.type === 'chatMessage') {
          chatMessages = [...chatMessages, { author: data.author, text: data.text }];
          return;
        }

        const remoteKey = data.value;
        handleKeyDown({
          key: remoteKey,
          preventDefault: () => {} 
        });
      } catch (err) {
        console.error("Error parsing incoming WebSocket stream data:", err);
      }
    };

    socket.onclose = () => {
      console.log("Disconnected from keyboard server.");
    };
  });

  onDestroy(() => {
    window.removeEventListener('keydown', handleKeyDown);
    window.removeEventListener('click', handleFirstClick);
    
    // Clean up camera/flashlight streams
    if (videoTrack) videoTrack.stop();
    if (videoStream) videoStream.getTracks().forEach(track => track.stop());
    
    if (socket) {
      socket.close();
    }
  });
</script>

<div bind:this={wrapperElement} class="screen-layout-wrapper">
  <div class="screen-container"> 
    <Header />

    <main class="content">
      {#if currentScreen === 'menu'} 
        <MenuScreen {hasEmergencies} {menuSelectedIndex} {menuItems} />
      {:else if currentScreen === 'popup'} 
        <AlertScreen {popupSelectedIndex} />
      {:else if currentScreen === 'exit-confirmation'}
        <div class="confirmation-screen">
          <div class="confirmation-banner">
            <p class="confirmation-text">You are trying to exit the emergency. Proceed?</p>
          </div>
          <div class="keyboard-hint">Slide down Keyboard to chat</div>
        </div>
      {:else if currentScreen === 'details'}
        <DetailsScreen />
      {:else if currentScreen === 'tasks'}
        <TasksScreen {tasksSelectedIndex} {sandbagCount} {shovelCount} />
      {:else if currentScreen === 'map'}
        <MapScreen />
      {:else if currentScreen === 'chat'} 
        <ChatScreen messages={chatMessages} typedMessage={currentTypedMessage} />
      {/if}
    </main>
  </div>

  <div class="global-sidebar-controls">
    <button class="software-btn" on:click={navigateUp} aria-label="Nach oben">
      <span class="arrow-up"></span>
    </button>
    <button class="software-btn" on:click={navigateDown} aria-label="Nach unten">
      <span class="arrow-down"></span>
    </button>
  </div>
</div>

<style>
  .screen-layout-wrapper {
    display: flex;
    justify-content: center;
    width: 100vw;
    height: 100vh;
    overflow: hidden;
    position: relative;
    background-color: #000000;
  }
  
  .screen-layout-wrapper:fullscreen {
    background-color: #000000;
    width: 100vw;
    height: 100vh;
  }

  .screen-container { 
    width: 100%;
    max-width: 600px;
    height: 100vh;
    padding: 15px 15px;
    display: flex; 
    flex-direction: column;
    overflow: hidden;
    box-sizing: border-box;
  }
  
  .content { 
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    overflow-y: auto;
  }

  .confirmation-text {
    font-size: 18px;
  }
</style>