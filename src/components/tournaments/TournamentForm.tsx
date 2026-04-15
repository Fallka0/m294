'use client'

import type { ChangeEvent, FormEvent } from 'react'
import TournamentFormHero from '@/components/tournaments/TournamentFormHero'
import { modeOptions, sports, statusOptions } from '@/lib/tournaments'
import type { TournamentFormValues } from '@/lib/types'

const fieldClassName =
  'app-input w-full rounded-xl px-4 py-3 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400'

type FeedbackTone = 'error' | 'success' | 'info'

interface TournamentFormProps {
  title: string
  subtitle: string
  form: TournamentFormValues
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
  const setupChecklist = [
    { label: 'Basic details', complete: Boolean(form.name.trim() && form.sport && form.date) },
    { label: 'Structure choices', complete: Boolean(form.mode && participantLimit >= 2) },
    { label: 'Visibility ready', complete: typeof form.is_public === 'boolean' },
    { label: 'Description added', complete: form.description.trim().length >= 12 },
  ]
  const guidance = [
    participantLimit < 2 ? 'Set at least 2 participants before saving.' : null,
    isCreateMode && hasPastDate ? 'Choose today or a future date for a new tournament.' : null,
    form.mode !== 'group' && participantLimit > 0 && participantLimit % 2 !== 0
      ? 'Odd participant caps create automatic byes in knockout rounds.'
      : null,
    showStatus && form.status === 'live' && participantLimit < 2
      ? 'A live tournament usually needs enough participants to generate matches.'
      : null,
  ].filter(Boolean)

  const feedbackClassName =
    feedbackTone === 'error'
      ? 'border-red-200 bg-red-50 text-red-700'
      : feedbackTone === 'success'
        ? 'border-green-200 bg-green-50 text-green-700'
        : 'border-cyan-100 bg-cyan-50 text-cyan-700'

  return (
    <main className="page-shell min-h-screen px-6 py-10 transition-colors duration-300">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <TournamentFormHero title={title} subtitle={subtitle} showStatus={showStatus} />

        <div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
          <div className="app-card rounded-[32px] p-8 md:p-10">
            <form onSubmit={onSubmit} className="flex flex-col gap-6">
              <div className="grid gap-4 md:grid-cols-[1.1fr_0.9fr]">
                <div className="app-muted-panel rounded-[24px] px-5 py-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gray-400">Setup progress</p>
                  <div className="mt-4 space-y-3">
                    {setupChecklist.map((item) => (
                      <div key={item.label} className="flex items-center justify-between gap-3 text-sm">
                        <span className="text-gray-600">{item.label}</span>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            item.complete ? 'border border-cyan-200 bg-cyan-50 text-cyan-700' : 'app-card-elevated text-gray-500'
                          }`}
                        >
                          {item.complete ? 'Ready' : 'Missing'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="app-accent-panel rounded-[24px] px-5 py-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gray-400">Current setup</p>
                  <div className="mt-4 grid gap-3 text-sm">
                    <div>
                      <p className="text-gray-400">Mode</p>
                      <p className="font-semibold text-gray-900">{selectedMode}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Capacity</p>
                      <p className="font-semibold text-gray-900">{participantLimit || 'Not set'} players</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Publishing</p>
                      <p className="font-semibold text-gray-900">{form.is_public ? 'Public listing' : 'Private draft'}</p>
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
                <div className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-4 text-sm text-amber-700">
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
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gray-400">Step 1</p>
                  <h2 className="mt-2 text-xl font-semibold tracking-tight text-gray-950">Basics</h2>
                  <p className="mt-1 text-sm text-gray-500">Name the event clearly and set the public-facing schedule.</p>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
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
                  <p className="mt-2 text-sm text-gray-500">Use a short name people can recognize quickly in the dashboard.</p>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
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
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
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
                    <p className="mt-2 text-sm text-gray-500">
                      {showStatus ? 'Past dates are allowed while updating existing tournaments.' : 'New tournaments should start today or later.'}
                    </p>
                  </div>
                </div>
              </section>

              <section className="space-y-5">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gray-400">Step 2</p>
                  <h2 className="mt-2 text-xl font-semibold tracking-tight text-gray-950">Structure</h2>
                  <p className="mt-1 text-sm text-gray-500">Choose the bracket shape and player limit before people start joining.</p>
                </div>

                <div>
                  <label className="mb-3 block text-sm font-semibold text-gray-700">
                    Mode <span className="text-red-500">*</span>
                  </label>
                  <div className="grid gap-3 sm:grid-cols-3">
                    {modeOptions.map((option) => (
                      <label
                        key={option.value}
                        className={`cursor-pointer rounded-2xl border px-4 py-4 transition duration-200 ${
                          form.mode === option.value
                            ? 'border-cyan-300 bg-cyan-50 shadow-sm'
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
                        <span className="block text-sm font-semibold text-gray-900">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-[0.8fr_1.2fr]">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">Max Participants</label>
                    <input
                      name="max_participants"
                      type="number"
                      required
                      min={2}
                      value={form.max_participants}
                      onChange={onChange}
                      className={fieldClassName}
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">Description</label>
                    <textarea
                      name="description"
                      rows={4}
                      value={form.description}
                      onChange={onChange}
                      placeholder="What kind of tournament is this?"
                      className={`${fieldClassName} resize-none`}
                    />
                    <p className="mt-2 text-sm text-gray-500">
                      {form.description.trim().length > 0
                        ? `${form.description.trim().length} characters added.`
                        : 'Descriptions help players understand format, rules, and expectations.'}
                    </p>
                  </div>
                </div>
              </section>

              <section className="space-y-5">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gray-400">Step 3</p>
                  <h2 className="mt-2 text-xl font-semibold tracking-tight text-gray-950">Visibility</h2>
                  <p className="mt-1 text-sm text-gray-500">Control whether players can discover the event immediately.</p>
                </div>

                <div>
                  <label className="mb-3 block text-sm font-semibold text-gray-700">Visibility</label>
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
                        className={`cursor-pointer rounded-2xl border px-4 py-4 transition duration-200 ${
                          form.is_public === option.value
                            ? 'border-cyan-300 bg-cyan-50 shadow-sm'
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
                        <span className="block text-sm font-semibold text-gray-900">{option.title}</span>
                        <span className="mt-2 block text-sm leading-6 text-gray-500">{option.description}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {showStatus && (
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">Status</label>
                    <select name="status" value={form.status} onChange={onChange} className={fieldClassName}>
                      {statusOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <p className="mt-2 text-sm text-gray-500">Use status to signal whether players should join, watch, or treat the bracket as final.</p>
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
                  className="flex-1 rounded-xl bg-cyan-400 px-4 py-3 font-semibold text-white transition duration-200 hover:-translate-y-0.5 hover:bg-cyan-500 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none"
                >
                  {submitting ? submitLoadingLabel : submitLabel}
                </button>
              </div>

              {onDelete && (
                <div className="mt-2 border-t border-gray-100 pt-5">
                  <button
                    type="button"
                    onClick={onDelete}
                    className="w-full rounded-xl border border-red-200 bg-red-50 px-4 py-3 font-medium text-red-600 transition duration-200 hover:-translate-y-0.5 hover:border-red-300 hover:bg-red-100 hover:shadow-sm"
                  >
                    Delete Tournament
                  </button>
                </div>
              )}
            </form>
          </div>

          <aside className="space-y-4">
            <div className="app-card-elevated rounded-[28px] p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gray-400">Preview</p>
              <div className="mt-4 space-y-4">
                <div>
                  <p className="text-sm text-gray-400">Name</p>
                  <p className="text-lg font-semibold text-gray-900">{form.name || 'Tournament name'}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-400">Sport</p>
                    <p className="font-medium text-gray-900">{form.sport || 'Not selected'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Date</p>
                    <p className="font-medium text-gray-900">{form.date || 'No date yet'}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Visibility</p>
                  <p className="font-medium text-gray-900">{form.is_public ? 'Public' : 'Private'}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-400">Mode</p>
                    <p className="font-medium text-gray-900">
                      {modeOptions.find((option) => option.value === form.mode)?.label ?? 'Knockout'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Capacity</p>
                    <p className="font-medium text-gray-900">{form.max_participants || 0} players</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Description</p>
                  <p className="font-medium text-gray-900">{form.description || 'No description yet'}</p>
                </div>
              </div>
            </div>

            <div className="app-muted-panel rounded-[28px] p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gray-400">Tips</p>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-gray-500">
                <li>Pick a clear tournament name so the dashboard stays easy to scan.</li>
                <li>Use a realistic participant cap before adding the bracket.</li>
                <li>Set the status to match what players should currently see.</li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </main>
  )
}
