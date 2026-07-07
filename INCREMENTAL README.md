# Incremental README — CLOCKWORK Pipeline Simulator

## Features Finished in 1st Milestone

- ✅ **Header banner** — exhibit title block ("CLOCKWORK: TICK, TOCK, EXECUTE") with tagline, matching the museum's dark theme (`#0a0e17` background, `#00ffc8` neon accent).
- ✅ **Clock Speed Slider** — single range input (0.5–10 GHz) that drives every other visualization from one shared `speed` state in the parent `PipelineSimulator` component.
- ✅ **Oscilloscope** — canvas-based radial sweep with a fading trail and live GHz readout in the center, redrawn every frame at a rotation rate proportional to `speed`.
- ✅ **Square Wave Visualizer** — canvas-based scrolling square wave whose period compresses as `speed` increases, with a background grid for scale reference.
- ✅ **Instruction Display** — highlights one of `MOV / ADD / SHL / ROR` at a time to represent the IF stage "fetching," cycling on a `speed`-based interval.
- ✅ **Animated Gantt Pipeline Table** — full 5-stage (IF, ID, EX, MEM, WB) execution table for 4 instructions, highlighting the currently active cycle column and lighting up each cell as instructions pass through it.
- ✅ **Static content section** (`index.mdx`) — "About This Simulation" writeup explaining the visualizations and key pipeline concepts (clock speed, stages, hazards, throughput) below the interactive simulator.

## Aha Moments — Animating Everything in Sync

- **One `speed` state to rule them all.** No global "master clock" broadcasting to children needed — lifting a single `speed` value into `PipelineSimulator` and passing it down as a prop was enough for every sub-component to derive its own timing off the same number.
- **`useRef` to escape stale closures.** Canvas components mirror `speed` into a `speedRef` via `useEffect` and read `speedRef.current` inside the `requestAnimationFrame` loop — without it, the loop's closure freezes `speed` at whatever it was when the loop started, so slider changes silently stop applying.
- **Delta-time math beats fixed-step increments.** Incrementing angle/offset by `speed * dt` (actual elapsed time) instead of a fixed amount per frame is what keeps the sweep and wave scaling smoothly instead of looking frame-rate dependent.

## Aha Moments — How a Clock Cycle Actually Works

- **A clock "cycle" is just a voltage swinging between two states.** What we're animating as a square wave isn't a metaphor — it's literally the CPU clock pin toggling between logic-high and logic-low voltage at a fixed rate.
- **The rising edge is the only moment that matters.** Flip-flops only latch new data on the clock's rising (or falling, depending on design) edge — the rest of the cycle is just the signal holding steady so the logic between edges has time to settle.
- **A flip-flop is just two NAND-gate latches wired back to back.** At the transistor level, each pipeline register is built from master-slave latches (~20 transistors), not some abstract "storage block" — that's the literal hardware being drawn as a Gantt cell.
- **Clock period has a hard floor: setup + hold time.** The fastest you can tick the clock is capped by how long a flip-flop's input must stay stable before and after the edge (setup/hold time) plus the propagation delay of the slowest combinational path between stages — this is the real constraint behind "max GHz."
- **Clock skew is why the signal isn't instant everywhere.** The clock doesn't arrive at every flip-flop at the exact same instant — wire length and buffer delay mean different parts of the chip see the rising edge nanoseconds (or less) apart.
