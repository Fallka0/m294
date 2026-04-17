'use client'

import { useEffect, useRef, useState, type ChangeEvent, type FormEvent, type ReactNode } from 'react'
import GameSportIcon from '@/components/game-sports/GameSportIcon'
import PageShell from '@/components/layout/PageShell'
import StepStatusIcon from '@/components/tournaments/StepStatusIcon'
import TournamentFormHero from '@/components/tournaments/TournamentFormHero'
import { featuredGameOptions, featuredSportOptions, findGameSportOption, otherGameSportOption } from '@/lib/game-sports'
import { sanitizeGroupCount, sanitizeTeamSize } from '@/lib/tournament-settings'
import { entryTypeLabel, matchFormatLabel, modeOptions, statusOptions } from '@/lib/tournaments'
import type { TournamentFormValues } from '@/lib/types'

const fieldClassName =
  'app-input w-full rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-400'

type FeedbackTone = 'error' | 'success' | 'info'
type SportPickerTab = 'games' | 'sports' | 'other'
type FormStep = 1 | 2 | 3 | 4

interface TournamentFormProps {
  title: string
  subtitle: string
  form: TournamentFormValues
  errors?: Partial<Record<'name' | 'sport' | 'mode' | 'group_count' | 'max_participants' | 'date' | 'team_size', string>>
  onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void
  onSportChange: (value: string) => void
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

interface StepSectionProps {
  step: FormStep
  title: string
  description: string
  summary: string
  complete: boolean
  active: boolean
  available: boolean
  onOpen: (step: FormStep) => void
  children: ReactNode
}

function StepSection({
  step,
  title,
  description,
  summary,
  complete,
  active,
  available,
  onOpen,
  children,
}: StepSectionProps) {
  const toneClassName = complete ? 'app-chip-info' : active ? 'app-chip-selected' : 'app-chip'
  const stateLabel = complete ? 'Done' : active ? 'Current step' : available ? 'Open' : 'Locked'

  return (
    <section className={`rounded-[28px] border p-6 transition duration-200 ${active ? 'app-card shadow-sm' : 'app-card-elevated'} ${!available ? 'opacity-60' : ''}`}>
      <button
        type="button"
        onClick={() => {
          if (available) onOpen(step)
        }}
        disabled={!available}
        className="w-full text-left"
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="app-eyebrow">Step {step}</p>
            <h2 className="app-text-primary mt-2 flex items-center gap-3 text-xl font-semibold tracking-tight">
              {complete ? <StepStatusIcon /> : null}
              <span>{title}</span>
            </h2>
            <p className="app-text-secondary mt-1 text-sm">
              {active ? description : summary}
            </p>
          </div>
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${toneClassName}`}>
            {stateLabel}
          </span>
        </div>
      </button>

      {active ? <div className="mt-6 space-y-5">{children}</div> : null}
    </section>
  )
}

export default function TournamentForm({
  title,
  subtitle,
  form,
  errors = {},
  onChange,
  onSportChange,
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
  const presetGameSport = findGameSportOption(form.sport)
  const isCustomGameSport = Boolean(form.sport.trim() && !presetGameSport)
  const [isSportPickerOpen, setIsSportPickerOpen] = useState(false)
  const [sportPickerTab, setSportPickerTab] = useState<SportPickerTab>(presetGameSport?.category === 'sport' ? 'sports' : 'games')
  const [sportPickerQuery, setSportPickerQuery] = useState('')
  const [customSportDraft, setCustomSportDraft] = useState(isCustomGameSport ? form.sport : '')
  const [activeStep, setActiveStep] = useState<FormStep>(1)
  const previousCompletionRef = useRef({
    step1Complete: false,
    step2Complete: false,
    step3Complete: false,
  })
  const step1Complete = Boolean(form.name.trim() && form.sport.trim() && form.date)
  const step2Complete = Boolean(
    form.mode &&
      participantLimit >= 2 &&
      (!showGroupControls || sanitizedGroupCount >= 1) &&
      (!isTeamTournament || sanitizedTeamSize >= 2),
  )
  const step3Complete = Boolean(
    typeof form.is_public === 'boolean' &&
      (!showStatus || Boolean(form.status)),
  )
  const step4Complete = form.description.trim().length >= 12
  const step2Available = step1Complete
  const step3Available = step1Complete && step2Complete
  const step4Available = step1Complete && step2Complete && step3Complete
  const setupChecklist = [
    { label: 'Basics', complete: step1Complete },
    { label: 'Structure', complete: step2Complete },
    { label: 'Visibility', complete: step3Complete },
    { label: 'Description', complete: step4Complete },
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

  useEffect(() => {
    if (isCustomGameSport) {
      setCustomSportDraft(form.sport)
    }
  }, [form.sport, isCustomGameSport])

  useEffect(() => {
    if (!isSportPickerOpen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsSportPickerOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isSportPickerOpen])

  useEffect(() => {
    setActiveStep((currentStep) => {
      const availableByStep: Record<FormStep, boolean> = {
        1: true,
        2: step2Available,
        3: step3Available,
        4: step4Available,
      }

      if (!availableByStep[currentStep]) {
        if (!step1Complete) return 1
        if (!step2Complete) return 2
        if (!step3Complete) return 3
        return 4
      }

      if (currentStep === 1 && !previousCompletionRef.current.step1Complete && step1Complete && step2Available) return 2
      if (currentStep === 2 && !previousCompletionRef.current.step2Complete && step2Complete && step3Available) return 3
      if (currentStep === 3 && !previousCompletionRef.current.step3Complete && step3Complete && step4Available) return 4

      return currentStep
    })

    previousCompletionRef.current = {
      step1Complete,
      step2Complete,
      step3Complete,
    }
  }, [step1Complete, step2Complete, step3Complete, step2Available, step3Available, step4Available])

  const openSportPicker = () => {
    setSportPickerTab(presetGameSport ? (presetGameSport.category === 'game' ? 'games' : 'sports') : 'other')
    setSportPickerQuery('')
    setCustomSportDraft(isCustomGameSport ? form.sport : '')
    setIsSportPickerOpen(true)
  }

  const filteredPickerOptions = (sportPickerTab === 'games' ? featuredGameOptions : featuredSportOptions).filter((option) => {
    const normalizedQuery = sportPickerQuery.trim().toLowerCase()
    if (!normalizedQuery) return true

    return [option.label, option.description, ...(option.keywords ?? [])].some((value) =>
      value.toLowerCase().includes(normalizedQuery),
    )
  })

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

              <StepSection
                step={1}
                title="Basics"
                description="Name the event clearly and set the public-facing schedule."
                summary={step1Complete ? `${form.name || 'Tournament'} • ${form.sport || 'No title'} • ${form.date || 'No date'}` : 'Complete the basics to unlock the next step.'}
                complete={step1Complete}
                active={activeStep === 1}
                available
                onOpen={setActiveStep}
              >
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
                      Game or Sport <span className="text-red-500">*</span>
                    </label>
                    <div className="app-card-elevated rounded-[24px] p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-4">
                          {form.sport.trim() ? (
                            <GameSportIcon value={form.sport} className="h-12 w-12 rounded-2xl" iconClassName="h-5 w-5" />
                          ) : (
                            <GameSportIcon value={otherGameSportOption.value} className="h-12 w-12 rounded-2xl" iconClassName="h-5 w-5" />
                          )}
                          <div>
                            <p className="app-text-primary text-base font-semibold">
                              {form.sport.trim() || 'No game or sport selected'}
                            </p>
                            <p className="app-text-secondary mt-1 text-sm">
                              {presetGameSport
                                ? presetGameSport.category === 'game'
                                  ? `PC game • ${presetGameSport.description}`
                                  : `Real sport • ${presetGameSport.description}`
                                : form.sport.trim()
                                  ? 'Custom title'
                                  : 'Choose from popular PC games, real sports, or add your own'}
                            </p>
                          </div>
                        </div>

                        {form.sport.trim() && (
                          <span className={`inline-flex min-h-[74px] items-center justify-center rounded-full px-3 py-1 text-center text-xs font-semibold leading-5 ${presetGameSport ? 'app-chip-info' : 'app-chip'}`}>
                            {presetGameSport ? (presetGameSport.category === 'game' ? 'PC Game' : 'Real Sport') : 'Custom'}
                          </span>
                        )}
                      </div>

                      <div className="mt-5 flex flex-wrap gap-3">
                        <button
                          type="button"
                          onClick={openSportPicker}
                          className="app-button-secondary rounded-xl px-4 py-3 text-sm font-semibold transition duration-200 hover:-translate-y-0.5"
                        >
                          {form.sport.trim() ? 'Change selection' : 'Choose title'}
                        </button>
                        {form.sport.trim() && (
                          <button
                            type="button"
                            onClick={() => {
                              onSportChange('')
                              setCustomSportDraft('')
                            }}
                            className="app-button-secondary rounded-xl px-4 py-3 text-sm font-semibold transition duration-200 hover:-translate-y-0.5"
                          >
                            Clear
                          </button>
                        )}
                      </div>
                    </div>
                    {errors.sport && <p className="mt-3 text-sm text-red-500">{errors.sport}</p>}
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
              </StepSection>

              <StepSection
                step={2}
                title="Structure"
                description="Choose the bracket shape and player limit before players or teams start joining."
                summary={
                  step2Complete
                    ? `${selectedMode} • ${participantLimit || 0} ${isTeamTournament ? 'teams' : 'players'} • ${entryTypeLabel[form.entry_type]}`
                    : 'Unlocks after the basics are complete.'
                }
                complete={step2Complete}
                active={activeStep === 2}
                available={step2Available}
                onOpen={setActiveStep}
              >
                <div>
                  <label className="app-text-primary mb-3 block text-sm font-semibold">
                    Mode <span className="text-red-500">*</span>
                  </label>
                  <div className="grid items-stretch gap-3 sm:grid-cols-3">
                    {modeOptions.map((option) => (
                      <label
                        key={option.value}
                        className={`flex min-h-[96px] items-center justify-center rounded-2xl border px-4 py-4 text-center transition duration-200 ${
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
                        <span className="app-text-primary block text-sm font-semibold leading-5">{option.label}</span>
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
              </StepSection>

              <StepSection
                step={3}
                title="Visibility"
                description="Control whether players can discover the event immediately."
                summary={
                  step3Complete
                    ? `${form.is_public ? 'Public listing' : 'Private draft'}${showStatus ? ` • ${statusOptions.find((option) => option.value === form.status)?.label ?? form.status}` : ''}`
                    : 'Choose how visible the tournament should be.'
                }
                complete={step3Complete}
                active={activeStep === 3}
                available={step3Available}
                onOpen={setActiveStep}
              >
                <div>
                  <label className="app-text-primary mb-3 block text-sm font-semibold">Visibility</label>
                  <div className="grid items-stretch gap-3 sm:grid-cols-2">
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
                        className={`flex min-h-[128px] items-center justify-center rounded-2xl border px-4 py-4 text-center transition duration-200 ${
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
                        <span className="flex w-full max-w-[18rem] flex-col items-center justify-center gap-2">
                          <span className="app-text-primary block text-sm font-semibold">{option.title}</span>
                          <span className="app-text-secondary block text-sm leading-6">{option.description}</span>
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {showStatus && (
                  <div>
                    <label className="app-text-primary mb-2 block text-sm font-semibold">Status</label>
                    <select
                      name="status"
                      value={form.status}
                      onChange={onChange}
                      className={fieldClassName}
                    >
                      {statusOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <p className="app-text-secondary mt-2 text-sm">Use status to signal whether players should join, watch, or treat the bracket as final.</p>
                  </div>
                )}
              </StepSection>

              <StepSection
                step={4}
                title="Final details"
                description="Add context for players, then review and save the tournament."
                summary={
                  step4Complete
                    ? `${form.description.trim().length} characters added`
                    : 'Finish with a short description and final review.'
                }
                complete={step4Complete}
                active={activeStep === 4}
                available={step4Available}
                onOpen={setActiveStep}
              >
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
              </StepSection>
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
                    <p className="app-text-muted text-sm">Game / Sport</p>
                    <p className="app-text-primary inline-flex items-center gap-3 font-medium">
                      {form.sport ? <GameSportIcon value={form.sport} className="h-9 w-9 rounded-xl" iconClassName="h-4 w-4" /> : null}
                      <span>{form.sport || 'Not selected'}</span>
                    </p>
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

        {isSportPickerOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6"
            onClick={() => setIsSportPickerOpen(false)}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-label="Choose game or sport"
              className="app-card w-full max-w-2xl rounded-[28px] p-6 shadow-xl"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="app-eyebrow">Selector</p>
                  <h3 className="app-text-primary mt-2 text-2xl font-semibold tracking-tight">Choose a title</h3>
                  <p className="app-text-secondary mt-2 text-sm">
                    Pick between popular PC games, real sports, or add your own custom title.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsSportPickerOpen(false)}
                  className="app-button-secondary rounded-xl px-3 py-2 text-sm font-semibold transition duration-200 hover:-translate-y-0.5"
                >
                  Close
                </button>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                {[
                  { value: 'games' as const, label: 'PC Games' },
                  { value: 'sports' as const, label: 'Real Sports' },
                  { value: 'other' as const, label: 'Other' },
                ].map((tab) => (
                  <button
                    key={tab.value}
                    type="button"
                    onClick={() => {
                      setSportPickerTab(tab.value)
                      setSportPickerQuery('')
                    }}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition duration-200 ${
                      sportPickerTab === tab.value ? 'app-chip-selected' : 'app-button-secondary'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {sportPickerTab !== 'other' && (
                <div className="mt-5">
                  <input
                    value={sportPickerQuery}
                    onChange={(event) => setSportPickerQuery(event.target.value)}
                    placeholder={sportPickerTab === 'games' ? 'Search PC games' : 'Search sports'}
                    className={fieldClassName}
                  />
                </div>
              )}

              <div className="mt-5">
                {sportPickerTab === 'other' ? (
                  <div className="app-muted-panel rounded-[24px] p-5">
                    <label className="app-text-primary mb-2 block text-sm font-semibold">
                      Custom game or sport <span className="text-red-500">*</span>
                    </label>
                    <input
                      value={customSportDraft}
                      onChange={(event) => setCustomSportDraft(event.target.value)}
                      placeholder="e.g. Call of Duty, Chess, Handball"
                      className={fieldClassName}
                    />
                    <p className="app-text-secondary mt-2 text-sm">
                      Use this when the title you need is not in the featured lists yet.
                    </p>

                    <div className="mt-5 flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          const nextValue = customSportDraft.trim()
                          onSportChange(nextValue)
                          setIsSportPickerOpen(false)
                        }}
                        disabled={!customSportDraft.trim()}
                        className="app-button-primary rounded-xl px-4 py-3 text-sm font-semibold transition duration-200 hover:-translate-y-0.5 hover:shadow-md disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none"
                      >
                        Use custom title
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setCustomSportDraft('')
                          onSportChange('')
                        }}
                        className="app-button-secondary rounded-xl px-4 py-3 text-sm font-semibold transition duration-200 hover:-translate-y-0.5"
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="app-muted-panel overflow-hidden rounded-[24px]">
                    <div className="max-h-[420px] overflow-y-auto">
                      {filteredPickerOptions.map((option) => {
                        const isActive = presetGameSport?.value === option.value

                        return (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => {
                              onSportChange(option.value)
                              setIsSportPickerOpen(false)
                            }}
                            className={`app-list-option w-full px-5 py-4 text-left transition duration-200 ${
                              isActive ? 'app-list-option-active' : ''
                            }`}
                          >
                            <div className="flex items-center justify-between gap-4">
                              <div className="flex items-center gap-4">
                                <GameSportIcon value={option.value} className="h-11 w-11 rounded-2xl" iconClassName="h-5 w-5" />
                                <div>
                                  <p className="app-text-primary text-sm font-semibold">{option.label}</p>
                                  <p className="app-text-secondary mt-1 text-sm">{option.description}</p>
                                </div>
                              </div>
                              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${isActive ? 'app-chip-selected' : 'app-chip'}`}>
                                {option.category === 'game' ? 'PC Game' : 'Sport'}
                              </span>
                            </div>
                          </button>
                        )
                      })}

                      {filteredPickerOptions.length === 0 && (
                        <div className="app-empty-state m-4 rounded-2xl px-5 py-8 text-center text-sm">
                          No matches found. Try another search or switch to `Other`.
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
    </PageShell>
  )
}
