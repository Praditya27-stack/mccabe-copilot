# System Architecture
## React/Next.js Typescript Distillation Simulator

---

## 1. Technology Stack
- **Framework**: Next.js 14/15 (App Router)
- **Language**: TypeScript (Strict Mode)
- **Styling**: Tailwind CSS (with arbitrary value support for exact layouts)
- **State Management**: Zustand (Context-free, hook-based, single source of truth)
- **Visualization (Charting)**: Recharts (for $x-y$ scatter, line charts, profiles)
- **Visualization (Column/Equipment)**: Pure SVG + Framer Motion (for liquid dynamics, bubbles, and flow streams)
- **Icons**: Lucide React
- **Math/Thermo Engine**: Custom vanilla TypeScript logic (zero heavy dependencies)

---

## 2. Directory Structure

```text
/
├── app/                  # Next.js App Router root
│   ├── layout.tsx        # Global layout, theme providers
│   ├── page.tsx          # Main simulator dashboard (grid layout)
│   └── globals.css       # Tailwind directives & custom CSS variables
│
├── components/           # React Components
│   ├── ui/               # Reusable primitive UI (sliders, inputs, cards, badges)
│   ├── simulation/       # Simulation-specific visualization
│   │   ├── ColumnSvg.tsx       # Animated SVG column, trays, piping
│   │   ├── McCabeChart.tsx     # Recharts McCabe-Thiele interactive diagram
│   │   ├── StageProfiles.tsx   # Recharts line charts for T, x, y profiles
│   │   └── ControlPanel.tsx    # Parameter sliders and numerical inputs
│   └── copilot/          # AI Agent Interface
│       ├── ChatWindow.tsx      # Conversational UI
│       ├── TelemetryCard.tsx   # Live readout of solver state
│       └── HazopAlerts.tsx     # Safety & diagnostic badge list
│
├── lib/                  # Core Business & Domain Logic (NO REACT IMPORTS)
│   ├── thermo/           # Thermodynamics Engine
│   │   ├── ethanolWater.ts     # VLE correlations, Antoine, Wilson/spline models
│   │   └── properties.ts       # Enthalpy, densities, molecular weights
│   ├── simulation/       # Unit Operation Solvers
│   │   ├── mccabeThiele.ts     # Core stepping algorithm, operating line math
│   │   ├── pinchAnalysis.ts    # Tangent and feed pinch intersection finders
│   │   └── hydraulics.ts       # Vapor/liquid flow limits, flooding indicators
│   └── utils/            # General utilities
│       └── formatters.ts       # Number formatting, sig-fig utilities
│
├── stores/               # State Management
│   └── useSimulation.ts  # Zustand store containing inputs, results, and actions
│
└── types/                # TypeScript Interfaces
    ├── thermo.d.ts       # Types for VLE data points
    └── simulation.d.ts   # Types for SimulationState, Config, StageResult
```

---

## 3. State Management (Zustand)
The `useSimulation` store is the beating heart of the application. It establishes a unidirectional data flow and enforces deterministic recalculation.

```typescript
interface SimulationStore {
  // 1. User Inputs (Source of Truth)
  inputs: {
    zF: number;   // Feed composition
    xD: number;   // Distillate composition
    xB: number;   // Bottoms composition
    q: number;    // Feed thermal condition
    R: number;    // Reflux ratio
    F: number;    // Feed flow rate
    Em: number;   // Murphree efficiency
  };
  
  // 2. Computed Outputs (Derived State)
  results: SimulationResult | null;
  alerts: Alert[];
  
  // 3. Actions
  setInputs: (newInputs: Partial<SimulationStore['inputs']>) => void;
  runSimulation: () => void; // Invokes lib/simulation/mccabeThiele.ts
  
  // 4. Co-Pilot Actions
  applyOptimization: (config: OptimizationResult) => void;
}
```
**Reactivity Rule**: Whenever `setInputs` is called, `runSimulation` is triggered synchronously or via a microtask debouncer. The UI simply subscribes to `results`.

---

## 4. Visualization Engine Architecture

### 4.1 Recharts (McCabe-Thiele Chart)
- Constructed using `<ComposedChart>` or `<ScatterChart>` to overlay the continuous VLE curve (`<Line>` or `<Scatter line />`) with the stepped tray data (`<Step>`).
- $45^\circ$ reference line mapped precisely from $(0,0)$ to $(1,1)$.
- Data arrays (`chartData`) generated dynamically by the simulation engine, mapping $x$ and $y$ coordinates for the ROL, SOL, and $q$-line.

### 4.2 SVG Animated Column (`ColumnSvg.tsx`)
- An `<svg>` element with `viewBox="0 0 500 800"`.
- Trays are mapped dynamically based on $N_{total}$.
  ```jsx
  {results.stages.map(stage => (
    <Tray 
      key={stage.number} 
      yPos={calculateY(stage.number)} 
      liquidFraction={stage.x} 
      isFeed={stage.number === results.feedStage} 
    />
  ))}
  ```
- **Framer Motion**: Used to animate liquid flowing down the downcomers and vapor bubbles rising through the sieve trays (via `<motion.circle>` or `<motion.path>` with `animate={{ y: [0, -50], opacity: [1, 0] }}`).

---

## 5. AI Co-Pilot Architecture
- The chat interface interacts with an external AI API route (e.g., `app/api/chat/route.ts`).
- **Telemetry Payload**: Every user message is appended with a hidden system context string derived from `get_simulation_state`.
- **Tool Calling**: When the LLM responds with a `function_call` (e.g., `run_pinch_analysis`), the React frontend intercepts the tool call, executes the calculation locally in the browser using the deterministic `lib/` functions, and injects the result back into the chat context.
- **Safety**: The AI cannot break the laws of physics. The `set_simulation_parameters` action includes hard clamps (e.g., enforcing $x_D \le x_{az}$).
