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
	import { PopParser } from "./parser";
	import { WaveInfo } from "./waveinfo";

	import Templateicon from "./templateicon.svelte";
	import Wavebar from "./wavebar.svelte";

	import type { Template } from "./templateLoader";
	import type { WaveSpawn } from "./wavespawn";

	const templatepop =
		"#base robot_giant.pop\n#base robot_standard.pop\nWaveSchedule\n{\n\tStartingCurrency\t600\n\tRespawnWaveTime\t5\n\tCanBotsAttackWhileInSpawnRoom\tno\n\tTemplates\n\t{\n\n\t}\n}";

	let templates: Array<Template> = [];
	let waves;

	let startcur: number = 0;
	let respawntime: number = 0;
	let fileloaded: boolean = false;
	let wavespawnEditorDiv: HTMLDivElement;

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
					initiateParser(fileContent).then(() => {
						fileloaded = true;
						//sortTemplateContainer();
						templates = STATICACCESS.parser.templateLoader.templates;
					});
				} else {
					console.log("Unable to read file as text.");
				}
			};

			reader.readAsText(file);
		} else {
			console.log("No file selected");
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
					console.log("Finished LLoading Extra Templates");
					templates = STATICACCESS.parser.templateLoader.templates;
					//sortTemplateContainer();
				} else {
					console.log("Unable to read file as text.");
				}
			};

			reader.readAsText(file);
		} else {
			console.log("No file selected");
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
		console.log("pop dict:", STATICACCESS.parser.getPopDict());
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
		STATICACCESS.parser.giveRawData(filecontent);
		await STATICACCESS.loadTemplatesAndWaves();
		console.log("Finished Loading Templates and Waves");
		//sortTemplateContainer();
		waves = STATICACCESS.parser.waves;
		startcur = STATICACCESS.parser.starting_currency;
		respawntime = STATICACCESS.parser.respawn_time;
		templates = STATICACCESS.parser.templateLoader.templates;
		console.log(startcur, respawntime);
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
		console.log(STATICACCESS.parser.waves);
		templates = STATICACCESS.parser.templateLoader.templates;
	}

	function addwave() {
		STATICACCESS.parser.waves.push(new WaveInfo());
		waves = STATICACCESS.parser.waves;
	}

	function removeWave(event: CustomEvent) {
		//console.log("Removing", event.detail);

		STATICACCESS.parser.waves.forEach((w, i) => {
			console.log(i, w.getID());
			if (w.getID() === event.detail.id) {
				STATICACCESS.parser.waves.splice(i, 1);
				console.log("found");
			}
		});
		waves = STATICACCESS.parser.waves;
	}
	function updateWavebars(event) {
		waves = STATICACCESS.parser.waves;
	}
	function handleStartCurChange(event) {
		console.log("Called handleStartCurChange");
		startcur = parseInt(event.target.value);
		STATICACCESS.parser.starting_currency = startcur;
	}
	function handleRespawnTimeChange(event) {
		console.log("Called handleRespawnTimeChange");
		respawntime = parseInt(event.target.value);
		STATICACCESS.parser.respawn_time = respawntime;
	}
	function editorMouseUp(event){

	}
	function editorMouseDown(event){
		
	}
	function editorMouseMove(event){
		
	}
</script>

<main>
	
		<h1>POP Editor</h1>
		<p>
			Visit the <a href="https://svelte.dev/tutorial">Svelte tutorial</a> to learn
			how to build Svelte apps.
		</p>
		<input type="file" id="popfileInput" />
		<button on:click={handleMissionFile}>Upload Mission POP</button>
		{#if fileloaded}
			<div class="wavespawneditor" 
				draggable="true" 
				bind:this={wavespawnEditorDiv}
				on:mouseup={editorMouseUp} 
				on:mousedown={editorMouseDown}
				on:mousemove={editorMouseMove}> 

			</div>

			<input type="file" id="templatefileInput" />
			<button on:click={handleTemplateFile}>Upload Template POP</button>
			<div>
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
			<div>
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
							waveinfo={w}
						/>
					{/each}
				</div>
			</div>
			<button on:click={addwave}>Add Wave</button>
			<button on:click={checkwaves}>Check Waves</button>
			<button on:click={downloadPopAsFile}>Download Pop</button>
			<div id="templatecontainer">
				{#each templates as t}
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

	.wavespawneditor {
		position: fixed;
		top: 50%;
		left: 50%;
		margin-right: -50%;
		transform: translate(-50%, -50%);
		background-color: #303030;
		width:300px;
		height:300px;
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

	#templatecontainer {
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
