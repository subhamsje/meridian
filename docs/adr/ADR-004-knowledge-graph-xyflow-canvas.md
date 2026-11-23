# ADR-004: Dual Knowledge Graph Architecture (HTML5 Canvas & React Flow)

## Status
Accepted

## Context
Institutional research terminals require graph visualization capable of rendering hundreds of interconnected nodes and relations (companies, contracts, sovereign agencies, executives, filings) with high rendering performance (60 FPS pan/zoom), crisp legibility, and rich interaction (node inspection, hover halos, sub-graph highlighting, and layout switching).
Standard SVG-only renderers choke on dense graphs (>500 DOM elements), while pure canvas implementations can make rich accessible HTML controls and complex node card layouts cumbersome to style.

## Decision
We engineered a **Dual Engine Knowledge Graph Architecture**:
1. **High-Performance Canvas Workstation (`LivingKnowledgeGraph.tsx`)**:
   - Custom HTML5 2D Canvas rendering engine optimized for dense institutional constellations.
   - Zero synthetic AI glow or blurry particle effects; employs crisp neutral graphite borders, sharp directional arrowheads, domain cluster gravitation, and concentric radial hierarchy layouts.
   - Built-in mini-radar viewport, real-time spatial culling, and click hit-testing.
2. **Declarative Component Engine (`ReactFlowKnowledgeGraph.tsx`)**:
   - Implemented using **`@xyflow/react` (React Flow v13)**.
   - Provides full React component rendering for each institutional node card, customizable connection ports (`Handle`), bezier curves, and smooth controls.
   - Enables analysts to toggle between the ultra-dense Canvas Workstation and the customizable React Flow component view based on their analytical workflow.

## Consequences
### Positive
- Fluid 60 FPS exploration even with dense interconnected knowledge networks.
- Full UI customizability and accessible node styling via Tailwind CSS in React Flow mode.
- Synchronized selection: Clicking any node or relation in either engine immediately populates the Provenance Inspector and documentary ledger.

### Negative / Trade-offs
- Maintaining two renderers requires shared state synchronization (`selectedNode`, `selectedEdge`, `searchQuery`, `typeFilter`).
