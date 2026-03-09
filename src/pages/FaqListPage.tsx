import { useState, useEffect, ChangeEvent } from "react"
import { Link } from "react-router-dom"
import type { FaqRecord } from "@/types/faq"


const API_BASE = import.meta.env.VITE_API_URL || ""
const PAGE_SIZES = [5, 10, 20, 50, 100]
const DEFAULT_PAGE_SIZE = 10

export default function FaqListPage() {
  const [page, setPage] = useState(1)
  const [size, setSize] = useState(DEFAULT_PAGE_SIZE)
  const [total, setTotal] = useState(0)
  const [items, setItems] = useState<FaqRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [hoverId, setHoverId] = useState<number | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null)
  const [reindexing, setReindexing] = useState(false)
  const [reindexMessage, setReindexMessage] = useState("")

  const totalPages = Math.max(1, Math.ceil(total / size))

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    fetch(`${API_BASE}/api/faq?page=${page}&size=${size}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load FAQs")
        return res.json()
      })
      .then((data: { items: FaqRecord[]; total: number }) => {
        if (!cancelled) {
          setItems(data.items)
          setTotal(data.total)
        }
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message || "Failed to load")
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [page, size])

  const handleSizeChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const newSize = Number(e.target.value)
    setSize(newSize)
    setPage(1)
  }

  const showPageNumbers = () => {
    if (totalPages <= 3) return Array.from({ length: totalPages }, (_, i) => i + 1)
    const start = Math.max(1, page - 1)
    const end = Math.min(totalPages, page + 1)
    return Array.from({ length: end - start + 1 }, (_, i) => start + i)
  }

  const pageNumbers = showPageNumbers()
  const showLeftEllipsis = totalPages > 3 && pageNumbers[0] > 1
  const showRightEllipsis =
    totalPages > 3 && pageNumbers[pageNumbers.length - 1] < totalPages

  useEffect(() => {
    if (deleteConfirmId == null) return
    const handler = (e: Event) => {
      if ((e as KeyboardEvent).key === "Escape" && deletingId !== deleteConfirmId)
        setDeleteConfirmId(null)
    }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [deleteConfirmId, deletingId])

  const handleDeleteConfirm = async (faqId: number) => {
    setDeletingId(faqId)
    setError("")
    try {
      const res = await fetch(`${API_BASE}/api/faq/${faqId}`, { method: "DELETE" })
      if (res.status === 404) {
        setItems((prev) => prev.filter((f) => f.id !== faqId))
        setTotal((t) => Math.max(0, t - 1))
      } else if (!res.ok) {
        throw new Error("Delete failed")
      } else {
        setItems((prev) => prev.filter((f) => f.id !== faqId))
        setTotal((t) => Math.max(0, t - 1))
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete")
    } finally {
      setDeletingId(null)
      setDeleteConfirmId(null)
    }
  }

  const iconBtn =
    "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border-0 cursor-pointer"
  const editIcon = (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  )
  const deleteIcon = (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 6h18" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
    </svg>
  )

  return (
    <div className="min-h-screen bg-lefitness-bg text-lefitness-text flex flex-col">
      {deleteConfirmId != null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-modal-title"
        >
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() =>
              deletingId !== deleteConfirmId && setDeleteConfirmId(null)
            }
          />
          <div className="relative rounded-lg bg-lefitness-header border border-[#303030] shadow-xl max-w-sm w-full p-5">
            <h2
              id="delete-modal-title"
              className="text-base font-semibold text-lefitness-text mb-2"
            >
              Delete this FAQ?
            </h2>
            <p className="text-sm text-lefitness-muted mb-5">
              This cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                disabled={deletingId === deleteConfirmId}
                className="px-4 py-2 rounded text-sm bg-lefitness-bg border border-[#303030] text-lefitness-text hover:bg-[#303030] disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDeleteConfirm(deleteConfirmId)}
                disabled={deletingId === deleteConfirmId}
                className="px-4 py-2 rounded text-sm bg-red-600 text-white border-0 hover:bg-red-700 disabled:opacity-50"
              >
                {deletingId === deleteConfirmId ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
      <header className="header-outer sticky top-0 z-20 flex-shrink-0 bg-lefitness-header header-sticky-bg opacity-85">
        <div className="header-row max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <a
            href="https://lefitness.se"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 no-underline text-lefitness-text hover:opacity-90"
          >
            <img src="/logo.svg" alt="LE Fitness" className="h-9 w-9 object-contain" />
            <span className="text-base font-semibold tracking-tight">LE Fitness</span>
          </a>
          <span className="text-lefitness-text text-sm">FAQ Admin</span>
        </div>
      </header>

      <main className="flex-1 flex flex-col max-w-2xl w-full mx-auto min-w-0 px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-lg font-semibold">Frequently Asked Questions</h1>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={reindexing || total === 0}
              onClick={async () => {
                setReindexMessage("")
                setReindexing(true)
                try {
                  const res = await fetch(`${API_BASE}/api/faq/reindex`, {
                    method: "POST",
                  })
                  const data = await res.json().catch(() => ({}))
                  if (res.ok && data.success) {
                    setReindexMessage(`Reindexed ${data.count} FAQ(s).`)
                  } else {
                    setReindexMessage(data.error || "Reindex failed")
                  }
                } catch (e) {
                  setReindexMessage(
                    e instanceof Error ? e.message : "Reindex failed"
                  )
                } finally {
                  setReindexing(false)
                }
              }}
              className="inline-flex items-center px-4 py-2 rounded-md text-sm bg-[#2a2a2a] text-lefitness-text border border-[#303030] hover:bg-[#333] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {reindexing ? "Reindexing..." : "Reindex"}
            </button>
            <Link
              to="/faq-admin/add"
              className="inline-flex items-center px-4 py-2 rounded-md text-sm bg-[#ffffff] text-black hover:bg-[#e5e5e5] no-underline"
            >
              Add
            </Link>
          </div>
        </div>
        {reindexMessage && (
          <p
            className={`text-sm mb-4 ${reindexMessage.startsWith("Reindexed") ? "text-green-400" : "text-red-400"}`}
          >
            {reindexMessage}
          </p>
        )}

        <div className="flex items-center gap-4 mb-4">
          <label className="flex items-center gap-2 text-sm text-lefitness-muted">
            Per page
            <select
              value={size}
              onChange={handleSizeChange}
              className="bg-lefitness-header text-lefitness-text text-sm border border-[#303030] rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-lefitness-muted"
            >
              {PAGE_SIZES.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-8 gap-1.5">
            <span className="typing-dot" />
            <span className="typing-dot" />
            <span className="typing-dot" />
          </div>
        )}
        {error && <p className="text-red-400 text-sm">{error}</p>}
        {!loading && !error && total === 0 && (
          <p className="text-lefitness-muted text-sm">
            No FAQs yet. Click Add to create one.
          </p>
        )}
        {!loading && !error && items.length > 0 && (
          <>
            <ul className="space-y-4">
              {items.map((faq) => (
                <li
                  key={faq.id}
                  className="relative rounded-md border border-[#303030] bg-lefitness-header p-4"
                  onMouseEnter={() => setHoverId(faq.id)}
                  onMouseLeave={() => setHoverId(null)}
                >
                  <p className="text-sm font-medium text-lefitness-text mb-1">
                    {faq.question}
                  </p>
                  <p className="text-sm text-lefitness-muted whitespace-pre-wrap">
                    {faq.answer}
                  </p>
                  {faq.video_link && (
                    <a
                      href={faq.video_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-lefitness-muted underline mt-2 inline-block break-all"
                    >
                      {faq.video_link}
                    </a>
                  )}
                  {hoverId === faq.id && (
                    <div className="absolute bottom-3 right-3 flex items-center gap-2">
                      <Link
                        to={`/faq-admin/edit/${faq.id}`}
                        className={`${iconBtn} bg-lefitness-muted text-lefitness-bg hover:bg-lefitness-text`}
                        aria-label="Edit"
                      >
                        {editIcon}
                      </Link>
                      <button
                        type="button"
                        onClick={() => setDeleteConfirmId(faq.id)}
                        disabled={deletingId === faq.id}
                        className={`${iconBtn} bg-lefitness-muted text-lefitness-bg hover:bg-red-600 disabled:opacity-50`}
                        aria-label="Delete"
                      >
                        {deleteIcon}
                      </button>
                    </div>
                  )}
                </li>
              ))}
            </ul>

            {totalPages > 1 && (
              <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
                <button
                  type="button"
                  onClick={() => setPage(1)}
                  disabled={page === 1}
                  className="px-3 py-1.5 rounded text-sm bg-lefitness-header border border-[#303030] text-lefitness-text disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#303030]"
                >
                  First
                </button>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 rounded text-sm bg-lefitness-header border border-[#303030] text-lefitness-text disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#303030]"
                >
                  Prev
                </button>
                {showLeftEllipsis && (
                  <span className="px-2 text-lefitness-muted">...</span>
                )}
                {pageNumbers.map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setPage(n)}
                    className={`px-3 py-1.5 rounded text-sm border ${n === page ? "bg-[#ffffff] text-black border-[#ffffff]" : "bg-lefitness-header border-[#303030] text-lefitness-text hover:bg-[#303030]"}`}
                  >
                    {n}
                  </button>
                ))}
                {showRightEllipsis && (
                  <span className="px-2 text-lefitness-muted">...</span>
                )}
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1.5 rounded text-sm bg-lefitness-header border border-[#303030] text-lefitness-text disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#303030]"
                >
                  Next
                </button>
                <button
                  type="button"
                  onClick={() => setPage(totalPages)}
                  disabled={page === totalPages}
                  className="px-3 py-1.5 rounded text-sm bg-lefitness-header border border-[#303030] text-lefitness-text disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#303030]"
                >
                  Last
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
