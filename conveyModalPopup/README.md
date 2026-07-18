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
- Optional **Data source** (single object) so Content widgets get Data view–like object context
- Open via **Trigger** dropzone and/or a Boolean **Is open** attribute (two-way)
- Shared dock across multiple widget instances on the same page
- Content stays mounted while minimized (form state preserved)
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

**Note:** Object Data source requires **Mendix 11.11+**.

---

## Quick start (Studio Pro)

1. Place **Convey Modal Popup** on a page (inside a Data view if you use **Is open** or Context data source).
2. Set **Title** (e.g. `Address Change`).
3. Drop an Action Button or Icon into **Trigger**.
4. Optionally set **Data source** to the object to edit (Context / Microflow / Nanoflow / Listen to widget).
5. Drop Text boxes and other widgets into **Content**, binding attributes of that object.
6. Optionally bind **Is open** to a Boolean attribute.
7. Under **Layout**, set **Dock position**, **Width**, **Height**, and leave **Enable drag** on if users should move the panel.
8. Under **Appearance**, set **Tab background** (pastel) so each modal is easy to tell apart when minimized.
9. Run the app: open → drag by header → Minimize → dock tab → Maximize restores position → Close resets position.

---

## Content like a Data view

Use **Data source** when Content widgets should bind directly to one object (same idea as a Data view):

1. Set **Data source** to Context (page/object), Microflow, Nanoflow, or Listen to widget.
2. Drop widgets into **Content** and select attributes of that entity.
3. Leave **Data source** empty if you only need layout widgets, or if you nest your own Data view inside Content.

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
| **Title** | Text template | No | — | Shown in the panel header and on the minimized dock tab. Supports expressions (e.g. `$Request/Name`). |
| **Trigger** | Widgets | No | — | Clickable area that opens the modal. Use an Action Button, Icon, or Image. Configure Trigger, Is open, or both. |
| **Data source** | Object datasource | No | — | Optional single object context for Content (like a Data view). Context / Microflow / Nanoflow / Listen to widget. Mendix 11.11+. |
| **Content** | Widgets | No | — | Body of the maximized panel. Linked to Data source when set. Stays mounted while minimized. |
| **Is open** | Boolean attribute | No | — | Two-way open/close from microflows/nanoflows. `true` = open maximized; `false` = close and remove dock tab. Widget writes to this attribute on user open/close. Requires entity context (e.g. Data view). |

### Layout

| Property | Type | Required | Default | Explanation |
|----------|------|----------|---------|-------------|
| **Dock position** | Enumeration | Yes | `Right` | Home side of the viewport: **Right** or **Left**. |
| **Width** | String | Yes | `480px` | CSS width. Examples: `480px`, `40%`, `30vw`. |
| **Height** | String | Yes | `100%` | CSS height. Examples: `100%`, `90vh`, `800px`. |
| **Top offset** | String | No | `0` | CSS `top`. Use e.g. `64px` to clear a top nav bar. |
| **Z-index** | Integer | No | `1000` | Overlay uses this value; panel uses Z-index + 1. Shared dock is fixed at **1100**. Keep panel Z-index below 1100 if dock tabs must stay above the panel. |
| **Enable drag** | Boolean | No | `Yes` | Drag maximized panel by header. Position kept while minimized; resets on close. |

### Appearance — overlay & panel colors

| Property | Type | Default | Explanation |
|----------|------|---------|-------------|
| **Icon class** | String | — | CSS class for an icon before the title (header + dock). Example: `glyphicon glyphicon-file`. |
| **Show overlay** | Boolean | `Yes` | Dim the page behind the maximized panel. |
| **Close on overlay click** | Boolean | `No` | If overlay is shown, clicking it closes the modal. |
| **Overlay color** | String | `rgba(15, 23, 42, 0.12)` | Dimmer color (`#hex`, `rgb()`, `rgba()`). Lower alpha = lighter. |
| **Panel background** | String | `#ffffff` | Shell background of the maximized panel. |
| **Header background** | String | `#ffffff` | Header bar background. |
| **Body background** | String | `#ffffff` | Scrollable content area background. |
| **Title color** | String | `#1a2b4b` | Title text and optional header icon color. |
| **Control color** | String | `#1a2b4b` | Minimize (−) and Close (×) icon color. |
| **Header border color** | String | `#e8eaed` | Color of the 1px divider under the header. |

### Appearance — panel border & shadow

| Property | Type | Default | Explanation |
|----------|------|---------|-------------|
| **Panel border color** | String | `#e5e7eb` | Outer border color (visible when width &gt; 0). |
| **Panel border width** | String | `0` | e.g. `0`, `1px`, `2px`. |
| **Panel border radius** | String | `0` | e.g. `0` (flush), `8px`, `12px`. |
| **Panel box shadow** | String | *(empty)* | Optional CSS `box-shadow`. Leave empty for the default side shadow. Example: `0 8px 32px rgba(0,0,0,0.18)`. |

### Appearance — dock tab

| Property | Type | Default | Explanation |
|----------|------|---------|-------------|
| **Tab background** | String | `#cfe8ff` | Pill fill color. Use different pastels per instance (`#cfe8ff`, `#ffe4c4`, `#d4edda`, `#f8d7da`). |
| **Tab text color** | String | `#1a2b4b` | Title and Maximize/Close icon color on the tab. |
| **Tab border color** | String | `rgba(26, 43, 75, 0.06)` | Tab border color. |
| **Tab border width** | String | `1px` | e.g. `0`, `1px`. |
| **Tab border radius** | String | `8px` | e.g. `8px`, `12px`, `999px`. |

### Events

| Property | Type | When it runs |
|----------|------|--------------|
| **On open** | Action | Modal opens from **closed** (trigger or Is open = true). Not on restore from minimized. |
| **On close** | Action | Modal fully closed (header/dock Close, Escape key, overlay click if enabled, or Is open = false). |
| **On minimize** | Action | User clicks Minimize (−). Content stays mounted. |
| **On maximize** | Action | User restores from a dock tab. Not on initial open. |

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
  ConveyModalPopup.tsx          # Orchestrator (state + isOpen sync)
  ConveyModalPopup.editorConfig.ts
  ConveyModalPopup.editorPreview.tsx
  components/
    ModalPanel.tsx              # Maximized side panel
    SharedDockBar.tsx           # Shared bottom dock (single owner)
    MinimizedTab.tsx            # Dock pill UI
  utils/
    dockRegistry.ts             # Cross-instance dock registry
  ui/
    ConveyModalPopup.css
```

---

## Limitations (v1)

- Web only (not native mobile)
- No drag-resize of the panel (size still from Width/Height)
- Drag position is not persisted across page navigation
- Object Data source requires Mendix 11.11+
- Shared dock Z-index is fixed at 1100
- Object Data source is a single object (not a repeating list)

---

## License

Apache-2.0
