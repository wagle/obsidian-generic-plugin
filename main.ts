import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';
import * as d3 from "d3";
import * as viz from "viz";
import { graphviz } from "d3-graphviz";
//as d3gv from "d3-graphviz";

import {execSync} from "child_process";

// Remember to rename these classes and interfaces!

interface MyPluginSettings {
	mySetting: string;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
	mySetting: 'default'
}

export default class MyPlugin extends Plugin {
	settings: MyPluginSettings;

	async onload() {
		await this.loadSettings();

		// This creates an icon in the left ribbon.
		const ribbonIconEl = this.addRibbonIcon('dice', 'Sample Plugin', (evt: MouseEvent) => {
			// Called when the user clicks the icon.
			new Notice('This is a notice!');
		});
		// Perform additional things with the ribbon
		ribbonIconEl.addClass('my-plugin-ribbon-class');

		// This adds a status bar item to the bottom of the app. Does not work on mobile apps.
		const statusBarItemEl = this.addStatusBarItem();
		statusBarItemEl.setText('Status Bar Text');

		// add an svgx widget
		this.registerMarkdownCodeBlockProcessor("svg2", (source, el, ctx) => {
			//const Viz = require('viz.js');
			//const { Module, render } = require('viz.js/full.render.js');
			//let viz = new Viz({ Module, render });

			console.log("---hello there source---");
			console.log(source);
			console.log("---hello there el---");
			console.log(el);
			d3.select("#div").graphviz()
				.renderDot('digraph  {a -> b}');		});
		this.registerMarkdownCodeBlockProcessor("svgx", (source, el, ctx) => {
			const execSync = require('child_process').execSync;
			// import { execSync } from 'child_process';  // replace ^ if using ES modules

			const output = execSync('cat /Users/wagle/obsidian-internal-link-test.dot', {encoding: 'utf-8'});  // the default is 'buffer'

			const Viz = require('viz.js');
			const { Module, render } = require('viz.js/full.render.js');

			let viz = new Viz({ Module, render });

			console.log("---hello there source---");
			console.log(source);
			console.log("---hello there el---");
			console.log(el);
			viz.renderString(output)
				.then((result: string) => {
					console.log("---good---");
					console.log(result);
					el.outerHTML = result;
				})
				.catch((error: any) => {
					// Create a new Viz instance (@see Caveats page for more info)
					viz = new Viz({ Module, render });

					// Possibly display the error
					console.log("---start bad---");
					console.log(error);
					console.log("---end bad---");
				});
		});
		// add an ls widget
		this.registerMarkdownCodeBlockProcessor("testx", (source, el, ctx) => {
			const execSync = require('child_process').execSync;
			// import { execSync } from 'child_process';  // replace ^ if using ES modules

			const output = execSync('cat /Users/wagle/obsidian-internal-link-test.svg', {encoding: 'utf-8'});  // the default is 'buffer'
			//el.innerHTML = '<em>bar</em>';
			try {
				el.outerHTML = output;
			}
			catch(err) {
				new Notice (err.message);
			}
		});
		// add a csv widget
		this.registerMarkdownCodeBlockProcessor("csv", (source, el, ctx) => {
			const rows = source.split("\n").filter((row) => row.length > 0);

			const table = el.createEl("table");
			const body = table.createEl("tbody");

			for (let i = 0; i < rows.length; i++) {
				const cols = rows[i].split(",");

				const row = body.createEl("tr");

				for (let j = 0; j < cols.length; j++) {
					row.createEl("td", { text: cols[j] });
				}
			}
		});
		// This adds a simple command that can be triggered anywhere
		this.addCommand({
			id: 'open-sample-modal-simple',
			name: 'Open sample modal (simple)',
			callback: () => {
				new SampleModal(this.app).open();
			}
		});
		// This adds an editor command that can perform some operation on the current editor instance
		this.addCommand({
			id: 'sample-editor-command',
			name: 'Sample editor command',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				console.log(editor.getSelection());
				editor.replaceSelection('Sample Editor Command');
			}
		});
		// This adds a complex command that can check whether the current state of the app allows execution of the command
		this.addCommand({
			id: 'open-sample-modal-complex',
			name: 'Open sample modal (complex)',
			checkCallback: (checking: boolean) => {
				// Conditions to check
				const markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
				if (markdownView) {
					// If checking is true, we're simply "checking" if the command can be run.
					// If checking is false, then we want to actually perform the operation.
					if (!checking) {
						new SampleModal(this.app).open();
					}

					// This command will only show up in Command Palette when the check function returns true
					return true;
				}
			}
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SampleSettingTab(this.app, this));

		// If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// Using this function will automatically remove the event listener when this plugin is disabled.
		this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
			console.log('click', evt);
		});

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000));
	}

	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class SampleModal extends Modal {
	constructor(app: App) {
		super(app);
	}

	onOpen() {
		const {contentEl} = this;
		contentEl.setText('Woah!');
	}

	onClose() {
		const {contentEl} = this;
		contentEl.empty();
	}
}

class SampleSettingTab extends PluginSettingTab {
	plugin: MyPlugin;

	constructor(app: App, plugin: MyPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		containerEl.createEl('h2', {text: 'Settings for my awesome plugin.'});

		new Setting(containerEl)
			.setName('Setting #1')
			.setDesc('It\'s a secret')
			.addText(text => text
				.setPlaceholder('Enter your secret')
				.setValue(this.plugin.settings.mySetting)
				.onChange(async (value) => {
					console.log('Secret: ' + value);
					this.plugin.settings.mySetting = value;
					await this.plugin.saveSettings();
				}));
	}
}
