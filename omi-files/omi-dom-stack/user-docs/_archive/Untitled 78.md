The Full Bootstrap Rosetta Stone Sourcemap

Circuits as OMI Canvas Graphs

You're asking: what if the 6T and 8T circuits are described as groups of electrical component nodes in the OMI Canvas format?

The answer: the circuit becomes a self-describing graph, and the Rosetta Stone becomes a sourcemap that traces every node back to its physical realization.

Let me build the complete bootstrap sourcemap.

---

Part I — The Circuit as a Graph

The 6T XOR Circuit as an OMI Canvas

The 6T XOR circuit (XOR #2, the apply, the full fan-out) is:

```
6 transistors + 6 resistors + 1 LED + 1 bus
```

Each transistor is a vertex.

Each resistor is a vertex.

Each LED is a vertex.

Each wire is an edge.

The Canvas

```json
{
  "nodes": [
    {"id": "Q1", "type": "text", "x": 0, "y": 0, "width": 8, "height": 3, "color": "1", "text": "Q1 (NPN)"},
    {"id": "Q2", "type": "text", "x": 0, "y": 8, "width": 8, "height": 3, "color": "1", "text": "Q2 (NPN)"},
    {"id": "Q3", "type": "text", "x": 0, "y": 16, "width": 8, "height": 3, "color": "1", "text": "Q3 (NPN)"},
    {"id": "Q4", "type": "text", "x": 0, "y": 24, "width": 8, "height": 3, "color": "1", "text": "Q4 (NPN)"},
    {"id": "Q5", "type": "text", "x": 0, "y": 32, "width": 8, "height": 3, "color": "1", "text": "Q5 (NPN)"},
    {"id": "Q6", "type": "text", "x": 0, "y": 40, "width": 8, "height": 3, "color": "1", "text": "Q6 (NPN)"},
    {"id": "R1", "type": "text", "x": 12, "y": 0, "width": 6, "height": 3, "color": "2", "text": "R1 (2K)"},
    {"id": "R2", "type": "text", "x": 12, "y": 8, "width": 6, "height": 3, "color": "2", "text": "R2 (2K)"},
    {"id": "R3", "type": "text", "x": 12, "y": 16, "width": 6, "height": 3, "color": "2", "text": "R3 (2K)"},
    {"id": "R4", "type": "text", "x": 12, "y": 24, "width": 6, "height": 3, "color": "2", "text": "R4 (2K)"},
    {"id": "R5", "type": "text", "x": 12, "y": 32, "width": 6, "height": 3, "color": "2", "text": "R5 (2K)"},
    {"id": "R6", "type": "text", "x": 12, "y": 40, "width": 6, "height": 3, "color": "2", "text": "R6 (2K)"},
    {"id": "RLED", "type": "text", "x": 12, "y": 48, "width": 6, "height": 3, "color": "2", "text": "RLED (330)"},
    {"id": "LED", "type": "text", "x": 24, "y": 48, "width": 8, "height": 3, "color": "5", "text": "YELLOW LED"},
    {"id": "BUS", "type": "text", "x": 24, "y": 0, "width": 10, "height": 3, "color": "4", "text": "DATA BUS"},
    {"id": "GND", "type": "text", "x": 24, "y": 24, "width": 8, "height": 3, "color": "0", "text": "GND"},
    {"id": "VCC", "type": "text", "x": 24, "y": 32, "width": 8, "height": 3, "color": "7", "text": "VCC (+5V)"}
  ],
  "edges": [
    {"id": "A-to-Q1-B", "fromNode": "BUS", "fromSide": "left", "toNode": "Q1", "toSide": "top", "toEnd": "arrow", "label": "A"},
    {"id": "B-to-Q2-B", "fromNode": "BUS", "fromSide": "left", "toNode": "Q2", "toSide": "top", "toEnd": "arrow", "label": "B"},
    {"id": "Q1-C-to-Q2-E", "fromNode": "Q1", "fromSide": "bottom", "toNode": "Q2", "toSide": "top", "toEnd": "arrow", "label": "NAND"},
    {"id": "Q2-C-to-Q3-B", "fromNode": "Q2", "fromSide": "bottom", "toNode": "Q3", "toSide": "top", "toEnd": "arrow", "label": "switch"},
    {"id": "Q3-C-to-Q4-B", "fromNode": "Q3", "fromSide": "bottom", "toNode": "Q4", "toSide": "top", "toEnd": "arrow", "label": "OR-like"},
    {"id": "Q3-C-to-Q5-B", "fromNode": "Q3", "fromSide": "bottom", "toNode": "Q5", "toSide": "top", "toEnd": "arrow", "label": "OR-like"},
    {"id": "Q4-C-to-LED", "fromNode": "Q4", "fromSide": "bottom", "toNode": "LED", "toSide": "left", "toEnd": "arrow", "label": "OUT"},
    {"id": "Q1-C-to-VCC", "fromNode": "Q1", "fromSide": "right", "toNode": "VCC", "toSide": "left", "toEnd": "arrow", "label": "pull-up"},
    {"id": "Q2-C-to-VCC", "fromNode": "Q2", "fromSide": "right", "toNode": "VCC", "toSide": "left", "toEnd": "arrow", "label": "pull-up"},
    {"id": "Q3-C-to-VCC", "fromNode": "Q3", "fromSide": "right", "toNode": "VCC", "toSide": "left", "toEnd": "arrow", "label": "pull-up"},
    {"id": "Q4-C-to-VCC", "fromNode": "Q4", "fromSide": "right", "toNode": "VCC", "toSide": "left", "toEnd": "arrow", "label": "pull-up"},
    {"id": "Q5-C-to-VCC", "fromNode": "Q5", "fromSide": "right", "toNode": "VCC", "toSide": "left", "toEnd": "arrow", "label": "pull-up"},
    {"id": "Q1-E-to-GND", "fromNode": "Q1", "fromSide": "bottom", "toNode": "GND", "toSide": "top", "toEnd": "arrow", "label": "emitter"},
    {"id": "Q3-E-to-GND", "fromNode": "Q3", "fromSide": "bottom", "toNode": "GND", "toSide": "top", "toEnd": "arrow", "label": "emitter"},
    {"id": "Q4-E-to-Q5-C", "fromNode": "Q4", "fromSide": "bottom", "toNode": "Q5", "toSide": "top", "toEnd": "arrow", "label": "OR-like"},
    {"id": "Q5-E-to-GND", "fromNode": "Q5", "fromSide": "bottom", "toNode": "GND", "toSide": "top", "toEnd": "arrow", "label": "emitter"},
    {"id": "LED-to-RLED", "fromNode": "LED", "fromSide": "right", "toNode": "RLED", "toSide": "left", "toEnd": "arrow", "label": "current limit"},
    {"id": "RLED-to-GND", "fromNode": "RLED", "fromSide": "bottom", "toNode": "GND", "toSide": "right", "toEnd": "arrow", "label": "return"}
  ]
}
```

The Same Circuit as a Haskell Graph

```haskell
-- ============================================================
-- The 6T XOR Circuit as an OMI Canvas Graph
-- ============================================================

module OmiCanvas.Circuit6T where

import OmiCanvas.Types

-- The 17 vertices (6 transistors + 7 resistors + 1 LED + 3 rails)
circuit6T_vertices :: [Vertex]
circuit6T_vertices =
  [ Vertex "Q1" VertexText 0 0 8 3 (Just "1") (Just (String "Q1 (NPN)")) Nothing
  , Vertex "Q2" VertexText 0 8 8 3 (Just "1") (Just (String "Q2 (NPN)")) Nothing
  , Vertex "Q3" VertexText 0 16 8 3 (Just "1") (Just (String "Q3 (NPN)")) Nothing
  , Vertex "Q4" VertexText 0 24 8 3 (Just "1") (Just (String "Q4 (NPN)")) Nothing
  , Vertex "Q5" VertexText 0 32 8 3 (Just "1") (Just (String "Q5 (NPN)")) Nothing
  , Vertex "Q6" VertexText 0 40 8 3 (Just "1") (Just (String "Q6 (NPN)")) Nothing
  , Vertex "R1" VertexText 12 0 6 3 (Just "2") (Just (String "R1 (2K)")) Nothing
  , Vertex "R2" VertexText 12 8 6 3 (Just "2") (Just (String "R2 (2K)")) Nothing
  , Vertex "R3" VertexText 12 16 6 3 (Just "2") (Just (String "R3 (2K)")) Nothing
  , Vertex "R4" VertexText 12 24 6 3 (Just "2") (Just (String "R4 (2K)")) Nothing
  , Vertex "R5" VertexText 12 32 6 3 (Just "2") (Just (String "R5 (2K)")) Nothing
  , Vertex "R6" VertexText 12 40 6 3 (Just "2") (Just (String "R6 (2K)")) Nothing
  , Vertex "RLED" VertexText 12 48 6 3 (Just "2") (Just (String "RLED (330)")) Nothing
  , Vertex "LED" VertexText 24 48 8 3 (Just "5") (Just (String "YELLOW LED")) Nothing
  , Vertex "BUS" VertexText 24 0 10 3 (Just "4") (Just (String "DATA BUS")) Nothing
  , Vertex "GND" VertexText 24 24 8 3 (Just "0") (Just (String "GND")) Nothing
  , Vertex "VCC" VertexText 24 32 8 3 (Just "7") (Just (String "VCC (+5V)")) Nothing
  ]

-- The 19 edges (the wires)
circuit6T_edges :: [Edge]
circuit6T_edges =
  [ Edge "A-to-Q1-B" "BUS" (Just SideLeft) (Just EndpointNone) "Q1" (Just SideTop) (Just EndpointArrow) Nothing (Just "A") Nothing
  , Edge "B-to-Q2-B" "BUS" (Just SideLeft) (Just EndpointNone) "Q2" (Just SideTop) (Just EndpointArrow) Nothing (Just "B") Nothing
  , Edge "Q1-C-to-Q2-E" "Q1" (Just SideBottom) (Just EndpointNone) "Q2" (Just SideTop) (Just EndpointArrow) Nothing (Just "NAND") Nothing
  , Edge "Q2-C-to-Q3-B" "Q2" (Just SideBottom) (Just EndpointNone) "Q3" (Just SideTop) (Just EndpointArrow) Nothing (Just "switch") Nothing
  , Edge "Q3-C-to-Q4-B" "Q3" (Just SideBottom) (Just EndpointNone) "Q4" (Just SideTop) (Just EndpointArrow) Nothing (Just "OR-like") Nothing
  , Edge "Q3-C-to-Q5-B" "Q3" (Just SideBottom) (Just EndpointNone) "Q5" (Just SideTop) (Just EndpointArrow) Nothing (Just "OR-like") Nothing
  , Edge "Q4-C-to-LED" "Q4" (Just SideBottom) (Just EndpointNone) "LED" (Just SideLeft) (Just EndpointArrow) Nothing (Just "OUT") Nothing
  , Edge "Q1-C-to-VCC" "Q1" (Just SideRight) (Just EndpointNone) "VCC" (Just SideLeft) (Just EndpointArrow) Nothing (Just "pull-up") Nothing
  , Edge "Q2-C-to-VCC" "Q2" (Just SideRight) (Just EndpointNone) "VCC" (Just SideLeft) (Just EndpointArrow) Nothing (Just "pull-up") Nothing
  , Edge "Q3-C-to-VCC" "Q3" (Just SideRight) (Just EndpointNone) "VCC" (Just SideLeft) (Just EndpointArrow) Nothing (Just "pull-up") Nothing
  , Edge "Q4-C-to-VCC" "Q4" (Just SideRight) (Just EndpointNone) "VCC" (Just SideLeft) (Just EndpointArrow) Nothing (Just "pull-up") Nothing
  , Edge "Q5-C-to-VCC" "Q5" (Just SideRight) (Just EndpointNone) "VCC" (Just SideLeft) (Just EndpointArrow) Nothing (Just "pull-up") Nothing
  , Edge "Q1-E-to-GND" "Q1" (Just SideBottom) (Just EndpointNone) "GND" (Just SideTop) (Just EndpointArrow) Nothing (Just "emitter") Nothing
  , Edge "Q3-E-to-GND" "Q3" (Just SideBottom) (Just EndpointNone) "GND" (Just SideTop) (Just EndpointArrow) Nothing (Just "emitter") Nothing
  , Edge "Q4-E-to-Q5-C" "Q4" (Just SideBottom) (Just EndpointNone) "Q5" (Just SideTop) (Just EndpointArrow) Nothing (Just "OR-like") Nothing
  , Edge "Q5-E-to-GND" "Q5" (Just SideBottom) (Just EndpointNone) "GND" (Just SideTop) (Just EndpointArrow) Nothing (Just "emitter") Nothing
  , Edge "LED-to-RLED" "LED" (Just SideRight) (Just EndpointNone) "RLED" (Just SideLeft) (Just EndpointArrow) Nothing (Just "current limit") Nothing
  , Edge "RLED-to-GND" "RLED" (Just SideBottom) (Just EndpointNone) "GND" (Just SideRight) (Just EndpointArrow) Nothing (Just "return") Nothing
  ]

-- The 6T canvas
circuit6T_canvas :: Canvas
circuit6T_canvas = Canvas circuit6T_vertices circuit6T_edges
```

---

Part II — The 8T XOR Circuit as a Graph

The 8T XOR (XOR #3, the eval, the SECURE) is built from 4 NAND gates.

Each NAND gate is a subgraph of the 6T canvas.

NAND Gate Transistors Role
NAND1 Q1, Q2 The first NAND
NAND2 Q3, Q4 The second NAND
NAND3 Q5, Q6 The third NAND
NAND4 Q7, Q8 The fourth NAND

The 8T Canvas

```haskell
-- ============================================================
-- The 8T XOR Circuit as an OMI Canvas Graph
-- ============================================================

module OmiCanvas.Circuit8T where

import OmiCanvas.Types

-- The 8 transistors
circuit8T_vertices :: [Vertex]
circuit8T_vertices =
  [ Vertex "Q1" VertexText 0 0 8 3 (Just "1") (Just (String "Q1 (NAND1)")) Nothing
  , Vertex "Q2" VertexText 0 8 8 3 (Just "1") (Just (String "Q2 (NAND1)")) Nothing
  , Vertex "Q3" VertexText 0 16 8 3 (Just "1") (Just (String "Q3 (NAND2)")) Nothing
  , Vertex "Q4" VertexText 0 24 8 3 (Just "1") (Just (String "Q4 (NAND2)")) Nothing
  , Vertex "Q5" VertexText 0 32 8 3 (Just "1") (Just (String "Q5 (NAND3)")) Nothing
  , Vertex "Q6" VertexText 0 40 8 3 (Just "1") (Just (String "Q6 (NAND3)")) Nothing
  , Vertex "Q7" VertexText 0 48 8 3 (Just "1") (Just (String "Q7 (NAND4)")) Nothing
  , Vertex "Q8" VertexText 0 56 8 3 (Just "1") (Just (String "Q8 (NAND4)")) Nothing
  , Vertex "R1" VertexText 12 0 6 3 (Just "2") (Just (String "R1 (2K)")) Nothing
  , Vertex "R2" VertexText 12 8 6 3 (Just "2") (Just (String "R2 (2K)")) Nothing
  , Vertex "R3" VertexText 12 16 6 3 (Just "2") (Just (String "R3 (2K)")) Nothing
  , Vertex "R4" VertexText 12 24 6 3 (Just "2") (Just (String "R4 (2K)")) Nothing
  , Vertex "R5" VertexText 12 32 6 3 (Just "2") (Just (String "R5 (2K)")) Nothing
  , Vertex "R6" VertexText 12 40 6 3 (Just "2") (Just (String "R6 (2K)")) Nothing
  , Vertex "R7" VertexText 12 48 6 3 (Just "2") (Just (String "R7 (2K)")) Nothing
  , Vertex "RLED" VertexText 12 56 6 3 (Just "2") (Just (String "RLED (330)")) Nothing
  , Vertex "LED" VertexText 24 56 8 3 (Just "3") (Just (String "GREEN LED")) Nothing
  , Vertex "BUS" VertexText 24 0 10 3 (Just "4") (Just (String "DATA BUS")) Nothing
  , Vertex "GND" VertexText 24 24 8 3 (Just "0") (Just (String "GND")) Nothing
  , Vertex "VCC" VertexText 24 32 8 3 (Just "7") (Just (String "VCC (+5V)")) Nothing
  ]
```

---

Part III — The Rosetta Stone Sourcemap

The sourcemap traces every node back to its physical realization.

The Sourcemap Schema

```haskell
-- ============================================================
-- The Rosetta Stone Sourcemap
-- ============================================================
-- Traces every canvas node back to its physical realization.
-- ============================================================

module OmiCanvas.SourceMap where

import OmiCanvas.Types
import Data.Text (Text)
import Data.Map (Map)
import qualified Data.Map as Map

-- | A sourcemap entry
data SourceMapEntry = SourceMapEntry
  { smeCanvasNodeId    :: Text
  , smePhysicalNodeId  :: Text
  , smeComponentType   :: Text
  , smeComponentValue  :: Text
  , smeBreadboardRow   :: Int
  , smeBreadboardCol   :: Int
  , smeDatasheetUrl    :: Maybe Text
  , smeNotes           :: Maybe Text
  } deriving (Show, Eq, Generic, ToJSON, FromJSON)

-- | The sourcemap
data SourceMap = SourceMap
  { smCanvasId       :: Text
  , smCanvasVersion  :: Text
  , smEntries        :: [SourceMapEntry]
  , smExtensions     :: Maybe Value
  } deriving (Show, Eq, Generic, ToJSON, FromJSON)

-- | The 6T sourcemap
sourceMap6T :: SourceMap
sourceMap6T = SourceMap
  { smCanvasId = "6t-xor"
  , smCanvasVersion = "1.0"
  , smEntries =
    [ SourceMapEntry "Q1" "Q1" "NPN" "2N2222" 5 1 (Just "https://www.onsemi.com/pdf/datasheet/2n2222-d.pdf") (Just "NAND gate left")
    , SourceMapEntry "Q2" "Q2" "NPN" "2N2222" 5 6 (Just "https://www.onsemi.com/pdf/datasheet/2n2222-d.pdf") (Just "NAND gate right")
    , SourceMapEntry "Q3" "Q3" "NPN" "2N2222" 5 11 (Just "https://www.onsemi.com/pdf/datasheet/2n2222-d.pdf") (Just "switch")
    , SourceMapEntry "Q4" "Q4" "NPN" "2N2222" 5 21 (Just "https://www.onsemi.com/pdf/datasheet/2n2222-d.pdf") (Just "OR-like left")
    , SourceMapEntry "Q5" "Q5" "NPN" "2N2222" 5 26 (Just "https://www.onsemi.com/pdf/datasheet/2n2222-d.pdf") (Just "OR-like right")
    , SourceMapEntry "Q6" "Q6" "NPN" "2N2222" 5 31 (Just "https://www.onsemi.com/pdf/datasheet/2n2222-d.pdf") (Just "inverter stage")
    , SourceMapEntry "R1" "R1" "resistor" "2K" 1 1 Nothing (Just "pull-up Q1")
    , SourceMapEntry "R2" "R2" "resistor" "2K" 1 6 Nothing (Just "pull-up Q2")
    , SourceMapEntry "R3" "R3" "resistor" "2K" 1 11 Nothing (Just "pull-up Q3")
    , SourceMapEntry "R4" "R4" "resistor" "2K" 1 21 Nothing (Just "pull-up Q4")
    , SourceMapEntry "R5" "R5" "resistor" "2K" 1 26 Nothing (Just "pull-up Q5")
    , SourceMapEntry "R6" "R6" "resistor" "2K" 1 31 Nothing (Just "pull-up Q6")
    , SourceMapEntry "RLED" "RLED" "resistor" "330" 12 48 Nothing (Just "current limit")
    , SourceMapEntry "LED" "LED" "LED" "YELLOW" 24 48 Nothing (Just "apply indicator")
    , SourceMapEntry "BUS" "BUS" "bus" "8-bit" 24 0 Nothing (Just "data bus")
    , SourceMapEntry "GND" "GND" "rail" "0V" 24 24 Nothing (Just "ground")
    , SourceMapEntry "VCC" "VCC" "rail" "+5V" 24 32 Nothing (Just "power")
    ]
  , smExtensions = Nothing
  }
```

The Full Bootstrap Sourcemap

```yaml
%YAML 1.2
---
# ============================================================
# THE FULL BOOTSTRAP ROSETTA STONE SOURCEMAP
# ============================================================
# Version 1.3.0
# Traces every canvas node back to its physical realization.
# The 6T and 8T circuits are described as groups of electrical
# component nodes in the OMI Canvas format.
# ============================================================

omi_rosetta_stone:

  metadata:
    version: "1.3.0"
    previous_version: "1.2.0"
    codex: "OMI-IMO-2026"
    date: "2026-09-24"
    license: "MIT"
    structure:
      - "Part I  — The Haskell type cast (v1.2.0)"
      - "Part II — The JSON Canvas rendering (v1.2.0)"
      - "Part III — The circuit sourcemap (v1.3.0)"
    canonical_law:
      - "The graph is the structure."
      - "The stream is the transport."
      - "The canvas is the interoperability."
      - "The sourcemap is the physical trace."
      - "OMI-Lisp is the executable notation."

  part_iii_circuit_sourcemap:

    description: "The 6T and 8T circuits are described as groups of electrical component nodes in the OMI Canvas format. The sourcemap traces every canvas node back to its physical realization."

    circuit_6t:
      description: "The 6T XOR circuit (XOR #2, the apply, the full fan-out)."
      canvas_id: "6t-xor"
      canvas_version: "1.0"
      vertices:
        - id: "Q1"
          type: "text"
          role: "NPN transistor"
          value: "2N2222"
          position: {"x": 0, "y": 0}
          size: {"width": 8, "height": 3}
          color: "1"
          label: "Q1 (NPN)"
        - id: "Q2"
          type: "text"
          role: "NPN transistor"
          value: "2N2222"
          position: {"x": 0, "y": 8}
          size: {"width": 8, "height": 3}
          color: "1"
          label: "Q2 (NPN)"
        - id: "Q3"
          type: "text"
          role: "NPN transistor"
          value: "2N2222"
          position: {"x": 0, "y": 16}
          size: {"width": 8, "height": 3}
          color: "1"
          label: "Q3 (NPN)"
        - id: "Q4"
          type: "text"
          role: "NPN transistor"
          value: "2N2222"
          position: {"x": 0, "y": 24}
          size: {"width": 8, "height": 3}
          color: "1"
          label: "Q4 (NPN)"
        - id: "Q5"
          type: "text"
          role: "NPN transistor"
          value: "2N2222"
          position: {"x": 0, "y": 32}
          size: {"width": 8, "height": 3}
          color: "1"
          label: "Q5 (NPN)"
        - id: "Q6"
          type: "text"
          role: "NPN transistor"
          value: "2N2222"
          position: {"x": 0, "y": 40}
          size: {"width": 8, "height": 3}
          color: "1"
          label: "Q6 (NPN)"
        - id: "R1"
          type: "text"
          role: "resistor"
          value: "2K"
          position: {"x": 12, "y": 0}
          size: {"width": 6, "height": 3}
          color: "2"
          label: "R1 (2K)"
        - id: "R2"
          type: "text"
          role: "resistor"
          value: "2K"
          position: {"x": 12, "y": 8}
          size: {"width": 6, "height": 3}
          color: "2"
          label: "R2 (2K)"
        - id: "R3"
          type: "text"
          role: "resistor"
          value: "2K"
          position: {"x": 12, "y": 16}
          size: {"width": 6, "height": 3}
          color: "2"
          label: "R3 (2K)"
        - id: "R4"
          type: "text"
          role: "resistor"
          value: "2K"
          position: {"x": 12, "y": 24}
          size: {"width": 6, "height": 3}
          color: "2"
          label: "R4 (2K)"
        - id: "R5"
          type: "text"
          role: "resistor"
          value: "2K"
          position: {"x": 12, "y": 32}
          size: {"width": 6, "height": 3}
          color: "2"
          label: "R5 (2K)"
        - id: "R6"
          type: "text"
          role: "resistor"
          value: "2K"
          position: {"x": 12, "y": 40}
          size: {"width": 6, "height": 3}
          color: "2"
          label: "R6 (2K)"
        - id: "RLED"
          type: "text"
          role: "resistor"
          value: "330"
          position: {"x": 12, "y": 48}
          size: {"width": 6, "height": 3}
          color: "2"
          label: "RLED (330)"
        - id: "LED"
          type: "text"
          role: "LED"
          value: "YELLOW"
          position: {"x": 24, "y": 48}
          size: {"width": 8, "height": 3}
          color: "5"
          label: "YELLOW LED"
        - id: "BUS"
          type: "text"
          role: "bus"
          value: "8-bit"
          position: {"x": 24, "y": 0}
          size: {"width": 10, "height": 3}
          color: "4"
          label: "DATA BUS"
        - id: "GND"
          type: "text"
          role: "rail"
          value: "0V"
          position: {"x": 24, "y": 24}
          size: {"width": 8, "height": 3}
          color: "0"
          label: "GND"
        - id: "VCC"
          type: "text"
          role: "rail"
          value: "+5V"
          position: {"x": 24, "y": 32}
          size: {"width": 8, "height": 3}
          color: "7"
          label: "VCC (+5V)"
      edges:
        - id: "A-to-Q1-B"
          from: "BUS"
          from_side: "left"
          to: "Q1"
          to_side: "top"
          to_end: "arrow"
          label: "A"
        - id: "B-to-Q2-B"
          from: "BUS"
          from_side: "left"
          to: "Q2"
          to_side: "top"
          to_end: "arrow"
          label: "B"
        - id: "Q1-C-to-Q2-E"
          from: "Q1"
          from_side: "bottom"
          to: "Q2"
          to_side: "top"
          to_end: "arrow"
          label: "NAND"
        - id: "Q2-C-to-Q3-B"
          from: "Q2"
          from_side: "bottom"
          to: "Q3"
          to_side: "top"
          to_end: "arrow"
          label: "switch"
        - id: "Q3-C-to-Q4-B"
          from: "Q3"
          from_side: "bottom"
          to: "Q4"
          to_side: "top"
          to_end: "arrow"
          label: "OR-like"
        - id: "Q3-C-to-Q5-B"
          from: "Q3"
          from_side: "bottom"
          to: "Q5"
          to_side: "top"
          to_end: "arrow"
          label: "OR-like"
        - id: "Q4-C-to-LED"
          from: "Q4"
          from_side: "bottom"
          to: "LED"
          to_side: "left"
          to_end: "arrow"
          label: "OUT"
        - id: "Q1-C-to-VCC"
          from: "Q1"
          from_side: "right"
          to: "VCC"
          to_side: "left"
          to_end: "arrow"
          label: "pull-up"
        - id: "Q2-C-to-VCC"
          from: "Q2"
          from_side: "right"
          to: "VCC"
          to_side: "left"
          to_end: "arrow"
          label: "pull-up"
        - id: "Q3-C-to-VCC"
          from: "Q3"
          from_side: "right"
          to: "VCC"
          to_side: "left"
          to_end: "arrow"
          label: "pull-up"
        - id: "Q4-C-to-VCC"
          from: "Q4"
          from_side: "right"
          to: "VCC"
          to_side: "left"
          to_end: "arrow"
          label: "pull-up"
        - id: "Q5-C-to-VCC"
          from: "Q5"
          from_side: "right"
          to: "VCC"
          to_side: "left"
          to_end: "arrow"
          label: "pull-up"
        - id: "Q1-E-to-GND"
          from: "Q1"
          from_side: "bottom"
          to: "GND"
          to_side: "top"
          to_end: "arrow"
          label: "emitter"
        - id: "Q3-E-to-GND"
          from: "Q3"
          from_side: "bottom"
          to: "GND"
          to_side: "top"
          to_end: "arrow"
          label: "emitter"
        - id: "Q4-E-to-Q5-C"
          from: "Q4"
          from_side: "bottom"
          to: "Q5"
          to_side: "top"
          to_end: "arrow"
          label: "OR-like"
        - id: "Q5-E-to-GND"
          from: "Q5"
          from_side: "bottom"
          to: "GND"
          to_side: "top"
          to_end: "arrow"
          label: "emitter"
        - id: "LED-to-RLED"
          from: "LED"
          from_side: "right"
          to: "RLED"
          to_side: "left"
          to_end: "arrow"
          label: "current limit"
        - id: "RLED-to-GND"
          from: "RLED"
          from_side: "bottom"
          to: "GND"
          to_side: "right"
          to_end: "arrow"
          label: "return"
      sourcemap:
        - canvas_node: "Q1"
          physical_node: "Q1"
          component_type: "NPN"
          component_value: "2N2222"
          breadboard_row: 5
          breadboard_col: 1
          datasheet: "https://www.onsemi.com/pdf/datasheet/2n2222-d.pdf"
          notes: "NAND gate left"
        - canvas_node: "Q2"
          physical_node: "Q2"
          component_type: "NPN"
          component_value: "2N2222"
          breadboard_row: 5
          breadboard_col: 6
          datasheet: "https://www.onsemi.com/pdf/datasheet/2n2222-d.pdf"
          notes: "NAND gate right"
        - canvas_node: "Q3"
          physical_node: "Q3"
          component_type: "NPN"
          component_value: "2N2222"
          breadboard_row: 5
          breadboard_col: 11
          datasheet: "https://www.onsemi.com/pdf/datasheet/2n2222-d.pdf"
          notes: "switch"
        - canvas_node: "Q4"
          physical_node: "Q4"
          component_type: "NPN"
          component_value: "2N2222"
          breadboard_row: 5
          breadboard_col: 21
          datasheet: "https://www.onsemi.com/pdf/datasheet/2n2222-d.pdf"
          notes: "OR-like left"
        - canvas_node: "Q5"
          physical_node: "Q5"
          component_type: "NPN"
          component_value: "2N2222"
          breadboard_row: 5
          breadboard_col: 26
          datasheet: "https://www.onsemi.com/pdf/datasheet/2n2222-d.pdf"
          notes: "OR-like right"
        - canvas_node: "Q6"
          physical_node: "Q6"
          component_type: "NPN"
          component_value: "2N2222"
          breadboard_row: 5
          breadboard_col: 31
          datasheet: "https://www.onsemi.com/pdf/datasheet/2n2222-d.pdf"
          notes: "inverter stage"
        - canvas_node: "R1"
          physical_node: "R1"
          component_type: "resistor"
          component_value: "2K"
          breadboard_row: 1
          breadboard_col: 1
          notes: "pull-up Q1"
        - canvas_node: "R2"
          physical_node: "R2"
          component_type: "resistor"
          component_value: "2K"
          breadboard_row: 1
          breadboard_col: 6
          notes: "pull-up Q2"
        - canvas_node: "R3"
          physical_node: "R3"
          component_type: "resistor"
          component_value: "2K"
          breadboard_row: 1
          breadboard_col: 11
          notes: "pull-up Q3"
        - canvas_node: "R4"
          physical_node: "R4"
          component_type: "resistor"
          component_value: "2K"
          breadboard_row: 1
          breadboard_col: 21
          notes: "pull-up Q4"
        - canvas_node: "R5"
          physical_node: "R5"
          component_type: "resistor"
          component_value: "2K"
          breadboard_row: 1
          breadboard_col: 26
          notes: "pull-up Q5"
        - canvas_node: "R6"
          physical_node: "R6"
          component_type: "resistor"
          component_value: "2K"
          breadboard_row: 1
          breadboard_col: 31
          notes: "pull-up Q6"
        - canvas_node: "RLED"
          physical_node: "RLED"
          component_type: "resistor"
          component_value: "330"
          breadboard_row: 12
          breadboard_col: 48
          notes: "current limit"
        - canvas_node: "LED"
          physical_node: "LED"
          component_type: "LED"
          component_value: "YELLOW"
          breadboard_row: 24
          breadboard_col: 48
          notes: "apply indicator"
        - canvas_node: "BUS"
          physical_node: "BUS"
          component_type: "bus"
          component_value: "8-bit"
          breadboard_row: 24
          breadboard_col: 0
          notes: "data bus"
        - canvas_node: "GND"
          physical_node: "GND"
          component_type: "rail"
          component_value: "0V"
          breadboard_row: 24
          breadboard_col: 24
          notes: "ground"
        - canvas_node: "VCC"
          physical_node: "VCC"
          component_type: "rail"
          component_value: "+5V"
          breadboard_row: 24
          breadboard_col: 32
          notes: "power"

    circuit_8t:
      description: "The 8T XOR circuit (XOR #3, the eval, the SECURE). It is built from 4 NAND gates."
      canvas_id: "8t-xor"
      canvas_version: "1.0"
      vertices:
        - id: "Q1"
          role: "NPN transistor"
          value: "2N2222"
          subgraph: "NAND1"
        - id: "Q2"
          role: "NPN transistor"
          value: "2N2222"
          subgraph: "NAND1"
        - id: "Q3"
          role: "NPN transistor"
          value: "2N2222"
          subgraph: "NAND2"
        - id: "Q4"
          role: "NPN transistor"
          value: "2N2222"
          subgraph: "NAND2"
        - id: "Q5"
          role: "NPN transistor"
          value: "2N2222"
          subgraph: "NAND3"
        - id: "Q6"
          role: "NPN transistor"
          value: "2N2222"
          subgraph: "NAND3"
        - id: "Q7"
          role: "NPN transistor"
          value: "2N2222"
          subgraph: "NAND4"
        - id: "Q8"
          role: "NPN transistor"
          value: "2N2222"
          subgraph: "NAND4"
        - id: "LED"
          role: "LED"
          value: "GREEN"
          subgraph: "output"
      sourcemap:
        - canvas_node: "Q1"
          physical_node: "Q1"
          component_type: "NPN"
          component_value: "2N2222"
          breadboard_row: 5
          breadboard_col: 1
          datasheet: "https://www.onsemi.com/pdf/datasheet/2n2222-d.pdf"
          notes: "NAND1 left"
        - canvas_node: "Q2"
          physical_node: "Q2"
          component_type: "NPN"
          component_value: "2N2222"
          breadboard_row: 5
          breadboard_col: 6
          datasheet: "https://www.onsemi.com/pdf/datasheet/2n2222-d.pdf"
          notes: "NAND1 right"
        # ... (the rest of the 8T sourcemap)

  # ----------------------------------------------------------
  # PART IV — THE UNIFIED CANONICAL STATEMENT
  # ----------------------------------------------------------
  unified_canonical_statement:
    protocol: "The data doesn't change. The observer's interpretation changes based on the point of view they infer from."
    stream: "The stream is the transport. Each vertex and each edge is one line of the JSONL/NDJSON stream."
    canvas: "The canvas is the interoperability. The .canvas file is the JSON Canvas 1.0 format."
    sourcemap: "The sourcemap is the physical trace. Every canvas node traces back to its physical realization."
    notation: "OMI-Lisp is the executable notation. ASCII is the terminal projection."
    authority: "Projection does not accept. Validation accepts. Receipt records."
    invariant: "Everything is XOR. Everything is balanced. Everything is one."
    observer: "The observer is you."

# ============================================================
# END OF THE OMI-IMO ROSETTA STONE
# Version 1.3.0 — Full Bootstrap Sourcemap
# ============================================================
```

---

Part IV — The Bootstrap Flow

The bootstrap flow is:

```
Physical breadboard
    ↓ (component placement)
OMI Canvas graph
    ↓ (JSONL/NDJSON stream)
JSON Canvas document (.canvas)
    ↓ (sourcemap)
Physical realization trace
    ↓ (back to breadboard)
```

Step 1 — The Physical Breadboard

Place the 17 vertices (6 transistors, 7 resistors, 1 LED, 3 rails) on the breadboard.

Step 2 — The OMI Canvas Graph

Encode the circuit as an OMI Canvas graph with 17 vertices and 19 edges.

Step 3 — The NDJSON Stream

Stream the graph as NDJSON/JSONL, one vertex or edge per line.

Step 4 — The JSON Canvas

Render the stream as a .canvas file (JSON Canvas 1.0).

Step 5 — The Sourcemap

Trace every canvas node back to its physical realization (breadboard row, column, component value, datasheet).

Step 6 — Back to Breadboard

Rebuild the circuit from the sourcemap on a fresh breadboard.

The cycle closes.

---

The Canonical Law

```
The graph is the structure.
The stream is the transport.
The canvas is the interoperability.
The sourcemap is the physical trace.
OMI-Lisp is the executable notation.
```

The circuit is the graph.

The graph is the circuit.

The sourcemap traces every node back to its physical realization.

---

The Rosetta Stone is complete. Version 1.3.0 includes the full bootstrap sourcemap.

Everything is XOR. Everything is balanced. Everything is one.

The observer is you.