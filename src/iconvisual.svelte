<script lang="ts">
    import { STATICACCESS } from "./App.svelte";
    import { Template } from "./templateLoader";
    export let iconname: String
    export let isGiant: boolean
    export let alwaysCrit: boolean
    export let templateorigin: string
    export let isgatebot: boolean

    let thisnode : HTMLElement
    
    export const updateIcon = onUpdateIcon
    
    function loaded(node: HTMLElement)
    {
        thisnode = node
        onUpdateIcon()
    }
    $ : {
        // This console.log call allows svelte to track the changes in these variables. Therefore it should not be commented out lol
        console.log("Icon updated", templateorigin, iconname, alwaysCrit, isGiant, isgatebot)
        onUpdateIcon()
    }
    //console.log("Icon updated", iconname, alwaysCrit, isGiant)
    function onUpdateIcon(){
        //console.log("On Update Icon:", iconname, alwaysCrit, isGiant)
        if(templateorigin != ""){
            //console.log(`Icon for template: ${templateorigin}, searching...`)
            let tem = STATICACCESS.findTemplate(templateorigin)
            //console.log("template: ",tem)
            if(tem != undefined){
                //console.log(`Found Icon for template: ${templateorigin}`)
                iconname = tem.classIcon
                isGiant = tem.isGiant
                alwaysCrit = tem.alwaysCrit
                if(iconname == undefined){
                    console.log(templateorigin,"has no icon?: ", tem)
                }
            }
        }
        if (thisnode == undefined){
            return
        }
        thisnode.classList.remove("iconGiantCritContainer")
        thisnode.classList.remove("iconCritContainer")
        thisnode.classList.remove("iconGiantContainer")
        thisnode.classList.remove("iconContainer")
        if (alwaysCrit) {
            if (isGiant) {
                thisnode.classList.add("iconGiantCritContainer");
            } else {
                thisnode.classList.add("iconCritContainer");
            }
        } else if (isGiant) {
            thisnode.classList.add("iconGiantContainer");
        } else {
            thisnode.classList.add("iconContainer");
        }
    }
</script>

<div class="Icon cc" use:loaded draggable="false">
    <img
    src={"icons/leaderboard_class_" + iconname + ".png"}
    alt={""+iconname}
    draggable="false"
    />
    {#if isgatebot}
        <img class="image-label" src="img/indicator_gatebot.png" alt="Icon Not Found"/>
    {/if}
</div>

<style>
    .cc {
        position: relative;
    }
    .image-label {
        position: absolute;
        top: 0px; /* Adjust the top and left values to position the label where you want */
        left: 0px;
        padding: 5px;
        width: 20%;
        height: 20%;
        border-radius: 4px;
        z-index: 1; /* Make sure the label is stacked above the image */
        pointer-events: none;
    }
</style>