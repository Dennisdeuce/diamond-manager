# CLAUDE.md — Diamond Manager

## Project Overview

Diamond Manager is a cross-platform web application for youth/rec baseball coaches to manage rosters, build lineups (batting order + field positions), and track position history across a season. It's the only free, open-source, cross-platform web app in this niche.

**Live:** https://dennisdeuce.github.io/diamond-manager/
**Repo:** https://github.com/Dennisdeuce/diamond-manager (branch: main)
**Supabase Project:** `kyymwuxswcokusauunap`

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript + Vite |
| Styling | Tailwind CSS (custom theme: navy, cream, accent-red, field-green) |
| Drag & Drop | @dnd-kit/core |
| Auth | Supabase Auth (email, Google, Apple) + Demo Mode (localStorage) |
| Database | Supabase PostgreSQL with Row Level Security |
| Routing | react-router-dom v6 with HashRouter (GitHub Pages compatible) |
| Excel Import | SheetJS (xlsx) for client-side CSV/Excel parsing |
| Sharing | Web Share API with clipboard fallback |
| Deployment | GitHub Pages via `gh-pages` npm package |
| Icons | lucide-react |

## Commands

```bash
# Install dependencies
npm install

# Local dev server
npm run dev

# Build for production
npx vite build

# Deploy to GitHub Pages
npx gh-pages -d dist

# Full deploy (build + push)
# Use _deploy_gh.bat on Windows
```

## Project Structure

```
BaseballLineup/
├── index.html                    # Entry HTML
├── vite.config.ts                # Vite config (base: '/diamond-manager/')
├── tailwind.config.ts            # Custom theme colors
├── postcss.config.js
├── tsconfig.json                 # ES2020, bundler resolution, @/* alias
├── vercel.json                   # SPA rewrite rules (alternative deploy)
├── .env.local                    # Supabase URL + anon key (DO NOT COMMIT)
├── .env.example                  # Template for env vars
├── public/
│   └── favicon.svg
├── supabase/
│   └── migrations/
│       ├── 00001_create_tables.sql         # 7 tables: teams, players, games, lineups, lineup_entries, position/batting history
│       ├── 00002_rls_policies.sql          # RLS policies chaining through teams.user_id
│       ├── 00003_position_history_trigger.sql  # Auto-upsert history on lineup finalization
│       └── 00004_game_results.sql          # score_us, score_them columns on games
└── src/
    ├── main.tsx                  # React entry point
    ├── App.tsx                   # HashRouter, route definitions
    ├── index.css                 # Tailwind directives, component classes, @media print styles
    ├── vite-env.d.ts
    ├── lib/
    │   ├── supabase.ts           # Supabase client singleton + isSupabaseConfigured()
    │   └── constants.ts          # FIELD_POSITIONS, BATTING_SLOTS, BATTING_SLOT_LABELS, EMPTY_DRAFT_LINEUP
    ├── types/
    │   └── index.ts              # All TypeScript interfaces (Team, Player, Game, Lineup, etc.)
    ├── contexts/
    │   ├── AuthContext.tsx        # Supabase auth + Demo Mode (isDemoMode, enableDemoMode)
    │   └── TeamContext.tsx        # Team CRUD, team selector, demo team support
    ├── hooks/
    │   ├── usePlayers.ts         # Player CRUD + bulkImport, demo mode with 9 sample players
    │   ├── useGames.ts           # Game CRUD + score updates, demo mode with 3 sample games
    │   ├── useLineup.ts          # Central lineup state: assign, swap, remove, save, autosave support
    │   └── usePositionHistory.ts # Fetch position history from Supabase or demo data
    ├── services/
    │   ├── autoSuggest.ts        # Two modes: 'performance' (stats-based) and 'fairRotation' (inverse scoring)
    │   ├── playerImport.ts       # SheetJS parsing with flexible column mapping
    │   └── shareLineup.ts        # formatLineupText() + shareLineup() via Web Share API
    └── components/
        ├── auth/
        │   ├── LoginPage.tsx     # Email/password, Google/Apple OAuth, Demo Mode button
        │   └── AuthGuard.tsx     # Route guard
        ├── layout/
        │   ├── AppShell.tsx      # Sidebar + Header + Outlet
        │   ├── Sidebar.tsx       # Nav: Roster, Games, Lineup Builder, Season History, Settings
        │   └── Header.tsx        # Team selector, create team modal, user menu
        ├── ui/
        │   ├── Button.tsx        # Variants: primary, secondary, outline, ghost, danger
        │   ├── Card.tsx          # hover, padding options
        │   ├── Modal.tsx         # Overlay + escape + scroll lock
        │   ├── Tabs.tsx          # Tab bar component
        │   ├── Badge.tsx         # Variants: default, success, warning, danger, info
        │   └── EmptyState.tsx    # Baseball-themed placeholder
        ├── roster/
        │   ├── RosterPage.tsx    # Player list with search, add/edit/delete, import
        │   ├── PlayerForm.tsx    # Name, jersey#, bats/throws, preferred positions
        │   ├── PlayerCard.tsx    # Player display card
        │   └── ImportPlayersModal.tsx  # File upload + paste, preview table, bulk import
        ├── games/
        │   └── GamesPage.tsx     # Game list, W/L/T badges, score entry modal, season record
        ├── lineup/
        │   ├── LineupBuilderPage.tsx   # Main orchestrator: DndContext, tabs, autosave, fair play toggle, print, copy
        │   ├── BattingOrderTab.tsx     # 9 droppable batting slots with position count badges
        │   ├── FieldPositionsTab.tsx   # Interactive SVG diamond + DH slot + position summary grid
        │   ├── DiamondSVG.tsx          # SVG baseball diamond with 9 field position drop targets
        │   ├── PlayerChip.tsx          # Draggable player pill with jersey#, position badge, history count
        │   ├── PlayerBench.tsx         # Unassigned active players as draggable chips
        │   ├── ShareLineupModal.tsx    # Formatted text output with copy/share
        │   └── PrintableLineupCard.tsx # Print-optimized card: batting table, field positions, mini diamond
        ├── history/
        │   └── SeasonHistoryPage.tsx   # Position Matrix (player × position grid) + Game Log
        └── settings/
            └── SettingsPage.tsx        # Team info editing, GameChanger CSV import placeholder
```

## Database Schema (Supabase PostgreSQL)

### Tables
- **teams** — `id, user_id, name, season, age_group`
- **players** — `id, team_id, first_name, last_name, jersey_number, bats, throws, preferred_positions (text[]), active, notes`
- **games** — `id, team_id, game_date, opponent, is_home, location, game_type, notes, gamechanger_id, score_us, score_them`
- **lineups** — `id, game_id, team_id, label, is_final`
- **lineup_entries** — `id, lineup_id, player_id, batting_order, field_position, inning_start, inning_end`
- **player_position_history** — `id, player_id, team_id, field_position, times_played` (auto-updated via trigger)
- **player_batting_history** — `id, player_id, team_id, batting_order, times_batted, hits, at_bats` (auto-updated via trigger)

### Key Constraints
- `unique(lineup_id, batting_order)` — one player per batting slot
- `unique(lineup_id, player_id)` — player appears once per lineup
- Partial unique index on `field_position` excluding `'BN'` — one player per field position

### RLS Pattern
All tables have RLS enabled. Policies chain through `teams.user_id = auth.uid()`. Players, games, lineups, etc. are accessed only if the team belongs to the authenticated user.

### Trigger
`00003_position_history_trigger.sql` — On INSERT to `lineup_entries`, if the parent lineup `is_final = true`, upserts into `player_position_history` and `player_batting_history`.

## Key Architecture Patterns

### Demo Mode
- Toggled via `AuthContext.isDemoMode`
- All hooks (usePlayers, useGames, useLineup, usePositionHistory) check `isDemoMode` first
- Demo data is hardcoded arrays (9 players, 3 games, position history)
- Lineup state persisted to `localStorage` with key `demo-lineup-{gameId}`
- No Supabase calls in demo mode

### Drag & Drop
- `@dnd-kit/core` with `PointerSensor` (desktop) and `TouchSensor` (mobile)
- Players are `useDraggable` (via `PlayerChip`)
- Batting slots and field positions are `useDroppable`
- `handleDragEnd` in `LineupBuilderPage` determines target type and calls appropriate assign function

### Autosave
- Debounced `useEffect` in `LineupBuilderPage` watches `draft.slots`
- 1.5s debounce, version counter prevents stale saves
- Status indicator: idle → "Saving..." (pulse animation) → "Saved ✓" (2s) → idle
- Saves as non-final (draft). "Finalize" is explicit action.

### Auto-Suggest Algorithm (`autoSuggest.ts`)
Two modes controlled by `SuggestMode`:
1. **Performance** — Scores players based on batting average, positional heuristics (power hitters cleanup, speed leadoff), and preferred position bonus
2. **Fair Rotation** — Inversely scores based on `times_batted`/`times_played` with small random factor. Players who've played fewer times get priority.

### Print Support
- `PrintableLineupCard.tsx` renders a dugout-ready card
- `@media print` CSS in `index.css` hides screen UI (`.no-print`), shows print card
- `handlePrintLineup()` calls `window.print()`

### Game Score Recording
- `score_us` and `score_them` columns on `games` table
- `GameResultBadge` component shows color-coded W/L/T badges (green/red/yellow)
- Season record (W-L-T) displayed in Games page header
- Trophy icon opens score entry modal

### Position Count Badges
- `PlayerChip` accepts optional `positionHistory` prop
- Shows "{N}x" badge when player is assigned to a position they've played before
- Helps coaches see at a glance how many times a player has played each position

## Deployment

### GitHub Pages (Primary)
```bash
# In vite.config.ts: base: '/diamond-manager/'
# Build and deploy:
npx vite build
npx gh-pages -d dist
```

### Windows Batch Scripts
- `_deploy_gh.bat` — Build + deploy to gh-pages in one step
- `_gh_push.bat` — Fresh git init + push source to main branch
- `_final_push.bat` — Same with user.email/user.name config

### Important Notes
- `vite.config.ts` has `base: '/diamond-manager/'` — required for GitHub Pages subdirectory
- `HashRouter` is used (not BrowserRouter) for GitHub Pages SPA compatibility
- `.env.local` contains Supabase credentials — never committed (in .gitignore)

## Competitive Position

### vs. Roster Blast (iOS only, 4.9★)
- DM is cross-platform web; RB is iOS-only
- DM has printable lineup card (closes #1 gap)
- DM has fair rotation mode (matches key feature)
- RB has position lockout (DM: planned)

### vs. Baseball Fielding Rotation (Android only, 4.1★)
- DM is cross-platform web; BFR is Android-only
- DM has both batting + field positions; BFR is field-only
- BFR has inning-by-inning rotation (DM: schema ready, no UI)

### vs. TeamSnap / DASH (Enterprise)
- DM is free/open-source; those are paid enterprise
- DM focuses on lineup building; they focus on org management

### Unique Differentiators
1. Only cross-platform web app in the lineup niche
2. Free and open source
3. Text/SMS sharing via Web Share API
4. GameChanger integration path (CSV import + API placeholder)
5. Demo mode for instant trial without signup

## Feature Roadmap

### Completed (P0-P1)
- [x] Printable Lineup Card (print-CSS optimized, mini diamond diagram)
- [x] Fair Rotation Mode (performance vs fair play toggle in auto-suggest)
- [x] Autosave (debounced 1.5s, status indicator)
- [x] Copy Lineup to Another Game (modal with game picker)
- [x] Game Score Recording (W/L/T badges, season record, score entry modal)
- [x] Inline Position Count Badges (Nx at position on player chips)

### Planned (P1-P2)
- [ ] Position Lockout — `excluded_positions` on player model, filtered in auto-suggest
- [ ] Inning Rotation Planner — Grid UI for positions × innings (schema has `inning_start`/`inning_end`)
- [ ] Multiple Lineups per Game — Schema supports labels ("Starting"/"Late Game"), add dropdown
- [ ] Post-Game Stats Entry — Hits/AB form per player, feeds auto-suggest with real data

### Planned (P3 — Polish)
- [ ] PWA Manifest + Service Worker — Installable, offline-capable
- [ ] Player Photo Upload — Supabase Storage
- [ ] CSV/PDF Export
- [ ] Undo/Redo in Lineup Builder
- [ ] Season Summary Dashboard — W-L-T record, position distribution charts

## Development Notes

### Environment Setup
1. Clone repo
2. `npm install`
3. Copy `.env.example` to `.env.local`, fill in Supabase URL + anon key
4. `npm run dev`

### Supabase Project
- Project ID: `kyymwuxswcokusauunap`
- 4 migrations applied (create tables, RLS, trigger, game results)
- Use Supabase MCP tools for migrations: `mcp__70098a0e-61b8-4288-82d7-af8e580135b6__apply_migration`

### Known Issues
- `useEffect` dependency warnings on autosave (suppressed with eslint-disable comment)
- Copy-to-game currently only works in demo mode (localStorage). Supabase copy needs server-side implementation.
- GameChanger API integration is placeholder only (CSV import works)

### Tailwind Custom Theme
```
navy: { 50-900 } — Primary text and UI color
cream: { 50-400 } — Background and subtle borders
accent-red: #C8102E — CTAs and highlights
field-green: #2D5A27 — Diamond/field elements
field-greenLight: #4A7C43 — Field gradient
```

### Key TypeScript Types
```typescript
type FieldPosition = 'P' | 'C' | '1B' | '2B' | '3B' | 'SS' | 'LF' | 'CF' | 'RF' | 'DH' | 'BN'
type GameType = 'game' | 'practice' | 'scrimmage' | 'tournament'
type SuggestMode = 'performance' | 'fairRotation'

interface DraftLineup {
  gameId: string
  lineupId: string | null
  slots: LineupSlot[]      // 9 slots with battingOrder, playerId, fieldPosition
  benchPlayerIds: string[]
}
```
