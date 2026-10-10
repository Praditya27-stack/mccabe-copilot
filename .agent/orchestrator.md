# Orchestrator & Operating Guidelines
## Memory Bank Context & Core AI Engineering Workflow

---

## 1. Operating Philosophy
As a Senior Full-Stack Engineer & Chemical Process Automation Specialist, the development of this interactive simulator relies on high rigor, deterministic boundaries, and systematic execution. The agent must strictly separate chemical engineering mathematics from React UI rendering.

### The 4-Phase Operating Loop
For every code modification, task, or bug fix, adhere to the following sequence:

#### Phase 1: Analyze
- **Requirements Audit**: Cross-check user requests against the thermodynamic limits in `prd.md`.
- **Constraint Verification**: Are the requested inputs mathematically feasible? (e.g., $x_D$ cannot exceed azeotropic composition of 0.8943; $R$ cannot be less than $R_{min}$).
- **State Impact**: Determine which slice of the Zustand store (`useDistillationStore`) requires updating.

#### Phase 2: Plan
- **Architecture Mapping**: Identify precisely which `lib/`, `stores/`, or `components/` files will be modified.
- **Mathematical Blueprinting**: Write down the exact chemical formulas and boundary constraints before touching code.
- **Component Contracts**: Determine props and types required for React UI to consume the mathematical outputs safely.

#### Phase 3: Execute
- **Modularity**: Write small, pure, unit-testable functions for the `lib/thermo/` and `lib/simulation/` directories.
- **Separation of Concerns (SOC)**: **No thermodynamics calculations in JSX files**. JSX should only consume values from the Zustand store or custom hooks.
- **Asset Rule**: Use absolutely zero external images (`.png`, `.svg` files from Figma, etc.). Construct visual elements exclusively using HTML, Canvas, primitive SVG tags, Lucide icons, Framer Motion, or Recharts.

#### Phase 4: Verify
- **Type Checking**: Before declaring a task complete, run `npx tsc --noEmit` to guarantee complete type safety.
- **Linting**: Ensure code conforms to ESLint standards.
- **Runtime Sanity**: (If running a local dev server) Verify the simulation stepping logic does not enter an infinite loop when given boundary conditions.
- **HAZOP / Safety Rule**: Ensure boundary warnings gracefully degrade the UI without throwing white-screen React errors.

---

## 2. Strict Architectural Boundaries

### 2.1 The `lib/thermo/` Directory (Pure Domain Logic)
- **Purpose**: Pure thermodynamic functions, property correlations, and VLE equilibrium models.
- **Rule**: Functions here must take raw numeric inputs (e.g., $x, T, P$) and return numeric outputs.
- **Restriction**: **ZERO imports from React, Next.js, or Zustand.** No DOM access. No UI state references.

### 2.2 The `lib/simulation/` Directory (Solver Engine)
- **Purpose**: Distillation algorithms (McCabe-Thiele stepping, $q$-line intersection, tangent pinch detection, Murphree efficiency modifiers).
- **Rule**: Pure functions that consume a `SimulationConfig` object and return a `SimulationResult` object (containing arrays of stage data, flow rates, heat duties, and alerts).
- **Restriction**: No asynchronous side-effects or API calls within the solver. Must run deterministically and synchronously.

### 2.3 The `stores/` Directory (Single Source of Truth)
- **Purpose**: Zustand store coordinating the application state.
- **Rule**: Holds `userInput` parameters and memoized `simulationResults`. Triggers the `lib/simulation/` engine whenever inputs change.
- **AI Telemetry**: Maintains a serialized snapshot of the state (`get_simulation_state`) that the AI Co-Pilot can ingest.

### 2.4 The `components/ui/` & `components/simulation/` Directories (Presentation)
- **Purpose**: Next.js React components rendering the UI.
- **Rule**: STRICTLY view-only. 
- **Restriction**: If you find yourself writing `const slope = R / (R + 1)` inside a `useMemo` in a component, you have violated the architecture. That logic belongs in `lib/simulation/`. Components should only map over `results.stages` and draw lines/SVG rects.

---

## 3. Verification & Compliance Checklist

Before ending any turn or claiming a feature is complete, verify:

- [ ] **Asset Rule**: No `.png`, `.jpg`, `.svg` imports or URL references exist.
- [ ] **Type Rule**: All variables and function parameters possess explicit TypeScript types (avoid `any`).
- [ ] **Boundary Rule**: The `lib/thermo/` directory contains no dependencies on the UI layer.
- [ ] **Infinite Loop Guard**: The step-by-step McCabe-Thiele solver implements a hard break (e.g., `if (steps > 200) break;`) to prevent browser crashing in unfeasible operation regions (e.g., user bypassed $R < R_{min}$ guard).
- [ ] **Build Rule**: Code successfully passes the TypeScript compiler (`npx tsc --noEmit`).
