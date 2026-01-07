# Frontend - Session Tracker

Angular 19 application for user authentication and tab presence tracking.

## Setup Instructions

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
npm install
npm start
```

The application will be available at `http://localhost:4200`.

### Environment

Configuration is in `src/environments/environment.ts`:

```typescript
export const environment = {
  supabaseUrl: 'https://your-project.supabase.co',
  supabaseKey: 'your-anon-key',
  apiUrl: 'http://localhost:5001/api'
};
```

## Authentication with Supabase

### Configuration

Authentication uses **Supabase Auth** with email/password strategy. The `SupabaseService` wraps the Supabase JS client.

### Flow

1. User registers or signs in via Supabase Auth API
2. Supabase returns JWT access token
3. Session is stored in `localStorage` automatically by Supabase client
4. `authGuard` waits for session initialization before checking auth state
5. `loginGuard` redirects authenticated users from `/login` to `/app`
6. Access token is sent to backend via `Authorization: Bearer <token>` header

### Key Files

- `services/supabase.service.ts` - Auth wrapper with reactive `user$` observable
- `guards/auth.guard.ts` - Protects `/app` route
- `guards/login.guard.ts` - Redirects logged users away from login

## Presence Strategy

### Tri-state Model

Instead of binary online/offline, the system uses three states:

| State | Condition | Meaning |
|-------|-----------|---------|
| **Active** | `lastSeen` < 30s | User is actively using the tab |
| **Idle** | `lastSeen` 30-60s | Tab open but not focused |
| **Stale** | `lastSeen` > 60s | Tab may be closed or throttled |

### Why This Approach?

1. **No `beforeunload` reliance** - These events are unreliable in modern browsers
2. **Graceful degradation** - Stale tabs "fade out" instead of flickering
3. **Browser throttling tolerance** - Background tabs have reduced timer precision

### Implementation

- `deviceId` stored in `localStorage` (persists across sessions)
- `tabId` stored in `sessionStorage` (unique per tab)
- Heartbeat: 10s for active tabs, 30s for background tabs
- Immediate heartbeat on visibility change (focus/blur)

### Key Files

- `services/tab-tracking.service.ts` - Heartbeat logic and visibility tracking
- `services/api.service.ts` - HTTP communication with backend

## Trade-offs and Limitations

Due to time constraints:

- **Polling over WebSockets** - Uses 10s polling instead of real-time updates
- **No token refresh** - Sessions expire after 1 hour without refresh
- **No automatic cleanup** - Stale entries remain in database
- **Minimal error handling** - No retry logic for failed API calls
- **No unit tests** - Focus was on functionality

## Architecture

```
src/app/
├── guards/           # Route protection (auth, login)
├── interfaces/       # TypeScript types (TabInfo, etc.)
├── pages/            # Standalone components (login, dashboard)
└── services/         # Business logic & API communication
```

**Tech Stack**: Angular 19, Tailwind CSS, Supabase JS Client, RxJS
