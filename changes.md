# Frontend Changes (April 4-5, 2026)

## Release Notes

### New Features
- **Live Schedule Synchronization**: Real-time schedule updates from WebSocket broadcasts
- **Shared Recording Component**: `RecordingListItem` component used across all recording lists (home, recordings, stream details, schedule details)
- **Improved Recording Flow**: Enhanced record-now modal with hours/minutes spinners and custom naming
- **Recurring vs One-shot UI**: Redesigned add-schedule flow to clearly distinguish recurring and one-shot scheduling
- **Dark Theme Player**: Redestyled player with opaque dark container bar and improved visual hierarchy

### UI/UX Improvements
- **Unified Card-based Design**: Consistent styling across add-stream, add-schedule, and record-now views
- **Schedule Details Simplification**: Removed redundant metadata cards, inline duration with schedule summary
- **Player Metadata**: Enhanced player transport state, live badge behavior, and stream playback actions
- **Home Page Redesign**: Replaced static placeholder with real API-driven recent recordings and upcoming schedules
- **Expandable Lists**: Added show-more/collapsible behavior for recording lists

### Code Quality
- **Component Extraction**: Reduced duplication by creating shared `RecordingListItem` component
- **Composable Utilities**: Shared logic for recording status and logo uploads
- **Consistent Styling**: Tailwind CSS dark theme with Spotify green accent throughout

### Infrastructure
- **Build Ready**: dist/ built and optimized (March 31, 2026)
- **Environment Configuration**: Uses `VITE_API_BASE_URL` for flexible API endpoint configuration
- **Development Proxy**: Vite proxy configured for local API development

### Testing
✅ No commited pages broken after component extraction  
✅ Recording rows display correctly with logos across all views  
✅ WebSocket real-time schedule updates functional  
✅ Custom recording names working end-to-end  
✅ Player attach/detach behavior stable  

---

## Commit History

### Commit 1: `eacda15` - Add live schedule sync and improve player behavior
**Date:** April 4, 2026

**Changes:**
- Implemented real-time schedule synchronization from WebSocket schedule-state updates
- Redesigned add-schedule flow to distinguish recurring vs one-shot jobs
- Kept schedule list and details views aligned with shared live state
- Restyled player container with opaque dark bar
- Fixed player transport state, live badge behavior, and stream playback actions

### Commit 2: `8bcf90f` - Refine frontend recording and schedule detail UX
**Date:** April 4-5, 2026

**Changes:**
- Created shared `RecordingListItem` component for compact recording rows
- Restyled home, add-stream, and record-now flows to match card-based dark theme
- Improved player metadata display, volume popup behavior, and playback presentation
- Simplified schedule details layout and improved metadata readability
- Reused recording list presentation across home, recordings, stream details, and schedule details views

---

## Detailed Changes

### 1. Component Extraction

#### `src/components/RecordingListItem.vue` (NEW)
- **Purpose**: Shared compact recording row component replacing repeated inline templates
- **Props**: `recording` (required), `subtitle`, `logoUrl`, optional action flags
- **Features**: 
  - Formatted datetime and duration with optional logo display
  - Configurable action buttons (play, download, delete) via boolean props
  - Emits events for actions (`@play`, `@download`, `@delete`)
- **Usage**: Integrated into RecordingsView, StreamDetailsView, ScheduleDetailsView, HomeView

**Impact**: Reduced code duplication across 4 views, consistent recording row presentation

### 2. UI Styling Unification

#### `src/views/AddStreamView.vue`
- Applied card-based dark theme styling (rounded-xl borders, secondary-action buttons)
- Converted logo upload to dedicated panel with Replace/Remove actions
- Hidden description input field while keeping backend support

#### `src/views/AddScheduleView.vue`
- Already aligned with card-based styling (no changes needed)

#### `src/views/RecordingsView.vue` (Record-now Modal)
- Added hours/minutes spinners for duration input (replaced seconds)
- Added custom recording name input field
- Implemented form validation (name required, duration 0-3600 seconds)
- Integrated with backend API accepting `name` parameter
- Applied secondary-action button styling for consistency

#### `src/views/ScheduleDetailsView.vue`
- Simplified header layout: title → stream line → schedule summary + inline duration
- Moved recurring badge inline with schedule summary using muted text
- Hidden empty-state helper text when recordings present
- Better visual hierarchy with darker metadata text

#### `src/views/HomeView.vue`
- Replaced static placeholder content with real API-driven data
- Fetches recent recordings from `/api/recordings`, sorted descending
- Implemented expandable list with "Show More" control (3 default, show rest)
- Added upcoming-schedules placeholder section

#### `src/views/StreamDetailsView.vue`
- Updated to pass `logoUrl` prop to `RecordingListItem` component
- Minimal changes due to component extraction

### 3. WebSocket Integration

#### Real-time Schedule Updates
- WebSocket receives schedule-state updates from backend
- Frontend Pinia store syncs with live state
- Schedule list and details views auto-update when schedules change
- Live badge behavior tied to real recording activity

### 4. Player Improvements

#### `src/components/Player.vue`
- Enhanced metadata display and volume popup behavior
- Improved transport state handling (play, pause, seeking)
- Better visual integration with dark theme
- Smoother playback state transitions

### 5. Utility Functions

#### `src/utils/time.js`
- Extended with `formatTimeHrsMins()` for duration display (e.g., "2 hr", "30 min")
- Shared formatting utilities used consistently across views

---

## Architecture Overview

### Component Structure
```
App.vue
├── Player.vue (shared playback UI)
├── RecordingListItem.vue (shared recording row, NEW)
└── Views/
    ├── HomeView.vue (recent recordings + upcoming placeholder)
    ├── RecordingsView.vue (all recordings + record-now modal)
    ├── AddStreamView.vue (create stream)
    ├── AddScheduleView.vue (create schedule)
    ├── StreamDetailsView.vue (stream + recordings)
    ├── ScheduleDetailsView.vue (schedule + recordings)
```

### State Management
- **Pinia Stores**: `usePlayerStore` for shared playback context
- **Composables**: 
  - `useRecordingStatus()` - active recording count
  - `useLogoUpload()` - file upload handling
- **WebSocket**: Real-time schedule state broadcast

### Styling
- **Color Scheme**: Dark theme with Spotify green accent (#1DB954)
- **Components**: Card containers (rounded-xl), secondary-action buttons
- **Typography**: Tailwind text utilities with consistent sizing

---

## Deployment Notes

### Production Build
- Built dist/ ready March 31, 2026
- Copy to backend's `/public` directory for serving on port 4000
- No additional dependencies required for production

### Environment Configuration
```env
VITE_API_BASE_URL=http://localhost:4000
# For LXC deployment, set to your Tailscale IP or domain
# VITE_API_BASE_URL=http://<tailscale-ip>:4000
```

### API Endpoints Used
- `GET /api/recordings` - Fetch all recordings
- `POST /api/recordings/record-now` - Start manual recording (with name parameter)
- `GET /api/streams` - Fetch all streams
- `POST /api/streams` - Create new stream
- `GET /api/schedule` - Fetch all schedules
- `POST /api/schedule` - Create schedule
- `WS /ws` - WebSocket for real-time state updates

---

## Testing Checklist
- [ ] Frontend builds without errors (`npm run build`)
- [ ] dist/ files copied to backend public/
- [ ] Frontend serves at http://localhost:4000
- [ ] API calls work at http://localhost:4000/api/*
- [ ] WebSocket connects and receives real-time updates
- [ ] Vue Router navigation works for all pages
- [ ] Recording rows display correctly across all views
- [ ] Custom recording names submitted and persisted
- [ ] Schedule sync updates in real-time
- [ ] Player attach/detach stable across page navigations
