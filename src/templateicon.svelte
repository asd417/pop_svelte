<script lang="ts">
    import type { Template } from "./templateLoader";
    import Iconvisual from "./iconvisual.svelte";
    import { compute_rest_props } from "svelte/internal";
    export let template: Template;
    let thisnode: HTMLElement;
    //let iconvisual: Iconvisual;

    let isDragged = false;
    let startX = 0;
    let startY = 0;
    let endX = 0;
    let endY = 0;

    let nametagdiv: HTMLDivElement;
    let nametagboxsize
    let tagx = 0;
    let tagy = 0;

    let showname : string = "hidden"

    function loaded(node) {
        //console.log("IS TANK:", template.isTank)
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
        nametagdiv.style.visibility = "hidden"
        nametagdiv.style.width = "0px"
        //event.dataTransfer.setDragImage(,50,50)
    }

    function handleDragEnd(event) {
        // Store the final coordinates of the draggable element
        endX = event.clientX;
        endY = event.clientY;
        isDragged = false;
        nametagdiv.style.width = ""
    }
    function showName(event){
        showname = "visible"
        //console.log(nametagdiv, nametagdiv.style)
        //console.log(event.pageX, event.pageY)
        //console.log(window.innerWidth, " - ", nametagboxsize)

        let left_adjusted = Math.min(event.pageX, window.innerWidth - nametagboxsize.width - 50)
        nametagdiv.style.left = left_adjusted.toString()+"px";
        nametagdiv.style.top = (event.pageY + 15).toString()+"px";
        nametagdiv.style.width = ""
        //console.log(nametagdiv.style.left, nametagdiv.style.top)
    }
    function moveName(event){
        let left_adjusted = Math.min(event.pageX, window.innerWidth - nametagboxsize.width - 50)
        nametagdiv.style.left = left_adjusted.toString()+"px";
        nametagdiv.style.top = (event.pageY + 15).toString() +"px";
        nametagdiv.style.width = ""
    }
    function hideName(event){
        showname = "hidden"
        nametagdiv.style.left = "0px"
        nametagdiv.style.top = "0px"
        //console.log(tagx,tagy)
    }

    //use:action to call function on element creation
</script>

<div class="TemplateIcon" style="display: inline-block;" 
    id={Date.now().toString(36) + Math.random().toString(36).substring(2)} 
    on:dragstart={handleDragStart} 
    on:dragend={handleDragEnd} 
    on:mouseover={showName}
    on:mousemove={moveName}
    on:mouseleave={hideName}
    on:focus={showName}
    on:focusout={hideName}
    use:loaded draggable="true"
    >
    <div bind:this={nametagdiv} 
        style="visibility:{showname}"
        class="NameTag"
        bind:contentRect={nametagboxsize}
        > 
        {template.name}
    </div>
    
    <Iconvisual isgatebot={template.isGatebot} iconname={template.classIcon} isGiant={template.isGiant} alwaysCrit={template.alwaysCrit} templateorigin={""}/>
</div>

<style>
    @import "./global_styles.css";

    .NameTag {
        position:absolute;
        top:0px;
        left:0px;
        z-index: 10;
        padding: 5px;
        background-color: #4f4f4f;
        color: #FFFFF2;
        border-radius: 14px;
        pointer-events: none;
    }
</style>
