import { Link, useLocation, useNavigate } from "react-router-dom"
import { adminFetch } from "@/lib/api"

export default function AdminHeader() {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <header className="header-outer sticky top-0 z-20 flex-shrink-0 bg-lefitness-header header-sticky-bg opacity-95 border-b border-[#303030]">
      <div className="header-row max-w-3xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <a
            href="https://lefitness.se"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 no-underline text-lefitness-text hover:opacity-90"
          >
            <img src="/logo.svg" alt="LE Fitness" className="h-9 w-9 object-contain" />
            <span className="text-base font-semibold tracking-tight">LE Fitness Admin</span>
          </a>
          <nav className="flex items-center gap-2 text-sm">
            <Link
              to="/admin/gym"
              className={`px-3 py-1.5 rounded no-underline ${location.pathname.startsWith("/admin/gym") ? "bg-white text-black" : "text-lefitness-muted hover:text-lefitness-text"}`}
            >
              Gyms
            </Link>
            <Link
              to="/admin/faq"
              className={`px-3 py-1.5 rounded no-underline ${location.pathname.startsWith("/admin/faq") ? "bg-white text-black" : "text-lefitness-muted hover:text-lefitness-text"}`}
            >
              FAQs
            </Link>
          </nav>
        </div>
        <button
          type="button"
          onClick={async () => {
            await adminFetch("/api/admin/logout", { method: "POST" }).catch(() => {})
            navigate("/admin/login")
          }}
          className="px-3 py-1.5 rounded text-sm bg-[#2a2a2a] text-lefitness-text border border-[#303030] hover:bg-[#333]"
        >
          Logout
        </button>
      </div>
    </header>
  )
}
