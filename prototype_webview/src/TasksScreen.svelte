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
    /* Horizontales Padding entfernt -> Wird jetzt komplett von der app.css übernommen */
  }

  .tasks-table {
    display: flex;
    flex-direction: column;
    gap: 45px; 
    padding-left: 1rem;
    padding-right: 1rem;
  }

  .table-row {
    display: grid;
    grid-template-columns: 180px 180px 1fr;
    align-items: center;
    font-size: 24px;
    padding: 16px 30px;
    margin-left: -30px;
    margin-right: -30px;
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
    font-size: 24px;
  }

  .padded-btn {
    padding: 18px 0;
  }

  .item-name {
    font-weight: 700;
  }

  .status-info {
    text-align: right;
  }
</style>