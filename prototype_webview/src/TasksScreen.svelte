<script>
  export let tasksSelectedIndex = 0;
  export let sandbagCount = 3;
  export let shovelCount = 1;

  // Reaktive Berechnung: Basiswert + das, was du bereitstellst
  $: totalSandbagsDelivered = 5 + sandbagCount;
  $: totalShovelsDelivered = 0 + shovelCount;
</script>

<div class="tasks-screen">
  <div class="tasks-table">
    <div class="table-row {tasksSelectedIndex === 0 ? 'focused-row active-selection' : ''}">
      <span class="item-name">Sandbag</span>
      <span class="user-provide">you provide: <strong>{sandbagCount}</strong></span>
      <span class="status-info">delivered: {totalSandbagsDelivered}/20 en route: 5</span>
    </div>

    <div class="table-row {tasksSelectedIndex === 1 ? 'focused-row active-selection' : ''}">
      <span class="item-name">Shovel</span>
      <span class="user-provide">you provide: <strong>{shovelCount}</strong></span>
      <span class="status-info">delivered: {totalShovelsDelivered}/1 en route: 0</span>
    </div>
  </div>

  <div class="tasks-footer">
    <div class="full-width-wrapper {tasksSelectedIndex === 2 ? 'active-selection' : ''}">
      <div class="action-item text-center bold-text padded-btn">Accept & Show map</div>
    </div>
    <div class="keyboard-hint">Slide down Keyboard to chat</div>
  </div>
</div>

<style>
  .tasks-screen {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    flex-grow: 1;
    padding-top: 15px;
  }

  .tasks-table {
    display: flex;
    flex-direction: column;
    gap: 20px; /* Reduced from 45px */
    padding-left: 0.5rem; /* Reduced padding */
    padding-right: 0.5rem;
  }

  .table-row {
    display: grid;
    /* Grid structure adapted for mobile widths */
    grid-template-columns: 80px 120px 1fr; 
    align-items: center;
    font-size: 14px; /* Reduced from 24px */
    padding: 10px 15px; /* Reduced padding */
    margin-left: -15px;
    margin-right: -15px;
    box-sizing: border-box;
    background-color: transparent;
  }

  .tasks-footer {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 15px;
  }

  .action-item {
    font-size: 18px; /* Reduced from 24px */
  }

  .padded-btn {
    padding: 12px 0; /* Reduced from 18px */
  }

  .item-name {
    font-weight: 700;
  }

  .status-info {
    text-align: right;
    font-size: 12px; /* Smaller sub-text for fitting */
  }
</style>