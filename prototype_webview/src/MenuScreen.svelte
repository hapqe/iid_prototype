<script>
    export let hasEmergencies = false;
    export let menuItems = [];
    export let menuSelectedIndex = 0;
</script>

<h2 class="section-title">Ongoing emergencies</h2>

<div class="emergency-list">
    {#if !hasEmergencies}
        <div class="no-emergencies-text">No ongoing emergencies</div>
    {:else}
        {#each menuItems as item, index}
            {#if item.type === 'emergency'}
                <div class="full-width-wrapper {menuSelectedIndex === index ? 'active-selection' : ''}">
                    <div class="list-item">
                        <div class="item-left">
                            <div class="item-title">{item.title}</div>
                            <div class="item-details">{item.details}</div>
                        </div>
                        <div class="item-time">{item.time}</div>
                    </div>
                </div>
            {/if}
        {/each}
    {/if}
</div>

<nav class="navigation">
    {#each menuItems as item, index}
        {#if item.type === 'nav'}
            <div class="full-width-wrapper {menuSelectedIndex === index ? 'active-selection' : ''}">
                <div class="nav-item">{item.title}</div>
            </div>
        {/if}
    {/each}
</nav>

<style>
    .section-title {
        font-size: 20px; /* Reduced from 27px */
        font-weight: 700;
        margin: 0 0 15px 0; /* Reduced margin */
        letter-spacing: -0.5px;
    }

    .no-emergencies-text {
        font-size: 16px; /* Reduced from 25px */
        padding: 8px 0;
        margin-bottom: 10px;
    }

    .emergency-list {
        padding-left: 1rem; /* Reduced from 2rem */
        display: flex;
        flex-direction: column;
        margin-bottom: 30px; /* Reduced from 55px */
    }

    .navigation {
        display: flex;
        flex-direction: column;
        gap: 5px;
    }

    .list-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px 0px; /* Reduced padding */
    }

    .item-left {
        display: flex;
        flex-direction: column;
    }

    .item-title {
        font-size: 18px; /* Reduced from 25px */
        font-weight: 700;
        margin-bottom: 4px;
    }

    .item-details {
        font-size: 14px; /* Reduced from 20px */
    }

    .item-time {
        font-size: 14px; /* Reduced from 24px */
        font-style: italic;
    }

    .nav-item {
        font-size: 18px; /* Reduced from 26px */
        font-weight: 700;
        padding: 10px 0px; /* Reduced from 14px */
    }
</style>