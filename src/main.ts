import { App, Plugin, PluginSettingTab, Setting, TFile } from 'obsidian';

// Remember to rename these classes and interfaces!

interface BacklinkSettings {
  collapseResults: boolean;
  showMoreContext: boolean;
  sortOrder: string;
}

const DEFAULT_SETTINGS: BacklinkSettings = {
  collapseResults: false,
  showMoreContext: false,
  sortOrder: 'alphabetical',
};

export default class BacklinkSettingsPlugin extends Plugin {
  settings: BacklinkSettings;

  async onload() {
    await this.loadSettings();

    // This adds a settings tab so the user can configure various aspects of the plugin
    this.addSettingTab(new BacklinkSettingsTab(this.app, this));

    // Register event to apply settings when a file is opened
    this.registerEvent(
      this.app.workspace.on('file-open', (file: TFile) => {
        if (file && document.querySelector('div.embedded-backlinks')) {
          console.log('File opened:', file.name);
          setTimeout(() => {
            this.applyBacklinkSettings();
          }, 1000);
        }
      })
    );
  }

  onunload() {}

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }

  private applyBacklinkSettings() {
    const embeddedBacklinks = document.querySelector('div.embedded-backlinks');
    if (!embeddedBacklinks) {
      return;
    }

    // Collapse results if the setting is enabled.
    if (this.settings.collapseResults) {
      console.log('Collapsing results');

      const collapseButton = embeddedBacklinks.querySelector(
        "[aria-label='Collapse results']:not(.is-active)"
      );

      console.log('collapseButton', collapseButton);

      if (collapseButton) {
        (collapseButton as HTMLElement).click();
      }
    }

    // Show more context if the setting is enabled.
    if (this.settings.showMoreContext) {
      console.log('Showing more context');

      const showContextButton = embeddedBacklinks.querySelector(
        "[aria-label='Show more context']:not(.is-active)"
      );

      console.log('showContextButton', showContextButton);

      if (showContextButton) {
        (showContextButton as HTMLElement).click();
      }
    }
    /*
    // Apply sort order setting
    const sortButton = embeddedBacklinks.querySelector(".sort-button");
    if (sortButton) {
      // Click the sort button to open the dropdown
      (sortButton as HTMLElement).click();

      // Find and click the desired sort option
      const sortOptions = document.querySelectorAll(".sort-option");
      sortOptions.forEach((option) => {
        if (option.textContent?.toLowerCase() === this.settings.sortOrder) {
          (option as HTMLElement).click();
        }
      });
    }
    */
  }
}

class BacklinkSettingsTab extends PluginSettingTab {
  plugin: BacklinkSettingsPlugin;

  constructor(app: App, plugin: BacklinkSettingsPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;

    containerEl.empty();

    new Setting(containerEl)
      .setName('Collapse Results')
      .setDesc('Automatically collapse backlink results when opening a file')
      .addToggle((toggle) =>
        toggle.setValue(this.plugin.settings.collapseResults).onChange(async (value) => {
          this.plugin.settings.collapseResults = value;
          await this.plugin.saveSettings();
        })
      );

    new Setting(containerEl)
      .setName('Show More Context')
      .setDesc('Automatically show more context for backlinks when opening a file')
      .addToggle((toggle) =>
        toggle.setValue(this.plugin.settings.showMoreContext).onChange(async (value) => {
          this.plugin.settings.showMoreContext = value;
          await this.plugin.saveSettings();
        })
      );

    new Setting(containerEl)
      .setName('Sort Order')
      .setDesc('Default sort order for backlinks')
      .addDropdown((dropdown) =>
        dropdown
          .addOption('alphabetical', 'Alphabetical')
          .addOption('newest', 'Newest First')
          .addOption('oldest', 'Oldest First')
          .setValue(this.plugin.settings.sortOrder)
          .onChange(async (value) => {
            this.plugin.settings.sortOrder = value;
            await this.plugin.saveSettings();
          })
      );
  }
}
