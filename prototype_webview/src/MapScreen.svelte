<script>
    import { onMount, onDestroy } from 'svelte';

    let currentLocationIndex = 0;

    const locations = [
        {
            name: "Location A",
            svgPath: "/you.svg",
            altText: "You are here",
            x: 500, 
            y: 500,
            mapOffsetX: -300, 
            mapOffsetY: -350
        },
        {
            name: "Location B",
            svgPath: "/dest.svg",
            altText: "Destination",
            x: 700,
            y: 600,
            mapOffsetX: -100, 
            mapOffsetY: -250
        }
    ];

    $: currentLocation = locations[currentLocationIndex];

    function handleKeyDown(event) {
        const key = event.key.toLowerCase();

        if (key === 'w' || key === 'arrowup' || key === 's' || key === 'arrowdown') {
            event.preventDefault();
            currentLocationIndex = 1 - currentLocationIndex;
        }
    }

    onMount(() => {
        window.addEventListener('keydown', handleKeyDown);
    });

    onDestroy(() => {
        window.removeEventListener('keydown', handleKeyDown);
    });

</script>

<div class="map-screen">
    <div class="map-viewport">
        <div class="map-container" style="transform: translate({currentLocation.mapOffsetX}px, {currentLocation.mapOffsetY}px);">
            <img src="/map.png" alt="Map" />
            
            {#each locations as loc}
                <div class="marker" style="left: {loc.x}px; top: {loc.y}px;">
                    <img src={loc.svgPath} alt={loc.altText} class="marker-icon" />
                </div>
            {/each}
        </div>
    </div>

    <div class="map-footer">
        <div class="instruction">Press confirm to toggle map focus</div>
        <div class="keyboard-hint">Slide down Keyboard to chat</div>
    </div>
</div>

<style>
    .map-screen {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        flex-grow: 1;
        align-items: center;
    }

    .map-viewport {
        flex-grow: 1;
        position: relative;
        overflow: hidden;
        width: 90%; /* Increased from 60% for better mobile fill */
    }

    .map-container {
        position: absolute;
        width: 1600px;
        height: 1200px;
    }

    .map-container img {
        width: 100%;
        height: 100%;
        display: block;
    }

    .marker {
        position: absolute;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 32px;  /* Reduced from 48px */
        height: 32px; /* Reduced from 48px */
        margin-left: -16px; /* Updated offset */ 
        margin-top: -16px; /* Updated offset */
        pointer-events: none;
        z-index: 10;
    }

    .marker-icon {
        width: 100%;  
        height: 100%; 
        display: block;
    }

    .map-footer {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 15px 0; /* Reduced from 20px */
    }

    .instruction {
        font-size: 16px; /* Reduced from 26px */
        margin-bottom: 15px; /* Reduced from 25px */
    }
</style>