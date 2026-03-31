import { FormEvent, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import AdminHeader from "@/components/AdminHeader"
import GymForm, { EMPTY_GYM_FORM, type GymFormValues } from "@/components/GymForm"
import { adminFetch } from "@/lib/api"

export default function GymAddPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState<GymFormValues>(EMPTY_GYM_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (submitting) return
    setSubmitting(true)
    setError("")
    try {
      const res = await adminFetch("/api/gyms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.detail || "Failed to create gym")
      navigate("/admin/gym")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create gym")
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

        <h1 className="text-lg font-semibold mb-4">Add Gym</h1>

        <GymForm
          form={form}
          onChange={setForm}
          onSubmit={handleSubmit}
          submitting={submitting}
          submitLabel="Save gym"
        />

        {error && <p className="text-sm text-red-400 mt-4">{error}</p>}
      </main>
    </div>
  )
}
