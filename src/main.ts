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

    // Register event to apply settings when layout changes
    this.registerEvent(
      this.app.workspace.on('layout-change', () => {
        this.applyBacklinkSettings();
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
    const embeddedBacklinks = document.querySelector(
      'div.embedded-backlinks'
    ) as HTMLElement;

    // If the embedded backlinks element is not found, return.
    if (!embeddedBacklinks) {
      return;
    }

    // If the embedded backlinks element is not visible, return.
    if (!embeddedBacklinks.offsetWidth || !embeddedBacklinks.offsetHeight) {
      return;
    }

    // Collapse results if the setting is enabled.
    if (this.settings.collapseResults) {
      const collapseButton = embeddedBacklinks.querySelector(
        "[aria-label='Collapse results']:not(.is-active)"
      ) as HTMLElement;

      if (collapseButton) {
        (collapseButton as HTMLElement).click();
      }
    }

    // Show more context if the setting is enabled.
    if (this.settings.showMoreContext) {
      const showContextButton = embeddedBacklinks.querySelector(
        "[aria-label='Show more context']:not(.is-active)"
      ) as HTMLElement;

      if (showContextButton) {
        showContextButton.click();
      }
    }

    // Apply sort order setting
    const sortButton = embeddedBacklinks.querySelector(
      "[aria-label='Change sort order']"
    ) as HTMLElement;
    if (sortButton) {
      // Click the sort button to open the dropdown.
      sortButton.click();

      // TODO: This doesn't work.
      // Find and click the desired sort option.
      const sortOptions = document.querySelectorAll('.sort-option');
      sortOptions.forEach((option) => {
        if (option.textContent?.toLowerCase() === this.settings.sortOrder) {
          (option as HTMLElement).click();
        }
      });
    }
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
      .setName('Collapse results')
      .setDesc('Automatically collapse backlink results.')
      .addToggle((toggle) =>
        toggle.setValue(this.plugin.settings.collapseResults).onChange(async (value) => {
          this.plugin.settings.collapseResults = value;
          await this.plugin.saveSettings();
        })
      );

    new Setting(containerEl)
      .setName('Show more context')
      .setDesc('Automatically show more context for backlink results.')
      .addToggle((toggle) =>
        toggle.setValue(this.plugin.settings.showMoreContext).onChange(async (value) => {
          this.plugin.settings.showMoreContext = value;
          await this.plugin.saveSettings();
        })
      );

    new Setting(containerEl)
      .setName('Sort order')
      .setDesc('Default sort order for backlink results.')
      .addDropdown((dropdown) =>
        dropdown
          .addOption('file-name-a-to-z', 'File name (A to Z)')
          .addOption('file-name-z-to-a', 'File name (Z to A)')
          .addOption('modified-time-new-to-old', 'Modified time (new to old)')
          .addOption('modified-time-old-to-new', 'Modified time (old to new)')
          .addOption('created-time-new-to-old', 'Created time (new to old)')
          .addOption('created-time-old-to-new', 'Created time (old to new)')
          .setValue(this.plugin.settings.sortOrder || 'file-name-a-to-z')
          .onChange(async (value) => {
            this.plugin.settings.sortOrder = value;
            await this.plugin.saveSettings();
          })
      );
  }
}
