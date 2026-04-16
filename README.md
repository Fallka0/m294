# TournamentHub

TournamentHub is a web platform for creating, managing, and sharing tournaments.

It is built for organizers who want a clean dashboard, participant management, bracket handling, profile customization, and a more social tournament experience with public events and account-based ownership.

## Why TournamentHub

TournamentHub is designed to make tournament administration simpler without feeling limited.

With TournamentHub, users can:

- create tournaments tied to their account
- manage tournament details, participants, and brackets
- browse public tournaments from other organizers
- join public tournaments as a participant
- customize their organizer profile with banners, avatars, bio, and links
- sign in with email/password or OAuth providers

## Key Features

- Account-based tournament ownership
- Public and private tournaments
- Explore, My tournaments, and Joined dashboard views
- Participant management and bracket views
- Organizer profile pages
- Remember-me login support
- Google and GitHub OAuth
- Light and dark mode
- Responsive interface for desktop and mobile

## Product Snapshot

### For organizers

- Create and manage your own tournaments
- Edit brackets and participant lists
- Present a public organizer identity
- Share tournaments publicly or keep them private

### For participants

- Discover public tournaments
- Join open public tournaments
- Track tournament status and bracket progress

### For teams and schools

- Use a modern, browser-based tournament workflow
- Extend the app with Supabase and Next.js
- Build on a modular TypeScript codebase

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- Supabase
- Framer Motion

## Getting Started

### Prerequisites

- Node.js
- npm
- a Supabase project

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-supabase-publishable-key
```

Important:

- the file must be in the project root
- do not place `.env.local` inside `src`

Correct location:

`C:\Users\ampro\OneDrive\Documents\GitHub\m294\.env.local`

### 3. Set up Supabase

Run these SQL files in your Supabase SQL editor:

1. `supabase/social-auth-mvp.sql`
2. `supabase/profile-customization.sql`

Optional:

- `supabase/join-tournament-fix.sql`
- `supabase/profile-media-storage.sql`

Additional notes:

- [docs/social-auth-mvp.md](C:/Users/ampro/OneDrive/Documents/GitHub/m294/docs/social-auth-mvp.md)

### 4. Start the development server

```bash
npm run dev
```

Then open:

[http://localhost:3000](http://localhost:3000)

## Available Scripts

```bash
npm run dev
npm run build
npm run start
```

- `npm run dev` starts the local development server
- `npm run build` creates the production build
- `npm run start` starts the production server

## OAuth Setup

TournamentHub supports OAuth through Supabase.

Supported providers:

- Google
- GitHub

To enable OAuth:

1. Go to `Supabase -> Authentication -> Providers`
2. Enable the provider
3. Enter the client ID and client secret
4. Configure redirect URLs

Typical redirect values:

- local auth route: `http://localhost:3000/auth`
- deployed auth route: `https://m294-d5ns.vercel.app/auth`
- provider callback: `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`

## Project Structure

```text
m294/
|- docs/
|- public/
|- supabase/
|- src/
|  |- app/
|  |- components/
|  |  |- auth/
|  |  |- home/
|  |  |- profile/
|  |  |- react-bits/
|  |  |- theme/
|  |  `- tournaments/
|  `- lib/
`- README.md
```

## Main Application Areas

- `src/app/page.tsx`
  Main dashboard and tournament browsing experience

- `src/app/auth/page.tsx`
  Sign-in, sign-up, remember-me, and OAuth flow

- `src/app/profile/page.tsx`
  Organizer profile editing and customization

- `src/app/organizers/[id]/page.tsx`
  Public organizer profile page

- `src/app/tournaments`
  Tournament creation, editing, detail, and bracket flows

- `src/components`
  Shared UI building blocks and modular feature components

## Development Notes

- The project uses TypeScript for application code
- Supabase is required for auth and tournament data
- Local auth behavior depends on correct Supabase redirect configuration
- Theme behavior is controlled through the app theme provider and CSS variables in `src/app/globals.css`

If you see:

`NEXT_PUBLIC_SUPABASE_URL is required`

then your `.env.local` file is missing or placed in the wrong location.

## LB2 Documentation

The formal LB2 project documents are available here:

- [lb2-projektdokumentation.md](C:/Users/ampro/OneDrive/Documents/GitHub/m294/docs/lb2-projektdokumentation.md)
- [lb2-testfaelle.md](C:/Users/ampro/OneDrive/Documents/GitHub/m294/docs/lb2-testfaelle.md)
- [lb2-testprotokoll.md](C:/Users/ampro/OneDrive/Documents/GitHub/m294/docs/lb2-testprotokoll.md)

## Contributing

Contributions are welcome.

If you want to improve the app, please keep changes modular and easy to review.

### Recommended workflow

1. Create a feature branch
2. Make focused changes
3. Test locally
4. Open a merge request or pull request

### Contribution guidelines

- keep components small and reusable
- prefer TypeScript-safe changes
- follow the existing folder structure
- avoid unrelated refactors in the same change
- keep UI changes consistent with the existing visual language
- document any required SQL or environment changes

### Good contribution examples

- improving bracket logic
- refining responsive layouts
- fixing accessibility issues
- adding profile or tournament features
- improving auth and onboarding flows
- cleaning up duplicated component logic

## Roadmap Ideas

The app is already moving toward a more social tournament platform. Future areas include:

- more bracket types such as swiss or double elimination
- stronger social and organizer profile features
- richer public tournament discovery
- better media handling for banners and profile images
- more polished theming and customization

## Deployment

TournamentHub can be deployed on Vercel.

Before deploying:

- add the same environment variables in Vercel
- configure Supabase redirect URLs for the deployed domain
- make sure your SQL setup is already applied in Supabase

## Support

If you are using the project as a customer, school, or organizer demo:

- start by setting up Supabase correctly
- verify auth redirects before testing OAuth
- keep `.env.local` in the project root

If you are contributing as a developer:

- read the structure section first
- test critical flows like auth, tournament creation, profile editing
- mention database changes clearly in your PR or merge request

## License

This repository currently does not define a separate license file.
