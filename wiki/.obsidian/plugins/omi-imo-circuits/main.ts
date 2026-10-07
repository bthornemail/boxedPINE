import { Plugin, Setting, Notice, MarkdownRenderer, Component } from 'obsidian';
import { CIRCUITS, getCircuit, getCircuitNames } from './src/CircuitData';
import { renderCircuitSVG } from './src/CircuitRenderer';

const DEFAULT_SETTINGS: CircuitSettings = {
  defaultCircuit: '6t-xor',
  showLabels: true,
  showDatasheets: false,
  theme: 'dark',
};

interface CircuitSettings {
  defaultCircuit: string;
  showLabels: boolean;
  showDatasheets: boolean;
  theme: string;
}

const VIEW_TYPE_CIRCUIT = 'omi-imo-circuit-view';

export default class OmiImoCircuitsPlugin extends Plugin {
  settings: CircuitSettings;

  async onload() {
    await this.loadSettings();

    this.registerView(VIEW_TYPE_CIRCUIT, (leaf) => new CircuitView(leaf, this));

    this.addRibbonIcon('circuit-board', 'Open Circuit Viewer', () => {
      this.activateView();
    });

    for (const id of getCircuitNames()) {
      this.addCommand({
        id: `show-${id}`,
        name: `Show ${CIRCUITS[id].name}`,
        callback: () => {
          this.activateView(id);
        },
      });
    }

    this.addCommand({
      id: 'list-circuits',
      name: 'List all circuits',
      callback: () => {
        const names = getCircuitNames().map(id => `${CIRCUITS[id].name}: ${CIRCUITS[id].description}`).join('\n');
        new Notice(names, 5000);
      },
    });

    this.addSettingTab(new CircuitSettingTab(this.app, this));
  }

  onunload() {}

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }

  async activateView(circuitId?: string) {
    const id = circuitId || this.settings.defaultCircuit;
    const { workspace } = this.app;

    let leaf = workspace.getLeavesOfType(VIEW_TYPE_CIRCUIT)[0];

    if (!leaf) {
      leaf = workspace.getRightLeaf(false);
      if (leaf) {
        await leaf.setViewState({ type: VIEW_TYPE_CIRCUIT, active: true });
      } else {
        new Notice('No available leaf to open circuit view');
        return;
      }
    } else {
      await leaf.setViewState({ type: VIEW_TYPE_CIRCUIT, active: true });
    }

    workspace.revealLeaf(leaf);

    const view = leaf.view as CircuitView;
    view.setCircuit(id);
  }
}

class CircuitView extends Component {
  private plugin: OmiImoCircuitsPlugin;
  private circuitId: string;
  private container: HTMLElement;

  constructor(leaf: any, plugin: OmiImoCircuitsPlugin) {
    super();
    this.plugin = plugin;
  }

  getViewType(): string {
    return VIEW_TYPE_CIRCUIT;
  }

  getDisplayText(): string {
    return 'OMI-IMO Circuit';
  }

  getIcon(): string {
    return 'circuit-board';
  }

  async onOpen(): Promise<void> {
    this.container = this.contentEl.createDiv({ cls: 'omi-imo-circuit-container' });
    this.setCircuit(this.plugin.settings.defaultCircuit);
  }

  async onClose(): Promise<void> {
    this.container.empty();
  }

  setCircuit(id: string): void {
    this.circuitId = id;
    this.render();
  }

  private render(): void {
    if (!this.container) return;
    this.container.empty();

    const circuit = getCircuit(this.circuitId);
    if (!circuit) {
      this.container.createEl('p', { text: `Circuit not found: ${this.circuitId}` });
      return;
    }

    this.container.createEl('h2', { text: circuit.name });
    this.container.createEl('p', { text: circuit.description });

    const svgContainer = this.container.createDiv({ cls: 'omi-imo-circuit-svg' });
    svgContainer.innerHTML = renderCircuitSVG(circuit);

    if (this.plugin.settings.showDatasheets) {
      const table = this.container.createEl('table');
      const thead = table.createEl('thead');
      const headerRow = thead.createEl('tr');
      headerRow.createEl('th', { text: 'ID' });
      headerRow.createEl('th', { text: 'Type' });
      headerRow.createEl('th', { text: 'Value' });
      headerRow.createEl('th', { text: 'Datasheet' });

      const tbody = table.createEl('tbody');
      for (const v of circuit.vertices) {
        if (v.role === 'NPN transistor') {
          const row = tbody.createEl('tr');
          row.createEl('td', { text: v.id });
          row.createEl('td', { text: v.role });
          row.createEl('td', { text: v.value });
          row.createEl('td', { text: 'https://www.onsemi.com/pdf/datasheet/2n2222-d.pdf' });
        }
      }
    }
  }
}

class CircuitSettingTab extends PluginSettingTab {
  plugin: OmiImoCircuitsPlugin;

  constructor(app: any, plugin: OmiImoCircuitsPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    containerEl.createEl('h2', { text: 'OMI-IMO Circuits Settings' });

    new Setting(containerEl)
      .setName('Default circuit')
      .setDesc('The circuit to show when opening the viewer')
      .addDropdown((dropdown) => {
        for (const id of getCircuitNames()) {
          dropdown.addOption(id, CIRCUITS[id].name);
        }
        dropdown.setValue(this.plugin.settings.defaultCircuit);
        dropdown.onChange(async (value) => {
          this.plugin.settings.defaultCircuit = value;
          await this.plugin.saveSettings();
        });
      });

    new Setting(containerEl)
      .setName('Show labels')
      .setDesc('Show component labels on the circuit diagram')
      .addToggle((toggle) => {
        toggle.setValue(this.plugin.settings.showLabels);
        toggle.onChange(async (value) => {
          this.plugin.settings.showLabels = value;
          await this.plugin.saveSettings();
        });
      });

    new Setting(containerEl)
      .setName('Show datasheets')
      .setDesc('Show a datasheet table below the circuit diagram')
      .addToggle((toggle) => {
        toggle.setValue(this.plugin.settings.showDatasheets);
        toggle.onChange(async (value) => {
          this.plugin.settings.showDatasheets = value;
          await this.plugin.saveSettings();
        });
      });
  }
}
