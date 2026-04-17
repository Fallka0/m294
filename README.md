# Tournamount

Tournamount is a Next.js + Supabase tournament platform focused on gaming first, while still supporting classic sports.

It gives organizers a cleaner way to create events, manage participants or teams, generate brackets, and present a public organizer profile. Players can browse public tournaments, join open events, and track bracket progress from the same app.

## Online Version

The deployed web application is available here:

- [https://m294-d5ns.vercel.app/](https://m294-d5ns.vercel.app/)

## What Tournamount Includes

- Game-first tournament creation with a visual selector for popular PC games
- Support for real sports and custom game/sport names
- Public and private tournaments
- Solo and team-based entries
- Group stage, knockout, and combined tournament modes
- Editable brackets and result reporting
- Team management with roster-size validation
- Organizer profiles with avatar, banner, bio, and links
- Public organizer pages
- Email/password auth plus Google and GitHub OAuth
- Light and dark mode
- Responsive UI for desktop and mobile
- Vercel Analytics and Speed Insights integration
- User-facing error handling for major fetch and submit flows

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- Supabase
- Framer Motion
- React Icons
- Vitest

## Frontend and Backend

### Frontend

The frontend is built with Next.js, React, and TypeScript.

It is responsible for:

- rendering the dashboard, auth, profile, team, and tournament pages
- handling user interactions such as form input, filtering, joining tournaments, and entering results
- managing theme behavior, responsive layouts, and client-side UI state
- calling Supabase from the application to load and update data

The main frontend code lives in:

- `src/app`
- `src/components`
- `src/lib`

### Backend

TournamentHub does not use a separate custom Express or Node backend. Instead, it uses Supabase as the backend platform.

Supabase handles:

- database storage
- authentication
- row level security
- public and protected data access
- storage for profile and team media

The backend-related setup is defined mainly through:

- SQL files in `supabase/`
- the Supabase client in `src/lib/supabase.ts`

In practice, the frontend talks directly to Supabase. This keeps the architecture simpler and reduces the amount of custom server code that has to be maintained.

## Endpoints and Routes

TournamentHub mainly uses App Router pages instead of a large custom REST API. The important endpoints in this project are therefore the application routes and the Supabase endpoints used behind the scenes.

### Main application routes

- `/`
  Dashboard with tournament browsing, filtering, and overview cards

- `/auth`
  Sign in, sign up, remember-me login, and OAuth entry point

- `/profile`
  Private page where a logged-in user edits their own profile

- `/organizers/[id]`
  Public organizer profile page

- `/teams`
  Private page where a logged-in user creates and manages reusable teams

- `/tournaments/new`
  Tournament creation form

- `/tournaments/[id]`
  Tournament detail page with participants or teams, status, bracket generation, and result handling

- `/tournaments/[id]/edit`
  Tournament editing page

- `/tournaments/[id]/bracket`
  Bracket-focused tournament view

### Supabase endpoints used indirectly

The app also communicates with Supabase through the configured project URL.

This includes:

- Auth endpoints for login, signup, session handling, and OAuth
- Database access for tables such as:
  - `profiles`
  - `tournaments`
  - `participants`
  - `matches`
  - `teams`
- Storage access for uploaded profile and team media

These endpoints are not written manually inside the project as classic controller routes. They are provided by Supabase and accessed through the Supabase client SDK.

## Getting Started

### Prerequisites

- Node.js
- npm

### Install dependencies

```bash
npm install
```

### Configure environment variables

Create `.env.local` in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-supabase-publishable-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

`NEXT_PUBLIC_APP_URL` is used as the configured app origin fallback for OAuth redirects.

### Set up Supabase

Run these SQL files in the Supabase SQL editor:

1. `supabase/social-auth-mvp.sql`
2. `supabase/profile-customization.sql`
3. `supabase/team-tournaments.sql`

Optional helper scripts:

- `supabase/join-tournament-fix.sql`
- `supabase/profile-media-storage.sql`

Supporting docs:

- `docs/social-auth-mvp.md`
- `docs/lb2-projektdokumentation.md`
- `docs/lb2-testfaelle.md`
- `docs/lb2-testprotokoll.md`


### Start the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

This README serves as the startup guide for the project. The application can either be started locally with `npm install` and `npm run dev`, or opened directly via the deployed version on Vercel.

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run test
npm run test:watch
```

- `npm run dev` starts the local development server
- `npm run build` creates the production build
- `npm run start` starts the production server
- `npm run test` runs the Vitest unit test suite once
- `npm run test:watch` runs Vitest in watch mode

## Unit Tests

Unit tests are already included and currently cover core tournament logic:

- `__tests__/bracket.test.ts`
  Covers initial bracket generation, score validation, and bracket progression updates
- `__tests__/tournaments.test.ts`
  Covers tournament normalization, display-status fallback logic, and dashboard date formatting

Run them with:

```bash
npm run test
```

## OAuth Setup

Tournamount supports OAuth through Supabase.

Supported providers:

- Google
- GitHub

To enable OAuth:

1. Go to `Supabase -> Authentication -> Providers`
2. Enable the provider
3. Add the client ID and client secret
4. Set the correct Site URL and Redirect URLs

Typical redirect values:

- local auth route: `http://localhost:3000/auth`
- deployed auth route: `https://m294-d5ns.vercel.app/auth`
- provider callback: `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`

## Routes and Endpoints

Tournamount currently does not expose custom Next.js API endpoints such as `src/app/api/*/route.ts`.

Instead, the app is made up of:

- user-facing App Router pages
- client-side calls to Supabase Auth, Database, and Storage endpoints

### App routes

- `/`
  Dashboard, tournament discovery, filters, and stats
- `/auth`
  Email auth, OAuth sign-in, and account creation
- `/profile`
  Organizer profile editing
- `/teams`
  Team creation and management
- `/organizers/[id]`
  Public organizer profile page
- `/tournaments/new`
  Tournament creation flow
- `/tournaments/[id]`
  Tournament detail page, participant handling, join/leave, and bracket actions
- `/tournaments/[id]/edit`
  Tournament editing flow
- `/tournaments/[id]/bracket`
  Standalone bracket management page

### Supabase endpoints used by the app

- `https://YOUR_PROJECT_REF.supabase.co/auth/v1/*`
  Authentication, OAuth redirects, session handling, and provider callback flow
- `https://YOUR_PROJECT_REF.supabase.co/rest/v1/*`
  Database access for tournaments, participants, profiles, teams, and matches
- `https://YOUR_PROJECT_REF.supabase.co/storage/v1/*`
  Profile and team media uploads/removals


### Main data areas used through Supabase

- `profiles`
  User profile and organizer identity data
- `tournaments`
  Tournament metadata and ownership
- `participants`
  Joined players or registered teams
- `matches`
  Bracket and stage matches
- `teams`
  Team rosters and team media

## Main App Areas

- `src/app/page.tsx`
  Dashboard, filtering, and tournament discovery
- `src/app/auth/page.tsx`
  Sign in, sign up, OAuth, and account onboarding
- `src/app/tournaments/new/page.tsx`
  Tournament creation flow
- `src/app/tournaments/[id]/page.tsx`
  Tournament details, participant management, joins, and bracket actions
- `src/app/tournaments/[id]/edit/page.tsx`
  Tournament editing flow
- `src/app/tournaments/[id]/bracket/page.tsx`
  Standalone bracket management page
- `src/app/teams/page.tsx`
  Team creation and team management
- `src/app/profile/page.tsx`
  Organizer profile editing
- `src/app/organizers/[id]/page.tsx`
  Public organizer profile page

## Project Structure

```text
m294/
|- __tests__/
|- docs/
|- public/
|- supabase/
|- src/
|  |- app/
|  |- components/
|  |  |- auth/
|  |  |- game-sports/
|  |  |- header/
|  |  |- home/
|  |  |- layout/
|  |  |- profile/
|  |  |- react-bits/
|  |  |- theme/
|  |  `- tournaments/
|  `- lib/
`- README.md
```

## Current Product Direction

Tournamount is no longer just a generic tournament CRUD app. The current app direction includes:

- stronger support for esports and PC game tournaments
- visual game/sport selection during tournament setup
- team-based tournament flows
- better dark mode consistency
- modular layout and shared UI primitives
- clearer in-app error messaging for failed loads and actions

## Development Notes

- Supabase is required for auth, tournament data, profiles, teams, and brackets
- OAuth redirects depend on both Supabase URL configuration and `NEXT_PUBLIC_APP_URL`
- Theme behavior is driven by the theme provider plus CSS variables in `src/app/globals.css`
- Some SQL files in `supabase/` are setup scripts rather than runtime migrations, so document any database changes clearly in merge requests

If you see:

```text
NEXT_PUBLIC_SUPABASE_URL is required
```

your `.env.local` file is missing or incomplete.

## Deployment

Tournamount can be deployed on Vercel.

Before deploying:

- add the same environment variables in Vercel
- configure Supabase redirect URLs for the deployed domain
- make sure the required SQL setup has already been applied in Supabase
- keep OAuth provider settings in sync with the deployed app URL

## Contributing

Recommended workflow:

1. Create a feature branch
2. Make focused changes
3. Run `npm run build`
4. Run `npm run test` when logic changes are involved
5. Open a merge request

Guidelines:

- keep components modular and reusable
- prefer TypeScript-safe changes
- avoid mixing unrelated refactors into one branch
- document environment or SQL changes clearly
- preserve the existing visual direction unless the task calls for a redesign

## Submission Note

For the module submission, the relevant project state is the latest commit on the `master` branch of the group GitLab repository before the submission deadline. The source code is therefore not submitted as a separate archive, but via the GitLab repository history.

## AI Usage Reflection

AI was used during this project as a supporting tool for implementation, debugging, refactoring, documentation, and wording improvements. The generated suggestions were not copied blindly into the project. Instead, they were reviewed, adapted, tested, and integrated into the existing codebase where they made sense.

Examples of AI-supported work in this project include:

- improving UI text and documentation wording
- debugging Git, environment, and dependency issues
- restructuring React and Next.js components
- refining bracket logic, validation, and team tournament features
- preparing README and project documentation sections

The final responsibility for the submitted solution, the architecture decisions, the testing, and the integrated code remains with the project team. AI-generated code and text were treated as drafts and then revised to match the project's requirements and implementation.

## License

This repository currently does not define a separate license file.
