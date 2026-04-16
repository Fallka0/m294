'use client'

import type { ChangeEvent, FormEvent } from 'react'
import PageShell from '@/components/layout/PageShell'
import TournamentFormHero from '@/components/tournaments/TournamentFormHero'
import { entryTypeLabel, matchFormatLabel, modeOptions, sports, statusOptions } from '@/lib/tournaments'
import { sanitizeGroupCount, sanitizeTeamSize } from '@/lib/tournament-settings'
import type { TournamentFormValues } from '@/lib/types'

const fieldClassName =
  'app-input w-full rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-400'

type FeedbackTone = 'error' | 'success' | 'info'

interface TournamentFormProps {
  title: string
  subtitle: string
  form: TournamentFormValues
  errors?: Partial<Record<'name' | 'sport' | 'mode' | 'group_count' | 'max_participants' | 'date' | 'team_size', string>>
  onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  onCancel: () => void
  onDelete?: () => void
  submitting: boolean
  submitLabel: string
  submitLoadingLabel: string
  showStatus?: boolean
  feedbackMessage?: string
  feedbackTone?: FeedbackTone
}

export default function TournamentForm({
  title,
  subtitle,
  form,
  errors = {},
  onChange,
  onSubmit,
  onCancel,
  onDelete,
  submitting,
  submitLabel,
  submitLoadingLabel,
  showStatus = false,
  feedbackMessage,
  feedbackTone = 'info',
}: TournamentFormProps) {
  const today = new Date().toISOString().split('T')[0]
  const participantLimit = Number(form.max_participants) || 0
  const isCreateMode = !showStatus
  const hasPastDate = Boolean(form.date && form.date < today)
  const blocksSubmission = participantLimit < 2 || (isCreateMode && hasPastDate)
  const selectedMode = modeOptions.find((option) => option.value === form.mode)?.label ?? 'Knockout'
  const sanitizedGroupCount = sanitizeGroupCount(form.group_count, form.mode, participantLimit || 2)
  const sanitizedTeamSize = sanitizeTeamSize(form.team_size, form.entry_type)
  const showGroupControls = form.mode === 'group' || form.mode === 'both'
  const isTeamTournament = form.entry_type === 'team'
  const setupChecklist = [
    { label: 'Basic details', complete: Boolean(form.name.trim() && form.sport && form.date) },
    {
      label: 'Structure choices',
      complete: Boolean(
        form.mode &&
          participantLimit >= 2 &&
          (!showGroupControls || sanitizedGroupCount >= 1) &&
          (!isTeamTournament || sanitizedTeamSize >= 2),
      ),
    },
    { label: 'Visibility ready', complete: typeof form.is_public === 'boolean' },
    { label: 'Description added', complete: form.description.trim().length >= 12 },
  ]
  const guidance = [
    participantLimit < 2 ? 'Set at least 2 participants before saving.' : null,
    isCreateMode && hasPastDate ? 'Choose today or a future date for a new tournament.' : null,
    showGroupControls && participantLimit > 0 && participantLimit / sanitizedGroupCount < 2
      ? 'Each group should have at least 2 teams, so reduce the group count or raise the cap.'
      : null,
    isTeamTournament && sanitizedTeamSize < 2 ? 'Team tournaments should use at least 2 players per team.' : null,
    form.mode !== 'group' && participantLimit > 0 && participantLimit % 2 !== 0
      ? 'Odd participant caps create automatic byes in knockout rounds.'
      : null,
    showStatus && form.status === 'live' && participantLimit < 2
      ? 'A live tournament usually needs enough participants to generate matches.'
      : null,
  ].filter(Boolean)

  const feedbackClassName =
    feedbackTone === 'error'
      ? 'app-banner-danger'
      : feedbackTone === 'success'
        ? 'app-banner-success'
        : 'app-banner-info'

  return (
    <PageShell>
        <TournamentFormHero title={title} subtitle={subtitle} />

        <div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
          <div className="app-card rounded-[32px] p-8 md:p-10">
            <form onSubmit={onSubmit} className="flex flex-col gap-6">
              <div className="grid gap-4 md:grid-cols-[1.1fr_0.9fr]">
                <div className="app-muted-panel rounded-[24px] px-5 py-5">
                  <p className="app-eyebrow">Setup progress</p>
                  <div className="mt-4 space-y-3">
                    {setupChecklist.map((item) => (
                      <div key={item.label} className="flex items-center justify-between gap-3 text-sm">
                        <span className="app-text-secondary">{item.label}</span>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            item.complete ? 'app-chip-info' : 'app-chip'
                          }`}
                        >
                          {item.complete ? 'Ready' : 'Missing'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="app-accent-panel rounded-[24px] px-5 py-5">
                  <p className="app-eyebrow">Current setup</p>
                  <div className="mt-4 grid gap-3 text-sm">
                    <div>
                      <p className="app-text-muted">Mode</p>
                      <p className="app-text-primary font-semibold">{selectedMode}</p>
                    </div>
                    <div>
                      <p className="app-text-muted">Series</p>
                      <p className="app-text-primary font-semibold">{matchFormatLabel[form.match_format]}</p>
                    </div>
                    <div>
                      <p className="app-text-muted">Entry type</p>
                      <p className="app-text-primary font-semibold">{entryTypeLabel[form.entry_type]}</p>
                    </div>
                    {isTeamTournament && (
                      <div>
                        <p className="app-text-muted">Team size</p>
                        <p className="app-text-primary font-semibold">{sanitizedTeamSize} players</p>
                      </div>
                    )}
                    <div>
                      <p className="app-text-muted">Capacity</p>
                      <p className="app-text-primary font-semibold">
                        {participantLimit || 'Not set'} {isTeamTournament ? 'teams' : 'players'}
                      </p>
                    </div>
                    {showGroupControls && (
                      <div>
                        <p className="app-text-muted">Groups</p>
                        <p className="app-text-primary font-semibold">{sanitizedGroupCount}</p>
                      </div>
                    )}
                    <div>
                      <p className="app-text-muted">Publishing</p>
                      <p className="app-text-primary font-semibold">{form.is_public ? 'Public listing' : 'Private draft'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {feedbackMessage && (
                <p className={`rounded-2xl border px-4 py-3 text-sm ${feedbackClassName}`}>
                  {feedbackMessage}
                </p>
              )}

              {guidance.length > 0 && (
                <div className="app-banner-warning rounded-2xl px-4 py-4 text-sm">
                  <p className="font-semibold">Review before saving</p>
                  <ul className="mt-2 space-y-2">
                    {guidance.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              <section className="space-y-5">
                <div>
                  <p className="app-eyebrow">Step 1</p>
                  <h2 className="app-text-primary mt-2 text-xl font-semibold tracking-tight">Basics</h2>
                  <p className="app-text-secondary mt-1 text-sm">Name the event clearly and set the public-facing schedule.</p>
                </div>

                <div>
                  <label className="app-text-primary mb-2 block text-sm font-semibold">
                    Tournament Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="name"
                    required
                    value={form.name}
                    onChange={onChange}
                    placeholder="Enter tournament name"
                    className={fieldClassName}
                  />
                  {errors.name && <p className="mt-2 text-sm text-red-500">{errors.name}</p>}
                  <p className="app-text-secondary mt-2 text-sm">Use a short name people can recognize quickly in the dashboard.</p>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <label className="app-text-primary mb-2 block text-sm font-semibold">
                      Sport Type <span className="text-red-500">*</span>
                    </label>
                    <select name="sport" required value={form.sport} onChange={onChange} className={fieldClassName}>
                      <option value="">Select a sport</option>
                      {sports.map((sport) => (
                        <option key={sport} value={sport}>
                          {sport}
                        </option>
                      ))}
                    </select>
                    {errors.sport && <p className="mt-2 text-sm text-red-500">{errors.sport}</p>}
                  </div>

                  <div>
                    <label className="app-text-primary mb-2 block text-sm font-semibold">
                      Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="date"
                      type="date"
                      required
                      min={isCreateMode ? today : undefined}
                      value={form.date}
                      onChange={onChange}
                      className={fieldClassName}
                    />
                    {errors.date && <p className="mt-2 text-sm text-red-500">{errors.date}</p>}
                    <p className="app-text-secondary mt-2 text-sm">
                      {showStatus ? 'Past dates are allowed while updating existing tournaments.' : 'New tournaments should start today or later.'}
                    </p>
                  </div>
                </div>
              </section>

              <section className="space-y-5">
                <div>
                  <p className="app-eyebrow">Step 2</p>
                  <h2 className="app-text-primary mt-2 text-xl font-semibold tracking-tight">Structure</h2>
                  <p className="app-text-secondary mt-1 text-sm">Choose the bracket shape and player limit before people start joining.</p>
                </div>

                <div>
                  <label className="app-text-primary mb-3 block text-sm font-semibold">
                    Mode <span className="text-red-500">*</span>
                  </label>
                  <div className="grid gap-3 sm:grid-cols-3">
                    {modeOptions.map((option) => (
                      <label
                        key={option.value}
                        className={`rounded-2xl border px-4 py-4 transition duration-200 ${
                          form.mode === option.value
                            ? 'app-chip-info shadow-sm'
                            : 'app-card-elevated hover:border-[color:var(--border-strong)]'
                        }`}
                      >
                        <input
                          type="radio"
                          name="mode"
                          value={option.value}
                          checked={form.mode === option.value}
                          onChange={onChange}
                          className="sr-only"
                        />
                        <span className="app-text-primary block text-sm font-semibold">{option.label}</span>
                      </label>
                    ))}
                  </div>
                  {errors.mode && <p className="mt-3 text-sm text-red-500">{errors.mode}</p>}
                </div>

                <div className="grid gap-6 md:grid-cols-[0.8fr_0.8fr_1.2fr]">
                  <div>
                    <label className="app-text-primary mb-2 block text-sm font-semibold">Max Participants</label>
                    <input
                      name="max_participants"
                      type="number"
                      required
                      min={2}
                      value={form.max_participants}
                      onChange={onChange}
                      className={fieldClassName}
                    />
                    {errors.max_participants && <p className="mt-2 text-sm text-red-500">{errors.max_participants}</p>}
                  </div>

                  <div>
                    <label className="app-text-primary mb-2 block text-sm font-semibold">Entry Type</label>
                    <select name="entry_type" value={form.entry_type} onChange={onChange} className={fieldClassName}>
                      {Object.entries(entryTypeLabel).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                    <p className="app-text-secondary mt-2 text-sm">
                      Choose whether tournaments are joined by individual players or full teams.
                    </p>
                  </div>

                  <div>
                    <label className="app-text-primary mb-2 block text-sm font-semibold">Match Format</label>
                    <select name="match_format" value={form.match_format} onChange={onChange} className={fieldClassName}>
                      {Object.entries(matchFormatLabel).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                    <p className="app-text-secondary mt-2 text-sm">Use series play for finals, esports, or longer head-to-head matchups.</p>
                  </div>
                </div>

                {isTeamTournament && (
                  <div>
                    <label className="app-text-primary mb-2 block text-sm font-semibold">Team Size</label>
                    <input
                      name="team_size"
                      type="number"
                      min={2}
                      value={form.team_size}
                      onChange={onChange}
                      className={fieldClassName}
                    />
                    {errors.team_size && <p className="mt-2 text-sm text-red-500">{errors.team_size}</p>}
                    <p className="app-text-secondary mt-2 text-sm">
                      Teams joining this tournament must match the required roster size.
                    </p>
                  </div>
                )}

                <div className="grid gap-6 md:grid-cols-[0.8fr_1.2fr]">

                  <div>
                    <label className="app-text-primary mb-2 block text-sm font-semibold">Description</label>
                    <textarea
                      name="description"
                      rows={4}
                      value={form.description}
                      onChange={onChange}
                      placeholder="What kind of tournament is this?"
                      className={`${fieldClassName} resize-none`}
                    />
                    <p className="app-text-secondary mt-2 text-sm">
                      {form.description.trim().length > 0
                        ? `${form.description.trim().length} characters added.`
                        : 'Descriptions help players understand format, rules, and expectations.'}
                    </p>
                  </div>
                </div>

                {showGroupControls && (
                  <div>
                    <label className="app-text-primary mb-2 block text-sm font-semibold">Number of Groups</label>
                    <input
                      name="group_count"
                      type="number"
                      min={1}
                      max={Math.max(1, Math.floor(Math.max(participantLimit, 2) / 2))}
                      value={form.group_count}
                      onChange={onChange}
                      className={fieldClassName}
                    />
                    {errors.group_count && <p className="mt-2 text-sm text-red-500">{errors.group_count}</p>}
                    <p className="app-text-secondary mt-2 text-sm">
                      Teams will be spread as evenly as possible across {sanitizedGroupCount} group{sanitizedGroupCount === 1 ? '' : 's'}.
                    </p>
                  </div>
                )}
              </section>

              <section className="space-y-5">
                <div>
                  <p className="app-eyebrow">Step 3</p>
                  <h2 className="app-text-primary mt-2 text-xl font-semibold tracking-tight">Visibility</h2>
                  <p className="app-text-secondary mt-1 text-sm">Control whether players can discover the event immediately.</p>
                </div>

                <div>
                  <label className="app-text-primary mb-3 block text-sm font-semibold">Visibility</label>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {[
                      {
                        value: true,
                        title: 'Public',
                        description: 'Everyone can discover it and players can join if registration is open.',
                      },
                      {
                        value: false,
                        title: 'Private',
                        description: 'Only you can manage it and it stays off the public feed.',
                      },
                    ].map((option) => (
                      <label
                        key={String(option.value)}
                        className={`rounded-2xl border px-4 py-4 transition duration-200 ${
                          form.is_public === option.value
                            ? 'app-chip-info shadow-sm'
                            : 'app-card-elevated hover:border-[color:var(--border-strong)]'
                        }`}
                      >
                        <input
                          type="radio"
                          name="is_public"
                          value={String(option.value)}
                          checked={form.is_public === option.value}
                          onChange={onChange}
                          className="sr-only"
                        />
                        <span className="app-text-primary block text-sm font-semibold">{option.title}</span>
                        <span className="app-text-secondary mt-2 block text-sm leading-6">{option.description}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {showStatus && (
                  <div>
                    <label className="app-text-primary mb-2 block text-sm font-semibold">Status</label>
                    <select name="status" value={form.status} onChange={onChange} className={fieldClassName}>
                      {statusOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <p className="app-text-secondary mt-2 text-sm">Use status to signal whether players should join, watch, or treat the bracket as final.</p>
                  </div>
                )}
              </section>

              <div className="mt-2 flex gap-4">
                <button
                  type="button"
                  onClick={onCancel}
                  className="app-button-secondary flex-1 rounded-xl px-4 py-3 font-semibold transition duration-200 hover:-translate-y-0.5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || blocksSubmission}
                  className="app-button-primary flex-1 rounded-xl px-4 py-3 font-semibold transition duration-200 hover:-translate-y-0.5 hover:shadow-md disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none"
                >
                  {submitting ? submitLoadingLabel : submitLabel}
                </button>
              </div>

              {onDelete && (
                <div className="mt-2 border-t border-[color:var(--border-subtle)] pt-5">
                  <button
                    type="button"
                    onClick={onDelete}
                    className="app-banner-danger w-full rounded-xl px-4 py-3 font-medium transition duration-200 hover:-translate-y-0.5 hover:shadow-sm"
                  >
                    Delete Tournament
                  </button>
                </div>
              )}
            </form>
          </div>

          <aside className="space-y-4">
            <div className="app-card-elevated rounded-[28px] p-6">
              <p className="app-eyebrow">Preview</p>
              <div className="mt-4 space-y-4">
                <div>
                  <p className="app-text-muted text-sm">Name</p>
                  <p className="app-text-primary text-lg font-semibold">{form.name || 'Tournament name'}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="app-text-muted text-sm">Sport</p>
                    <p className="app-text-primary font-medium">{form.sport || 'Not selected'}</p>
                  </div>
                  <div>
                    <p className="app-text-muted text-sm">Date</p>
                    <p className="app-text-primary font-medium">{form.date || 'No date yet'}</p>
                  </div>
                </div>
                <div>
                  <p className="app-text-muted text-sm">Visibility</p>
                  <p className="app-text-primary font-medium">{form.is_public ? 'Public' : 'Private'}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="app-text-muted text-sm">Mode</p>
                    <p className="app-text-primary font-medium">
                      {modeOptions.find((option) => option.value === form.mode)?.label ?? 'Knockout'}
                    </p>
                  </div>
                  <div>
                    <p className="app-text-muted text-sm">Capacity</p>
                    <p className="app-text-primary font-medium">
                      {form.max_participants || 0} {isTeamTournament ? 'teams' : 'players'}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="app-text-muted text-sm">Entry type</p>
                    <p className="app-text-primary font-medium">{entryTypeLabel[form.entry_type]}</p>
                  </div>
                  <div>
                    <p className="app-text-muted text-sm">Match format</p>
                    <p className="app-text-primary font-medium">{matchFormatLabel[form.match_format]}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="app-text-muted text-sm">Team size</p>
                    <p className="app-text-primary font-medium">{isTeamTournament ? sanitizedTeamSize : 'Not required'}</p>
                  </div>
                  <div>
                    <p className="app-text-muted text-sm">Groups</p>
                    <p className="app-text-primary font-medium">{showGroupControls ? sanitizedGroupCount : 'None'}</p>
                  </div>
                </div>
                <div>
                  <p className="app-text-muted text-sm">Description</p>
                  <p className="app-text-primary font-medium">{form.description || 'No description yet'}</p>
                </div>
              </div>
            </div>

            <div className="app-muted-panel rounded-[28px] p-6">
              <p className="app-eyebrow">Tips</p>
              <ul className="app-text-secondary mt-4 space-y-3 text-sm leading-6">
                <li>Pick a clear tournament name so the dashboard stays easy to scan.</li>
                <li>Use a realistic participant cap before adding the bracket.</li>
                <li>Set the status to match what players should currently see.</li>
              </ul>
            </div>
          </aside>
        </div>
    </PageShell>
  )
}
