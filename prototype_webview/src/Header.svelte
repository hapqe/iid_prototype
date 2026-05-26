<script>
  export let time = "12:34";
  export let address = "Fritzbergerstraße 12";
</script>

<header class="header">
  <span class="clock">{time}</span>
  <div class="header-right">
    <span class="address">{address}</span>
    <svg class="battery-icon" viewBox="0 0 14 27" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 1H10V3H4V1Z" fill="#5CE1E6" stroke="#5CE1E6" stroke-width="0.5"/>
      <rect x="1" y="3" width="12" height="23" rx="1.5" stroke="#5CE1E6" stroke-width="1.5"/>
      <rect x="3" y="5" width="8" height="3" fill="#5CE1E6" />
      <rect x="3" y="9" width="8" height="3" fill="#5CE1E6" />
      <rect x="3" y="13" width="8" height="3" fill="#5CE1E6" />
      <rect x="3" y="17" width="8" height="3" fill="#5CE1E6" />
      <rect x="3" y="21" width="8" height="3" fill="#5CE1E6" />
    </svg>
  </div>
</header>

<style>
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 50px;
  }
  .clock {
    font-size: 54px;
    color: #5CE1E6;
    letter-spacing: -1px;
    line-height: 1;
  }
  .header-right {
    display: flex;
    align-items: center;
    gap: 16px;
  }
  .address {
    font-size: 26px;
    color: #5CE1E6;
  }
  .battery-icon {
    width: 18px;
    height: 32px;
  }
</style>