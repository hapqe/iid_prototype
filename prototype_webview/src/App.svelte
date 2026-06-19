<script>
  import { onMount, onDestroy } from 'svelte';
  import Header from './Header.svelte';
  import MenuScreen from './MenuScreen.svelte';
  import AlertScreen from './AlertScreen.svelte';
  import DetailsScreen from './DetailsScreen.svelte';
  import TasksScreen from './TasksScreen.svelte';
  import MapScreen from './MapScreen.svelte';
  import ChatScreen from './ChatScreen.svelte';
  import SettingsScreen from './SettingsScreen.svelte';

  let wrapperElement;

  let currentScreen = 'menu';
  let previousScreen = 'menu';
  let hasEmergencies = false;
  let sandbagCount = 3;
  let shovelCount = 1;
  let menuSelectedIndex = 0;
  let popupSelectedIndex = 0;
  let tasksSelectedIndex = 2;
  let settingsSelectedIndex = 0;
  
  // Track physical slide state manually to gate input access
  let isHardwareKeyboardOpen = false;
  let settingsData = {
    firstAid: true,
    heavyLabor: true,
    personSearch: true,
    otherEmergencies: false,
    name: "Jonathan",
    ringtone: "Standard"
  };
  let hasSeenPopup = false;
  let hasSeenDetails = false;

  let chatMessages = [];
  let currentTypedMessage = '';

  let socket;
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
  const totalSettingsCount = 6;

  async function turnOnFlashlight() {
    try {
      if (!videoStream) {
        videoStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' } }
        });
        videoTrack = videoStream.getVideoTracks()[0];
      }

      const capabilities = videoTrack.getCapabilities();
      if ('torch' in capabilities) {
        await videoTrack.applyConstraints({ advanced: [{ torch: true }] });
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
        await videoTrack.applyConstraints({ advanced: [{ torch: false }] });
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
    } else if (currentScreen === 'settings') {
      settingsSelectedIndex = (settingsSelectedIndex - 1 + totalSettingsCount) % totalSettingsCount;
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
    } else if (currentScreen === 'settings') {
      settingsSelectedIndex = (settingsSelectedIndex + 1) % totalSettingsCount;
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

  // Refactored helper targeting explicit opening events
  function handleOpenKeyboard() {
    if (currentScreen === 'settings') {
      isHardwareKeyboardOpen = true;
      return;
    }
    if (currentScreen !== 'chat') {
      previousScreen = currentScreen;
      currentScreen = 'chat';
    }
    isHardwareKeyboardOpen = true;
  }

  // Refactored helper targeting explicit closing events
  function handleCloseKeyboard() {
    if (currentScreen === 'settings') {
      isHardwareKeyboardOpen = false;
      return;
    }
    if (currentScreen === 'chat') {
      currentScreen = previousScreen;
    }
    isHardwareKeyboardOpen = false;
  }

  // Explicit typing pipeline implementation 
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

  function handleKeyDown(event, isRemote = false) {
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
        currentTypedMessage += rawKey;
      }
      return;
    }

    // Capture text input on settings fields ONLY if the hardware slider is open
    if (currentScreen === 'settings' && isHardwareKeyboardOpen && (settingsSelectedIndex === 4 || settingsSelectedIndex === 5)) {
      const rawKey = event.key;
      const targetField = settingsSelectedIndex === 4 ? 'name' : 'ringtone';
      
      // If it is the remote emulated keyboard, it ignores navigation completely and types everything
      if (isRemote) {
        if (rawKey === 'Backspace') {
          if (event.preventDefault) event.preventDefault();
          settingsData[targetField] = settingsData[targetField].slice(0, -1);
          return;
        } else if (rawKey && rawKey.length === 1) {
          if (event.preventDefault) event.preventDefault();
          settingsData[targetField] += rawKey;
          return;
        }
      } else {
        // Native local device keyboard: Pass control/navigation keys through so layout remains responsive
        if (rawKey !== 'Escape' && rawKey !== 'ArrowUp' && rawKey !== 'ArrowDown' && 
            rawKey.toLowerCase() !== 'w' && rawKey.toLowerCase() !== 's') {
          
          if (rawKey === 'Backspace') {
            if (event.preventDefault) event.preventDefault();
            settingsData[targetField] = settingsData[targetField].slice(0, -1);
          } else if (rawKey && rawKey.length === 1) {
            if (event.preventDefault) event.preventDefault();
            settingsData[targetField] += rawKey;
          }
          return;
        }
      }
    }

    // --- NAVIGATION GUARD ---
    // Emulated keyboard (isRemote = true) exits early here and cannot perform navigation
    if (isRemote) return;
    const key = event.key.toLowerCase();
    if (key === 'f') {
      if (event.preventDefault) event.preventDefault();
      turnOnFlashlight();
      return;
    } else if (key === 'g') {
      if (event.preventDefault) event.preventDefault();
      turnOffFlashlight();
      return;
    }

    if (key === 'w' || key === 'arrowup') {
      navigateUp();
      return;
    } else if (key === 's' || key === 'arrowdown') {
      navigateDown();
      return;
    }
    
    if (currentScreen === 'menu') { 
      if (key === 'd' || key === 'enter') {
        if (event.preventDefault) event.preventDefault();
        const selectedItem = menuItems[menuSelectedIndex];
        if (selectedItem?.type === 'emergency') {
          if (hasSeenPopup && hasSeenDetails) {
            currentScreen = 'tasks';
            tasksSelectedIndex = 2;
          } else {
            currentScreen = 'popup';
            popupSelectedIndex = 0;
          }
        } else if (selectedItem?.title === 'Settings') {
          currentScreen = 'settings';
          settingsSelectedIndex = 0;
        }
      }
    }
    
    else if (currentScreen === 'popup') { 
      if (key === 'd') {
        if (event.preventDefault) event.preventDefault();
        if (popupSelectedIndex === 0) {
          hasSeenPopup = true;
          currentScreen = 'details';
        } else if (popupSelectedIndex === 1) {
          currentScreen = 'exit-confirmation';
        }
      } else if (key === 'a') {
        if (event.preventDefault) event.preventDefault();
        currentScreen = 'menu'; 
        menuSelectedIndex = 0;
      }
    }

    else if (currentScreen === 'settings') {
      if (key === 'd' || key === 'enter') {
        if (event.preventDefault) event.preventDefault();
        if (settingsSelectedIndex === 0) settingsData.firstAid = !settingsData.firstAid;
        if (settingsSelectedIndex === 1) settingsData.heavyLabor = !settingsData.heavyLabor;
        if (settingsSelectedIndex === 2) settingsData.personSearch = !settingsData.personSearch;
        if (settingsSelectedIndex === 3) settingsData.otherEmergencies = !settingsData.otherEmergencies;
      } else if (key === 'a' || key === 'escape') {
        if (event.preventDefault) event.preventDefault();
        currentScreen = 'menu';
        menuSelectedIndex = hasEmergencies ? 2 : 1;
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
    window.addEventListener('keydown', (e) => handleKeyDown(e, false));
    window.addEventListener('click', handleFirstClick);

    // Connect to the hub over the SAME origin as the page using a /ws path.
    // - Locally: Vite proxies /ws -> ws://localhost:7777 (see vite.config.js)
    // - On the server: nginx proxies /ws -> 127.0.0.1:7777
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';

    socket = new WebSocket(`${wsProtocol}//${window.location.host}/ws?from=3000`);

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'toggleEmergency') {
          triggerEmergencyState();
          return;
        }

        // Processing explicit orientation values routed via the Central ws system hub
        if (data.value === 'openKeyboard') {
          handleOpenKeyboard();
          return;
        }

        if (data.value === 'closeKeyboard') {
          handleCloseKeyboard();
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
        }, true);
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
    
    if (videoTrack) videoTrack.stop();
    if (videoStream) videoStream.getTracks().forEach(track => track.stop());
    
    if (socket) {
      socket.close();
    }
  });
</script>

<div bind:this={wrapperElement} class="screen-layout-wrapper">
  <div class="screen-container"> 
    <Header address="Fritzbergerstraße 12" />

    <main class="content">
      {#if currentScreen === 'menu'} 
        <MenuScreen {hasEmergencies} {menuSelectedIndex} {menuItems} />
      {:else if currentScreen === 'popup'} 
        <AlertScreen {popupSelectedIndex} />
      {:else if currentScreen === 'settings'}
        <SettingsScreen {settingsSelectedIndex} bind:settingsData />
      {:else if currentScreen === 'exit-confirmation'}
        <div class="confirmation-screen">
          <div class="confirmation-banner">
            <p class="confirmation-text">You are trying to exit the emergency.<br>Proceed?</p>
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

  .confirmation-screen {
    display: flex;
    flex-direction: column;
    align-items: center;
    height: 100%;
    color: #ffffff;
    font-family: 'Inter', sans-serif;
  }

  .confirmation-banner {
    background-color: #80f5ff; /* Cyan banner color */
    color: #000000; /* Black banner text */
    width: calc(100% + 30px);
    margin-left: -15px;
    padding: 24px 20px;
    box-sizing: border-box;
    margin-top: 15px;
  }

  .confirmation-text {
    font-size: 26px;
    font-weight: 700;
    line-height: 1.3;
    margin: 0;
  }

  .keyboard-hint {
    font-size: 20px;
    color: #ffffff;
    margin-top: auto; /* Push down towards keyboard boundary */
    margin-bottom: 35px;
    font-weight: 400;
  }
</style>