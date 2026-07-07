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

- **One `speed` state to rule them all.** The biggest unlock was realizing we didn't need a global "master clock" ticking somewhere and broadcasting to children. Lifting a single `speed` value into `PipelineSimulator` and passing it down as a prop was enough — every sub-component independently derives its own timing from that one number, so turning the slider updates all four visuals at once without any cross-component messaging.
- **Two different timing strategies can share one source of truth.** The canvas pieces (Oscilloscope, Square Wave) use `requestAnimationFrame` with delta-time math (`angle += speed * 2π * dt`), while the DOM-driven pieces (Instruction Display, Gantt Table) use `setInterval` with a delay of `1000 / speed`. They look and feel synced even though they're mechanically different loops — because both formulas scale directly off the same `speed` value, so a 2x speed change always means "2x faster" everywhere, regardless of which technique is animating it.
- **`useRef` to escape stale closures.** Each canvas component mirrors `speed` into a `speedRef` via `useEffect`, and reads `speedRef.current` inside the `requestAnimationFrame` loop instead of the `speed` prop directly. This was the fix for a subtle bug: without the ref, the animation loop closure would freeze the `speed` value from whenever the loop first started, and slider changes wouldn't actually change the animation until it remounted.
- **Delta-time math beats fixed-step increments.** Early attempts incremented angle/offset by a fixed amount per frame, which made speed changes look jumpy and frame-rate dependent. Switching to `dt`-based increments (actual elapsed time since the last frame) made the sweep and wave scale smoothly and consistently across devices/frame rates.
- **Resetting intervals on dependency change, not on every render.** For the `setInterval`-based components, clearing and re-creating the interval only when `speed` changes (via the `useEffect` dependency array) — rather than on every re-render — was what made the instruction cycling and Gantt chart cycle feel like they were "speeding up" instead of restarting erratically.
- **Same visual language, different widgets.** Keeping the same active/inactive color logic (`#00ffc8` glow for "current," muted `#8892b0`/`#1a2540` for "idle") across the slider, instruction cards, and Gantt cells made the sync between components *feel* intentional even though each is a separate canvas/DOM tree — visual consistency reinforced the sense that "everything is listening to the same clock."
