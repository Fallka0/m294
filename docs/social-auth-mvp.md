# Social Auth MVP Setup

This app now expects Supabase Auth and a few extra database fields for:

- JWT-based accounts
- profile records
- tournament ownership
- public/private tournaments
- joining public tournaments as a participant

## Before running the app

1. Open the Supabase SQL editor for your project.
2. Run [social-auth-mvp.sql](C:/Users/ampro/OneDrive/Documents/GitHub/m294/supabase/social-auth-mvp.sql).
3. Make sure Email auth is enabled in Supabase Authentication.
4. Enable the OAuth providers you want to use in Supabase Authentication.
   The app now supports `Google` and `GitHub`.
5. Add your local and deployed auth callback URLs in the Supabase provider settings.
   For local dev, include `http://localhost:3000/auth`.
6. If you want organizer profile customization, also run [profile-customization.sql](C:/Users/ampro/OneDrive/Documents/GitHub/m294/supabase/profile-customization.sql).

## What changes in the app

- unauthenticated users can browse public tournaments
- authenticated users can:
  - create tournaments tied to their account
  - set tournaments to public or private
  - manage only their own tournaments
  - join public tournaments owned by other users
  - see `Explore`, `My tournaments`, and `Joined` scopes on the dashboard

## Important note about old tournaments

Existing tournaments without an `owner_id` will still be readable if they are public, but they will not automatically belong to an account. If you want to claim old tournaments, update their `owner_id` manually in Supabase.

If players cannot join an older public tournament, also run [join-tournament-fix.sql](C:/Users/ampro/OneDrive/Documents/GitHub/m294/supabase/join-tournament-fix.sql).
