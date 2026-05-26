<script>
  import { onMount, onDestroy } from 'svelte';
  import Header from './Header.svelte';
  import MenuScreen from './MenuScreen.svelte';
  import AlertScreen from './AlertScreen.svelte';
  import DetailsScreen from './DetailsScreen.svelte';
  import TasksScreen from './TasksScreen.svelte';
  import MapScreen from './MapScreen.svelte';
  import ChatScreen from './ChatScreen.svelte';

  let currentScreen = 'menu';
  let previousScreen = 'menu';
  let hasEmergencies = false;

  let sandbagCount = 3;
  let shovelCount = 1;
  let menuSelectedIndex = 0; 
  let popupSelectedIndex = 0;
  let tasksSelectedIndex = 2;

  // Chat state
  let chatMessages = [];
  let currentTypedMessage = ''; 

  let socket;

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
    currentScreen = 'popup';
  }

  function sendChatMessage() {
    if (currentTypedMessage.trim() !== '') {
      chatMessages = [...chatMessages, { author: 'Me', text: currentTypedMessage }];
      currentTypedMessage = '';
    }
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

    // --- Standard Navigation Mode ---
    const key = event.key.toLowerCase();
    if (key === 'w') {
      navigateUp();
    } else if (key === 's') {
      navigateDown();
    }
    
    else if (currentScreen === 'menu') { 
      // REMOVED: Spacebar trigger condition from here
      if (key === 'd') {
        if (event.preventDefault) event.preventDefault();
        if (hasEmergencies && menuSelectedIndex === 0) {
          currentScreen = 'tasks';
          tasksSelectedIndex = 2; 
        }
      }
    }
    
    else if (currentScreen === 'popup') { 
      if (key === 'd') { 
        if (event.preventDefault) event.preventDefault();
        currentScreen = 'details';
      } else if (key === 'a') { 
        if (event.preventDefault) event.preventDefault();
        currentScreen = 'exit-confirmation'; 
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
        currentScreen = 'tasks'; 
        tasksSelectedIndex = 2; 
      } else if (key === 'a' || key === 'escape') { 
        if (event.preventDefault) event.preventDefault();
        currentScreen = 'menu'; 
        menuSelectedIndex = 0; 
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
      
      else if (tasksSelectedIndex === 2 && key === 'd') { 
        if (event.preventDefault) event.preventDefault();
        currentScreen = 'map'; 
      }
      
      else if (key === 'escape') { 
        if (event.preventDefault) event.preventDefault();
        currentScreen = 'menu';
        menuSelectedIndex = 0;
      }
    }

    else if (currentScreen === 'map') { 
        if (key === 'd' || key === ' ' || key === 'spacebar') {
            if (event.preventDefault) event.preventDefault();
            currentScreen = 'menu'; 
            menuSelectedIndex = 0;
        } else if (key === 'escape' || key === 'a') { 
            if (event.preventDefault) event.preventDefault();
            currentScreen = 'tasks'; 
            tasksSelectedIndex = 2; 
        }
    }
  }

  onMount(() => {
    window.addEventListener('keydown', handleKeyDown); 
    socket = new WebSocket('ws://localhost:7777');

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        // Handle explicit server terminal action
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
    if (socket) {
      socket.close();
    }
  });
</script>

<div class="screen-layout-wrapper">
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
    width: 100vw;
    height: 100vh;
    overflow: hidden;
    position: relative;
    background-color: #000000;
  }
  .screen-container { 
    flex-grow: 1;
    height: 100vh;
    padding: 35px 30px; 
    display: flex; 
    flex-direction: column; 
    overflow: hidden;
  }
  .content { 
    display: flex;
    flex-direction: column; 
    flex-grow: 1; 
    overflow-y: auto;
  }
</style>