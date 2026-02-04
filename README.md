# LE Fitness Chat (Web)

Web chat page for LE Fitness. Users open this page (e.g. from an ad link) and chat with the same bot as Messenger/Instagram, without leaving the browser.

## Stack

- React 18, Vite, React Router, Tailwind CSS

## Setup

1. Install dependencies: `npm install`
2. Ensure the [Fitness-Chatbot](../../Fitness-Chatbot) backend is running (`uvicorn app.main:app --reload` on port 8000).
3. (Optional) Create `.env` and set `VITE_API_URL` if the API is not on the same origin or not proxied.

## Run

- Dev: `npm run dev` — app at http://localhost:5173, API requests proxied to http://localhost:8000.
- Build: `npm run build`
- Preview: `npm run preview`

## Routes

- `/` and `/chat` — chat page. Use one as the landing URL for ads.

## API

The app calls `POST /api/chat` with body `{ "session_id": "optional", "message": "optional" }`. First request without `message` returns welcome + first profile question. Response: `{ "session_id": "...", "messages": ["..."] }`.
