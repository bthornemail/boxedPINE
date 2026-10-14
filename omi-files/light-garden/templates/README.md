# Templates (Legacy HTML Prototypes)

This directory contains legacy standalone HTML dashboard prototypes.

Source of truth is the native React implementations in `automaton/ui` (tabs). These HTML files are the originals the tabs were ported from:

- `metaverse-dashboard.html` -> Bundle / Portal tab
- `worldbuilder.html` -> World tab
- `mesh-builder.html` -> Mesh tab
- `avatar-builder.html` -> Avatar tab
- `metacodex.html` -> MetaCodex tab

These HTML files are kept for:

- rapid sketching without the build pipeline
- visual reference when iterating UI/UX
- regression comparisons when porting features into `automaton/ui`

## Deployment Path Conventions

If you deploy these tools across multiple domains, keep consistent paths:

- `/portal`
- `/world`
- `/mesh`
- `/avatar`
- `/codex`

## Bundle Base Convention

The bundle portal is designed to load artifacts from a configurable base:

- `/?base=/bundles/<bundle-name>/`
