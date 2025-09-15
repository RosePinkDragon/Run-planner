# Run Logger — Minimal Requirements (No GPS)

> File: `RUN_LOGGER_REQUIREMENTS.md`

## 1) Single prompt (paste into your AI/dev tool)

Build a **manual run logger** in my existing **Vite + React + Chakra UI** app. **No GPS, no backend, no auth.** Store data in `localStorage`. I need:

- Add/Edit/Delete runs
- A runs table with sort/filter
- Basic weekly/monthly stats
- Export CSV & JSON, Import JSON
- Clean, mobile‑first UI with Chakra

Keep it small, fast, and simple.

---

## 2) Scope (intentionally minimal)

- **In**: Manual run logging, basic stats, local persistence, simple exports/imports.
- **Out**: GPS tracking, maps, elevation, live pace, heart rate, accounts, notifications.

---

## 3) Core features

### 3.1 Add/Edit Run

Form fields (all client-side; defaults in parentheses):

- **Date** (today)
- **Distance (km)** number with 0.01 step
- **Duration (hh:mm:ss)** input mask; validate
- **Pace (mm:ss/km)** auto-calculated from distance & duration (read-only)
- **Type** (Easy, Tempo, Intervals, Hill, Long, Recovery, Strength*).*Strength logs won’t show pace
- **Effort (RPE 1–10)** optional slider
- **Tags** comma-separated optional
- **Notes** textarea optional

Actions: **Save**, **Cancel**. For Edit: **Update**, **Delete**, **Duplicate**.

### 3.2 Runs List

- Table with columns: Date • Distance (km) • Duration • Pace • Type • Effort • Tags • Actions
- Sort by Date/Distance/Duration
- Filters: by Type, by date range (From/To), by text (tags/notes contains)
- Pagination or “Load more” (client-only)

### 3.3 Stats (lightweight)

- **This week**: total km, total time, avg pace
- **This month**: total km, total time, avg pace
- **All time**: total km, longest run, count of runs
- Small sparkline (optional) for last 8 weeks total km (client-only canvas/SVG)

### 3.4 Data

- **Storage**: `localStorage` key `runlogger.v1` (JSON)
- Structure (array of runs):

  ```json
  {
    "version": 1,
    "runs": [
      {
        "id": "uuid",
        "date": "2025-09-15",
        "distanceKm": 5.2,
        "durationSec": 1800,
        "paceSecPerKm": 346,
        "type": "Easy",
        "rpe": 5,
        "tags": ["evening"],
        "notes": "felt good"
      }
    ]
  }
  ```

- **Import/Export**:
  - Export **CSV** (columns: date,distance_km,duration_sec,pace_sec_per_km,type,rpe,tags,notes)
  - Export **JSON** (same model)
  - Import JSON: validate version and shape, merge or replace (ask user)

---

## 4) UI (Chakra)

- **Header**: app title + buttons: Add Run, Export, Import
- **Add/Edit Drawer** (from right) or Modal containing the form
- **Filters Bar**: Type (Select), Date From/To (DatePickers), Search (Input), Clear filters
- **Runs Table**: `Table`, `Thead`, `Tbody`; actions column (Edit/Delete/Duplicate)
- **Stats Cards** (Grid of 3): This Week / This Month / All Time
- **Toast** for save/delete/import/export feedback

Minimal color scheme; respect system theme if available.

---

## 5) Logic helpers

- **parseDuration(hh:mm:ss) → seconds**
- **formatDuration(seconds) → hh:mm:ss**
- **calcPace(durationSec, distanceKm) → paceSecPerKm** (guard against 0)
- **formatPace(paceSecPerKm) → mm:ss**
- **groupByWeek(runs)** and **groupByMonth(runs)** (ISO week)
- **sumDistance**, **sumDuration**, **avgPace** (weighted by distance)

---

## 6) Types (TS)

```ts
export type RunType =
  | "Easy"
  | "Tempo"
  | "Intervals"
  | "Hill"
  | "Long"
  | "Recovery"
  | "Strength";

export interface RunEntry {
  id: string;
  date: string; // YYYY-MM-DD
  distanceKm: number; // 0 for Strength
  durationSec: number; // 0 allowed for Strength
  paceSecPerKm: number; // derived; 0 if distance==0
  type: RunType;
  rpe?: number; // 1..10
  tags?: string[];
  notes?: string;
}

export interface RunDBV1 {
  version: 1;
  runs: RunEntry[];
}
```

---

## 7) State & persistence

- Keep state in a simple React context or a tiny Zustand store
- On init: read from `localStorage`; on changes: debounce write (300ms)
- Provide a **“Reset data”** button with confirm dialog

---

## 8) Routing

- Single-page is fine. If you add routes: `/` (list+stats), `/run/new`, `/run/:id`

---

## 9) Validation

- Date required
- Distance ≥ 0 (allow 0 for Strength)
- Duration ≥ 0
- If distance > 0 and duration > 0, compute pace; else pace = 0/“—”

---

## 10) Keyboard & a11y

- Form fully tabbable, ESC to close modal/drawer
- Press **Enter** to save when valid
- Announce toast messages

---

## 11) Minimal file layout

```
src/
  components/
    AddEditRunForm.tsx
    FiltersBar.tsx
    RunsTable.tsx
    StatsCards.tsx
  lib/
    calc.ts        // calcPace, avgPace, etc.
    time.ts        // parse/format duration & pace
    storage.ts     // load/save to localStorage
  store/
    runs.ts        // context or zustand store
  pages/
    Home.tsx
  App.tsx
  main.tsx
```

---

## 12) Acceptance checklist

- [ ] I can add a run with date, distance, duration; pace is auto
- [ ] I can edit, delete, duplicate runs
- [ ] I can sort and filter the table
- [ ] Stats show correct totals for week/month/all-time
- [ ] Export CSV & JSON work; Import JSON merges or replaces safely
- [ ] Data persists after reload
- [ ] Works well on mobile

---

## 13) Future (optional, not now)

- Quick-add presets (5k easy, 10k long)
- Weekly goal km and progress bar
- Backup to file automatically (download JSON)
- Share read-only stats view
