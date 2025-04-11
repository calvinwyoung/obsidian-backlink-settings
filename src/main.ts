import { App, MarkdownView, Plugin, PluginSettingTab, Setting } from 'obsidian';
import type { BacklinkComponent, BacklinkView } from 'obsidian-typings';
import { ViewType } from 'obsidian-typings/implementations';

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

    // Add a settings tab so the user can configure the plugin.
    this.addSettingTab(new BacklinkSettingsTab(this.app, this));

    // Register event to apply settings when layout changes.
    this.registerEvent(
      this.app.workspace.on('layout-change', () => {
        this.updateBacklinkComponents();
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

  private async updateBacklinkComponents() {
    const embeddedBacklinks = document.querySelector(
      'div.embedded-backlinks'
    ) as HTMLElement;

    // Short-circuit if the embedded backlinks element isn't found.
    if (!embeddedBacklinks) {
      return;
    }

    // Short-circuit if the embedded backlinks element isn't visible.
    if (!embeddedBacklinks.offsetWidth || !embeddedBacklinks.offsetHeight) {
      return;
    }

    // Apply settings to global backlink view.
    const backlinkView = await getBacklinkView(this.app);
    if (backlinkView?.backlink) {
      applyBacklinkSettings(backlinkView.backlink, this.settings);
    }

    // Apply settings to backlink view in each note's footer.
    for (const leaf of this.app.workspace.getLeavesOfType(ViewType.Markdown)) {
      if (!(leaf.view instanceof MarkdownView)) {
        continue;
      }

      if (!leaf.view.backlinks) {
        continue;
      }

      applyBacklinkSettings(leaf.view.backlinks, this.settings);
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
          .addOption('alphabetical', 'File name (A to Z)')
          .addOption('alphabeticalReverse', 'File name (Z to A)')
          .addOption('byModifiedTime', 'Modified time (new to old)')
          .addOption('byModifiedTimeReverse', 'Modified time (old to new)')
          .addOption('byCreatedTime', 'Created time (new to old)')
          .addOption('byCreatedTimeReverse', 'Created time (old to new)')
          .setValue(this.plugin.settings.sortOrder)
          .onChange(async (value) => {
            this.plugin.settings.sortOrder = value;
            await this.plugin.saveSettings();
          })
      );
  }
}

/**
 * Apply the given settings to a `BacklinkComponent`.
 *
 * Note this uses the internal API and can be brittle.
 */
function applyBacklinkSettings(
  backlinkComponent: BacklinkComponent,
  settings: BacklinkSettings
) {
  backlinkComponent.setCollapseAll(settings.collapseResults);
  backlinkComponent.setExtraContext(settings.showMoreContext);
  backlinkComponent.setSortOrder(settings.sortOrder);
}

/**
 * Returns the global `BacklinkView` for the app.
 *
 * Note this uses the internal API and can be brittle.
 *
 * Source:
 * https://github.com/mnaoumov/obsidian-backlink-cache/blob/2.7.4/src/BacklinkCorePlugin.ts#L70-L78
 */
async function getBacklinkView(app: App): Promise<BacklinkView | undefined> {
  const backlinksLeaf = app.workspace.getLeavesOfType(ViewType.Backlink)[0];
  if (!backlinksLeaf) {
    return undefined;
  }

  await backlinksLeaf.loadIfDeferred();

  if (backlinksLeaf.view) {
    return backlinksLeaf.view as BacklinkView;
  }

  return undefined;
}
