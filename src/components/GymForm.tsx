import { FormEvent } from "react"

export interface GymFormValues {
  name: string
  slug: string
  location: string
  phone: string
  booking_url: string
  is_active: boolean
}

interface GymFormProps {
  form: GymFormValues
  onChange: (next: GymFormValues) => void
  onSubmit: (e: FormEvent) => void
  submitting?: boolean
  submitLabel: string
}

export const EMPTY_GYM_FORM: GymFormValues = {
  name: "",
  slug: "",
  location: "",
  phone: "",
  booking_url: "",
  is_active: true,
}

export default function GymForm({
  form,
  onChange,
  onSubmit,
  submitting = false,
  submitLabel,
}: GymFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div>
        <label className="block text-sm mb-1">Name</label>
        <input
          value={form.name}
          onChange={(e) => onChange({ ...form, name: e.target.value })}
          className="w-full rounded-md bg-lefitness-header text-lefitness-text text-sm p-2.5 border border-[#303030] focus:outline-none focus:ring-1 focus:ring-lefitness-muted"
        />
      </div>
      <div>
        <label className="block text-sm mb-1">Slug</label>
        <input
          value={form.slug}
          onChange={(e) => onChange({ ...form, slug: e.target.value })}
          className="w-full rounded-md bg-lefitness-header text-lefitness-text text-sm p-2.5 border border-[#303030] focus:outline-none focus:ring-1 focus:ring-lefitness-muted"
        />
      </div>
      <div>
        <label className="block text-sm mb-1">Location</label>
        <input
          value={form.location}
          onChange={(e) => onChange({ ...form, location: e.target.value })}
          className="w-full rounded-md bg-lefitness-header text-lefitness-text text-sm p-2.5 border border-[#303030] focus:outline-none focus:ring-1 focus:ring-lefitness-muted"
        />
      </div>
      <div>
        <label className="block text-sm mb-1">Phone</label>
        <input
          value={form.phone}
          onChange={(e) => onChange({ ...form, phone: e.target.value })}
          className="w-full rounded-md bg-lefitness-header text-lefitness-text text-sm p-2.5 border border-[#303030] focus:outline-none focus:ring-1 focus:ring-lefitness-muted"
        />
      </div>
      <div>
        <label className="block text-sm mb-1">Booking URL</label>
        <input
          value={form.booking_url}
          onChange={(e) => onChange({ ...form, booking_url: e.target.value })}
          className="w-full rounded-md bg-lefitness-header text-lefitness-text text-sm p-2.5 border border-[#303030] focus:outline-none focus:ring-1 focus:ring-lefitness-muted"
        />
      </div>
      <label className="flex items-center gap-2 text-sm text-lefitness-muted">
        <input
          type="checkbox"
          checked={form.is_active}
          onChange={(e) => onChange({ ...form, is_active: e.target.checked })}
        />
        Gym is active
      </label>
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center px-4 py-2 rounded-md text-sm bg-[#ffffff] text-black hover:bg-[#e5e5e5] disabled:opacity-60"
        >
          {submitting ? "Saving..." : submitLabel}
        </button>
      </div>
    </form>
  )
}
