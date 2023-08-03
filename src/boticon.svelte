<script lang="ts">
    import Iconvisual from "./iconvisual.svelte";
    import type { Template } from "./templateLoader";
    import type { WaveSpawn } from "./wavespawn";
    import { createEventDispatcher } from "svelte";

    export let wavespawn: WaveSpawn;
    export let bot: Template;
    export let index: number;
    export let editing: boolean;

    let thisbutton: HTMLButtonElement;

    $: {
        if (thisbutton != undefined) {
            if (editing) {
                thisbutton.style.backgroundColor = "#fcfae6";
            } else {
                thisbutton.style.backgroundColor = "";
            }
        }
    }

    const dispatch = createEventDispatcher();

    function handleDragStart(event: DragEvent) {
        // Store the initial coordinates of the draggable element
        event.dataTransfer.setData("wavespawnid", wavespawn.getID());
        event.dataTransfer.setData("botindex", index.toString());
    }

    function handleDragEnd(event) {}

    function botEditEvent() {
        dispatch("botEditEvent", { Bot: bot, Index: index });
        //thisbutton.style.backgroundColor = "#FFFF"
    }
    function removeBotEvent() {
        console.log("Removing bot at index", index)
        dispatch("removeBotEvent", { Index: index })
    }
</script>

<button
    on:dragstart={handleDragStart}
    on:dragend={handleDragEnd}
    on:click={botEditEvent}
    bind:this={thisbutton}
    draggable="true"
    class="blockEditorMove"
    style="position:relative"
    >
    <button class="close" on:click={removeBotEvent}></button>
    <Iconvisual template={bot}/>

</button>

<style>
    .close {
        position: absolute;
        left: 3px;
        top: 3px;
        width: 11px;
        height: 10px;
        opacity: 0.5;
        border: 0px;
        background-color: transparent;
        z-index: 2;
        pointer-events: all;
    }
    .close:hover {
        opacity: 1;
    }
    .close:before,
    .close:after {
        position: absolute;
        left: 5px;
        top: 2px;
        content: " ";
        height: 10px;
        width: 2px;
        background-color: #c7c7c7;
    }
    .close:before {
        transform: rotate(45deg);
    }
    .close:after {
        transform: rotate(-45deg);
    }
    .close:active {
        background-color: transparent;
    }
</style>
