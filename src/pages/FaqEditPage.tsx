import { useState, useEffect, FormEvent } from "react"
import { Link, useParams, useNavigate } from "react-router-dom"
import AdminHeader from "@/components/AdminHeader"
import { adminFetch } from "@/lib/api"
import type { GymRecord } from "@/types/gym"

export default function FaqEditPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [question, setQuestion] = useState("")
  const [answer, setAnswer] = useState("")
  const [sourceLang, setSourceLang] = useState<"en" | "sv">("en")
  const [videoLink, setVideoLink] = useState("")
  const [loading, setLoading] = useState(false)
  const [fetchError, setFetchError] = useState("")
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [gyms, setGyms] = useState<GymRecord[]>([])
  const [gymIds, setGymIds] = useState<number[]>([])

  useEffect(() => {
    let cancelled = false
    adminFetch("/api/gyms")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load gyms")
        return res.json()
      })
      .then((data: GymRecord[]) => {
        if (!cancelled) setGyms(data)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    const numId = id ? parseInt(id, 10) : NaN
    if (!id || Number.isNaN(numId) || numId < 1) {
      setFetchError("Invalid FAQ id")
      return
    }
    let cancelled = false
    adminFetch(`/api/faq/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("FAQ not found")
        return res.json()
      })
      .then((data: { question?: string; answer?: string; video_link?: string | null; gym_ids?: number[] }) => {
        if (!cancelled) {
          setQuestion(data.question || "")
          setAnswer(data.answer || "")
          setVideoLink(data.video_link || "")
          setGymIds(data.gym_ids || [])
        }
      })
      .catch((err: Error) => {
        if (!cancelled) setFetchError(err.message || "Failed to load")
      })
    return () => {
      cancelled = true
    }
  }, [id])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setMessage("")
    setError("")
    const q = question.trim()
    const a = answer.trim()
    if (!q || !a || loading) return
    const numId = id ? parseInt(id, 10) : NaN
    if (Number.isNaN(numId) || numId < 1) {
      setError("Invalid FAQ id")
      return
    }
    setLoading(true)
    try {
      const res = await adminFetch(`/api/faq/${numId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: q,
          answer: a,
          source_lang: sourceLang,
          video_link: videoLink.trim() || null,
          gym_ids: gymIds,
        }),
      })
      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || "Failed to update")
      }
      setMessage("Saved.")
      setTimeout(() => navigate("/admin/faq"), 800)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-lefitness-bg text-lefitness-text flex flex-col">
      <AdminHeader />

      <main className="flex-1 flex flex-col max-w-2xl w-full mx-auto min-w-0 px-4 py-6">
        <Link
          to="/admin/faq"
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

        <h1 className="text-lg font-semibold mb-4">Edit FAQ</h1>

        {fetchError && (
          <p className="text-red-400 text-sm mb-4">{fetchError}</p>
        )}

        {!fetchError && (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-sm mb-2">Answer language</label>
              <div className="flex gap-2">
                {(["en", "sv"] as const).map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => setSourceLang(lang)}
                    className={`px-4 py-1.5 rounded-md text-sm border ${
                      sourceLang === lang
                        ? "bg-[#ffffff] text-black border-[#ffffff]"
                        : "bg-lefitness-header text-lefitness-muted border-[#303030] hover:border-lefitness-muted"
                    }`}
                  >
                    {lang === "en" ? "English" : "Swedish"}
                  </button>
                ))}
              </div>
              <p className="text-xs text-lefitness-muted mt-1">
                Write in the selected language — the other language is auto-translated on save.
              </p>
            </div>
            <div>
              <label className="block text-sm mb-1">Question</label>
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className="w-full min-h-[60px] rounded-md bg-lefitness-header text-lefitness-text text-sm p-2 border border-[#303030] focus:outline-none focus:ring-1 focus:ring-lefitness-muted"
              />
            </div>
            <div>
              <label className="block text-sm mb-1">Answer</label>
              <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                className="w-full min-h-[80px] rounded-md bg-lefitness-header text-lefitness-text text-sm p-2 border border-[#303030] focus:outline-none focus:ring-1 focus:ring-lefitness-muted"
              />
            </div>
            <div>
              <label className="block text-sm mb-1">Video link (optional)</label>
              <input
                type="text"
                value={videoLink}
                onChange={(e) => setVideoLink(e.target.value)}
                className="w-full rounded-md bg-lefitness-header text-lefitness-text text-sm p-2 border border-[#303030] focus:outline-none focus:ring-1 focus:ring-lefitness-muted"
              />
            </div>
            <div>
              <label className="block text-sm mb-2">Gyms</label>
              <div className="space-y-2 text-sm">
                <label className="flex items-center gap-2 text-lefitness-muted">
                  <input
                    type="checkbox"
                    checked={gymIds.length === 0}
                    onChange={() => setGymIds([])}
                  />
                  Global FAQ
                </label>
                {gyms.map((gym) => (
                  <label key={gym.id} className="flex items-center gap-2 text-lefitness-muted">
                    <input
                      type="checkbox"
                      checked={gymIds.includes(gym.id)}
                      onChange={(e) =>
                        setGymIds((prev) =>
                          e.target.checked
                            ? [...prev, gym.id].filter((value, index, list) => list.indexOf(value) === index)
                            : prev.filter((id) => id !== gym.id)
                        )
                      }
                    />
                    {gym.name}
                  </label>
                ))}
              </div>
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center px-4 py-2 rounded-md text-sm bg-[#ffffff] text-black hover:bg-[#e5e5e5] disabled:opacity-60"
              >
                {loading ? "Saving..." : "Save"}
              </button>
            </div>
          </form>
        )}

        {(message || error) && (
          <div className="mt-4 text-sm">
            {message && <p className="text-green-400">{message}</p>}
            {error && (
              <p className="text-red-400 whitespace-pre-wrap break-words">
                {error}
              </p>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
