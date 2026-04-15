'use client'

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
    <main className="min-h-screen bg-gray-100 px-6 py-10">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl p-10 shadow-sm border border-gray-100">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
        {subtitle && <p className="text-gray-500 mb-8">{subtitle}</p>}

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

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Mode <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-col gap-3">
              {modeOptions.map((option) => (
                <label key={option.value} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="mode"
                    value={option.value}
                    checked={form.mode === option.value}
                    onChange={onChange}
                    className="w-5 h-5 accent-gray-800"
                  />
                  <span className="text-gray-700">{option.label}</span>
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

          <div className="flex gap-4 mt-2">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-gray-700 font-semibold cursor-pointer transition duration-200 hover:bg-gray-50 hover:-translate-y-0.5 hover:shadow-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-cyan-400 text-white rounded-xl px-4 py-3 font-semibold cursor-pointer transition duration-200 hover:bg-cyan-500 hover:-translate-y-0.5 hover:shadow-md disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none"
            >
              {submitting ? submitLoadingLabel : submitLabel}
            </button>
          </div>

          {onDelete && (
            <div className="border-t border-gray-100 pt-5 mt-2">
              <button
                type="button"
                onClick={onDelete}
                className="w-full rounded-xl px-4 py-3 bg-red-50 border border-red-200 text-red-600 font-medium cursor-pointer transition duration-200 hover:bg-red-100 hover:border-red-300 hover:-translate-y-0.5 hover:shadow-sm"
              >
                Delete Tournament
              </button>
            </div>
          )}
        </form>
      </div>
    </main>
  )
}
