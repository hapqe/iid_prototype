<script>
  export let popupSelectedIndex = 0;
</script>

<div class="alert-screen"> 
  <div class="alert-header"> 
    <h1>INCOMING ALERT -<br>Heavy Labor</h1> 
    <p class="distance-italic">500m</p> 
  </div> 
  <div class="alert-actions"> 
    <div class="full-width-wrapper {popupSelectedIndex === 0 ? 'active-selection' : ''}"> 
      <div class="action-item text-center bold-text">Show Information</div> 
    </div> 
    <div class="full-width-wrapper {popupSelectedIndex === 1 ? 'active-selection' : ''}"> 
      <div class="action-item text-center bold-text">Mute</div> 
    </div> 
  </div> 
</div>

<style>
  .alert-screen {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    flex-grow: 1;
    padding-top: 10px;
  }
  .alert-header h1 {
    font-size: 38px;
    font-weight: 700;
    line-height: 1.2;
    margin: 0 0 30px 0;
    text-transform: uppercase;
  }
  .distance-italic {
    font-size: 26px;
    font-style: italic;
    margin: 0;
  }
  .alert-actions {
    display: flex;
    flex-direction: column;
    gap: 15px;
    margin-bottom: 60px;
  }
  .action-item {
    font-size: 24px;
    padding: 14px 0;
  }
</style>