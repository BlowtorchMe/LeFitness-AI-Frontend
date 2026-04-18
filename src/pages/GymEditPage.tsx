import { FormEvent, useEffect, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import AdminHeader from "@/components/AdminHeader"
import GymForm, { EMPTY_GYM_FORM, type GymFormValues } from "@/components/GymForm"
import { adminFetch } from "@/lib/api"
import type { GymRecord } from "@/types/gym"

export default function GymEditPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [form, setForm] = useState<GymFormValues>(EMPTY_GYM_FORM)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [fetchError, setFetchError] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    const gymId = id ? parseInt(id, 10) : NaN
    if (!id || Number.isNaN(gymId) || gymId < 1) {
      setFetchError("Invalid gym id")
      setLoading(false)
      return
    }

    let cancelled = false
    adminFetch(`/api/gyms/${gymId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Gym not found")
        return res.json()
      })
      .then((data: GymRecord) => {
        if (cancelled) return
        setForm({
          name: data.name,
          slug: data.slug,
          location: data.location,
          phone: data.phone || "",
          booking_url: data.booking_url,
          calendar_id: data.calendar_id || "",
          is_active: data.is_active,
        })
      })
      .catch((err: Error) => {
        if (!cancelled) setFetchError(err.message || "Failed to load gym")
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [id])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const gymId = id ? parseInt(id, 10) : NaN
    if (submitting || Number.isNaN(gymId) || gymId < 1) return
    setSubmitting(true)
    setError("")
    try {
      const res = await adminFetch(`/api/gyms/${gymId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.detail || "Failed to update gym")
      navigate("/admin/gym")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update gym")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-lefitness-bg text-lefitness-text flex flex-col">
      <AdminHeader />

      <main className="flex-1 flex flex-col max-w-2xl w-full mx-auto min-w-0 px-4 py-6">
        <Link
          to="/admin/gym"
          className="inline-flex items-center gap-2 text-sm text-lefitness-muted hover:text-lefitness-text no-underline mb-6 w-fit"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M19 12H5" />
            <path d="M12 19l-7-7 7-7" />
          </svg>
          Back to list
        </Link>

        <h1 className="text-lg font-semibold mb-4">Edit Gym</h1>

        {loading && (
          <div className="flex items-center gap-1.5">
            <span className="typing-dot" />
            <span className="typing-dot" />
            <span className="typing-dot" />
          </div>
        )}

        {!loading && fetchError && <p className="text-sm text-red-400">{fetchError}</p>}

        {!loading && !fetchError && (
          <>
            <GymForm
              form={form}
              onChange={setForm}
              onSubmit={handleSubmit}
              submitting={submitting}
              submitLabel="Save gym"
            />
            {error && <p className="text-sm text-red-400 mt-4">{error}</p>}
          </>
        )}
      </main>
    </div>
  )
}
