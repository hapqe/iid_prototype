<script>
  export let time = "12:34";
  export let address = "Fritzbergerstraße 12";
</script>

<header class="header">
  <span class="clock">{time}</span>
  <div class="header-right">
    <span class="address">{address}</span>
    <svg class="battery-icon" viewBox="0 0 14 27" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 1H10V3H4V1Z" fill="currentColor" stroke="currentColor" stroke-width="0.5"/>
      <rect x="1" y="3" width="12" height="23" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.5"/>
      <rect x="3" y="5" width="8" height="3" fill="currentColor" />
      <rect x="3" y="9" width="8" height="3" fill="currentColor" />
      <rect x="3" y="13" width="8" height="3" fill="currentColor" />
      <rect x="3" y="17" width="8" height="3" fill="currentColor" />
      <rect x="3" y="21" width="8" height="3" fill="currentColor" />
    </svg>
  </div>
</header>

<style>
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px; /* Reduced from 50px */
  }
  .clock {
    font-size: 32px; /* Reduced from 54px */
    color: var(--accent);
    letter-spacing: -1px;
    line-height: 1;
    transition: color 0.3s ease;
  }
  .header-right {
    display: flex;
    align-items: center;
    gap: 10px; /* Reduced from 16px */
  }
  .address {
    font-size: 16px; /* Reduced from 26px */
    color: var(--accent);
    transition: color 0.3s ease;
  }
  .battery-icon {
    width: 12px; /* Reduced from 18px */
    height: 22px; /* Reduced from 32px */
    color: var(--accent); /* drives the SVG's currentColor */
    transition: color 0.3s ease;
  }
</style>