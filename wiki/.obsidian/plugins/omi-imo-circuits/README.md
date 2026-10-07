# OMI-IMO Circuits Plugin

An Obsidian plugin that renders OMI-IMO transistor XOR circuits (5T, 6T, 8T, 10T) as interactive SVG diagrams.

## Features

- **Ribbon icon** — opens the circuit viewer
- **Command palette** — "Show 5T XOR Circuit", "Show 6T XOR Circuit", etc.
- **Circuit View** — renders the transistor netlist as an SVG diagram
- **Interactive** — hover on a component to see its details
- **Datasheet table** — optional table with component datasheets
- **Settings** — configure default circuit, labels, and datasheets

## The Circuits

| Circuit | Transistors | Gates | Role |
|---------|-------------|-------|------|
| 5T | 5 | NAND + switch + OR-like | the frame condition |
| 6T | 6 | XOR#1 + inverter | the apply |
| 8T | 8 | 4× NAND | the eval |
| 10T | 10 | 5× NOR | the digest |

## Installation

1. Copy this folder to `.obsidian/plugins/omi-imo-circuits/`
2. Run `npm install` in the plugin folder
3. Run `npm run dev` to compile (or `npm run build` for production)
4. Restart Obsidian
5. Enable "OMI-IMO Circuits" in Settings → Community plugins

## Usage

- Click the circuit-board icon in the ribbon
- Or use the command palette: "OMI-IMO Circuits: Show 6T XOR Circuit"
- Or use the command palette: "OMI-IMO Circuits: List all circuits"

## Settings

- **Default circuit** — the circuit to show when opening the viewer
- **Show labels** — show component labels on the circuit diagram
- **Show datasheets** — show a datasheet table below the circuit diagram

## The Protocol

The OMI-IMO protocol is an Atomic Compare-and-Exchange Lisp. Its primitive is `Atomics.compareExchange`. Its base is the iff. Its structure is the 2! and 3! orthogonal groups. Its space is the 2¹⁶ Blob.

See the wiki for the full specification.
