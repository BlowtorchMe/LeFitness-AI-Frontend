import { useState, FormEvent } from "react"
import { Link } from "react-router-dom"
import { useEffect } from "react"
import AdminHeader from "@/components/AdminHeader"
import { adminFetch } from "@/lib/api"
import type { GymRecord } from "@/types/gym"

interface ImportItem {
  question: string
  answer: string
  video_link?: string | null
}

interface ImportResponse {
  imported: number
  reindexed: boolean
  reindex_count: number
  reindex_error?: string | null
}

export default function FaqAddPage() {
  const [singleQuestion, setSingleQuestion] = useState("")
  const [singleAnswer, setSingleAnswer] = useState("")
  const [singleSourceLang, setSingleSourceLang] = useState<"en" | "sv">("en")
  const [singleVideoLink, setSingleVideoLink] = useState("")
  const [singleLoading, setSingleLoading] = useState(false)

  const [jsonText, setJsonText] = useState("")
  const [jsonLoading, setJsonLoading] = useState(false)
  const [gyms, setGyms] = useState<GymRecord[]>([])
  const [singleGymIds, setSingleGymIds] = useState<number[]>([])

  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

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

  const resetStatus = () => {
    setMessage("")
    setError("")
  }

  const handleCreateOne = async (e: FormEvent) => {
    e.preventDefault()
    resetStatus()
    const q = singleQuestion.trim()
    const a = singleAnswer.trim()
    if (!q || !a || singleLoading) return
    setSingleLoading(true)
    try {
      const res = await adminFetch(`/api/faq`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: q,
          answer: a,
          source_lang: singleSourceLang,
          video_link: singleVideoLink.trim() || null,
          gym_ids: singleGymIds,
        }),
      })
      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || "Failed to create FAQ")
      }
      const data = await res.json()
      setMessage(`Saved FAQ #${data.id}.`)
      setSingleQuestion("")
      setSingleAnswer("")
      setSingleVideoLink("")
      setSingleGymIds([])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create FAQ")
    } finally {
      setSingleLoading(false)
    }
  }

  const handleImportJson = async (e: FormEvent) => {
    e.preventDefault()
    resetStatus()
    const raw = jsonText.trim()
    if (!raw || jsonLoading) return
    let parsed: ImportItem[]
    try {
      parsed = JSON.parse(raw)
      if (!Array.isArray(parsed)) {
        throw new Error("JSON must be an array of objects")
      }
      if (parsed.length > 500) {
        setError("Too many items: max 500")
        return
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid JSON")
      return
    }
    setJsonLoading(true)
    try {
      const res = await adminFetch(`/api/faq/import?reindex=true`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed),
      })
      if (!res.ok) {
        let msg = "Failed to import FAQs"
        try {
          const data = await res.json()
          msg = data.detail ?? msg
        } catch {
          const text = await res.text()
          if (text) msg = text
        }
        throw new Error(typeof msg === "string" ? msg : JSON.stringify(msg))
      }
      const data: ImportResponse = await res.json()
      setMessage(
        `Imported ${data.imported} FAQ(s). Reindexed: ${data.reindexed ? "yes" : "no"} (count: ${data.reindex_count}).`
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to import FAQs")
    } finally {
      setJsonLoading(false)
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

        <section className="mb-8">
          <h1 className="text-lg font-semibold mb-3">Import FAQs (JSON)</h1>
          <p className="text-sm text-lefitness-muted mb-3">
            Paste a JSON array of FAQs with fields <code>question</code>,{" "}
            <code>answer</code>, and optional <code>video_link</code>. Imported
            FAQs are added as global FAQs and then reindexed.
          </p>
          <form onSubmit={handleImportJson} className="space-y-3">
            <textarea
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              className="w-full min-h-[160px] rounded-md bg-lefitness-header text-lefitness-text text-sm p-3 border border-[#303030] focus:outline-none focus:ring-1 focus:ring-lefitness-muted"
              placeholder='[{"question":"...","answer":"...","video_link":null}]'
            />
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={jsonLoading}
                className="inline-flex items-center px-4 py-2 rounded-md text-sm bg-[#ffffff] text-black hover:bg-[#e5e5e5] disabled:opacity-60"
              >
                {jsonLoading ? "Importing..." : "Import and reindex"}
              </button>
            </div>
          </form>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3">Add one FAQ</h2>
          <form onSubmit={handleCreateOne} className="space-y-3">
            <div>
              <label className="block text-sm mb-2">Answer language</label>
              <div className="flex gap-2">
                {(["en", "sv"] as const).map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => setSingleSourceLang(lang)}
                    className={`px-4 py-1.5 rounded-md text-sm border ${
                      singleSourceLang === lang
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
                value={singleQuestion}
                onChange={(e) => setSingleQuestion(e.target.value)}
                className="w-full min-h-[60px] rounded-md bg-lefitness-header text-lefitness-text text-sm p-2 border border-[#303030] focus:outline-none focus:ring-1 focus:ring-lefitness-muted"
              />
            </div>
            <div>
              <label className="block text-sm mb-1">Answer</label>
              <textarea
                value={singleAnswer}
                onChange={(e) => setSingleAnswer(e.target.value)}
                className="w-full min-h-[80px] rounded-md bg-lefitness-header text-lefitness-text text-sm p-2 border border-[#303030] focus:outline-none focus:ring-1 focus:ring-lefitness-muted"
              />
            </div>
            <div>
              <label className="block text-sm mb-1">Video link (optional)</label>
              <input
                type="text"
                value={singleVideoLink}
                onChange={(e) => setSingleVideoLink(e.target.value)}
                className="w-full rounded-md bg-lefitness-header text-lefitness-text text-sm p-2 border border-[#303030] focus:outline-none focus:ring-1 focus:ring-lefitness-muted"
              />
            </div>
            <div>
              <label className="block text-sm mb-2">Gyms</label>
              <div className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2 xl:grid-cols-4">
                <label className="flex items-center gap-2 rounded-md border border-[#303030] bg-lefitness-header px-3 py-2 text-lefitness-muted">
                  <input
                    type="checkbox"
                    checked={singleGymIds.length === 0}
                    onChange={() => setSingleGymIds([])}
                  />
                  Global FAQ
                </label>
                {gyms.map((gym) => (
                  <label
                    key={gym.id}
                    className="flex items-center gap-2 rounded-md border border-[#303030] bg-lefitness-header px-3 py-2 text-lefitness-muted"
                  >
                    <input
                      type="checkbox"
                      checked={singleGymIds.includes(gym.id)}
                      onChange={(e) =>
                        setSingleGymIds((prev) =>
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
                disabled={singleLoading}
                className="inline-flex items-center px-4 py-2 rounded-md text-sm bg-[#ffffff] text-black hover:bg-[#e5e5e5] disabled:opacity-60"
              >
                {singleLoading ? "Saving..." : "Save FAQ"}
              </button>
            </div>
          </form>
        </section>

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
