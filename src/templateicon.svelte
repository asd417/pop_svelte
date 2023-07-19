<script lang="ts">
    import type { Template } from "./templateLoader";
    import Iconvisual from "./iconvisual.svelte";
    export let template: Template;
    let thisnode: HTMLElement;

    let isDragged = false;
    let startX = 0;
    let startY = 0;
    let endX = 0;
    let endY = 0;

    function loaded(node) {
        console.log("LOADED")
        thisnode = node;
        if(template.templateOrigin != ""){
            thisnode.setAttribute("classNum", template.classNum.toString());
            thisnode.setAttribute("isGiant", template.isGiant.toString());
            thisnode.setAttribute("templatename", template.getName());
        }
    }

    function handleDragStart(event:DragEvent) {
        // Store the initial coordinates of the draggable element
        startX = event.clientX;
        startY = event.clientY;
        isDragged = true;
        let dragged = event.target as HTMLElement
        event.dataTransfer.setData("templatename",template.getName())
        event.dataTransfer.setData("draggedID",dragged.id)
    }

    function handleDragEnd(event) {
        // Store the final coordinates of the draggable element
        endX = event.clientX;
        endY = event.clientY;
        isDragged = false;
    }

    //use:action to call function on element creation
</script>
<div class="TemplateIcon" style="display: inline-block;" id={Date.now().toString(36) + Math.random().toString(36).substring(2)} on:dragstart={handleDragStart} on:dragend={handleDragEnd} use:loaded draggable="true">
    <Iconvisual iconname={template.classIcon} isGiant={template.isGiant} alwaysCrit={template.alwaysCrit} templateorigin={""}/>
</div>

<style>
    @import "./global_styles.css";
</style>
