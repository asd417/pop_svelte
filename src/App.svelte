<script context="module" lang="ts">
	class globalaccess {
		public parser: PopParser;

		constructor() {
			this.parser = new PopParser();
		}

		async loadTemplatesAndWaves() {
			await this.parser.loadTemplateArray();
			STATICACCESS.parser.readMissionInfo();
			STATICACCESS.parser.mapToWaves();
		}

		findTemplate(n: string): Template {
			return this.parser.templateLoader.findTemplate(n);
		}
	}

	export const STATICACCESS = new globalaccess();
</script>

<script lang="ts">
	//Design Patterns that I might need to implement
	//https://www.youtube.com/watch?v=tv-_1er1mWI
	
	import { PopParser } from "./parser";
	import { WaveInfo } from "./waveinfo";

	import Templateicon from "./templateicon.svelte";
	import Wavebar from "./wavebar.svelte";

	import type { Template } from "./templateLoader";
	import type { WaveSpawn } from "./wavespawn";
    import Wavespawnicon from "./wavespawnicon.svelte";
	import WavespawnEditor from "./wavespawnEditor.svelte";

	const templatepop =
		"#base robot_giant.pop\n#base robot_standard.pop\nWaveSchedule\n{\n\tStartingCurrency\t600\n\tRespawnWaveTime\t5\n\tCanBotsAttackWhileInSpawnRoom\tno\n\tTemplates\n\t{\n\n\t}\n}";

	let templates: Array<Template> = [];
	let embedtemplates : Array<Template> = [];
	let waves;
	let startcur: number = 0;
	let respawntime: number = 0;
	let fileloaded: boolean = false;
	let wavespawnEditorDiv: HTMLDivElement;
	let editorMove: boolean = false
	let editorMoveOffsetX, editorMoveOffsetY;
	let editorWavespawn : WaveSpawn = undefined;

	let codearea = undefined
	let codeflaskoutput = ""
		
	function handleMissionFile() {
		const fileInput: HTMLInputElement = document.getElementById(
			"popfileInput"
		) as HTMLInputElement;
		const file: File = fileInput.files[0];

		if (file) {
			const reader: FileReader = new FileReader();

			reader.onload = (event: ProgressEvent<FileReader>) => {
				const fileContent: string | ArrayBuffer = event.target?.result;

				if (typeof fileContent === "string") {
					STATICACCESS.parser.clear()
					initiateParser(fileContent).then(() => {
						fileloaded = true;
						//sortTemplateContainer();
						templates = STATICACCESS.parser.templateLoader.templates;
						embedtemplates = STATICACCESS.parser.templateLoader.embededTemplates;
					});
				} else {
					console.error("Unable to read file as text.");
				}
			};

			reader.readAsText(file);
		} else {
			console.error("No file selected");
		}
	}

	function handleTemplateFile() {
		const fileInput: HTMLInputElement = document.getElementById(
			"templatefileInput"
		) as HTMLInputElement;
		const file: File = fileInput.files[0];

		if (file) {
			const reader: FileReader = new FileReader();

			reader.onload = (event: ProgressEvent<FileReader>) => {
				const fileContent: string | ArrayBuffer = event.target?.result;

				if (typeof fileContent === "string") {
					STATICACCESS.parser.addFileContentToTemplateArray(fileContent);
					console.info("Finished Loading Extra Templates");
					templates = STATICACCESS.parser.templateLoader.templates;
					embedtemplates = STATICACCESS.parser.templateLoader.embededTemplates;
					//sortTemplateContainer();
				} else {
					console.error("Unable to read file as text.");
				}
			};

			reader.readAsText(file);
		} else {
			console.error("No file selected");
		}
	}

	function newPop() {
		initiateParser(templatepop).then(() => {
			fileloaded = true;
			//sortTemplateContainer();
		});
	}

	function downloadPopAsFile() {
		let raw_string = STATICACCESS.parser.writePopToData();
		console.info("Pop dict:", STATICACCESS.parser.getPopDict());
		downloadAsFile("generated.pop", raw_string);
	}

	function downloadAsFile(filename: string, content: string) {
		const blob = new Blob([content], { type: "text/plain" });
		const url = URL.createObjectURL(blob);
		const link = document.createElement("a");
		link.href = url;
		link.download = filename;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		// Clean up the created object URL
		URL.revokeObjectURL(url);
	}

	async function initiateParser(filecontent: string) {
		STATICACCESS.parser.parseRawData(filecontent);
		await STATICACCESS.loadTemplatesAndWaves();
		console.info("Finished Loading Templates and Waves");
		//sortTemplateContainer();
		waves = STATICACCESS.parser.waves;
		startcur = STATICACCESS.parser.starting_currency;
		respawntime = STATICACCESS.parser.respawn_time;
		templates = STATICACCESS.parser.templateLoader.templates;
		embedtemplates = STATICACCESS.parser.templateLoader.embededTemplates;
		//console.log(startcur, respawntime);
	}

	function sortTemplateContainer() {
		const container = document.getElementById(
			"templatecontainer"
		) as HTMLElement;
		const boxes = Array.from(
			container.getElementsByClassName(
				"TemplateIcon"
			) as HTMLCollectionOf<HTMLElement>
		);

		boxes.sort((a, b) => {
			const cnA = Number(a.getAttribute("classNum"));
			const cnB = Number(b.getAttribute("classNum"));
			//console.log(`Comparing ${nameA} and ${nameB}`)
			if (cnA < cnB) {
				return -1;
			}
			if (cnA > cnB) {
				return 1;
			}
			const igA = Boolean(a.getAttribute("isGiant"));
			const igB = Boolean(b.getAttribute("isGiant"));
			if (igA && !igB) {
				return -1;
			}
			if (!igA && igB) {
				return 1;
			}
			const nameA = a.getAttribute("templatename")!;
			const nameB = b.getAttribute("templatename")!;
			// If templateA and templateB are the same class
			if (nameA < nameB) {
				return -1;
			}
			if (nameA > nameB) {
				return 1;
			}
			return 0;
		});

		boxes.forEach((box) => container.appendChild(box));
	}

	function delay(ms: number) {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}

	function checkwaves() {
		console.info("Check Waves:", STATICACCESS.parser.waves);
		templates = STATICACCESS.parser.templateLoader.templates;
		embedtemplates = STATICACCESS.parser.templateLoader.embededTemplates;
	}

	function addwave() {
		STATICACCESS.parser.waves.push(new WaveInfo());
		waves = STATICACCESS.parser.waves;
	}

	function removeWave(event: CustomEvent) {
		console.info("Removing", event.detail);

		STATICACCESS.parser.waves.forEach((w, i) => {
			//console.log(i, w.getID());
			if (w.getID() === event.detail.id) {
				STATICACCESS.parser.waves.splice(i, 1);
				//console.log("found");
			}
		});
		waves = STATICACCESS.parser.waves;
	}
	function updateWavebars(event) {
		waves = STATICACCESS.parser.waves;
	}
	function handleStartCurChange(event) {
		//console.log("Called handleStartCurChange");
		startcur = parseInt(event.target.value);
		STATICACCESS.parser.starting_currency = startcur;
	}
	function handleRespawnTimeChange(event) {
		//console.log("Called handleRespawnTimeChange");
		respawntime = parseInt(event.target.value);
		STATICACCESS.parser.respawn_time = respawntime;
	}
	function editorMouseUp(event){
		editorMove = false
		//console.log("Stop moving")
	}
	function editorMouseDown(event: MouseEvent){
		const element = event.target as Element;
		//console.log(event.target, event.currentTarget, element.nodeName)

		if(element.nodeName != "INPUT" && element.nodeName != "TEXTAREA" && !element.classList.contains("blockEditorMove"))
		{
			editorMove = true
			editorMoveOffsetX = event.x - wavespawnEditorDiv.getBoundingClientRect().left;
			editorMoveOffsetY = event.y - wavespawnEditorDiv.getBoundingClientRect().top;
		}
	}
	function editorMouseMove(event: MouseEvent){
		if(editorMove){
			wavespawnEditorDiv.style.left = event.x - editorMoveOffsetX + window.scrollX + "px"
			wavespawnEditorDiv.style.top = event.y - editorMoveOffsetY + window.scrollY + "px"
			//console.log("Moving", event.x, event.y )
		}
	}
	function wavespawnSelected(event){
		editorWavespawn = event.detail.wavespawn
	}

	function checkparser(event){
		console.log("Printing Parser:",STATICACCESS.parser)
	}
</script>

<main>

	<h1>POP Editor</h1>
	<p>
		Visit the <a href="https://svelte.dev/tutorial">Svelte tutorial</a> to learn
		how to build Svelte apps.
	</p>
	<div id="codeflasktest">
		<div bind:this={codearea}></div>
	</div>
	<p style="white-space:pre">
		{codeflaskoutput}
	</p>
	<input type="file" id="popfileInput" />
	<button on:click={handleMissionFile}>Upload Mission POP</button>
	{#if fileloaded}
		<div class="wavespawneditor noselect" 
			bind:this={wavespawnEditorDiv}
			on:mouseup={editorMouseUp} 
			on:mousedown={editorMouseDown}
			on:mousemove={editorMouseMove}
			draggable="false"
			> 
			{#if editorWavespawn != undefined}
				<WavespawnEditor wavespawn={editorWavespawn} on:WavespawnUpdate={updateWavebars} />
			{:else}
				<p>Click a wavespawn to edit</p>
			{/if}
			
		</div>

		<input type="file" id="templatefileInput" />
		<button on:click={handleTemplateFile}>Upload Template POP</button>
		<div class="noselect">
			<label for="startCurSelector">Starting Currency:</label>
			<input
				type="number"
				id="startCurSelector"
				name="startingcurrency"
				min="0"
				max="10000"
				step="50"
				bind:value={startcur}
				on:change={handleStartCurChange}
				autocomplete="off"
			/>
		</div>
		<div class="noselect">
			<label for="respawnTimeSelector">Player Respawn Time:</label>
			<input
				type="number"
				id="respawnTimeSelector"
				name="respawntime"
				min="1"
				max="20"
				step="1"
				bind:value={respawntime}
				on:change={handleRespawnTimeChange}
				autocomplete="off"
			/>
		</div>
		<div class="contentbox">
			<div id="wavebarcontainer">
				{#each waves as w}
					<Wavebar
						on:removeWave={removeWave}
						on:updateWaveBars={updateWavebars}
						on:wavespawnSelectEvent={wavespawnSelected}
						waveinfo={w}
					/>
				{/each}
			</div>
		</div>
		<button on:click={addwave}>Add Wave</button>
		<button on:click={checkwaves}>Check Waves</button>
		<button on:click={downloadPopAsFile}>Download Pop</button>
		<button on:click={checkparser}>Check Parser</button>
		<div class="templatecontainer">
			{#each templates as t}
				<Templateicon template={t} />
			{/each}
		</div>
		<div class="templatecontainer">
			{#each embedtemplates as t}
				<Templateicon template={t} />
			{/each}
		</div>
		<div class="contentbox" />
	{:else}
		<button on:click={newPop}>Create New Pop File</button>
	{/if}

</main>

<style>
	
	main {
		text-align: center;
		padding: 1em;
		max-width: 240px;
		margin: 0 auto;
		justify-content: center;
	}

	.noselect {
		-webkit-touch-callout: none;
		-webkit-user-select: none;
		-khtml-user-select: none;
		-moz-user-select: none;
		-ms-user-select: none;
		user-select: none;
	}

	.wavespawneditor {
		position: absolute;
		top: 250px;
		left: 250px;
		background-color: #303030;
		min-width:300px;
		min-height:200px;
		z-index: 4;
		border: 1px solid #656565;
		border-radius: 10px;
    }

	h1 {
		color: #ff3e00;
		text-transform: uppercase;
		font-size: 4em;
		font-weight: 100;
	}

	@media (min-width: 640px) {
		main {
			max-width: none;
		}
	}

	.contentbox {
		display: flex;
		flex-direction: row;
		overflow: auto;
		min-width: 100%;
		max-width: 100%;
	}

	#wavebarcontainer {
		overflow: auto;
		/*min-width: 40%;
		max-width: 40%;*/
	}

	.templatecontainer {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(70px, 1fr));
		grid-gap: 10px; /* gap between grid items */
		overflow: auto;
		border: 1px solid #414141;
		margin-left: auto;
		width: 50%;
		height: 400px;
		flex: auto;

		justify-items: center;
		align-items: center;
		border-radius: 10px;
		margin-right: 30px;
	}
</style>
