# Product Requirement Document (PRD)
## Interactive McCabe-Thiele Distillation Simulator (Ethanol - Water System) with AI Co-Pilot

---

## 1. Product Vision & Executive Summary
The **McCabe-Thiele Distillation Simulator** is a high-fidelity, interactive chemical engineering web application designed to model, visualize, and analyze the fractional distillation of an **Ethanol-Water** binary mixture at atmospheric pressure ($P = 101.325\text{ kPa}$).

The application combines a deterministic chemical engineering calculation engine with an **AI Process Engineering Co-Pilot**, allowing operators, students, and process engineers to:
1. Dynamically manipulate feed compositions, thermal conditions, column specifications, and reflux ratios.
2. Observe instantaneous visual updates of the McCabe-Thiele diagram, column hydraulics, and stage-by-stage composition/temperature profiles.
3. Receive real-time operational advice, pinch warnings, and HAZOP safety diagnostics from an embedded AI agent.

### Absolute Visual Rule
**ZERO EXTERNAL IMAGE ASSETS**: The application strictly prohibits any external raster or vector image assets (`.png`, `.jpg`, `.jpeg`, `.webp`, `.svg` files, Figma exports, or external CDNs).
- All diagrams, column vessels, condenser/reboiler vessels, trays, weirs, liquid downcomers, vapor bubbles, and flow meters **must be rendered 100% via code**: primitive SVG components, CSS styling, Framer Motion animations, Lucide React icons, and Recharts visualization components.

---

## 2. Chemical Engineering & Thermodynamic Foundations

### 2.1 Binary System: Ethanol (1) – Water (2)
- **Component 1 (More Volatile Component, MVC)**: Ethanol ($\text{C}_2\text{H}_5\text{OH}$), Normal Boiling Point: $78.37^\circ\text{C}$ ($351.52\text{ K}$).
- **Component 2 (Less Volatile Component, LVC)**: Water ($\text{H}_2\text{O}$), Normal Boiling Point: $100.00^\circ\text{C}$ ($373.15\text{ K}$).
- **Operating Pressure**: $P = 101.325\text{ kPa}$ ($1.00\text{ atm}$).
- **Azeotropic Behavior**: Minimum-boiling homogeneous azeotrope at atmospheric pressure:
  $$x_{az} \approx 0.8943\text{ (mole fraction ethanol)} \quad (\approx 95.63\text{ wt}\%), \quad T_{az} \approx 78.15^\circ\text{C}$$
  - Distillate purity $x_D$ cannot exceed $x_{az}$ via conventional binary distillation.

### 2.2 Vapor-Liquid Equilibrium (VLE) Modeling
The non-ideality of the liquid phase is significant due to strong hydrogen bonding between ethanol and water.

#### Option A: Modified Raoult's Law with Wilson Activity Coefficient Model
For vapor-liquid equilibrium at low pressures:
$$y_i P = x_i \gamma_i P_i^{sat}(T)$$
Where:
- $P_i^{sat}(T)$: Vapor pressure calculated using the extended Antoine equation:
  $$\ln P_i^{sat}[\text{kPa}] = A_i - \frac{B_i}{T[^\circ\text{C}] + C_i}$$
  - Ethanol: $A_1 = 16.8958, B_1 = 3795.17, C_1 = 230.918$ (valid $20^\circ\text{C} - 100^\circ\text{C}$)
  - Water: $A_2 = 16.3872, B_2 = 3885.70, C_2 = 230.170$ (valid $0^\circ\text{C} - 100^\circ\text{C}$)
- $\gamma_i$: Wilson Activity Coefficients:
  $$\ln \gamma_1 = -\ln(x_1 + \Lambda_{12}x_2) + x_2 \left( \frac{\Lambda_{12}}{x_1 + \Lambda_{12}x_2} - \frac{\Lambda_{21}}{\Lambda_{21}x_1 + x_2} \right)$$
  $$\ln \gamma_2 = -\ln(x_2 + \Lambda_{21}x_1) - x_1 \left( \frac{\Lambda_{12}}{x_1 + \Lambda_{12}x_2} - \frac{\Lambda_{21}}{\Lambda_{21}x_1 + x_2} \right)$$
  - Wilson binary interaction parameters: $\Lambda_{12} = 0.1664$, $\Lambda_{21} = 0.8808$ (calibrated for 1 atm).

#### Option B: High-Fidelity Empirical VLE Spline / Polynomial
For ultra-fast real-time UI stepping without solving iterative bubble-point loops at 60 FPS, the simulator provides an analytical high-fidelity piecewise PCHIP / polynomial function calibrated against experimental Perry's Chemical Engineers' Handbook VLE data ($P = 101.325\text{ kPa}$), preserving:
1. $(0, 0)$ and $(1, 1)$ endpoints.
2. Azeotropic inflection and tangent pinch at $x = 0.8943, y = 0.8943$.
3. Strict monotonicity ($dy/dx > 0$).

#### Relative Volatility
$$\alpha_{12} = \frac{y_1 / (1 - y_1)}{x_1 / (1 - x_1)} = \frac{y_1 (1 - x_1)}{x_1 (1 - y_1)}$$
Notice $\alpha_{12} \to 1.0$ at the azeotropic point ($x = y$).

---

## 3. McCabe-Thiele Mathematical Framework

### 3.1 Material Balances
Given:
- Feed rate: $F\text{ [kmol/h]}$
- Feed mole fraction: $z_F$
- Distillate specification: $x_D$
- Bottoms specification: $x_B$

Overall Mole Balance:
$$F = D + B$$
Component Mole Balance:
$$F z_F = D x_D + B x_B$$
Solving for Distillate ($D$) and Bottoms ($B$) product flow rates:
$$D = F \left( \frac{z_F - x_B}{x_D - x_B} \right)$$
$$B = F - D = F \left( \frac{x_D - z_F}{x_D - x_B} \right)$$
*Feasibility condition*: $0 < x_B < z_F < x_D < x_{az} \le 1.0$.

---

### 3.2 Feed Thermal Condition ($q$-line)
The thermal state of the feed mixture determines the slope and orientation of the $q$-line:
$$q = \frac{\text{Heat to convert 1 mole of feed to saturated vapor}}{\text{Molar heat of vaporization } \Delta H_{vap}}$$
$$q = \frac{H_V - H_F}{H_V - H_L} = 1 + \frac{C_{p,L} (T_b - T_F)}{\Delta H_{vap}}$$

Classification of $q$:
- **Subcooled liquid**: $q > 1$, $T_F < T_b$, slope $> 1$
- **Saturated liquid (bubble point)**: $q = 1$, $T_F = T_b$, vertical line ($x = z_F$)
- **Partially vaporized liquid (two-phase mixture)**: $0 < q < 1$, vapor fraction $f = 1 - q$, negative slope
- **Saturated vapor (dew point)**: $q = 0$, $T_F = T_d$, horizontal line ($y = z_F$)
- **Superheated vapor**: $q < 0$, $T_F > T_d$, positive slope $< 1$

$q$-line Equation:
$$y = \frac{q}{q - 1}x - \frac{z_F}{q - 1} \quad (\text{for } q \neq 1)$$
$$x = z_F \quad (\text{for } q = 1)$$

---

### 3.3 Operating Lines

#### Rectifying Section Operating Line (ROL)
Governs the section above the feed tray:
- Internal liquid reflux rate: $L$
- Internal vapor flow rate: $V = L + D$
- External reflux ratio: $R = \frac{L}{D}$

Equation:
$$y = \frac{R}{R + 1}x + \frac{x_D}{R + 1}$$
- Passes through $(x_D, x_D)$ on the $45^\circ$ diagonal line ($y = x$).
- $y$-intercept: $\frac{x_D}{R + 1}$.
- Slope: $\frac{R}{R + 1} < 1$.

#### Intersection Point of ROL and $q$-line ($(x_i, y_i)$)
Simultaneously solve ROL and $q$-line:
- If $q = 1$:
  $$x_i = z_F, \quad y_i = \frac{R}{R + 1}z_F + \frac{x_D}{R + 1}$$
- If $q \neq 1$:
  $$\frac{R}{R + 1}x_i + \frac{x_D}{R + 1} = \frac{q}{q - 1}x_i - \frac{z_F}{q - 1}$$
  $$x_i \left( \frac{q}{q - 1} - \frac{R}{R + 1} \right) = \frac{x_D}{R + 1} + \frac{z_F}{q - 1}$$
  $$x_i = \frac{x_D(q - 1) + z_F(R + 1)}{q(R + 1) - R(q - 1)} = \frac{x_D(q - 1) + z_F(R + 1)}{R + q}$$
  $$y_i = \frac{R}{R + 1}x_i + \frac{x_D}{R + 1}$$

#### Stripping Section Operating Line (SOL)
Governs the section below the feed tray:
- Connects $(x_B, x_B)$ on the $45^\circ$ line to the intersection point $(x_i, y_i)$.

Equation:
$$y = \frac{y_i - x_B}{x_i - x_B}(x - x_B) + x_B$$
Or in terms of boilup ratio $V_B = \frac{\bar{V}}{B}$:
$$y = \frac{V_B + 1}{V_B}x - \frac{x_B}{V_B}$$

---

### 3.4 Minimum Reflux Ratio ($R_{min}$) & Pinch Point Detection
1. **Normal Feed Pinch**: For regular systems, $R_{min}$ is found where the $q$-line intersects the VLE curve at $(x_p, y_p)$:
   $$R_{min} = \frac{x_D - y_p}{y_p - x_p}$$
2. **Tangent Pinch (Crucial for Ethanol-Water)**:
   Because the ethanol-water VLE curve has an inflection point and is highly non-ideal, the operating line can become tangent to the equilibrium curve **before** reaching the intersection with the $q$-line.
   - The engine must compute the tangent line from $(x_D, x_D)$ to the curve $y_{eq}(x)$.
   - $R_{min}$ is the maximum of the feed pinch reflux ratio and the tangent pinch reflux ratio:
     $$R_{min} = \max(R_{min, \text{feed}}, R_{min, \text{tangent}})$$
3. **Pinch Condition & Feasibility Guard**:
   If user sets $R \le R_{min}$, the column requires an infinite number of stages ($N \to \infty$). The UI must trigger an immediate visual warning and prevent step-stepping freeze.

---

### 3.5 Stepping Tray Algorithm (Ideal & Murphree Efficiency)
Starting from distillate composition $(x_D, x_D)$ (assuming a total condenser):
1. **Step 1 (Horizontal)**: From current liquid composition $y_k = x_D$, find vapor equilibrium composition $x_k^*$ such that:
   $$y_{eq}(x_k^*) = y_k \implies x_k^* = y_{eq}^{-1}(y_k)$$
2. **Murphree Tray Efficiency ($E_{MV}$)**:
   If tray efficiency $E_M < 1.0$, the actual vapor composition leaving stage $k$ is:
   $$y_k = y_{k+1} + E_M \cdot (y_k^* - y_{k+1})$$
3. **Step 2 (Vertical)**: From $x_k$, drop down to the appropriate operating line:
   - If $x_k > x_i$: Rectifying section $\implies y_{k+1} = \frac{R}{R + 1}x_k + \frac{x_D}{R + 1}$
   - If $x_k \le x_i$: Stripping section $\implies y_{k+1} = \text{SOL}(x_k)$
4. **Transition (Optimal Feed Stage)**:
   - The stage where the vertical drop transitions from the ROL to the SOL is designated as the **Optimal Feed Tray** ($N_{feed}$).
5. **Termination**:
   - Continue until $x_k \le x_B$.
   - The last step accounts for the partial reboiler (counts as 1 theoretical equilibrium stage).
   - Calculate fractional stages using linear interpolation at the bottoms cut:
     $$N_{total} = (k - 1) + \frac{x_{k-1} - x_B}{x_{k-1} - x_k}$$

---

### 3.6 Energy & Hydraulic Balances
- **Latent Heat of Vaporization**:
  $$\Delta H_{vap, \text{EtOH}} \approx 38.56\text{ kJ/mol}, \quad \Delta H_{vap, \text{H}_2\text{O}} \approx 40.66\text{ kJ/mol}$$
  $$\Delta H_{vap, avg}(x) \approx x \Delta H_{vap, \text{EtOH}} + (1 - x) \Delta H_{vap, \text{H}_2\text{O}}$$
- **Condenser Heat Duty ($Q_C$)**:
  $$V = D(R + 1)$$
  $$Q_C = V \cdot \Delta H_{vap}(x_D)\text{ [kW]}$$
- **Reboiler Heat Duty ($Q_R$)**:
  $$\bar{V} = V - F(1 - q)$$
  $$Q_R = \bar{V} \cdot \Delta H_{vap}(x_B) + Q_{loss}\text{ [kW]}$$
- **Column Hydraulic Checks**:
  - Weeping index: $W_i = \bar{V} / \bar{V}_{min}$ (warns when vapor velocity is too low to support liquid hold-up on sieve trays).
  - Flooding index: $F_i = V / V_{flood}$ (warns when vapor velocity causes liquid entrainment).

---

## 4. UI/UX System & Interactive Features

### 4.1 Master Layout
- **Left Panel (Inputs & Column Controls)**:
  - Feed parameters: $F$ (10 - 500 kmol/h), $z_F$ (0.05 - 0.85), $q$ (-0.5 to 1.8).
  - Target specifications: $x_D$ (0.50 - 0.89), $x_B$ (0.01 - 0.30).
  - Operating parameters: Reflux ratio multiplier ($R / R_{min}$ slider: 1.05 to 5.0x) or direct $R$ input.
  - Tray efficiency slider: $E_M$ (20% to 100%).
- **Center Canvas (Visualization Viewports)**:
  - **Tab 1: Interactive McCabe-Thiele Graph**:
    - Equilibrium curve ($y$ vs $x$), $45^\circ$ reference line.
    - $q$-line, ROL, SOL with distinct, accessible high-contrast colors.
    - Animated or interactive staircase steps (highlighting current stage on hover).
    - Pinch point marker and minimum reflux asymptote overlay.
  - **Tab 2: Animated Distillation Column (SVG Primitive)**:
    - Complete column shell with sieve trays.
    - Dynamic bubble generation inside liquid pools.
    - Downcomers with liquid level indicators.
    - Feed tray entry nozzle glowing and positioned dynamically at $N_{feed}$.
    - Total condenser with reflux splitter valve and distillate stream.
    - Kettle/thermosiphon reboiler with vapor return and bottoms product stream.
    - Fluid stream color gradations (amber/cyan reflecting ethanol mole fraction).
  - **Tab 3: Stage Profiles (Recharts)**:
    - Temperature profile ($T$ vs Stage).
    - Liquid composition profile ($x_n$ vs Stage).
    - Vapor composition profile ($y_n$ vs Stage).
- **Right Panel (AI Co-Pilot & Automation Console)**:
  - Streaming conversational chat interface.
  - Telemetry card reflecting current column state.
  - Actionable command buttons ("Optimize Feed Tray", "Resolve Pinch", "Run HAZOP Audit").
  - Live HAZOP anomaly alerts (e.g., Azeotropic proximity, high reboiler duty, weeping/flooding warnings).

---

## 5. Non-Functional Requirements
- **Zero Assets**: No raster or external vector files. Clean SVG primitives only.
- **60 FPS Performance**: Fast numeric evaluations, debounced calculation pipelines where needed, memoized VLE curves.
- **Robust Error Handling**: Impossible boundary checks ($x_D \ge x_{az}$, $x_B \ge z_F$, $R \le R_{min}$) handled with friendly engineering alert badges, never crashing the render tree.
- **Type Safety**: 100% strict TypeScript types for all thermodynamic state objects and calculation results.
