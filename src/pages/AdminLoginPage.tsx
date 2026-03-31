import { FormEvent, useEffect, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { adminFetch } from "@/lib/api"

export default function AdminLoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    let cancelled = false
    adminFetch("/api/admin/session")
      .then((res) => res.json())
      .then((data: { authenticated?: boolean }) => {
        if (!cancelled && data.authenticated) {
          const target = (location.state as { from?: string } | null)?.from || "/admin/gym"
          navigate(target, { replace: true })
        }
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [location.state, navigate])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!password.trim() || loading) return
    setLoading(true)
    setError("")
    try {
      const res = await adminFetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Sign-in failed")
      }
      const target = (location.state as { from?: string } | null)?.from || "/admin/gym"
      navigate(target, { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign-in failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-lefitness-bg text-lefitness-text flex items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-xl border border-[#303030] bg-lefitness-header p-6 shadow-xl">
        <div className="flex items-center gap-3 mb-6">
          <img src="/logo.svg" alt="LE Fitness" className="h-10 w-10 object-contain" />
          <div>
            <h1 className="text-lg font-semibold">Admin Sign In</h1>
            <p className="text-sm text-lefitness-muted">Enter the admin password to continue.</p>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md bg-lefitness-bg text-lefitness-text text-sm p-3 border border-[#303030] focus:outline-none focus:ring-1 focus:ring-lefitness-muted"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center px-4 py-3 rounded-md text-sm bg-white text-black hover:bg-[#e5e5e5] disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
          {error && <p className="text-sm text-red-400">{error}</p>}
        </form>
      </div>
    </div>
  )
}
