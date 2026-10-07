var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// main.ts
var main_exports = {};
__export(main_exports, {
  default: () => OmiImoCircuitsPlugin
});
module.exports = __toCommonJS(main_exports);
var import_obsidian = require("obsidian");

// src/CircuitData.ts
var CIRCUITS = {
  "5t-xor": {
    id: "5t-xor",
    name: "5T XOR Circuit",
    description: "The frame condition (read). NAND + switch + OR-like.",
    vertices: [
      { id: "Q1", role: "NPN transistor", value: "2N2222", label: "Q1" },
      { id: "Q2", role: "NPN transistor", value: "2N2222", label: "Q2" },
      { id: "Q3", role: "NPN transistor", value: "2N2222", label: "Q3" },
      { id: "Q4", role: "NPN transistor", value: "2N2222", label: "Q4" },
      { id: "Q5", role: "NPN transistor", value: "2N2222", label: "Q5" },
      { id: "R1", role: "resistor", value: "2K" },
      { id: "R2", role: "resistor", value: "2K" },
      { id: "R3", role: "resistor", value: "2K" },
      { id: "R4", role: "resistor", value: "2K" },
      { id: "R5", role: "resistor", value: "2K" },
      { id: "RLED", role: "resistor", value: "330" },
      { id: "LED", role: "LED", value: "YELLOW" },
      { id: "BUS", role: "bus", value: "8-bit" },
      { id: "GND", role: "rail", value: "0V" },
      { id: "VCC", role: "rail", value: "+5V" }
    ],
    edges: [
      { from: "BUS", to: "Q1", label: "A" },
      { from: "BUS", to: "Q2", label: "B" },
      { from: "Q1", to: "Q2", label: "NAND" },
      { from: "Q2", to: "Q3", label: "switch" },
      { from: "Q3", to: "Q4", label: "OR-like" },
      { from: "Q3", to: "Q5", label: "OR-like" },
      { from: "Q4", to: "LED", label: "OUT" },
      { from: "Q1", to: "VCC", label: "pull-up" },
      { from: "Q2", to: "VCC", label: "pull-up" },
      { from: "Q3", to: "VCC", label: "pull-up" },
      { from: "Q4", to: "VCC", label: "pull-up" },
      { from: "Q5", to: "VCC", label: "pull-up" },
      { from: "Q1", to: "GND", label: "emitter" },
      { from: "Q3", to: "GND", label: "emitter" },
      { from: "Q4", to: "Q5", label: "OR-like" },
      { from: "Q5", to: "GND", label: "emitter" },
      { from: "LED", to: "RLED", label: "current limit" },
      { from: "RLED", to: "GND", label: "return" }
    ]
  },
  "6t-xor": {
    id: "6t-xor",
    name: "6T XOR Circuit",
    description: "The apply (full fan-out). XOR#1 + inverter.",
    vertices: [
      { id: "Q1", role: "NPN transistor", value: "2N2222", label: "Q1" },
      { id: "Q2", role: "NPN transistor", value: "2N2222", label: "Q2" },
      { id: "Q3", role: "NPN transistor", value: "2N2222", label: "Q3" },
      { id: "Q4", role: "NPN transistor", value: "2N2222", label: "Q4" },
      { id: "Q5", role: "NPN transistor", value: "2N2222", label: "Q5" },
      { id: "Q6", role: "NPN transistor", value: "2N2222", label: "Q6" },
      { id: "R1", role: "resistor", value: "2K" },
      { id: "R2", role: "resistor", value: "2K" },
      { id: "R3", role: "resistor", value: "2K" },
      { id: "R4", role: "resistor", value: "2K" },
      { id: "R5", role: "resistor", value: "2K" },
      { id: "R6", role: "resistor", value: "2K" },
      { id: "RLED", role: "resistor", value: "330" },
      { id: "LED", role: "LED", value: "YELLOW" },
      { id: "BUS", role: "bus", value: "8-bit" },
      { id: "GND", role: "rail", value: "0V" },
      { id: "VCC", role: "rail", value: "+5V" }
    ],
    edges: [
      { from: "BUS", to: "Q1", label: "A" },
      { from: "BUS", to: "Q2", label: "B" },
      { from: "Q1", to: "Q2", label: "NAND" },
      { from: "Q2", to: "Q3", label: "switch" },
      { from: "Q3", to: "Q4", label: "OR-like" },
      { from: "Q3", to: "Q5", label: "OR-like" },
      { from: "Q4", to: "LED", label: "OUT" },
      { from: "Q1", to: "VCC", label: "pull-up" },
      { from: "Q2", to: "VCC", label: "pull-up" },
      { from: "Q3", to: "VCC", label: "pull-up" },
      { from: "Q4", to: "VCC", label: "pull-up" },
      { from: "Q5", to: "VCC", label: "pull-up" },
      { from: "Q1", to: "GND", label: "emitter" },
      { from: "Q3", to: "GND", label: "emitter" },
      { from: "Q4", to: "Q5", label: "OR-like" },
      { from: "Q5", to: "GND", label: "emitter" },
      { from: "LED", to: "RLED", label: "current limit" },
      { from: "RLED", to: "GND", label: "return" }
    ]
  },
  "8t-xor": {
    id: "8t-xor",
    name: "8T XOR Circuit",
    description: "The eval (SECURE). Built from 4 NAND gates.",
    vertices: [
      { id: "Q1", role: "NPN transistor", value: "2N2222", label: "Q1", subgraph: "NAND1" },
      { id: "Q2", role: "NPN transistor", value: "2N2222", label: "Q2", subgraph: "NAND1" },
      { id: "Q3", role: "NPN transistor", value: "2N2222", label: "Q3", subgraph: "NAND2" },
      { id: "Q4", role: "NPN transistor", value: "2N2222", label: "Q4", subgraph: "NAND2" },
      { id: "Q5", role: "NPN transistor", value: "2N2222", label: "Q5", subgraph: "NAND3" },
      { id: "Q6", role: "NPN transistor", value: "2N2222", label: "Q6", subgraph: "NAND3" },
      { id: "Q7", role: "NPN transistor", value: "2N2222", label: "Q7", subgraph: "NAND4" },
      { id: "Q8", role: "NPN transistor", value: "2N2222", label: "Q8", subgraph: "NAND4" },
      { id: "LED", role: "LED", value: "GREEN", subgraph: "output" }
    ],
    edges: [
      { from: "Q1", to: "Q2", label: "NAND1" },
      { from: "Q3", to: "Q4", label: "NAND2" },
      { from: "Q5", to: "Q6", label: "NAND3" },
      { from: "Q7", to: "Q8", label: "NAND4" },
      { from: "Q2", to: "Q3", label: "chain" },
      { from: "Q4", to: "Q5", label: "chain" },
      { from: "Q6", to: "Q7", label: "chain" },
      { from: "Q8", to: "LED", label: "OUT" }
    ]
  },
  "10t-xor": {
    id: "10t-xor",
    name: "10T XOR Circuit",
    description: "The digest (reads and drives). Built from 5 NOR gates.",
    vertices: [
      { id: "Q1", role: "NPN transistor", value: "2N2222", label: "Q1", subgraph: "NOR1" },
      { id: "Q2", role: "NPN transistor", value: "2N2222", label: "Q2", subgraph: "NOR1" },
      { id: "Q3", role: "NPN transistor", value: "2N2222", label: "Q3", subgraph: "NOR2" },
      { id: "Q4", role: "NPN transistor", value: "2N2222", label: "Q4", subgraph: "NOR2" },
      { id: "Q5", role: "NPN transistor", value: "2N2222", label: "Q5", subgraph: "NOR3" },
      { id: "Q6", role: "NPN transistor", value: "2N2222", label: "Q6", subgraph: "NOR3" },
      { id: "Q7", role: "NPN transistor", value: "2N2222", label: "Q7", subgraph: "NOR4" },
      { id: "Q8", role: "NPN transistor", value: "2N2222", label: "Q8", subgraph: "NOR4" },
      { id: "Q9", role: "NPN transistor", value: "2N2222", label: "Q9", subgraph: "NOR5" },
      { id: "Q10", role: "NPN transistor", value: "2N2222", label: "Q10", subgraph: "NOR5" },
      { id: "LED", role: "LED", value: "RED", subgraph: "output" }
    ],
    edges: [
      { from: "Q1", to: "Q2", label: "NOR1" },
      { from: "Q3", to: "Q4", label: "NOR2" },
      { from: "Q5", to: "Q6", label: "NOR3" },
      { from: "Q7", to: "Q8", label: "NOR4" },
      { from: "Q9", to: "Q10", label: "NOR5" },
      { from: "Q2", to: "Q3", label: "chain" },
      { from: "Q4", to: "Q5", label: "chain" },
      { from: "Q6", to: "Q7", label: "chain" },
      { from: "Q8", to: "Q9", label: "chain" },
      { from: "Q10", to: "LED", label: "OUT" }
    ]
  }
};
function getCircuitNames() {
  return Object.keys(CIRCUITS);
}
function getCircuit(id) {
  return CIRCUITS[id];
}

// src/CircuitRenderer.ts
function renderCircuitSVG(circuit) {
  const w = 800;
  const h = 600;
  const pad = 40;
  const compW = 60;
  const compH = 40;
  const pos = /* @__PURE__ */ new Map();
  const cols = Math.ceil(Math.sqrt(circuit.vertices.length));
  const rows = Math.ceil(circuit.vertices.length / cols);
  const cellW = (w - 2 * pad) / cols;
  const cellH = (h - 2 * pad) / rows;
  circuit.vertices.forEach((v, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    pos.set(v.id, {
      x: pad + col * cellW + cellW / 2,
      y: pad + row * cellH + cellH / 2
    });
  });
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">`;
  svg += `<rect width="${w}" height="${h}" fill="#1e1e1e"/>`;
  for (const edge of circuit.edges) {
    const from = pos.get(edge.from);
    const to = pos.get(edge.to);
    if (!from || !to)
      continue;
    svg += `<line x1="${from.x}" y1="${from.y}" x2="${to.x}" y2="${to.y}" stroke="#888" stroke-width="1.5" marker-end="url(#arrow)"/>`;
    if (edge.label) {
      const mx = (from.x + to.x) / 2;
      const my = (from.y + to.y) / 2;
      svg += `<text x="${mx}" y="${my - 4}" fill="#aaa" font-size="10" text-anchor="middle">${escapeXml(edge.label)}</text>`;
    }
  }
  for (const v of circuit.vertices) {
    const p = pos.get(v.id);
    if (!p)
      continue;
    const color = getComponentColor(v.role);
    svg += `<rect x="${p.x - compW / 2}" y="${p.y - compH / 2}" width="${compW}" height="${compH}" rx="4" fill="${color}" stroke="#fff" stroke-width="1"/>`;
    svg += `<text x="${p.x}" y="${p.y - 2}" fill="#fff" font-size="9" text-anchor="middle" font-weight="bold">${escapeXml(v.id)}</text>`;
    svg += `<text x="${p.x}" y="${p.y + 10}" fill="#ddd" font-size="8" text-anchor="middle">${escapeXml(v.value)}</text>`;
  }
  svg += `<defs><marker id="arrow" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#888"/></marker></defs>`;
  svg += `</svg>`;
  return svg;
}
function getComponentColor(role) {
  const colors = {
    "NPN transistor": "#2d5a27",
    "resistor": "#5a3d2b",
    "LED": "#7a6a1a",
    "bus": "#1a3a5a",
    "rail": "#3a1a5a"
  };
  return colors[role] || "#444";
}
function escapeXml(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

// main.ts
var DEFAULT_SETTINGS = {
  defaultCircuit: "6t-xor",
  showLabels: true,
  showDatasheets: false,
  theme: "dark"
};
var VIEW_TYPE_CIRCUIT = "omi-imo-circuit-view";
var OmiImoCircuitsPlugin = class extends import_obsidian.Plugin {
  async onload() {
    await this.loadSettings();
    this.registerView(VIEW_TYPE_CIRCUIT, (leaf) => new CircuitView(leaf, this));
    this.addRibbonIcon("circuit-board", "Open Circuit Viewer", () => {
      this.activateView();
    });
    for (const id of getCircuitNames()) {
      this.addCommand({
        id: `show-${id}`,
        name: `Show ${CIRCUITS[id].name}`,
        callback: () => {
          this.activateView(id);
        }
      });
    }
    this.addCommand({
      id: "list-circuits",
      name: "List all circuits",
      callback: () => {
        const names = getCircuitNames().map((id) => `${CIRCUITS[id].name}: ${CIRCUITS[id].description}`).join("\n");
        new import_obsidian.Notice(names, 5e3);
      }
    });
    this.addSettingTab(new CircuitSettingTab(this.app, this));
  }
  onunload() {
  }
  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }
  async saveSettings() {
    await this.saveData(this.settings);
  }
  async activateView(circuitId) {
    const id = circuitId || this.settings.defaultCircuit;
    const { workspace } = this.app;
    let leaf = workspace.getLeavesOfType(VIEW_TYPE_CIRCUIT)[0];
    if (!leaf) {
      leaf = workspace.getRightLeaf(false);
      if (leaf) {
        await leaf.setViewState({ type: VIEW_TYPE_CIRCUIT, active: true });
      } else {
        new import_obsidian.Notice("No available leaf to open circuit view");
        return;
      }
    } else {
      await leaf.setViewState({ type: VIEW_TYPE_CIRCUIT, active: true });
    }
    workspace.revealLeaf(leaf);
    const view = leaf.view;
    view.setCircuit(id);
  }
};
var CircuitView = class extends import_obsidian.Component {
  constructor(leaf, plugin) {
    super();
    this.plugin = plugin;
  }
  getViewType() {
    return VIEW_TYPE_CIRCUIT;
  }
  getDisplayText() {
    return "OMI-IMO Circuit";
  }
  getIcon() {
    return "circuit-board";
  }
  async onOpen() {
    this.container = this.contentEl.createDiv({ cls: "omi-imo-circuit-container" });
    this.setCircuit(this.plugin.settings.defaultCircuit);
  }
  async onClose() {
    this.container.empty();
  }
  setCircuit(id) {
    this.circuitId = id;
    this.render();
  }
  render() {
    if (!this.container)
      return;
    this.container.empty();
    const circuit = getCircuit(this.circuitId);
    if (!circuit) {
      this.container.createEl("p", { text: `Circuit not found: ${this.circuitId}` });
      return;
    }
    this.container.createEl("h2", { text: circuit.name });
    this.container.createEl("p", { text: circuit.description });
    const svgContainer = this.container.createDiv({ cls: "omi-imo-circuit-svg" });
    svgContainer.innerHTML = renderCircuitSVG(circuit);
    if (this.plugin.settings.showDatasheets) {
      const table = this.container.createEl("table");
      const thead = table.createEl("thead");
      const headerRow = thead.createEl("tr");
      headerRow.createEl("th", { text: "ID" });
      headerRow.createEl("th", { text: "Type" });
      headerRow.createEl("th", { text: "Value" });
      headerRow.createEl("th", { text: "Datasheet" });
      const tbody = table.createEl("tbody");
      for (const v of circuit.vertices) {
        if (v.role === "NPN transistor") {
          const row = tbody.createEl("tr");
          row.createEl("td", { text: v.id });
          row.createEl("td", { text: v.role });
          row.createEl("td", { text: v.value });
          row.createEl("td", { text: "https://www.onsemi.com/pdf/datasheet/2n2222-d.pdf" });
        }
      }
    }
  }
};
var CircuitSettingTab = class extends PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }
  display() {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.createEl("h2", { text: "OMI-IMO Circuits Settings" });
    new import_obsidian.Setting(containerEl).setName("Default circuit").setDesc("The circuit to show when opening the viewer").addDropdown((dropdown) => {
      for (const id of getCircuitNames()) {
        dropdown.addOption(id, CIRCUITS[id].name);
      }
      dropdown.setValue(this.plugin.settings.defaultCircuit);
      dropdown.onChange(async (value) => {
        this.plugin.settings.defaultCircuit = value;
        await this.plugin.saveSettings();
      });
    });
    new import_obsidian.Setting(containerEl).setName("Show labels").setDesc("Show component labels on the circuit diagram").addToggle((toggle) => {
      toggle.setValue(this.plugin.settings.showLabels);
      toggle.onChange(async (value) => {
        this.plugin.settings.showLabels = value;
        await this.plugin.saveSettings();
      });
    });
    new import_obsidian.Setting(containerEl).setName("Show datasheets").setDesc("Show a datasheet table below the circuit diagram").addToggle((toggle) => {
      toggle.setValue(this.plugin.settings.showDatasheets);
      toggle.onChange(async (value) => {
        this.plugin.settings.showDatasheets = value;
        await this.plugin.saveSettings();
      });
    });
  }
};
