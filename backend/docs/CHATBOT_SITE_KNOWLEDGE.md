# Chatbot: site knowledge & live updates

## Connection (frontend → backend → database)

1. **Frontend** (`frontend/src/services/api.js`) sends each message with `POST {VITE_API_URL}/chat` and body `{ message }`.
2. **Backend** (`backend/server.js`) mounts chat at `/api/chat` — so `VITE_API_URL` must end with `/api` (e.g. `http://localhost:5000/api`).
3. **Chat handler** (`backend/controllers/chatController.js`) calls **`buildCmsContentContextForChat()`** (`backend/services/cmsSiteContentAggregator.js`), which **reads all CMS-backed collections** in MongoDB on every request and injects that text into the AI system prompt.

Set in **`frontend/.env`**:

```bash
VITE_API_URL=http://localhost:5000/api
# production example:
# VITE_API_URL=https://your-backend.onrender.com/api
```

Backend needs **`MONGO_URI`** (or your `connectDB` env) so the snapshot queries succeed.

## How it works

1. **Static site map** — `backend/data/siteKnowledge.js`  
   Describes every public route (Home, About, Events, Clubs, Sports, Placements, Exams, etc.).  
   **Update this file** when you add new pages in `frontend/src/routes/AppRoutes.jsx`.

2. **CMS / database content** — `backend/services/cmsSiteContentAggregator.js`  
   On **each chat request**, the server aggregates live text from your admin-managed data (same source as the website):
   - Branding, footer, social links, home carousel (all slide types)  
   - Events (`Event` model): upcoming + TBA + recent past  
   - **Club events** (`ClubEvent` collection — full descriptions & activities)  
   - Club categories (`ClubType`)  
   - Achievements, placements (including description snippets & skills)  
   - Sports categories, sport events, sport achievements  
   - Exam schedules (expanded subject lines)  

   Optional env: **`CMS_MAX_CONTEXT_CHARS`** (default `28000`) caps prompt size if your DB is huge.

   When admins update content in the dashboard, the **next** chat message sees it—no separate training step.

3. **Prompt assembly** — `backend/controllers/chatController.js`  
   Combines personality instructions + site map + live snapshot for OpenAI / Gemini.

## Environment (optional but recommended)

Set on your backend (e.g. Render):

```bash
FRONTEND_URL=https://your-frontend-domain.com
```

The chatbot will include **full URLs** in answers when helpful. If unset, it still uses correct **paths** (e.g. `/events/...`).

## Voice assistant (Vapi)

The **text** chat uses this backend. The **voice** call uses your Vapi assistant in their dashboard.

To keep voice aligned:

- Paste the same **site map** text into the assistant’s system prompt or knowledge base in Vapi, **or**
- Export a short doc from `siteKnowledge.js` + sample answers and upload as a Vapi knowledge file.

Vapi cannot read your MongoDB directly unless you add server-side tools/webhooks.
