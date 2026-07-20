# Convey Modal Popup

Dockable side modal for Mendix web apps. Opens on the **left** or **right**, minimizes into a **shared bottom dock** (multiple instances share one tab bar), and supports configurable size, colors, and borders.

**Widget ID:** `indium.conveymodalpopup.ConveyModalPopup`  
**Package:** `indium.ConveyModalPopup.mpk`  
**Platform:** Web  
**Offline capable:** Yes

---

## Features

- Side panel docked **left** or **right** with configurable width, height, and top offset
- **Drag** the maximized panel by its header to any screen position (optional; on by default)
- **Minimize** to a pastel pill tab in a shared bottom dock
- **Maximize** from the dock tab to restore the panel
- **Close** from the panel header or the dock tab
- Nested **Content** dropzone for any Mendix widgets
- Object context for Content: wrap the widget in a **Data view** (or nest one inside Content) and bind attributes as usual
- Open via **Trigger** dropzone and/or a Boolean **Is open** attribute (two-way)
- Shared dock across multiple widget instances on the same page
- **When multiple open**: stack beside each other on the same dock side (default), or overlap
- Content stays mounted while minimized (form state preserved)
- Survives Mendix Data view / datasource remounts without closing (re-asserts **Is open**)
- **Escape** closes the topmost open modal
- Focus moves into the panel on open, is trapped inside while the overlay is shown, and returns to the trigger on close
- Dragged panel is re-clamped on window resize so it never ends up off-screen
- Full **Appearance** configuration: borders, colors, radius, overlay, shadows

---

## States

| State | Behavior |
|-------|----------|
| **Closed** | Panel and dock tab are hidden; drag offset resets |
| **Maximized** | Side panel visible; optional page overlay; header can be dragged |
| **Minimized** | Panel hidden; pastel tab visible in the shared bottom dock; drag offset kept |

Transitions:

1. Closed → Maximized — click Trigger, or set **Is open** = true  
2. Maximized → Minimized — click Minimize (−) in the header  
3. Minimized → Maximized — click Maximize on the dock tab  
4. Maximized / Minimized → Closed — click Close (×), press **Escape** (topmost modal only), or set **Is open** = false  

---

## Installation

1. Build or obtain `dist/1.0.0/indium.ConveyModalPopup.mpk`
2. In Studio Pro: **App** → **Add widget file…** (or copy the `.mpk` into your project `widgets` folder)
3. Synchronize the project and find **Convey Modal Popup** in the Toolbox

### Build from source

```bash
cd conveyModalPopup
npm install
npm run build
```

Output: `dist/1.0.0/indium.ConveyModalPopup.mpk`

**Note:** Compatible with **Mendix 10.24+** (no object data source property is used, so the widget loads on Studio Pro versions before 11.11).

---

## Quick start (Studio Pro)

1. Place **Convey Modal Popup** on a page — inside a **Data view** when Content widgets or **Is open** need an object context.
2. Set **Title** (e.g. `Address Change`).
3. Drop an Action Button or Icon into **Trigger**.
4. Drop Text boxes and other widgets into **Content**; they bind attributes of the surrounding Data view object (or nest a Data view inside Content for a microflow/nanoflow source).
5. Optionally bind **Is open** to a Boolean attribute.
6. Under **Layout**, set **Dock position**, **Width**, **Height**, **When multiple open** (Open beside by default), and leave **Enable drag** on if users should move the panel.
7. Under **Appearance**, set **Tab background** (pastel) so each modal is easy to tell apart when minimized.
8. Run the app: open → drag by header → Minimize → dock tab → Maximize restores position → Close resets position.

---

## When multiple open

| Mode | Behavior |
|------|----------|
| **Open beside** (default) | Each maximized panel on the **same** dock side is offset by the width of panels opened before it, plus an **8px** gap. First sits at the edge; next opens beside it. Closing or minimizing one **reflows** the others toward the edge. If combined widths exceed the viewport, inset is capped so about **40px** of the panel stays visible (partial overlap only as a last resort). |
| **Overlap** | All maximized panels share the dock edge (stacked on top of each other — previous behavior). Users can still drag panels apart if **Enable drag** is on. |

Panels docked **left** and **right** are arranged independently. User drag offsets still apply on top of the calculated home inset. Set this per widget instance under **Layout → When multiple open**.

---

## Is open and datasource refresh

Bind **Is open** to a Boolean on a **stable** helper object:

- Page parameter, or  
- A committed non-persistent entity that is **not** recreated on every field change / list refresh  

Avoid binding Is open to an object that a surrounding Data view replaces whenever the user clicks a radio button or text box — that remounts the widget tree and historically closed every open modal.

The widget mitigates short remounts by:

1. Saving open/minimized state + drag offset by widget name (about 2 seconds TTL)  
2. Restoring that state on remount  
3. Re-asserting `Is open = true` when the new object still has `false`  

Genuine closes (header/dock ×, Escape, microflow sets false while mounted) still work. **On open** does not fire again for a remount re-assert.

If the surrounding Data view replaces its object, Mendix may still remount **Content** widgets and reset unsaved field values — that is platform behavior, not the modal shell. Keep form objects stable, or commit/refresh deliberately in **On close** / **On maximize**.

---

## Content like a Data view

Content widgets get their object context the standard Mendix 10 way:

1. **Context object** — place the whole widget inside a Data view (or use a page parameter context). Widgets dropped into **Content** inherit that object and can bind its attributes directly.
2. **Microflow / Nanoflow / Listen to widget** — nest a Data view *inside* Content and give that Data view the desired data source.
3. Only layout widgets? No wrapping needed — Content works without any object context.

While the modal is minimized, Content stays mounted so typed values are not lost.

---

## Enable drag

| Behavior | Detail |
|----------|--------|
| Handle | Panel **header** only (title area). Body remains interactive for forms. |
| Property | **Enable drag** (default Yes). Set No to keep the panel fixed to Dock position. |
| Position | Dock left/right is the home position; drag applies a pixel offset via CSS transform. |
| Minimize | Drag offset is **kept** when minimizing and restoring. |
| Close | Drag offset **resets** to home (docked) position. |
| Limits | Panel is clamped so ~40px of the header stays on-screen. |

Minimize (−) and Close (×) buttons never start a drag.

---

## Property reference

All of these appear in the widget properties pane in Studio Pro. Descriptions below match the tooltips in the widget XML.

### General

| Property | Type | Required | Default | Explanation |
|----------|------|----------|---------|-------------|
| **Title** | Text template | No | — | Shown in the maximized panel header and on the minimized dock tab. Supports static text, expressions, and attributes (e.g. `$Request/Name`). Empty → runtime fallback **Modal**. Keep titles short so dock tabs stay readable. |
| **Trigger** | Widgets | No | — | Dropzone that opens the modal on click (Action Button, Icon, Image, etc.). Nested clickables also open it. If the dropzone already contains a button/link, the wrapper does not add an extra keyboard role. Leave empty when open/close is only via **Is open**. Configure Trigger, Is open, or both. |
| **Content** | Widgets | No | — | Panel body dropzone. Inherits the surrounding object context (e.g. an enclosing Data view), so nested widgets can bind that object’s attributes. Stays mounted while minimized until the modal is fully closed. Supports drop / paste / move in design mode like a Container. |
| **Is open** | Boolean attribute | No | — | Two-way open/close for microflows/nanoflows. `true` = open maximized; `false` = close and remove dock tab. The widget also writes this attribute on user open/close (header/dock Close, Escape, overlay click if enabled). Requires entity context (e.g. Data view). Prefer a **stable** helper object (page parameter / committed NPE) not recreated on every field change. After a short remount, the widget restores open/minimized state and may re-assert `true` if the new object still has `false`. |

### Layout

| Property | Type | Required | Default | Explanation |
|----------|------|----------|---------|-------------|
| **Dock position** | Enumeration | Yes | `Right` | Home edge before drag: **Right** or **Left**. With **Open beside**, only panels on the **same** side are tiled; left and right are independent. Drag applies a pixel offset from this home position. |
| **Width** | String | Yes | `480px` | CSS width (`480px`, `40%`, `30vw`). Also used for side-by-side inset (measured in pixels after layout). Prefer similar widths when several modals open beside each other. |
| **Height** | String | Yes | `100%` | CSS height (`100%`, `90vh`, `800px`). Pair with Top offset under a top nav. Body scrolls when Content overflows. |
| **Top offset** | String | No | `0` | CSS `top` (`0`, `64px`, `10vh`) to clear a top bar. Combined with Height defines the vertical band. |
| **Z-index** | Integer | No | `1000` | Overlay uses this value; panel uses Z-index + 1. Shared dock is fixed at **1100**. Keep panel Z-index **below 1100** so dock tabs stay clickable. Raise only to sit above other overlays. |
| **Enable drag** | Boolean | No | `Yes` | Drag by **header** only (body stays interactive; Minimize/Close never start a drag). Offset kept while minimized/restored; **resets on close**. Clamped so ~40px of the header stays on-screen (also after resize). Off = fixed to dock home (+ beside inset if applicable). |
| **When multiple open** | Enumeration | Yes | `Open beside` | **Open beside** — first panel at the edge; each next one offset by previous width + 8px gap; close/minimize reflows others; inset capped so ~40px stays visible. **Overlap** — all maximized panels share the dock edge. Drag still applies on top of the home inset. |

### Appearance — overlay & panel colors

| Property | Type | Default | Explanation |
|----------|------|---------|-------------|
| **Icon class** | String | — | CSS class before the title in header and dock (e.g. `glyphicon glyphicon-file`). Empty = no icon. Uses Title color in header; Tab text color on the dock. |
| **Show overlay** | Boolean | `Yes` | Dims the page behind the panel and **traps focus** inside (true modal). Off = page stays interactive, no focus trap; Close on overlay click is ignored. |
| **Close on overlay click** | Boolean | `No` | If overlay is shown, click dimmer to close (same as header Close: On close + Is open = false). Default No avoids accidental dismiss. |
| **Overlay color** | String | `rgba(15, 23, 42, 0.12)` | Dimmer color (`#hex`, `rgb()`, `rgba()`). Lower alpha = lighter. Only when Show overlay is Yes. |
| **Panel background** | String | `#ffffff` | Outer shell background (hex / rgb / rgba). |
| **Header background** | String | `#ffffff` | Header bar (title, icon, controls). Pair with Title color and Control color. |
| **Body background** | String | `#ffffff` | Scrollable content area under the header. |
| **Title color** | String | `#1a2b4b` | Title text and optional header icon. Use strong contrast vs Header background. |
| **Control color** | String | `#1a2b4b` | Minimize (−) and Close (×) in the **header** only (dock icons use Tab text color). |
| **Header border color** | String | `#e8eaed` | 1px divider under the header. |

### Appearance — panel border & shadow

| Property | Type | Default | Explanation |
|----------|------|---------|-------------|
| **Panel border color** | String | `#e5e7eb` | Outer border color (visible when border width &gt; 0). |
| **Panel border width** | String | `0` | e.g. `0`, `1px`, `2px`. Use a visible border when the panel sits over busy content. |
| **Panel border radius** | String | `0` | `0` = flush side panel; `8px` / `12px` = rounded (useful when dragged away from the edge). |
| **Panel box shadow** | String | *(empty)* | Optional CSS `box-shadow`. Empty = default side shadow from dock side. Example: `0 8px 32px rgba(0,0,0,0.18)`. |

### Appearance — dock tab

| Property | Type | Default | Explanation |
|----------|------|---------|-------------|
| **Tab background** | String | `#cfe8ff` | Pill fill. Use different pastels per instance (`#cfe8ff`, `#ffe4c4`, `#d4edda`, `#f8d7da`) so minimized tabs are easy to tell apart. |
| **Tab text color** | String | `#1a2b4b` | Tab title, icon, Maximize, and Close. Dark on light pastel works best. |
| **Tab border color** | String | `rgba(26, 43, 75, 0.06)` | Tab border (visible when width &gt; 0). |
| **Tab border width** | String | `1px` | `0` = no border; `1px` = light outline against the page. |
| **Tab border radius** | String | `8px` | e.g. `8px`, `12px`, `999px` (full pill). |

### Events

| Property | Type | When it runs |
|----------|------|--------------|
| **On open** | Action | Opens from **closed** (trigger or Is open = true). Not on restore from minimized. Not again when the widget only re-asserts Is open after a short remount. Use to load draft / prepare Content. |
| **On close** | Action | Fully closed: header/dock Close, Escape (topmost maximized only), overlay click if enabled, or Is open = false. Not on minimize. Use to clear drafts, commit, or refresh lists. |
| **On minimize** | Action | User clicks Minimize (−). Becomes a dock tab; Content stays mounted; Is open stays true. Optional analytics / soft-save. |
| **On maximize** | Action | Restore from a dock tab only. Not on initial open. Use to refresh Content or refocus a field. |

---

## Usage patterns

### Pattern A — Trigger only

1. Leave **Is open** empty.  
2. Put a button in **Trigger**.  
3. User opens via the trigger; closes via panel/dock Close.

### Pattern B — Attribute only (microflow-driven)

1. Leave **Trigger** empty (or hide it).  
2. Bind **Is open** to a Boolean on a non-persistent helper / page object.  
3. Microflow/nanoflow sets the attribute to `true` / `false` to open / close.

### Pattern C — Both (recommended)

1. Configure Trigger for UX.  
2. Bind **Is open** so flows can also open/close and so close from the UI updates the model.

### Multiple modals (shared dock)

Place several **Convey Modal Popup** widgets on the same page (e.g. one per special request type). Each minimized instance appears as its own tab in the **same** bottom dock. Give each a distinct **Tab background** and **Title**.

With **When multiple open** = Open beside, maximized panels on the same dock side tile next to each other instead of stacking. Set **Overlap** if you prefer the previous stacked look.

---

## Color & border tips

- Accept any CSS color: `#1a2b4b`, `rgb(26, 43, 75)`, `rgba(26, 43, 75, 0.5)`.
- Accept any CSS size: `0`, `1px`, `8px`, `40%`, `90vh`.
- To show a panel border: set **Panel border width** to `1px` (or more) and pick **Panel border color**.
- To match a brand header: set **Header background** + **Title color** + **Control color** together.
- Dock tabs look best with light pastel **Tab background** and dark **Tab text color**.

---

## Development

```bash
npm install          # or npm install --legacy-peer-deps on NPM 7+
npm start            # watch mode → updates test project widgets/
npm run build        # production .mpk
npm run lint         # ESLint + Prettier check
```

### Project layout

```
src/
  ConveyModalPopup.xml          # Studio properties (tooltips for developers)
  ConveyModalPopup.tsx          # Orchestrator (state + isOpen sync + remount restore)
  ConveyModalPopup.editorConfig.ts
  ConveyModalPopup.editorPreview.tsx
  components/
    ModalPanel.tsx              # Maximized side panel (+ side-by-side inset)
    SharedDockBar.tsx           # Shared bottom dock (single owner)
    MinimizedTab.tsx            # Dock pill UI
  utils/
    dockRegistry.ts             # Cross-instance dock registry
    panelRegistry.ts            # Cross-instance maximized panel insets
    modalStack.ts               # Escape-key topmost modal stack
    modalStateStore.ts          # Persist open state across short remounts
  ui/
    ConveyModalPopup.css
```

---

## Limitations (v1)

- Web only (not native mobile)
- No drag-resize of the panel (size still from Width/Height)
- Drag position is not persisted across page navigation
- No built-in data source property (Mendix 10.x compatibility) — use an enclosing or nested Data view for object context
- Shared dock Z-index is fixed at 1100

---

## License

Apache-2.0
