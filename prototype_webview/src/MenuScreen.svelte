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
        font-size: 27px;
        font-weight: 700;
        margin: 0 0 25px 0;
        letter-spacing: -0.5px;
    }

    .no-emergencies-text {
        font-size: 25px;
        padding: 12px 0;
        margin-bottom: 10px;
    }

    .emergency-list {
      padding-left: 2rem;
        display: flex;
        flex-direction: column;
        margin-bottom: 55px;
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
        padding: 12px 0px;
    }

    .item-left {
        display: flex;
        flex-direction: column;
    }

    .item-title {
        font-size: 25px;
        font-weight: 700;
        margin-bottom: 4px;
    }

    .item-details {
        font-size: 20px;
    }

    .item-time {
        font-size: 24px;
        font-style: italic;
    }

    .nav-item {
        font-size: 26px;
        font-weight: 700;
        padding: 14px 0px;
    }
</style>