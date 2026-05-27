<script>
  export let settingsSelectedIndex = 0;
  export let settingsData = {
    firstAid: true,
    heavyLabor: true,
    personSearch: true,
    otherEmergencies: false,
    name: "Jonathan",
    ringtone: "Standard"
  };

  // 1. Create an array to hold references to the DOM elements
  let elements = [];

  // 2. Reactively scroll the selected element into view whenever index changes
  $: if (elements[settingsSelectedIndex]) {
    elements[settingsSelectedIndex].scrollIntoView({
      behavior: 'smooth',
      block: 'nearest' // Ensures it only scrolls if out of view, avoiding jarring jumps
    });
  }
</script>

<div class="settings-screen">
  <div class="settings-group">
    <h3 class="group-title">Alert Categories</h3>
    
    <div 
      bind:this={elements[0]} 
      class="full-width-wrapper {settingsSelectedIndex === 0 ? 'active-selection' : ''}"
    >
      <div class="setting-row">
        <span>First aid</span>
        <span class="value-text">{settingsData.firstAid ? 'on' : 'off'}</span>
      </div>
    </div>
    
    <div 
      bind:this={elements[1]} 
      class="full-width-wrapper {settingsSelectedIndex === 1 ? 'active-selection' : ''}"
    >
      <div class="setting-row">
        <span>Heavy labor</span>
        <span class="value-text">{settingsData.heavyLabor ? 'on' : 'off'}</span>
      </div>
    </div>
    
    <div 
      bind:this={elements[2]} 
      class="full-width-wrapper {settingsSelectedIndex === 2 ? 'active-selection' : ''}"
    >
      <div class="setting-row">
        <span>Person search</span>
        <span class="value-text">{settingsData.personSearch ? 'on' : 'off'}</span>
      </div>
    </div>
    
    <div 
      bind:this={elements[3]} 
      class="full-width-wrapper {settingsSelectedIndex === 3 ? 'active-selection' : ''}"
    >
      <div class="setting-row">
        <span>Other emergencies</span>
        <span class="value-text">{settingsData.otherEmergencies ? 'on' : 'off'}</span>
      </div>
    </div>
  </div>

  <div class="settings-group">
    <h3 class="group-title">Misc Settings</h3>
    
    <div 
      bind:this={elements[4]} 
      class="full-width-wrapper {settingsSelectedIndex === 4 ? 'active-selection' : ''}"
    >
      <div class="setting-row">
        <span>Name</span>
        <span class="value-text typeable-field">
          {settingsData.name}<span class="cursor {settingsSelectedIndex === 4 ? 'visible' : ''}">|</span>
        </span>
      </div>
    </div>
    
    <div 
      bind:this={elements[5]} 
      class="full-width-wrapper {settingsSelectedIndex === 5 ? 'active-selection' : ''}"
    >
      <div class="setting-row">
        <span>Ringtone</span>
        <span class="value-text typeable-field">
          {settingsData.ringtone}<span class="cursor {settingsSelectedIndex === 5 ? 'visible' : ''}">|</span>
        </span>
      </div>
    </div>
  </div>
</div>

<style>
  .settings-screen {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    color: #ffffff;
    font-family: sans-serif;
    
    /* Crucial change: Ensure the container can scroll if content overflows */
    overflow-y: auto; 
    max-height: 100%; /* Or a specific height like 400px depending on layout */
  }

  .settings-group {
    margin-bottom: 20px;
  }

  .group-title {
    font-size: 18px;
    font-weight: 700;
    margin: 10px 0;
    color: #ffffff;
  }

  .setting-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 10px;
    font-size: 18px;
    background-color: transparent;
    width: 100%;
    box-sizing: border-box;
  }

  .value-text {
    font-weight: 400;
  }

  .typeable-field {
    display: inline-flex;
    align-items: center;
  }

  .cursor {
    display: none;
    color: #5CE1E6;
    margin-left: 2px;
    animation: blink 1s infinite;
  }

  .cursor.visible {
    display: inline;
  }

  @keyframes blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0; }
  }
</style>