# AI Co-Pilot Agentic Tools
## Function Calling Schema & Specifications

The embedded AI Process Engineering Co-Pilot utilizes a set of well-defined function calls to observe the simulation state, manipulate the column, and run advanced safety and optimization heuristics.

These tools must be registered and mapped to Zustand store actions.

---

### Tool 1: `get_simulation_state`
**Description**: Retrieves the complete current state of the distillation simulation, including user inputs, thermodynamic boundaries, calculated stage profiles, and active alerts.
- **Parameters**: None
- **Returns (JSON)**:
  - `inputs`: $\{ F, z_F, x_D, x_B, q, R, E_M \}$
  - `thermo_limits`: $\{ azeotrope_x, R_{min}, N_{min}, \text{pinch_type} \}$
  - `results`: $\{ N_{total}, N_{feed}, Q_C, Q_R, D, B \}$
  - `alerts`: List of active warnings (e.g., "Pinch proximity", "High reflux energy").

---

### Tool 2: `set_simulation_parameters`
**Description**: Updates one or more simulation parameters and instantly triggers a re-simulation. Validates bounds to prevent physically impossible scenarios.
- **Parameters**:
  - `zF` (number, optional): Feed mole fraction (0.01 to 0.89).
  - `xD` (number, optional): Distillate mole fraction (must be $> z_F$ and $< 0.894$).
  - `xB` (number, optional): Bottoms mole fraction (must be $< z_F$).
  - `q` (number, optional): Feed thermal condition.
  - `R` (number, optional): Reflux ratio (must be $> R_{min}$).
  - `F` (number, optional): Feed flow rate in kmol/h.
  - `Em` (number, optional): Murphree tray efficiency (0.1 to 1.0).
- **Behavior**: Merges new parameters with existing state, clamps to safe bounds if necessary, and re-renders the UI.

---

### Tool 3: `run_pinch_analysis`
**Description**: Triggers a detailed algorithmic sweep to analyze the severity of the pinch point. Specifically assesses if the column is suffering from a tangent pinch (common in ethanol-water) or a standard feed pinch.
- **Parameters**: None
- **Returns (JSON)**:
  - `pinch_type`: "tangent" | "feed" | "none"
  - `pinch_coordinates`: $\{ x, y \}$
  - `R_min_calculated`: Precise minimum reflux ratio.
  - `recommended_R_margin`: Suggested operational reflux (typically $1.2 \times R_{min}$ to $1.5 \times R_{min}$).
  - `bottleneck_stage`: The tray number where driving force $\Delta y$ is minimized.

---

### Tool 4: `generate_hazop_report`
**Description**: Executes a heuristic Hazard and Operability (HAZOP) analysis based on current column hydraulics, thermal duties, and composition targets.
- **Parameters**: None
- **Returns (JSON)**:
  - `nodes`: List of analyzed nodes (e.g., Condenser, Reboiler, Feed Tray).
  - `deviations`: Array of detected issues:
    - Flow / Hydraulics: "Flooding risk due to high internal vapor rate", "Weeping risk".
    - Temperature / Energy: "Excessive reboiler duty $Q_R$ leading to dry-out risk", "High condenser load requiring excessive cooling water".
    - Quality: "Off-spec product risk", "Proximity to azeotrope limits controllability".
  - `recommendations`: Actionable steps (e.g., "Decrease R", "Lower feed temperature (increase q)", "Relax $x_D$ purity specification").

---

### Tool 5: `optimize_feed_stage_and_reflux`
**Description**: An optimization routine that scans for the optimal feed stage configuration and reflux ratio that minimizes the reboiler duty $Q_R$ while maintaining the target product purities ($x_D, x_B$).
- **Parameters**:
  - `target_xD` (number): Desired distillate purity.
  - `target_xB` (number): Desired bottoms purity.
  - `energy_weight` (number): Weighting factor prioritizing energy savings vs number of trays.
- **Behavior**: Automatically iterates through $R$ and $N_{feed}$ combinations, sets the optimal parameters via `set_simulation_parameters`, and returns the optimization delta (energy saved).

---

### Tool Integration Schema (JSON Example)

```json
{
  "name": "set_simulation_parameters",
  "description": "Adjust distillation column parameters.",
  "parameters": {
    "type": "object",
    "properties": {
      "R": { "type": "number", "description": "Reflux ratio" },
      "xD": { "type": "number", "description": "Distillate purity mole fraction (max 0.894)" }
    }
  }
}
```
