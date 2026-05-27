<script>
  // Statischer Screen ohne reaktive Logik
</script>

<div class="details-screen">
  <div class="details-text-block">
    <p class="main-instruction">First responders need volunteers urgently to control the flood</p>
    <p class="location-block">
      Location: Bakerstreet 221b,<br>
      Vienna - 500m
    </p>
  </div>

  <div class="details-footer">
    <div class="full-width-wrapper active-selection">
      <div class="action-item text-center bold-text padded-btn show-tasks">Show tasks</div>
    </div>
    <div class="keyboard-hint">Slide down Keyboard to chat</div>
  </div>
</div>

<style>
  .show-tasks {
    font-size: 1.1rem; /* Reduced from 1.5rem */
  }
  .details-screen {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    flex-grow: 1;
  }
  .details-text-block {
    display: flex;
    flex-direction: column;
    gap: 20px; /* Reduced from 40px */
    padding-top: 15px;
  }
  .main-instruction, .location-block {
    font-size: 18px; /* Reduced from 26px */
    font-weight: 700;
    line-height: 1.3;
    margin: 0;
  }
  .details-footer {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 15px;
  }
  .padded-btn {
    padding: 12px 0; /* Reduced from 18px */
  }
</style>