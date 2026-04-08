# FE/CLAUDE.md

This file provides frontend-specific guidance for the Vue application in `FE/`.

## Stack

- Vue 3
- Composition API
- Vite
- Vue Router 4
- Pinia
- Axios
- Plyr
- Tailwind CSS

## Development Commands

```bash
npm run dev
npm run build
npm run preview
npm run test:unit
npm run lint
npm run format
```

## Directory Guide

```text
src/
├── views/         page components
├── components/    reusable UI
├── stores/        Pinia stores
├── composables/   shared logic
├── services/      API helpers
├── utils/         axios instance and shared utilities
└── router/        route definitions
```

## Core Frontend Rules

### API Usage

- Use `src/utils/axiosInstance.js` for all HTTP requests.
- Assume backend base path includes `/api`.
- File URLs must go through `getFileUrl()` when backend returns `/files/...`.

### Auth State

- User state lives in `userStore`.
- Prefer `userStore.getMemberId` over reading `id` directly in components.
- Refresh flow must preserve user id and role after `/auth/refresh`.

### Component Conventions

- Views: `*View.vue`
- Reusable components: descriptive names like `LectureItem`, `UserBar`
- Modals: `*Modal.vue`

### Icon Usage

- Do not use emoji as UI icons.
- Prefer `Phosphor Icons` or `Google Material Icons`.
- Replace legacy emoji UI gradually when touching nearby code.

## UI / UX Conventions

### Layout

- Desktop lecture card layouts should keep width and spacing stable.
- Mobile and tablet layouts should avoid cramped multi-button rows.
- Reuse shared layout patterns before introducing new one-off variants.

### Error Handling

- Prefer user-facing failure messages over silent console-only handling.
- Network failure, auth failure, and business-rule failure should be distinguishable.

### File and Video Flows

- Upload UI should reflect in-progress state clearly.
- Edit flows must preserve existing file URLs unless the user explicitly replaces them.

## Video Playback / LastView

### Current Implemented Behavior

- Last viewed position lookup exists.
- Recent video lookup for lecture resume exists.
- Enter/exit lecture events exist.
- Client sends watch time updates through `/v1/last-view`.

### Related Files

- `src/views/VideoPlayerView.vue`
- `src/views/LectureDetailsView.vue`
- `src/utils/axiosInstance.js`

## Frontend Completed Work

- Lecture edit UI
- Video player fixed aspect ratio
- Lecture list item fixed height
- Featured lecture selection UX
- Lecture card layout stabilization

## Frontend TODO

### High Priority

- [ ] Responsive polish for mobile/tablet button layout and spacing
- [ ] Improve user-facing API error messages
- [x] Remove frontend reliance on `418` auth handling and align with standard auth status codes
- [ ] Make logout / expired-token UX more robust after refresh edge cases

Auth planning note:
- Prefer finishing the shared auth/session error-code contract first, then tighten logout / expired-token UX on the frontend using `status + code` instead of status-only branching

### Medium Priority

- [ ] Reclassify LastView / resume-playback feature as fully complete or document remaining UX gaps
- [ ] Fix inflated total watch time on the frontend side
- [ ] Review duplicate watch-time sends from interval, visibility change, unload, and route leave
- [ ] Add stronger lecture-management UI in admin pages if needed beyond upload/edit
- [ ] Reduce large video UX friction where loading feels slow

### Low Priority

- [ ] Replace remaining legacy emoji UI with icon components where still present
- [ ] Add richer lecture stats/dashboard views if product scope requires them

## Notes

- Time values are handled in milliseconds.
- Query-parameter tab state is already used in `AdminView` and `SettingsView`.
- When fixing auth issues, check both UI behavior and Pinia state restoration.
