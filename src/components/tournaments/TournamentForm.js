'use client'
import TournamentFormHero from '@/components/tournaments/TournamentFormHero'

const sports = [
  'Football', 'Basketball', 'Tennis', 'Volleyball',
  'Cricket', 'Baseball', 'Hockey', 'Badminton', 'Table Tennis', 'Other',
]

const modeOptions = [
  { value: 'group', label: 'Group Phase' },
  { value: 'knockout', label: 'Knockout' },
  { value: 'both', label: 'Both' },
]

const statusOptions = [
  { value: 'open', label: 'Open' },
  { value: 'live', label: 'Live' },
  { value: 'finished', label: 'Finished' },
]

const fieldClassName = 'w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-700 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400'

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
}) {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#050505_0px,#050505_104px,#f5f5f5_104px,#f5f5f5_100%)] px-6 py-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <TournamentFormHero title={title} subtitle={subtitle} showStatus={showStatus} />

        <div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
          <div className="rounded-[32px] border border-black/5 bg-white p-8 shadow-[0_18px_50px_rgba(15,23,42,0.08)] md:p-10">
            <form onSubmit={onSubmit} className="flex flex-col gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
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
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Sport Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="sport"
                    required
                    value={form.sport}
                    onChange={onChange}
                    className={fieldClassName}
                  >
                    <option value="">Select a sport</option>
                    {sports.map((sport) => (
                      <option key={sport} value={sport}>{sport}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="date"
                    type="date"
                    required
                    value={form.date}
                    onChange={onChange}
                    className={fieldClassName}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Mode <span className="text-red-500">*</span>
                </label>
                <div className="grid gap-3 sm:grid-cols-3">
                  {modeOptions.map((option) => (
                    <label
                      key={option.value}
                      className={`cursor-pointer rounded-2xl border px-4 py-4 transition duration-200 ${
                        form.mode === option.value
                          ? 'border-cyan-300 bg-cyan-50 shadow-sm'
                          : 'border-gray-200 bg-white hover:border-gray-300'
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

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Max Participants
                </label>
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

              {showStatus && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    name="status"
                    value={form.status}
                    onChange={onChange}
                    className={fieldClassName}
                  >
                    {statusOptions.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="mt-2 flex gap-4">
                <button
                  type="button"
                  onClick={onCancel}
                  className="flex-1 rounded-xl border border-gray-200 px-4 py-3 text-gray-700 font-semibold cursor-pointer transition duration-200 hover:bg-gray-50 hover:-translate-y-0.5 hover:shadow-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 rounded-xl bg-cyan-400 px-4 py-3 font-semibold text-white cursor-pointer transition duration-200 hover:bg-cyan-500 hover:-translate-y-0.5 hover:shadow-md disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none"
                >
                  {submitting ? submitLoadingLabel : submitLabel}
                </button>
              </div>

              {onDelete && (
                <div className="mt-2 border-t border-gray-100 pt-5">
                  <button
                    type="button"
                    onClick={onDelete}
                    className="w-full rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-600 font-medium cursor-pointer transition duration-200 hover:bg-red-100 hover:border-red-300 hover:-translate-y-0.5 hover:shadow-sm"
                  >
                    Delete Tournament
                  </button>
                </div>
              )}
            </form>
          </div>

          <aside className="space-y-4">
            <div className="rounded-[28px] border border-black/5 bg-white/90 p-6 shadow-[0_14px_40px_rgba(15,23,42,0.06)]">
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
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-400">Mode</p>
                    <p className="font-medium text-gray-900">{modeOptions.find((option) => option.value === form.mode)?.label ?? 'Knockout'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Capacity</p>
                    <p className="font-medium text-gray-900">{form.max_participants || 0} players</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[28px] border border-black/5 bg-[linear-gradient(180deg,#ffffff_0%,#f7f7f7_100%)] p-6 shadow-[0_14px_40px_rgba(15,23,42,0.05)]">
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
