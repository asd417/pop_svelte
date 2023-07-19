<script context="module" lang="ts">
	class globalaccess {
		public parser: PopParser;
		public waves: Array<WaveInfo> = [];
		constructor() {
			this.parser = new PopParser();
		}

		async loadTemplatesAndWaves(){
			await this.parser.getTemplateArray()
			this.waves = STATICACCESS.parser.mapToWaves();
		}

		findTemplate(n:string): Template{
			return this.parser.templateLoader.findTemplate(n)
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

	const templatepop = "#base robot_giant.pop\n#base robot_standard.pop\nWaveSchedule\n{\n\tStartingCurrency\t600\n\tRespawnWaveTime\t5\n\tCanBotsAttackWhileInSpawnRoom\tno\n\tTemplates\n\t{\n\n\t}\n}"


	let templates: Array<Template> = [];
	let waves;
	let fileloaded: boolean = false;

	function handleFile() {
		const fileInput: HTMLInputElement = document.getElementById(
			"popfileInput"
		) as HTMLInputElement;
		const file: File = fileInput.files[0];

		if (file) {
			const reader: FileReader = new FileReader();

			reader.onload = (event: ProgressEvent<FileReader>) => {
				const fileContent: string | ArrayBuffer = event.target?.result;

				if (typeof fileContent === "string") {
					initiateParser(fileContent).then(()=>{
						fileloaded = true;
						//sortTemplateContainer();
					})
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
		initiateParser(templatepop).then(()=>{
			fileloaded = true;
			//sortTemplateContainer();
		})
	}

	async function initiateParser(filecontent: string) {
		STATICACCESS.parser.giveRawData(filecontent);
		await STATICACCESS.loadTemplatesAndWaves()
		console.log("Finished Loading Templates and Waves")
		//sortTemplateContainer();
		waves = STATICACCESS.waves
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
		console.log(STATICACCESS.waves);
	}

	function addwave() {
		STATICACCESS.waves.push(new WaveInfo());
		waves = STATICACCESS.waves
	}

	function removeWave(event: CustomEvent) {
		//console.log("Removing", event.detail);

		STATICACCESS.waves.forEach((w, i) => {
			console.log(i, w.getID());
			if (w.getID() === event.detail.id) {
				STATICACCESS.waves.splice(i, 1);
				console.log("found");
			}
		});
		waves = STATICACCESS.waves
	}
	function updateWavebars(event) {
		waves = STATICACCESS.waves
	}
</script>

<main>
	<h1>POP Editor</h1>
	<p>
		Visit the <a href="https://svelte.dev/tutorial">Svelte tutorial</a> to learn
		how to build Svelte apps.
	</p>
	<input type="file" id="popfileInput" />
	<button on:click={handleFile}>Upload</button>
	{#if fileloaded}
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
		<div id="templatecontainer">
			{#each STATICACCESS.parser.templateLoader.templates as t}
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
		border: 1px solid #ccc;
		margin-left: auto;
		max-width: 50%;
		min-width: 80px;
		height: 400px;
		flex: auto;

		justify-items: center;
		align-items: center;
		border-radius: 10px;
	}
</style>
