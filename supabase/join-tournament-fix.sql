-- Run this if public tournaments exist without an owner_id and players
-- cannot join them through the "Join Tournament" button.

drop policy if exists "users can join public tournaments" on public.participants;

create policy "users can join public tournaments"
on public.participants
for insert
to authenticated
with check (
  user_id = auth.uid()
  and exists (
    select 1
    from public.tournaments
    where tournaments.id = participants.tournament_id
      and tournaments.is_public = true
      and coalesce(tournaments.status, 'open') = 'open'
      and (tournaments.owner_id is null or tournaments.owner_id <> auth.uid())
  )
);
