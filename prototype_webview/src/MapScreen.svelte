<script>
    // Which point of interest is centered. Controlled by the parent via the
    // up/down navigation (and confirm), so the control is consistent with the
    // rest of the device instead of relying on hidden key handling.
    export let focusIndex = 0;

    const MAP_W = 1600;
    const MAP_H = 1200;

    const locations = [
        {
            name: "Your location",
            sub: "Fritzbergerstraße 12",
            distance: "0 m",
            svgPath: "/you.svg",
            altText: "You are here",
            x: 500,
            y: 500
        },
        {
            name: "Destination",
            sub: "Bakerstreet 221b",
            distance: "500 m",
            svgPath: "/dest.svg",
            altText: "Destination",
            x: 700,
            y: 600
        }
    ];

    // Live viewport size so we can center the focused marker precisely
    let vpW = 0;
    let vpH = 0;

    $: focus = locations[focusIndex] ?? locations[0];

    // Center the focused marker, but clamp so the map always fills the viewport
    function clamp(v, min, max) {
        return Math.max(min, Math.min(max, v));
    }
    $: tx = clamp(vpW / 2 - focus.x, vpW - MAP_W, 0);
    $: ty = clamp(vpH / 2 - focus.y, vpH - MAP_H, 0);
</script>

<div class="map-screen">
    <div class="map-viewport" bind:clientWidth={vpW} bind:clientHeight={vpH}>
        <div
            class="map-container"
            style="width:{MAP_W}px; height:{MAP_H}px; transform: translate({tx}px, {ty}px);"
        >
            <img src="/map.png" alt="Map" />

            {#each locations as loc, i}
                <div class="marker" class:focused={i === focusIndex} style="left: {loc.x}px; top: {loc.y}px;">
                    <span class="ring"></span>
                    <img src={loc.svgPath} alt={loc.altText} class="marker-icon" />
                </div>
            {/each}
        </div>

        <!-- Fixed center reticle so it is obvious what is being focused -->
        <div class="reticle" aria-hidden="true"></div>
    </div>

    <div class="map-controls">
        <div class="focus-info">
            <span class="focus-name">{focus.name}</span>
            <span class="focus-sub">{focus.sub} · {focus.distance}</span>
        </div>

        <div class="focus-tabs">
            {#each locations as loc, i}
                <div class="focus-tab" class:active={i === focusIndex}>{loc.name}</div>
            {/each}
        </div>

        <div class="map-hint">Up / Down: switch view &nbsp;·&nbsp; Back: tasks</div>
        <div class="keyboard-hint">Slide down Keyboard to chat</div>
    </div>
</div>

<style>
    .map-screen {
        display: flex;
        flex-direction: column;
        flex-grow: 1;
        min-height: 0;
    }

    .map-viewport {
        flex-grow: 1;
        position: relative;
        overflow: hidden;
        width: 100%;
        border-radius: 8px;
        border: 1px solid var(--surface-border);
        background-color: var(--surface);
        transition: border-color 0.3s ease, background-color 0.3s ease;
    }

    .map-container {
        position: absolute;
        top: 0;
        left: 0;
        /* Smooth pan when switching focus */
        transition: transform 0.45s cubic-bezier(0.22, 1, 0.36, 1);
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
        width: 34px;
        height: 34px;
        margin-left: -17px;
        margin-top: -17px;
        pointer-events: none;
        z-index: 10;
        transition: transform 0.25s ease;
    }

    .marker.focused {
        transform: scale(1.25);
        z-index: 20;
    }

    .marker-icon {
        width: 100%;
        height: 100%;
        display: block;
    }

    /* Pulsing ring around the focused marker */
    .ring {
        position: absolute;
        width: 100%;
        height: 100%;
        border-radius: 50%;
        opacity: 0;
    }

    .marker.focused .ring {
        opacity: 1;
        box-shadow: 0 0 0 3px var(--accent);
        animation: pulse 1.6s ease-out infinite;
    }

    @keyframes pulse {
        0% { box-shadow: 0 0 0 0 var(--accent); opacity: 0.9; }
        100% { box-shadow: 0 0 0 16px transparent; opacity: 0; }
    }

    .reticle {
        position: absolute;
        top: 50%;
        left: 50%;
        width: 46px;
        height: 46px;
        margin-left: -23px;
        margin-top: -23px;
        border: 2px dashed var(--accent);
        border-radius: 50%;
        opacity: 0.5;
        pointer-events: none;
        z-index: 5;
    }

    .map-controls {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding-top: 14px;
    }

    .focus-info {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 2px;
        margin-bottom: 12px;
    }

    .focus-name {
        font-size: 22px;
        font-weight: 700;
        color: var(--accent);
        transition: color 0.3s ease;
    }

    .focus-sub {
        font-size: 16px;
        opacity: 0.85;
    }

    .focus-tabs {
        display: flex;
        gap: 10px;
        width: 100%;
        max-width: 420px;
    }

    .focus-tab {
        flex: 1;
        text-align: center;
        padding: 12px 8px;
        font-size: 17px;
        font-weight: 700;
        border-radius: 0;
        border: 1px solid var(--surface-border);
        color: var(--fg);
        background-color: transparent;
        transition: background-color 0.18s ease, color 0.18s ease, border-color 0.18s ease;
    }

    .focus-tab.active {
        background-color: var(--selection-bg);
        color: var(--selection-fg);
        border-color: var(--selection-bg);
    }

    .map-hint {
        font-size: 16px;
        color: var(--accent);
        text-align: center;
        margin-top: 14px;
        font-weight: 600;
        transition: color 0.3s ease;
    }
</style>
