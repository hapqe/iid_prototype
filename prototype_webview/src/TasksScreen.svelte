<script>
  export let tasksSelectedIndex = 0;
  export let sandbagCount = 3;
  export let shovelCount = 1;
  // True while the user is editing the amount of the selected resource
  export let isAdjustingQuantity = false;

  // Reaktive Berechnung: Basiswert + das, was du bereitstellst
  $: totalSandbagsDelivered = 5 + sandbagCount;
  $: totalShovelsDelivered = 0 + shovelCount;

  $: resources = [
    {
      name: 'Sandbag',
      count: sandbagCount,
      status: `delivered: ${totalSandbagsDelivered}/20 · en route: 5`
    },
    {
      name: 'Shovel',
      count: shovelCount,
      status: `delivered: ${totalShovelsDelivered}/1 · en route: 0`
    }
  ];
</script>

<div class="tasks-screen">
  <div class="tasks-table">
    {#each resources as res, i}
      {@const isFocused = tasksSelectedIndex === i}
      {@const isEditing = isFocused && isAdjustingQuantity}
      <div class="table-row {isFocused ? 'focused-row active-selection' : ''} {isEditing ? 'editing' : ''}">
        <div class="row-main">
          <span class="item-name">{res.name}</span>
          <div class="provide">
            <span class="provide-label">you provide</span>
            <div class="count-box" class:editing={isEditing}>
              {#if isEditing}<span class="chevron">▲</span>{/if}
              <span class="count">{res.count}</span>
              {#if isEditing}<span class="chevron">▼</span>{/if}
            </div>
          </div>
        </div>
        <div class="status-info">{res.status}</div>
      </div>
    {/each}
  </div>

  <div class="tasks-footer">
    <div class="full-width-wrapper {tasksSelectedIndex === 2 ? 'active-selection' : ''}">
      <div class="action-item text-center bold-text padded-btn">Accept &amp; Show map</div>
    </div>

    <div class="mode-hint">
      {#if isAdjustingQuantity}
        Up / Down: change amount &nbsp;·&nbsp; Confirm: save
      {:else if tasksSelectedIndex === 2}
        Confirm: accept &amp; open map
      {:else}
        Confirm: edit amount &nbsp;·&nbsp; Up / Down: navigate
      {/if}
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
    gap: 18px;
    padding-left: 0.5rem;
    padding-right: 0.5rem;
  }

  .table-row {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 16px 15px;
    margin-left: -15px;
    margin-right: -15px;
    box-sizing: border-box;
    background-color: transparent;
    border-radius: 4px;
  }

  .row-main {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
  }

  /* Larger text on the resource screen for better readability */
  .item-name {
    font-weight: 700;
    font-size: 26px;
  }

  .provide {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .provide-label {
    font-size: 18px;
    opacity: 0.85;
  }

  .count-box {
    display: flex;
    flex-direction: column;
    align-items: center;
    line-height: 1;
    min-width: 2.2ch;
    padding: 2px 10px;
    border-radius: 8px;
    transition: background-color 0.18s ease, box-shadow 0.18s ease, transform 0.18s ease;
  }

  /* Highlight the editable number while in edit mode. The selected row paints
     descendant text with the selection color, so we force a contrasting pill. */
  .count-box.editing {
    background-color: var(--bg);
    box-shadow: 0 0 0 2px var(--accent) inset;
    transform: scale(1.08);
  }

  .count-box.editing .count,
  .count-box.editing .chevron {
    color: var(--fg) !important;
  }

  .count {
    font-size: 30px;
    font-weight: 700;
  }

  .chevron {
    font-size: 14px;
    line-height: 1;
    opacity: 0.9;
    animation: nudge 1.1s ease-in-out infinite;
  }

  @keyframes nudge {
    0%, 100% { opacity: 0.45; }
    50% { opacity: 1; }
  }

  .status-info {
    font-size: 17px;
    opacity: 0.8;
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
    padding: 16px 0;
  }

  .mode-hint {
    font-size: 17px;
    color: var(--accent);
    text-align: center;
    margin-top: 16px;
    font-weight: 600;
    transition: color 0.3s ease;
  }
</style>
