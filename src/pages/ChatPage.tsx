import { useState, useRef, useEffect, FormEvent, KeyboardEvent } from "react"

const API_BASE = import.meta.env.VITE_API_URL || ""

const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "sv", label: "Swedish" },
] as const

const UI_STRINGS: Record<string, Record<string, string>> = {
  en: {
    chat: "Chat",
    placeholder: "Ask me anything",
    connecting: "Connecting...",
    send: "Send",
    errorConnect:
      "Sorry, we could not connect. Please check that the server is running and try again.",
    errorRetry: "Something went wrong. Please try again.",
  },
  sv: {
    chat: "Chatt",
    placeholder: "Fråga mig vad som helst",
    connecting: "Ansluter...",
    send: "Skicka",
    errorConnect:
      "Kunde inte ansluta. Kontrollera att servern kör och försök igen.",
    errorRetry: "Något gick fel. Försök igen.",
  },
}

function t(lang: string, key: string): string {
  const locale = lang === "sv" ? "sv" : "en"
  return UI_STRINGS[locale]?.[key] ?? UI_STRINGS.en[key] ?? key
}

interface ChatMessage {
  role: "user" | "bot"
  text?: string
  text_en?: string
  text_sv?: string
}

interface ChatResponse {
  session_id: string
  messages?: string[]
  history?: { role: string; text?: string; text_en?: string; text_sv?: string }[]
  language?: string
}

export default function ChatPage() {
  const [sessionId, setSessionId] = useState<string>(() => {
    try {
      return localStorage.getItem("lefitness_chat_session") || ""
    } catch {
      return ""
    }
  })
  const [language, setLanguage] = useState<string>(() => {
    try {
      return localStorage.getItem("lefitness_lang") || "en"
    } catch {
      return "en"
    }
  })
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [layoutReady, setLayoutReady] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const langDropdownRef = useRef<HTMLDivElement>(null)
  const [langDropdownOpen, setLangDropdownOpen] = useState(false)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (!langDropdownOpen) return
    const onOutside = (e: MouseEvent) => {
      if (
        langDropdownRef.current &&
        !langDropdownRef.current.contains(e.target as Node)
      )
        setLangDropdownOpen(false)
    }
    document.addEventListener("mousedown", onOutside)
    return () => document.removeEventListener("mousedown", onOutside)
  }, [langDropdownOpen])

  useEffect(() => {
    setLayoutReady(true)
  }, [])

  useEffect(() => {
    if (!layoutReady) return
    if (sessionId && messages.length === 0) {
      let cancelled = false
      setLoading(true)
      fetchChat(sessionId)
        .then((data) => {
          if (cancelled) return
          persistSession(data.session_id)
          if (data.history && data.history.length > 0) {
            if (data.language && data.language !== language)
              setLang(data.language)
            setMessages(
              data.history.map((m) => ({
                role: (m.role === "user" ? "user" : "bot") as "user" | "bot",
                text_en: m.text_en ?? m.text,
                text_sv: m.text_sv ?? m.text,
              }))
            )
          } else if (data.messages && data.messages.length > 0) {
            setMessages(
              data.messages.map((text) => ({ role: "bot" as const, text }))
            )
          }
        })
        .catch(() => {})
        .finally(() => {
          if (!cancelled) setLoading(false)
        })
      return () => {
        cancelled = true
      }
    }
    if (!sessionId && messages.length === 0) {
      startChat()
    }
  }, [layoutReady])

  const persistSession = (id: string) => {
    setSessionId(id)
    try {
      localStorage.setItem("lefitness_chat_session", id)
    } catch {}
  }

  const setLang = (lang: string) => {
    setLanguage(lang)
    try {
      localStorage.setItem("lefitness_lang", lang)
    } catch {}
  }

  const handleLanguageChange = (newLang: string) => {
    setLang(newLang)
    if (sessionId) {
      setLoading(true)
      fetchChat(sessionId, undefined, newLang)
        .then((data) => {
          if (data.history && data.history.length > 0) {
            setMessages(
              data.history.map((m) => ({
                role: (m.role === "user" ? "user" : "bot") as "user" | "bot",
                text_en: m.text_en ?? m.text,
                text_sv: m.text_sv ?? m.text,
              }))
            )
          }
        })
        .catch(() => {})
        .finally(() => setLoading(false))
    }
  }

  const fetchChat = async (
    sid: string | undefined,
    message?: string,
    langOverride?: string
  ): Promise<ChatResponse> => {
    const lang = langOverride ?? language
    const res = await fetch(`${API_BASE}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        session_id: sid || undefined,
        message,
        language: lang,
      }),
    })
    if (!res.ok)
      throw new Error(res.status === 500 ? "Server error" : "Failed to start chat")
    const data = await res.json()
    if (!langOverride && data.language && data.language !== language)
      setLang(data.language)
    return data
  }

  const startChat = async () => {
    if (loading) return
    setLoading(true)
    try {
      const data = await fetchChat(sessionId || undefined)
      persistSession(data.session_id)
      if (data.history && data.history.length > 0) {
        setMessages(
          data.history.map((m) => ({
            role: "bot" as const,
            text: m.text,
          }))
        )
      } else {
        const newBotMessages = (data.messages || []).map((text) => ({
          role: "bot" as const,
          text,
        }))
        setMessages((prev) => [...prev, ...newBotMessages])
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: t(language, "errorConnect") },
      ])
    } finally {
      setLoading(false)
    }
  }

  const sendMessage = async (e?: FormEvent) => {
    e?.preventDefault()
    const text = input.trim()
    if (!text || loading) return
    setInput("")
    setMessages((prev) => [...prev, { role: "user", text }])
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionId || undefined,
          message: text,
          language: language,
        }),
      })
      if (!res.ok) throw new Error("Request failed")
      const data = await res.json()
      if (data.session_id) persistSession(data.session_id)
      if (data.language && data.language !== language) setLang(data.language)
      const newBotMessages = (data.messages || []).map((msg: string) => ({
        role: "bot" as const,
        text: msg,
      }))
      setMessages((prev) => [...prev, ...newBotMessages])
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: t(language, "errorRetry") },
      ])
    } finally {
      setLoading(false)
    }
    inputRef.current?.focus()
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const formatMessage = (text: string) => {
    return text.split(/\n/g).map((line, i) => {
      const parts = line.split(/(https?:\/\/[^\s]+)/g)
      return (
        <span key={i}>
          {parts.map((part, j) =>
            /^https?:\/\//.test(part) ? (
              <a
                key={j}
                href={part}
                target="_blank"
                rel="noopener noreferrer"
                className="text-lefitness-muted underline hover:text-lefitness-text"
              >
                {part}
              </a>
            ) : (
              part
            )
          )}
          {i < text.split(/\n/g).length - 1 ? <br /> : null}
        </span>
      )
    })
  }

  return (
    <div className="min-h-screen bg-lefitness-bg text-lefitness-text flex flex-col">
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
          <div className="flex items-center gap-3">
            <div
              ref={langDropdownRef}
              className="lang-dropdown relative self-stretch flex items-center"
            >
              <button
                type="button"
                onClick={() => setLangDropdownOpen((o) => !o)}
                className="lang-dropdown-trigger text-sm text-inherit bg-transparent border-0 cursor-pointer py-0 pl-1 pr-1"
                aria-label="Language"
                aria-expanded={langDropdownOpen}
              >
                {LANGUAGES.find((o) => o.value === language)?.label ?? "English"}
              </button>
              {langDropdownOpen && (
                <div className="lang-dropdown-panel">
                  {LANGUAGES.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        handleLanguageChange(opt.value)
                        setLangDropdownOpen(false)
                      }}
                      className="lang-dropdown-option block w-full text-left text-sm py-2 pr-3 text-lefitness-text hover:bg-lefitness-bg"
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <span className="text-lefitness-text text-sm">{t(language, "chat")}</span>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col max-w-2xl w-full mx-auto min-w-0">
        {!layoutReady && (
          <div className="flex-1 flex flex-col items-center justify-center py-12">
            <div className="spinner" />
            <p className="mt-4 text-lefitness-muted text-sm">
              {t(language, "connecting")}
            </p>
          </div>
        )}

        {layoutReady && (
          <>
            <div
              ref={scrollContainerRef}
              className="flex-1 overflow-y-auto px-5 pt-5 pb-3 min-h-0 pb-24"
            >
              <div className="space-y-6 pb-4">
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] px-5 py-3 text-lefitness-text ${
                        msg.role === "user" ? "rounded-full" : ""
                      }`}
                      style={
                        msg.role === "user"
                          ? { backgroundColor: "#303030" }
                          : undefined
                      }
                    >
                      <div className="text-sm whitespace-pre-wrap break-words leading-[1.15]">
                        {formatMessage(
                          msg.text ??
                            (language === "sv"
                              ? (msg.text_sv ?? msg.text_en ?? "")
                              : (msg.text_en ?? msg.text_sv ?? ""))
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="px-4 py-3 flex items-center gap-1.5 min-w-[52px] justify-center">
                      <span className="typing-dot" />
                      <span className="typing-dot" />
                      <span className="typing-dot" />
                    </div>
                  </div>
                )}
              </div>
              <div ref={messagesEndRef} />
            </div>
          </>
        )}
      </main>

      {layoutReady && (
        <div className="sticky bottom-0 z-10 flex-shrink-0 w-full mt-auto bg-lefitness-bg pt-2">
          <div className="max-w-2xl mx-auto px-4">
            <div
              className="rounded-full py-0.5 mb-3 w-full pr-0.5 pl-2"
              style={{ backgroundColor: "#303030" }}
            >
              <form onSubmit={sendMessage}>
                <div
                  className="flex overflow-hidden rounded-full"
                  style={{ backgroundColor: "#303030" }}
                >
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={t(language, "placeholder")}
                    disabled={loading}
                    className="flex-1 min-w-0 bg-transparent px-1.5 py-0.5 text-sm text-lefitness-text placeholder-lefitness-muted focus:outline-none focus:ring-0 border-0 rounded-none disabled:opacity-60"
                  />
                  <button
                    type="submit"
                    disabled={loading || !input.trim()}
                    aria-label="Send"
                    className="m-1 w-9 h-9 rounded-full bg-[#ffffff] text-black flex items-center justify-center hover:bg-[#e5e5e5] disabled:opacity-50 flex-shrink-0"
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M22 2L11 13" />
                      <path d="M22 2L15 22L11 13L2 9L22 2Z" />
                    </svg>
                  </button>
                </div>
              </form>
            </div>
          </div>
          <footer className="w-full bg-lefitness-header py-2.5">
            <div className="max-w-2xl mx-auto px-4 text-center text-lefitness-muted text-xs">
              <a
                href="https://lefitness.se"
                target="_blank"
                rel="noopener noreferrer"
                className="no-underline text-lefitness-muted hover:text-lefitness-text"
              >
                lefitness.se
              </a>
            </div>
          </footer>
        </div>
      )}
    </div>
  )
}
