import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import AdminHeader from "@/components/AdminHeader"
import { adminFetch } from "@/lib/api"
import type { GymRecord } from "@/types/gym"

export default function GymAdminPage() {
  const [items, setItems] = useState<GymRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")

  const loadGyms = async () => {
    setLoading(true)
    setError("")
    try {
      const res = await adminFetch("/api/gyms")
      if (!res.ok) throw new Error("Failed to load gyms")
      const data: GymRecord[] = await res.json()
      setItems(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load gyms")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadGyms()
  }, [])

  return (
    <div className="min-h-screen bg-lefitness-bg text-lefitness-text flex flex-col">
      <AdminHeader />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-6 space-y-6">
        <section className="rounded-xl border border-[#303030] bg-lefitness-header p-5">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-lg font-semibold">Gyms</h1>
            <Link
              to="/admin/gym/add"
              className="inline-flex items-center px-4 py-2 rounded-md text-sm bg-[#ffffff] text-black hover:bg-[#e5e5e5] no-underline"
            >
              Add
            </Link>
          </div>
          {loading && (
            <div className="flex items-center gap-1.5">
              <span className="typing-dot" />
              <span className="typing-dot" />
              <span className="typing-dot" />
            </div>
          )}
          {!loading && items.length === 0 && (
            <p className="text-sm text-lefitness-muted">No gyms yet.</p>
          )}
          {!loading && items.length > 0 && (
            <div className="space-y-3">
              {items.map((gym) => (
                <div
                  key={gym.id}
                  className="rounded-lg border border-[#303030] bg-lefitness-bg p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-medium">{gym.name}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${gym.is_active ? "bg-green-700/40 text-green-300" : "bg-[#2a2a2a] text-lefitness-muted"}`}>
                          {gym.is_active ? "Active" : "Inactive"}
                        </span>
                      </div>
                      <p className="text-xs text-lefitness-muted mt-1">{gym.slug}</p>
                      <p className="text-sm text-lefitness-muted mt-2">{gym.location}</p>
                      {gym.phone && <p className="text-sm text-lefitness-muted mt-1">{gym.phone}</p>}
                      <a
                        href={gym.booking_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-lefitness-muted underline mt-2 inline-block break-all"
                      >
                        {gym.booking_url}
                      </a>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/admin/gym/edit/${gym.id}`}
                        className="px-3 py-1.5 rounded text-sm bg-[#2a2a2a] text-lefitness-text border border-[#303030] hover:bg-[#333]"
                      >
                        Edit
                      </Link>
                      <button
                        type="button"
                        onClick={async () => {
                          setError("")
                          setMessage("")
                          try {
                            const res = await adminFetch(`/api/gyms/${gym.id}`, { method: "DELETE" })
                            if (!res.ok) throw new Error("Failed to deactivate gym")
                            setMessage(`${gym.name} deactivated.`)
                            await loadGyms()
                          } catch (err) {
                            setError(err instanceof Error ? err.message : "Failed to deactivate gym")
                          }
                        }}
                        className="px-3 py-1.5 rounded text-sm bg-red-600 text-white hover:bg-red-700"
                      >
                        Deactivate
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {(message || error) && (
            <div className="mt-4 text-sm">
              {message && <p className="text-green-400">{message}</p>}
              {error && <p className="text-red-400">{error}</p>}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
