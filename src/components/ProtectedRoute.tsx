import { useEffect, useState } from "react"
import { Navigate, Outlet, useLocation } from "react-router-dom"
import { adminFetch } from "@/lib/api"

export default function ProtectedRoute() {
  const location = useLocation()
  const [status, setStatus] = useState<"loading" | "authed" | "guest">("loading")

  useEffect(() => {
    let cancelled = false
    adminFetch("/api/admin/session")
      .then((res) => res.json())
      .then((data: { authenticated?: boolean }) => {
        if (!cancelled) setStatus(data.authenticated ? "authed" : "guest")
      })
      .catch(() => {
        if (!cancelled) setStatus("guest")
      })
    return () => {
      cancelled = true
    }
  }, [])

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-lefitness-bg text-lefitness-text flex items-center justify-center">
        <div className="flex items-center gap-1.5">
          <span className="typing-dot" />
          <span className="typing-dot" />
          <span className="typing-dot" />
        </div>
      </div>
    )
  }

  if (status === "guest") {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />
  }

  return <Outlet />
}
