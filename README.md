# Tournamount

Tournamount is a Next.js + Supabase tournament platform focused on gaming first, while still supporting classic sports.

It gives organizers a cleaner way to create events, manage participants or teams, generate brackets, and present a public organizer profile. Players can browse public tournaments, join open events, and track bracket progress from the same app.

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

## Getting Started

### Prerequisites

- Node.js
- npm
- a Supabase project

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

## License

This repository currently does not define a separate license file.
