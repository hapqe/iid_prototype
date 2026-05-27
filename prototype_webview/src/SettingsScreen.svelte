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
</script>

<div class="settings-screen">
  <div class="settings-group">
    <h3 class="group-title">Alert Categories</h3>
    
    <div class="full-width-wrapper {settingsSelectedIndex === 0 ? 'active-selection' : ''}">
      <div class="setting-row">
        <span>First aid</span>
        <span class="value-text">{settingsData.firstAid ? 'on' : 'off'}</span>
      </div>
    </div>
    
    <div class="full-width-wrapper {settingsSelectedIndex === 1 ? 'active-selection' : ''}">
      <div class="setting-row">
        <span>Heavy labor</span>
        <span class="value-text">{settingsData.heavyLabor ? 'on' : 'off'}</span>
      </div>
    </div>
    
    <div class="full-width-wrapper {settingsSelectedIndex === 2 ? 'active-selection' : ''}">
      <div class="setting-row">
        <span>Person search</span>
        <span class="value-text">{settingsData.personSearch ? 'on' : 'off'}</span>
      </div>
    </div>
    
    <div class="full-width-wrapper {settingsSelectedIndex === 3 ? 'active-selection' : ''}">
      <div class="setting-row">
        <span>Other emergencies</span>
        <span class="value-text">{settingsData.otherEmergencies ? 'on' : 'off'}</span>
      </div>
    </div>
  </div>

  <div class="settings-group">
    <h3 class="group-title">Misc Settings</h3>
    
    <div class="full-width-wrapper {settingsSelectedIndex === 4 ? 'active-selection' : ''}">
      <div class="setting-row">
        <span>Name</span>
        <span class="value-text typeable-field">
          {settingsData.name}<span class="cursor {settingsSelectedIndex === 4 ? 'visible' : ''}">|</span>
        </span>
      </div>
    </div>
    
    <div class="full-width-wrapper {settingsSelectedIndex === 5 ? 'active-selection' : ''}">
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